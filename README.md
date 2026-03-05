# Seating Chart Builder

A classroom seating chart tool with Google login and cloud sync — works from any browser.

---

## One-time setup (~15 minutes)

### Step 1 — Install tools (on your Mac, in Terminal)

```bash
npm install -g firebase-tools
```

### Step 2 — Create a Firebase project

1. Go to **https://console.firebase.google.com**
2. Click **Add project** → name it `seating-chart` → Continue → Create project
3. In the left sidebar click **Authentication** → **Get started**
4. Under **Sign-in method**, enable **Google** → save
5. In the left sidebar click **Firestore Database** → **Create database**
   - Choose **Production mode** → select a region (us-central1 is fine) → Enable
6. In Firestore, click the **Rules** tab → replace all the text with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```
   Click **Publish**.

### Step 3 — Get your Firebase config

1. In Firebase Console, click the ⚙️ gear → **Project settings**
2. Scroll to **Your apps** → click **</>** (Add web app)
3. Name it `seating-chart-web` → Register app
4. Copy the `firebaseConfig` object — you'll need these 6 values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Step 4 — Paste the config into index.html

Open `index.html` in a text editor and find this block near the top:

```js
window.FB_CONFIG = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  ...
};
```

Replace each `REPLACE_WITH_...` value with the corresponding value from Step 3.

### Step 5 — Add your domain to Firebase authorized domains

1. In Firebase Console → Authentication → **Settings** tab
2. Under **Authorized domains**, click **Add domain**
3. Add `your-github-username.github.io` (e.g. `tgreenleaf.github.io`)

---

## Deploy to GitHub Pages

### First deploy

```bash
cd ~/GitHubProjects/SeatingChart

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repo (authenticate first if needed: gh auth login)
gh repo create SeatingChart --public --source=. --push

# Enable GitHub Pages from the main branch
gh api repos/{owner}/SeatingChart/pages \
  --method POST \
  --field source='{"branch":"main","path":"/"}' \
  2>/dev/null || true
```

Your app will be live at:
`https://YOUR-GITHUB-USERNAME.github.io/SeatingChart/`

(GitHub Pages usually takes 1–2 minutes after the first push.)

### Updating after changes

```bash
cd ~/GitHubProjects/SeatingChart
git add index.html
git commit -m "Update app"
git push
```

GitHub Pages redeploys automatically on every push to `main`.

---

## How the sync works

| Situation | What happens |
|-----------|-------------|
| Signed in | All changes save to Firebase Firestore within ~1 second |
| Open on another browser | Sign in with the same Google account → your data loads automatically |
| No internet | The app still works; changes save locally and sync next time |
| Not signed in | Data saves to the browser's localStorage (same as before) |

The sync status dot in the bottom-left of the sidebar shows: 🟢 Saved · 🟡 Saving… · 🔴 Error

---

## Firestore data structure

```
users/
  {uid}/
    d: { classes: [...], activeClassId: "..." }   ← entire app state
    savedAt: timestamp
```

One document per user. Maximum Firestore document size is 1 MB — well above what any
realistic number of classes would use.
