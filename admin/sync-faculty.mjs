// Privileged administrator utility; default is dry-run. No Workspace OU or Directory API.
import {initializeApp, applicationDefault} from 'firebase-admin/app';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {eligibleFaculty, parseAllowlist} from './policy.mjs';
import {readFile} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
const apply = process.argv.includes('--apply');
const {GOOGLE_APPLICATION_CREDENTIALS, FACULTY_ALLOWLIST_PATH, FIREBASE_PROJECT_ID} = process.env;
if (!GOOGLE_APPLICATION_CREDENTIALS || !FACULTY_ALLOWLIST_PATH || !isAbsolute(FACULTY_ALLOWLIST_PATH) || FIREBASE_PROJECT_ID !== 'seatingchart-a4cae') {
  throw Error('Set external GOOGLE_APPLICATION_CREDENTIALS, absolute FACULTY_ALLOWLIST_PATH and FIREBASE_PROJECT_ID=seatingchart-a4cae.');
}
// Validate the entire input before initializing clients or modifying any grants.
const approvals = parseAllowlist(JSON.parse(await readFile(FACULTY_ALLOWLIST_PATH, 'utf8')));
initializeApp({credential: applicationDefault(), projectId: FIREBASE_PROJECT_ID});
const db = getFirestore(), auth = getAuth();
let token, granted = 0, revoked = 0;
do {
  const page = await auth.listUsers(1000, token);
  for (const identity of page.users) {
    const ref = db.collection('facultyAccess').doc(identity.uid);
    if (eligibleFaculty(identity, approvals)) {
      granted++;
      if (apply) await ref.set({
        email: identity.email,
        expiresAt: Timestamp.fromMillis(Math.min(Date.now() + 3600000, approvals.get(identity.email.toLowerCase()))),
        verifiedAt: Timestamp.now(),
        source: 'administrator-allowlist'
      });
    } else {
      revoked++;
      if (apply) await ref.delete();
    }
  }
  token = page.pageToken;
} while (token);
console.log(`${apply ? 'Applied' : 'Dry run'}: ${granted} approved Faculty identities; ${revoked} denied identities. No student records read or changed.`);
