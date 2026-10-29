// Administrator-only utility. Never bundle or serve this directory as a backend.
// Default is dry-run. Credentials remain outside this repository.
import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getFirestore,Timestamp} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {google} from 'googleapis';
import {eligibleFaculty} from './policy.mjs';
import {readFile} from 'node:fs/promises';
const apply=process.argv.includes('--apply');
const {GOOGLE_APPLICATION_CREDENTIALS,WORKSPACE_ADMIN_EMAIL,FACULTY_OU_PATH,FIREBASE_PROJECT_ID}=process.env;
if(!GOOGLE_APPLICATION_CREDENTIALS||!WORKSPACE_ADMIN_EMAIL||!FACULTY_OU_PATH||FIREBASE_PROJECT_ID!=='seatingchart-a4cae')throw Error('Set external delegated service-account credentials, WORKSPACE_ADMIN_EMAIL, exact FACULTY_OU_PATH and FIREBASE_PROJECT_ID=seatingchart-a4cae.');
if(!WORKSPACE_ADMIN_EMAIL.endsWith('@markdayschool.org')||!FACULTY_OU_PATH.startsWith('/')||FACULTY_OU_PATH==='/')throw Error('Invalid school administrator or Faculty OU path.');
const key=JSON.parse(await readFile(GOOGLE_APPLICATION_CREDENTIALS,'utf8'));
const client=new google.auth.JWT({email:key.client_email,key:key.private_key,subject:WORKSPACE_ADMIN_EMAIL,scopes:['https://www.googleapis.com/auth/admin.directory.user.readonly']});
const directory=google.admin({version:'directory_v1',auth:client});
initializeApp({credential:applicationDefault(),projectId:FIREBASE_PROJECT_ID});
const db=getFirestore(),auth=getAuth();let token,granted=0,revoked=0;
// Membership is checked against the exact OU, not a domain or client-supplied claim.
// Child OUs are excluded intentionally until the administrator changes this policy.
do {const page=await auth.listUsers(1000,token);for(const u of page.users){
 let eligible=false;
 if(!u.disabled&&u.emailVerified&&u.email?.endsWith('@markdayschool.org')&&u.providerData.some(p=>p.providerId==='google.com')){
  try{const {data}=await directory.users.get({userKey:u.email,projection:'basic'});eligible=eligibleFaculty(u,data,FACULTY_OU_PATH);}
  catch(e){if(e.code!==404)throw Error('Directory verification failed; no further grants issued. Existing grants expire within one hour.');}
 }
 const ref=db.collection('facultyAccess').doc(u.uid);
 if(eligible){granted++;if(apply)await ref.set({email:u.email,expiresAt:Timestamp.fromMillis(Date.now()+3600000),verifiedAt:Timestamp.now()});}
 else{revoked++;if(apply)await ref.delete();}
}token=page.pageToken;}while(token);
// Deleted Firebase identities cannot use an existing access grant; remove orphan grants separately if desired.
console.log(`${apply?'Applied':'Dry run'}: ${granted} eligible Faculty identities; ${revoked} denied identities. No student records read or changed.`);
