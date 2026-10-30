// Run against the emulator only: npm run test:rules (never production).
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,deleteDoc,Timestamp,collection,query,where,getDocs} from 'firebase/firestore';
const env=await initializeTestEnvironment({projectId:'demo-seating-v2',firestore:{rules:await readFile('firestore.rules','utf8')}});
const now=Date.now();const identity=(uid,email=uid==='teacher'?'tgreenleaf@markdayschool.org':uid+'@markdayschool.org',verified=true,provider='google.com')=>env.authenticatedContext(uid,{email,email_verified:verified,firebase:{sign_in_provider:provider}}).firestore();
try{
 await env.withSecurityRulesDisabled(async ctx=>{const db=ctx.firestore();await setDoc(doc(db,'facultyAccess/teacher'),{email:'teacher@markdayschool.org',expiresAt:Timestamp.fromMillis(now+3600000)});await setDoc(doc(db,'facultyAccess/colleague'),{email:'colleague@markdayschool.org',expiresAt:Timestamp.fromMillis(now+3600000)});await setDoc(doc(db,'sharedViews/expired'),{ownerUid:'teacher',expiresAt:Timestamp.fromMillis(now-1000),chart:{}});await setDoc(doc(db,'facultyAccess/expired'),{email:'expired@markdayschool.org',expiresAt:Timestamp.fromMillis(now-1000)});await setDoc(doc(db,'users/teacher'),{d:{classes:[]}});await setDoc(doc(db,'sharedClasses/legacy'),{students:['private']});await setDoc(doc(db,'sharedViews/live'),{ownerUid:'teacher',expiresAt:Timestamp.fromMillis(now+3600000),chart:{}});});
 const teacher=identity('teacher'),colleague=identity('colleague');
 await assertSucceeds(getDoc(doc(teacher,'users/teacher')));
 for(const db of [env.unauthenticatedContext().firestore(),identity('student'),identity('expired'),identity('external','external@gmail.com'),identity('teacher','tgreenleaf@markdayschool.org',false),identity('teacher','tgreenleaf@markdayschool.org',true,'password')])await assertFails(getDoc(doc(db,'users/teacher')));
 await assertFails(getDoc(doc(teacher,'users/other')));
 await assertFails(getDoc(doc(colleague,'users/teacher')));
 await assertFails(setDoc(doc(colleague,'users/teacher'),{d:{classes:[]}}));
 await assertSucceeds(setDoc(doc(teacher,'users/teacher'),{d:{classes:[]}}));
 await assertFails(getDoc(doc(colleague,'sharedViews/expired')));
 await assertFails(getDoc(doc(colleague,'sharedViews/live')));
 await assertSucceeds(getDocs(query(collection(teacher,'sharedViews'),where('ownerUid','==','teacher'))));
 await assertSucceeds(setDoc(doc(teacher,'sharedViews/new'),{ownerUid:'teacher',expiresAt:Timestamp.fromMillis(now+3600000),chart:{name:'Synthetic',room:{width:1100,height:600}} }));
 await assertFails(setDoc(doc(colleague,'sharedViews/new'),{ownerUid:'teacher',expiresAt:Timestamp.fromMillis(now+3600000),chart:{name:'Tampered'}}));
 await assertFails(setDoc(doc(teacher,'sharedViews/forever'),{ownerUid:'teacher',expiresAt:Timestamp.fromMillis(now+30*86400000),chart:{}}));
 await assertFails(setDoc(doc(teacher,'facultyAccess/teacher'),{expiresAt:Timestamp.fromMillis(now+99999999)}));
 await assertFails(getDoc(doc(teacher,'sharedClasses/legacy')));
 await assertFails(setDoc(doc(teacher,'schoolNotes/markdayschool_org/students/example'),{note:'test'}));
 await assertSucceeds(getDoc(doc(teacher,'sharedViews/live')));
 await assertFails(deleteDoc(doc(identity('student'),'sharedViews/live')));
 await assertSucceeds(deleteDoc(doc(teacher,'sharedViews/live')));
 await assertFails(getDoc(doc(colleague,'users/colleague')));
 console.log('PASS: Owner-only account,  Faculty, non-Faculty, anonymous, external, expired, provider, isolation, grant tampering, legacy sharing, notes, and revocation checks.');
}finally{await env.cleanup();}
