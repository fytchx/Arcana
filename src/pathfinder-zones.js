/* Pathfinder visual identity for the twelve IdleArc biomes.
 * Names, order, displayed tier, and emblem families follow the provided
 * in-game Select Biome screenshots (2026-10-19). Background tiles are exact
 * indices from /assets/official-art/manifest.json -> categories.biomes.
 * These are presentation properties, not material-drop inference. */
const ICON_SHAPES=Object.freeze({
 tree:'<path fill="currentColor" d="M12 1 4.5 11h4l-5 7H10v5h4v-5h6.5l-5-7h4z"/>',
 sun:'<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path stroke="currentColor" stroke-width="2.3" stroke-linecap="round" d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.2 2.2m11.2 11.2 2.2 2.2M19.8 4.2l-2.2 2.2M6.4 17.6l-2.2 2.2"/>',
 waves:'<path fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" d="M1.5 5c2.4-2.2 4.7-2.2 7.1 0s4.8 2.2 7.2 0 4.6-2.2 6.7 0M1.5 11.4c2.4-2.2 4.7-2.2 7.1 0s4.8 2.2 7.2 0 4.6-2.2 6.7 0M1.5 17.8c2.4-2.2 4.7-2.2 7.1 0s4.8 2.2 7.2 0 4.6-2.2 6.7 0"/>',
 snow:'<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 1v22M1 12h22M4.2 4.2l15.6 15.6m0-15.6L4.2 19.8M8.6 3.1 12 6.4l3.4-3.3M8.6 20.9l3.4-3.3 3.4 3.3M3.1 8.6 6.4 12l-3.3 3.4m17.8-6.8L17.6 12l3.3 3.4"/>',
 moon:'<path fill="currentColor" d="M19.5 15.9A9 9 0 0 1 8.1 4.5 9.2 9.2 0 1 0 19.5 15.9Z"/>',
 flame:'<path fill="currentColor" d="M12.5 1.2c1.2 4.3 5 5.9 5 10.1 0 1.9-.7 3.4-1.5 4.5.1-3-1.4-4.9-3.4-6.7.2 3.6-5.9 5.8-5.9 9.2 0 3 2.3 5.2 5.3 5.2 5.2 0 8.6-3.4 8.6-8.5 0-5.5-5.6-8.7-8.1-13.8-.7 4-4.5 5.7-4.5 10.6-.1 2 .4 3.3 1.1 4.8-3.2-1.4-4.7-4.6-4.4-8.1.3-4.2 4.8-6.8 5.6-11.7 2.8 1.6 5.1 3.6 6.5 6.3Z"/>'
});
const RECORDS=[
 ['Verdant Woods',1,'tree','#65BD75',23],
 ['Scorched Sands',1,'sun','#F0A13C',19],
 ['Murky Depths',2,'waves','#3DBCB4',17],
 ['Frozen Peaks',3,'snow','#78C9F3',14],
 ['Shadow Realm',4,'moon','#AA82F0',20],
 ['Infernal Pits',5,'flame','#F16C58',16],
 ['Elderwood',6,'tree','#82C88E',11],
 ['Glasslands',7,'sun','#E9AD59',15],
 ['Drowned Abyss',8,'waves','#54C4BB',10],
 ['Shattered Summit',9,'snow','#88C5ED',21],
 ['Umbral Rift',10,'moon','#AD80F0',22],
 ["Oblivion's Crown",11,'flame','#EC6376',18]
];
export const PATHFINDER_ZONES=Object.freeze(RECORDS.map(([name,tier,symbol,color,tile],order)=>{
 const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const x=(tile%8)/7*100,y=Math.floor(tile/8)/2*100;
 return Object.freeze({name,slug,tier,symbol,color,tile,order,atlasX:Number(x.toFixed(5)),atlasY:Number(y.toFixed(5))});
}));
const BY_NAME=new Map(PATHFINDER_ZONES.map(x=>[x.name.toLowerCase(),x]));
export const pathfinderZone=name=>BY_NAME.get(String(name??'').trim().toLowerCase())||null;
export const pathfinderZoneOrder=name=>pathfinderZone(name)?.order??Number.MAX_SAFE_INTEGER;
export function pathfinderZoneIcon(name){
 const zone=pathfinderZone(name);
 if(!zone)return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 9 18H3z"/><path d="M12 9v5m0 3v1"/></svg>';
 return '<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">'+ICON_SHAPES[zone.symbol]+'</svg>';
}
