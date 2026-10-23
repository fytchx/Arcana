import {fieldNumber} from './damage-formula.js';

export const FORMULA_UNITS={
 flat:[['','Value'],['K','K'],['M','M'],['B','B'],['T','T'],['Q','Q']],
 percent:[['%','%'],['K%','K%'],['M%','M%'],['B%','B%'],['T%','T%'],['Q%','Q%'],['x','×']],
 factor:[['x','×']],percentOf:[['%','%']]
};
// Preserve saved text and its precision. Split only for display; the engine
// continues to consume the same canonical values as before this UI update.
export function splitFormulaInput(raw,kind){
 const text=String(raw??'').trim(),fallback=FORMULA_UNITS[kind][0][0];
 if(!text)return {amount:'',unit:fallback};
 const factor=text.match(/^[x×]\s*(.*)$/i);
 if(factor&&(kind==='factor'||kind==='percent'))return {amount:factor[1],unit:'x'};
 const match=text.match(/^([+\-]?(?:\d[\d,]*(?:\.\d*)?|\.\d+)(?:e[+\-]?\d+)?)\s*([kmbtq]?)\s*(%?)$/i);
 if(!match||!Number.isFinite(fieldNumber(text,kind)))return {amount:text,unit:fallback};
 const unit=kind==='flat'?match[2].toUpperCase():kind==='percent'?match[2].toUpperCase()+'%':fallback;
 if(!FORMULA_UNITS[kind].some(([id])=>id===unit))return {amount:text,unit:fallback};
 return {amount:match[1],unit};
}
export function joinFormulaInput(amount,unit,kind){
 const text=String(amount??'').trim();if(!text)return '';
 // Pasted/typed shorthand wins over the selector; never make 100m become
 // 100mM, and never silently clean malformed input into a different number.
 if(/^[x×]/i.test(text)||/%\s*$/i.test(text))return text;
 if(/[kmbtq]\s*$/i.test(text))return unit==='x'?'x'+text:text;
 if(!FORMULA_UNITS[kind].some(([id])=>id===unit))return text;
 return unit==='x'?'x'+text:text+unit;
}
export function formulaInputHint(raw,kind){
 const n=fieldNumber(raw,kind);
 if(n===null)return kind==='flat'?'Choose a unit for large values':kind==='percent'?'Bonus % or direct multiplier':'Copy the value from your breakdown';
 if(!Number.isFinite(n)||n<0)return 'Check this value';
 const fmt=n=>n.toLocaleString('en-US',{maximumFractionDigits:6});
 if(kind==='percent')return '×'+fmt(1+n/100)+' multiplier';
 if(kind==='factor')return '×'+fmt(n)+' multiplier';
 if(kind==='percentOf')return fmt(n)+'% of maximum';
 return '= '+fmt(n);
}
export function averageChange(before,after){
 if(!before?.ready||!after?.ready||before.average<=0)return null;
 const change=(after.average/before.average-1)*100;
 return Number.isFinite(change)?change:null;
}
