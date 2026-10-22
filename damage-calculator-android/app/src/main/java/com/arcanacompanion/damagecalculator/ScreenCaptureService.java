package com.arcanacompanion.damagecalculator;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Rect;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.util.DisplayMetrics;
import android.view.WindowManager;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

/** Opt-in screen OCR. Pixels are held only in memory and are never written to disk. */
public final class ScreenCaptureService extends Service {
    public static final String ACTION_START = "com.arcanacompanion.damagecalculator.capture.START";
    public static final String ACTION_STOP = "com.arcanacompanion.damagecalculator.capture.STOP";
    public static final String PREFS = "arcana_screen_scan";
    public static final String KEY_RECORDS = "records";
    public static final String KEY_ACTIVE = "active";
    private static final String CHANNEL_ID = "arcana_screen_capture";
    private static final int NOTIFICATION_ID = 6204;
    private static final int MAX_RECORDS = 100;
    private static final int MAX_TEXT_CHARS = 6000;
    private static final long SAMPLE_INTERVAL_MS = 1250;

    private HandlerThread workerThread;
    private Handler worker;
    private MediaProjection projection;
    private VirtualDisplay virtualDisplay;
    private ImageReader imageReader;
    private TextRecognizer recognizer;
    private final AtomicBoolean recognizing = new AtomicBoolean(false);
    private long lastSampleAt;
    private String lastCandidate = "";
    private int stableCount;
    private int width;
    private int height;
    private int densityDpi;
    private int sourceWidth;
    private int sourceHeight;

    private final MediaProjection.Callback projectionCallback = new MediaProjection.Callback() {
        @Override public void onStop() { stopCapture(false); }
    };

    @Override public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        workerThread = new HandlerThread("ArcanaScreenOcr");
        workerThread.start();
        worker = new Handler(workerThread.getLooper());
        recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || ACTION_STOP.equals(intent.getAction())) {
            stopCapture(true);
            return START_NOT_STICKY;
        }
        if (!ACTION_START.equals(intent.getAction())) return START_NOT_STICKY;
        startForeground(NOTIFICATION_ID, buildNotification(),
                Build.VERSION.SDK_INT >= 29 ? android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION : 0);
        try {
            int resultCode = intent.getIntExtra("resultCode", 0);
            Intent resultData = intent.getParcelableExtra("resultData");
            MediaProjectionManager manager = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
            projection = manager.getMediaProjection(resultCode, resultData);
            if (projection == null) throw new IllegalStateException("Android did not provide screen capture access.");
            projection.registerCallback(projectionCallback, worker);
            startProjection();
            getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_ACTIVE, true).apply();
        } catch (Exception e) {
            recordError(e.getMessage());
            stopCapture(true);
        }
        return START_NOT_STICKY;
    }

    private void startProjection() {
        WindowManager wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        DisplayMetrics metrics = new DisplayMetrics();
        if (Build.VERSION.SDK_INT >= 30) wm.getDefaultDisplay().getRealMetrics(metrics);
        else wm.getDefaultDisplay().getRealMetrics(metrics);
        sourceWidth = metrics.widthPixels;
        sourceHeight = metrics.heightPixels;
        densityDpi = metrics.densityDpi;
        float ratio = Math.min(1f, 1000f / Math.max(sourceWidth, sourceHeight));
        width = Math.max(480, Math.round(sourceWidth * ratio));
        height = Math.max(480, Math.round(sourceHeight * ratio));
        imageReader = ImageReader.newInstance(width, height, android.graphics.PixelFormat.RGBA_8888, 2);
        imageReader.setOnImageAvailableListener(this::onImageAvailable, worker);
        virtualDisplay = projection.createVirtualDisplay("ArcanaCharacterScan", width, height, densityDpi,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, imageReader.getSurface(), null, worker);
    }

    private void onImageAvailable(ImageReader reader) {
        Image image = null;
        try {
            image = reader.acquireLatestImage();
            if (image == null || recognizing.get() || System.currentTimeMillis() - lastSampleAt < SAMPLE_INTERVAL_MS) return;
            lastSampleAt = System.currentTimeMillis();
            if (!recognizing.compareAndSet(false, true)) return;
            Bitmap bitmap = copyBitmap(image);
            image.close();
            image = null;
            if (bitmap == null) { recognizing.set(false); return; }
            recognizer.process(InputImage.fromBitmap(bitmap, 0))
                    .addOnSuccessListener(workerThreadExecutor -> handleText(workerThreadExecutor, bitmap))
                    .addOnFailureListener(error -> { bitmap.recycle(); recognizing.set(false); });
        } catch (Exception ignored) {
            if (image != null) image.close();
            recognizing.set(false);
        }
    }

    private Bitmap copyBitmap(Image image) {
        Image.Plane plane = image.getPlanes()[0];
        ByteBuffer buffer = plane.getBuffer();
        int pixelStride = plane.getPixelStride();
        int rowStride = plane.getRowStride();
        int paddedWidth = rowStride / pixelStride;
        Bitmap padded = Bitmap.createBitmap(paddedWidth, height, Bitmap.Config.ARGB_8888);
        buffer.rewind();
        padded.copyPixelsFromBuffer(buffer);
        Bitmap cropped = Bitmap.createBitmap(padded, 0, 0, Math.min(width, paddedWidth), height);
        padded.recycle();
        return cropped;
    }

    private void handleText(Text result, Bitmap bitmap) {
        try {
            JSONArray lines = new JSONArray();
            StringBuilder joined = new StringBuilder();
            for (Text.TextBlock block : result.getTextBlocks()) {
                for (Text.Line line : block.getLines()) {
                    String value = clean(line.getText());
                    if (value.isEmpty()) continue;
                    if (joined.length() > 0) joined.append('\n');
                    joined.append(value);
                    JSONObject entry = new JSONObject().put("text", value);
                    Rect box = line.getBoundingBox();
                    if (box != null) {
                        entry.put("bounds", new JSONArray().put(round4((double)box.left / bitmap.getWidth()))
                                .put(round4((double)box.top / bitmap.getHeight()))
                                .put(round4((double)box.right / bitmap.getWidth()))
                                .put(round4((double)box.bottom / bitmap.getHeight())));
                    }
                    lines.put(entry);
                }
            }
            String text = joined.toString();
            if (text.length() > MAX_TEXT_CHARS) text = text.substring(0, MAX_TEXT_CHARS);
            String normalized = normalize(text);
            if (normalized.length() < 18) { lastCandidate = ""; stableCount = 0; return; }
            if (normalized.equals(lastCandidate)) stableCount++;
            else { lastCandidate = normalized; stableCount = 1; }
            if (stableCount >= 2) saveIfRelevant(text, lines, classify(text));
        } catch (Exception ignored) {
            // OCR is best-effort; a bad frame never stops the capture session.
        } finally {
            bitmap.recycle();
            recognizing.set(false);
        }
    }

    private void saveIfRelevant(String text, JSONArray lines, Classification classification) throws Exception {
        if (classification.type.equals("other")) return;
        String hash = sha256(normalize(text));
        android.content.SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        JSONArray records;
        try { records = new JSONArray(prefs.getString(KEY_RECORDS, "[]")); }
        catch (JSONException e) { records = new JSONArray(); }
        for (int i = 0; i < records.length(); i++) {
            if (hash.equals(records.optJSONObject(i).optString("contentHash"))) return;
        }
        JSONObject record = new JSONObject()
                .put("screenType", classification.type)
                .put("confidence", classification.confidence)
                .put("capturedAt", timestamp())
                .put("contentHash", hash)
                .put("recognizedText", text)
                .put("lines", lines);
        records.put(record);
        while (records.length() > MAX_RECORDS) records = removeFirst(records);
        prefs.edit().putString(KEY_RECORDS, records.toString()).apply();
        updateNotification("Captured " + records.length() + " unique game screens");
    }

    private JSONArray removeFirst(JSONArray source) throws JSONException {
        JSONArray out = new JSONArray();
        for (int i = 1; i < source.length(); i++) out.put(source.get(i));
        return out;
    }

    private Classification classify(String text) {
        String value = normalize(text);
        if (has(value, "retaliation breakdown", "damage per enemy attack", "reflecting bonuses")) return new Classification("retaliation_damage_breakdown", .97);
        if (has(value, "attack damage breakdown", "combined multiplier", "layered product") && has(value,"weapon","final damage")) return new Classification("attack_damage_breakdown", .95);
        if (has(value, "pet damage breakdown", "effective multiplier") && has(value,"equipment affixes","pet shards")) return new Classification("pet_damage_breakdown", .95);
        if (has(value, "character stats", "dodge chance", "block chance") || has(value,"effective drop multiplier","life on hit")) return new Classification("character_stats", .89);
        if (has(value, "rune bonuses")) return new Classification("rune_stat_breakdown", .86);
        if (has(value, "bonuses", "increased strength", "material quantity", "extra kill chance")) return new Classification("pet_stat_breakdown", .78);
        if (has(value, "bonuses", "passive tree", "attack damage", "defense")) return new Classification("passive_stat_breakdown", .74);
        if (has(value, "rune grid", "presets")) return new Classification("runes", .86);
        if (has(value, "passive tree", "skill tree", "attack damage", "strength") && has(value,"assign","refund")) return new Classification("passive_skill_tree", .84);
        if (has(value, "class skills")) return new Classification("class_skills", .82);
        if (has(value, "affixes", "equipment affixes") || has(value,"unequip","upgrade","craft")) return new Classification("gear_detail", .84);
        if (has(value,"pet mastery","favourite pets","hatch") || has(value,"pets gain xp")) return new Classification("pets", .84);
        if (has(value,"monster level","stats","character")) return new Classification("character_overview", .68);
        return new Classification("other", 0);
    }

    private boolean has(String haystack, String... needles) {
        for (String needle : needles) if (haystack.contains(needle)) return true;
        return false;
    }

    private String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9%+.×x]+", " ").trim().replaceAll("\\s+", " ");
    }

    private String clean(String value) { return value == null ? "" : value.trim().replaceAll("\\s+", " "); }
    private double round4(double value) { return Math.round(value * 10000d) / 10000d; }
    private String timestamp() {
        java.text.SimpleDateFormat format = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        format.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
        return format.format(new java.util.Date());
    }
    private String sha256(String value) throws Exception {
        byte[] bytes = MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        for (byte b : bytes) out.append(String.format(Locale.ROOT, "%02x", b));
        return out.toString();
    }

    private void recordError(String message) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString("lastError", message == null ? "Capture could not start" : message).putBoolean(KEY_ACTIVE, false).apply();
    }

    private void stopCapture(boolean stopProjection) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean(KEY_ACTIVE, false).apply();
        if (virtualDisplay != null) { virtualDisplay.release(); virtualDisplay = null; }
        if (imageReader != null) { imageReader.setOnImageAvailableListener(null, null); imageReader.close(); imageReader = null; }
        if (projection != null) {
            try { projection.unregisterCallback(projectionCallback); } catch (Exception ignored) {}
            if (stopProjection) projection.stop();
            projection = null;
        }
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Screen capture", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Visible notification while Arcana reads game text from your screen");
            ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Intent stop = new Intent(this, ScreenCaptureService.class).setAction(ACTION_STOP);
        PendingIntent stopIntent = PendingIntent.getService(this, 6205, stop,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_menu_view)
                .setContentTitle("Arcana character scan is active")
                .setContentText("On-device OCR · no screenshots saved · tap Stop when finished")
                .setOngoing(true)
                .addAction(android.R.drawable.ic_media_pause, "Stop capture", stopIntent)
                .build();
    }

    private void updateNotification(String text) {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_menu_view)
                .setContentTitle("Arcana character scan is active")
                .setContentText(text)
                .setOngoing(true)
                .addAction(android.R.drawable.ic_media_pause, "Stop capture",
                        PendingIntent.getService(this, 6205, new Intent(this, ScreenCaptureService.class).setAction(ACTION_STOP),
                                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)))
                .build();
        ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).notify(NOTIFICATION_ID, notification);
    }

    @Override public void onDestroy() {
        if (recognizer != null) recognizer.close();
        if (workerThread != null) workerThread.quitSafely();
        super.onDestroy();
    }

    @Nullable @Override public IBinder onBind(Intent intent) { return null; }

    private static final class Classification {
        final String type; final double confidence;
        Classification(String type, double confidence) { this.type = type; this.confidence = confidence; }
    }
}
