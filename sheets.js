const ROSTER_SHEET_ID='1uvuCvkcqCLXokBlRlHJTtqE6S2UpMP-mKQbuyTBaws4';
const GRADE_MAP={'kindergarten':'K','kinder':'K','k':'K','first grade':'1','1st grade':'1','1st':'1','second grade':'2','2nd grade':'2','2nd':'2','third grade':'3','3rd grade':'3','3rd':'3','fourth grade':'4','4th grade':'4','4th':'4','fifth grade':'5','5th grade':'5','5th':'5','sixth grade':'6','6th grade':'6','6th':'6'};
async function getSheetsToken(userEmail){
  const provider=new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  if(userEmail)provider.setCustomParameters({login_hint:userEmail,hd:'markdayschool.org'});
  const user=firebase.auth().currentUser;
  if(!user||user.email!==userEmail)throw new Error('Sign in with your authorized school account first.');
  const result=await user.reauthenticateWithPopup(provider);
  return result.credential?.accessToken||null;
}

async function fetchAllRosters(token){
  const BASE='https://sheets.googleapis.com/v4/spreadsheets';
  const h={Authorization:`Bearer ${token}`};
  const metaRes=await fetch(`${BASE}/${ROSTER_SHEET_ID}?fields=sheets.properties`,{headers:h});
  if(!metaRes.ok)throw new Error(`Sheets API error ${metaRes.status} — try signing in again`);
  const meta=await metaRes.json();
  const classes=[];
  for(const sheet of(meta.sheets||[])){
    const title=sheet.properties.title;
    const grade=GRADE_MAP[title.trim().toLowerCase()];
    if(!grade)continue;
    const valRes=await fetch(`${BASE}/${ROSTER_SHEET_ID}/values/${encodeURIComponent(title)}`,{headers:h});
    if(!valRes.ok)continue;
    const{values:rows=[]}=await valRes.json();
    // Find the teacher row (first row containing a cell starting with "Teacher:")
    let teacherRowIdx=-1;
    for(let i=0;i<Math.min(rows.length,8);i++){
      if((rows[i]||[]).some(c=>c&&/^Teacher:/i.test(c))){teacherRowIdx=i;break;}
    }
    if(teacherRowIdx<0)continue;
    const teacherRow=rows[teacherRowIdx];
    const numCols=Math.max(...rows.map(r=>(r||[]).length));
    for(let col=0;col<numCols;col++){
      const teacherCell=(teacherRow[col]||'').trim();
      if(!/^Teacher:/i.test(teacherCell))continue;
      const teacherName=teacherCell.replace(/^Teacher:\s*/i,'').trim();
      const lastName=teacherName.split(' ').pop();
      const code=`${grade}${lastName[0].toUpperCase()}`;
      // Students start 2 rows after teacher row (skipping support teacher row)
      const students=[];
      for(let r=teacherRowIdx+2;r<rows.length;r++){
        const cell=((rows[r]||[])[col]||'').trim();
        if(!cell||/^bold\s*=/i.test(cell))continue;
        students.push(cell);
      }
      if(students.length>0)classes.push({code,teacher:teacherName,grade:title.trim(),students});
    }
  }
  return classes;
}

