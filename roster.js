(function(root){
  'use strict';
  const clean=v=>String(v??'').trim();
  function delimited(text,delimiter){
    const rows=[];let row=[],field='',quoted=false;
    text=String(text).replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(ch===delimiter&&!quoted){row.push(field);field='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';}else field+=ch;}
    if(quoted)throw Error('An opening quote has no closing quote. Check the pasted text or CSV.');row.push(field);rows.push(row);return rows;
  }
  const metadata=/^(?:(?:homeroom |support )?teacher\s*:|(?:math|english|science|history)\s*:|(?:hybrid|enriched) algebra|bold\s*=|dear parents|mentor homerooms|homerooms open|students must|homeroom partners)/i;
  const person=v=>{const name=clean(v).replace(/\s*\([78]\)\s*$/,'').replace(/\s+/g,' ');return {name};};
  function registrar(rows,title='Imported roster'){
    rows=rows.map(r=>r.map(clean));const result=[];
    const max=Math.max(0,...rows.map(r=>r.length));
    if(/mentor/i.test(title)||rows.some(r=>r.filter(v=>/\([78]\)\s*$/.test(v)).length>=2)){
      for(let col=0;col<max;col++){let group=null;for(let i=0;i<rows.length;i++){const value=rows[i][col]||'';if(/\([78]\)\s*$/.test(value)){if(group)group.students.push(person(value));}else if(value && /\([78]\)\s*$/.test(rows[i+1]?.[col]||'')){group={name:`${title} · ${value}`,students:[],key:`${i}:${col}`};result.push(group);}}}
      return result.filter(r=>r.students.length);
    }
    const headerRow=rows.findIndex(r=>r.some(v=>/^(?:(?:homeroom )?teacher\s*:|[78][A-Z]$|PE SECTION\s*\d|(?:Ms|Mrs|Mr|Dr)\.\s)/i.test(v)));
    if(headerRow<0)return [];
    for(let col=0;col<max;col++){
      const header=rows[headerRow][col]||'';if(!header||! /^(?:(?:homeroom )?teacher\s*:|[78][A-Z]$|PE SECTION\s*\d|(?:Ms|Mrs|Mr|Dr)\.\s)/i.test(header))continue;
      const preceding=rows[headerRow-1]?.[col]||'';
      const subject=/^(Mandarin|Spanish)/i.test(preceding)?preceding+' · ':'';
      const label=header.replace(/^(?:homeroom )?teacher:\s*/i,'');const students=[];
      for(let i=headerRow+1;i<rows.length;i++){const value=rows[i][col]||'';if(/^bold\s*=/i.test(value))break;if(!value||metadata.test(value))continue;students.push(person(value));}
      if(students.length)result.push({name:`${title} · ${subject}${label}`,students,key:`${headerRow}:${col}`});
    }
    return result;
  }
  function parse(text,{format='auto',name='Imported class'}={}){
    if(!clean(text))throw Error('Paste a roster or choose a file first.');
    if(text.length>2000000)throw Error('Please import a smaller file (under 2 MB).');
    if(format==='names')return [{name,students:text.split(/\r?\n/).map(clean).filter(Boolean).map(person)}];
    const rows=delimited(text,(text.split(/\r?\n/,1)[0]).includes('\t')?'\t':',');
    const csvHeader=rows.find(r=>r.some(v=>clean(v)))?.some(v=>/^(?:name|student|student name|full name|first ?name|last ?name|preferred name|display name|class|class name|section|homeroom|gender)$/i.test(clean(v)));
    if(format==='registrar'||(format==='auto'&&!csvHeader)){const groups=registrar(rows,name);if(groups.length)return groups;if(format==='registrar')throw Error('No registrar headers found. Include teacher or section headers, or choose one name per line.');}
    const nonempty=rows.filter(r=>r.some(v=>clean(v))),head=nonempty[0].map(v=>clean(v).toLowerCase());
    const index=(...names)=>head.findIndex(h=>names.includes(h));
    const ni=index('name','student','student name','full name'),fi=index('first name','firstname'),li=index('last name','lastname'),ci=index('class','class name','section','homeroom'),pi=index('preferred name','display name'),gi=index('gender');
    if(ni<0&&fi<0){if(nonempty.some(r=>r.length>1))throw Error('For CSV or pasted columns, include Name or First name / Last name headers. For “Last, First” names, select one name per line.');return [{name,students:nonempty.map(r=>person(r[0]))}];}
    const groups=new Map();for(const r of nonempty.slice(1)){const full=ni>=0?clean(r[ni]):[clean(r[fi]),li>=0?clean(r[li]):''].filter(Boolean).join(' ');if(!full)continue;const className=ci>=0?clean(r[ci]):name;if(!className)throw Error('A student row has no class name. Fill the Class column before importing.');if(!groups.has(className))groups.set(className,{name:className,students:[]});groups.get(className).students.push({name:full,...fi>=0?{firstName:clean(r[fi]),lastName:li>=0?clean(r[li]):''}:{},preferredName:pi>=0?clean(r[pi]):'',gender:gi>=0?clean(r[gi]):''});}
    if(!groups.size)throw Error('No student rows found below the headers.');return [...groups.values()];
  }
  function sheetId(value){const s=clean(value);const match=s.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);if(match)return match[1];if(/^[\w-]{20,}$/.test(s))return s;throw Error('Paste a Google Sheets link or spreadsheet ID.');}
  const api={delimited,registrar,parse,sheetId};if(typeof module!=='undefined')module.exports=api;else root.RosterImport=api;
})(globalThis);
