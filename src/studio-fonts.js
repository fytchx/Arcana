// Curated display and interface faces. Real Google Fonts with carefully chosen fallbacks.
// Shared by published themes, draft previews, and embedded real-page preview.
export const STUDIO_FONTS=Object.freeze([
 ['system','System clean','system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'],
 ['rounded','Soft rounded','ui-rounded,"Trebuchet MS",system-ui,sans-serif'],
 ['serif','Classic editorial','Georgia,"Times New Roman",serif'],
 ['mono','System mono','ui-monospace,Consolas,monospace'],
 ['inter','Inter · precise','"Inter",system-ui,sans-serif'],
 ['manrope','Manrope · polished','"Manrope",system-ui,sans-serif'],
 ['outfit','Outfit · modern','"Outfit",system-ui,sans-serif'],
 ['space-grotesk','Space Grotesk · futuristic','"Space Grotesk",system-ui,sans-serif'],
 ['sora','Sora · digital','"Sora",system-ui,sans-serif'],
 ['rubik','Rubik · friendly','"Rubik",system-ui,sans-serif'],
 ['dm-sans','DM Sans · balanced','"DM Sans",system-ui,sans-serif'],
 ['cinzel','Cinzel · arcane','"Cinzel",Georgia,serif'],
 ['playfair','Playfair Display · editorial','"Playfair Display",Georgia,serif'],
 ['cormorant','Cormorant Garamond · elegant','"Cormorant Garamond",Georgia,serif'],
 ['fraunces','Fraunces · expressive','"Fraunces",Georgia,serif'],
 ['merriweather','Merriweather · literary','"Merriweather",Georgia,serif'],
 ['jetbrains','JetBrains Mono · technical','"JetBrains Mono",ui-monospace,monospace'],
 ['barlow','Barlow Condensed · athletic','"Barlow Condensed","Arial Narrow",sans-serif']
]);
export const STUDIO_FONT_OPTIONS=Object.freeze(STUDIO_FONTS.map(([id,label])=>[id,label]));
const MAP=new Map(STUDIO_FONTS.map(([id,,stack])=>[id,stack]));
export const fontStack=id=>MAP.get(id)||MAP.get('system');
export const validStudioFont=id=>MAP.has(id);
