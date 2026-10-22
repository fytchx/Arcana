package com.arcanacompanion.damagecalculator;

import android.app.Activity;
import android.media.projection.MediaProjectionManager;
import android.content.Intent;
import android.content.Context;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public final class MainActivity extends Activity {
    private static final int CREATE_JSON_FILE = 701;
    private static final int REQUEST_SCREEN_CAPTURE = 702;
    private WebView webView;
    private String pendingJson;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(16, 20, 22));
        getWindow().setNavigationBarColor(Color.rgb(16, 20, 22));
        getWindow().getDecorView().setSystemUiVisibility(0);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(16, 20, 22));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(false);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new ExportBridge(), "ArcanaBridge");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    private final class ExportBridge {
        @JavascriptInterface
        public void saveTextFile(String filename, String content) {
            runOnUiThread(() -> {
                pendingJson = content;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, filename);
                startActivityForResult(intent, CREATE_JSON_FILE);
            });
        }

        @JavascriptInterface
        public void startScreenCapture() {
            runOnUiThread(() -> {
                MediaProjectionManager manager = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
                startActivityForResult(manager.createScreenCaptureIntent(), REQUEST_SCREEN_CAPTURE);
            });
        }

        @JavascriptInterface
        public void stopScreenCapture() {
            runOnUiThread(() -> {
                Intent intent = new Intent(MainActivity.this, ScreenCaptureService.class).setAction(ScreenCaptureService.ACTION_STOP);
                startService(intent);
            });
        }

        @JavascriptInterface
        public String getScreenScanState() {
            return getSharedPreferences(ScreenCaptureService.PREFS, MODE_PRIVATE).getString(ScreenCaptureService.KEY_RECORDS, "[]");
        }

        @JavascriptInterface
        public boolean isScreenCaptureActive() {
            return getSharedPreferences(ScreenCaptureService.PREFS, MODE_PRIVATE).getBoolean(ScreenCaptureService.KEY_ACTIVE, false);
        }

        @JavascriptInterface
        public String getScreenCaptureError() {
            return getSharedPreferences(ScreenCaptureService.PREFS, MODE_PRIVATE).getString("lastError", "");
        }

        @JavascriptInterface
        public void clearScreenScan() {
            getSharedPreferences(ScreenCaptureService.PREFS, MODE_PRIVATE).edit()
                    .putString(ScreenCaptureService.KEY_RECORDS, "[]").remove("lastError").apply();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_SCREEN_CAPTURE) {
            if (resultCode != RESULT_OK || data == null) {
                if (webView != null) webView.evaluateJavascript("window.arcanaCapturePermissionDenied && window.arcanaCapturePermissionDenied()", null);
                return;
            }
            Intent service = new Intent(this, ScreenCaptureService.class)
                    .setAction(ScreenCaptureService.ACTION_START)
                    .putExtra("resultCode", resultCode)
                    .putExtra("resultData", data);
            if (android.os.Build.VERSION.SDK_INT >= 26) startForegroundService(service);
            else startService(service);
            if (webView != null) webView.evaluateJavascript("window.arcanaCaptureStarted && window.arcanaCaptureStarted()", null);
            return;
        }
        if (requestCode != CREATE_JSON_FILE) return;
        if (resultCode != RESULT_OK || data == null || data.getData() == null || pendingJson == null) {
            pendingJson = null;
            return;
        }
        Uri destination = data.getData();
        try (OutputStream output = getContentResolver().openOutputStream(destination)) {
            if (output == null) throw new IllegalStateException("Unable to open the selected file.");
            output.write(pendingJson.getBytes(StandardCharsets.UTF_8));
            Toast.makeText(this, "Character data file saved", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "Could not save the character data file", Toast.LENGTH_LONG).show();
        } finally {
            pendingJson = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
