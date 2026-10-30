async function getSheetsToken(userEmail){
  const provider=new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  if(userEmail)provider.setCustomParameters({login_hint:userEmail,hd:'markdayschool.org'});
  const user=firebase.auth().currentUser;
  if(!user||user.email!==userEmail)throw new Error('Sign in with your authorized school account first.');
  const result=await user.reauthenticateWithPopup(provider);
  return result.credential?.accessToken||null;
}

const REGISTRAR_SOURCES=[
 {label:'K–4 Class Lists 2026–2027',id:'18LCnerCUBWiPmry-wrw_ifrQiGoHiMx10HEnLaIFU_4'},
 {label:'5–8 Class Lists 2026–2027',id:'1BzCLhNBellOKfpdY3fxWwveH2tG3ZChQk5os2Yaxn5Y'}
];
async function sheetsRead(token,path){
 const response=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+path,{headers:{Authorization:`Bearer ${token}`}});
 if(!response.ok)throw Error(`Google Sheets returned ${response.status}. Check this account can open the sheet and grant read-only access. You can also copy cells and use Paste / CSV.`);
 return response.json();
}
async function listRosterTabs(token,id){
 const meta=await sheetsRead(token,`${id}?fields=sheets.properties`);
 return meta.sheets.map(s=>s.properties).filter(s=>s.sheetType==='GRID'||!s.sheetType);
}
async function fetchRosterTabs(token,id,tabs){
 const groups=[],warnings=[];
 for(const tab of tabs){
  if(tab.gridProperties?.rowCount>2000||tab.gridProperties?.columnCount>52)throw Error(`“${tab.title}” exceeds the import limit (2,000 rows / 52 columns). Copy the roster cells into Paste / CSV instead.`);
  const range="'"+tab.title.replace(/'/g,"''")+"'!A1:AZ2000";
  const data=await sheetsRead(token,`${id}/values/${encodeURIComponent(range)}`);
  const rows=data.values||[],parsed=RosterImport.registrar(rows,tab.title);
  if(!parsed.length){warnings.push(`No registrar layout recognized in “${tab.title}”. Copy its student column into Paste / CSV.`);continue;}
  groups.push(...parsed.map(g=>({...g,sourceKey:`${id}:${tab.sheetId}:${g.key}`})));
 }
 return {groups,warnings};
}
