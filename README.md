# TierForge

A tier list platform: build, share and vote on rankings. React + Vite + Tailwind on the
front end, Firebase (Authentication + Firestore) for accounts and data.

This is a real project meant to run on your machine and be deployed — it will **not**
work inside a Claude chat preview, because the sandbox blocks the network calls Firebase
needs to make. Follow the steps below on your own computer.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click
   **Add project**. Give it any name (e.g. "tierforge").
2. Once created, click the **web** icon (`</>`) to register a web app. Skip Firebase
   Hosting for now if asked — you'll do that later.
3. Firebase shows you a `firebaseConfig` object with keys like `apiKey`, `authDomain`,
   etc. Keep this tab open, you'll need it in step 4.

## 2. Enable sign-in methods

In the Firebase console: **Build → Authentication → Sign-in method**, enable:
- **Email/Password**
- **Google** (pick a support email when prompted)

## 3. Create the Firestore database

In the Firebase console: **Build → Firestore Database → Create database**. Choose
**production mode** and any region close to your users.

Then, in **Firestore → Rules**, paste the contents of `firestore.rules` (already in this
project) and click **Publish**. This keeps users limited to editing their own profile and
their own tier lists.

## 4. Configure your local project

```bash
cp .env.example .env
```

Open `.env` and paste in the values from the `firebaseConfig` object from step 1:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`.env` is already ignored by `.gitignore` — never commit real keys.

## 5. Install and run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). Try **Sign up**, then
**Create a tier list**, drag a few players into tiers, and hit **Publish** — it'll save
to Firestore under your account and show up on your **Profile** page.

## 6. Deploy it

**Option A — Firebase Hosting** (keeps everything in one place):
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting   # choose your project, "dist" as the public folder, single-page app: yes
firebase deploy
```

**Option B — Vercel or Netlify**: import the repo, set the build command to
`npm run build`, the output directory to `dist`, and add the same six `VITE_FIREBASE_*`
environment variables in the project's dashboard.

Either way, go back to **Authentication → Settings → Authorized domains** in the Firebase
console and add your deployed domain, or Google sign-in will be rejected there.

## What's implemented

- Email/password and Google sign-up & login (`src/context/AuthContext.jsx`)
- A `users/{uid}` profile document created automatically on first sign-in
- Protected routes: `/create` and `/profile` redirect to `/login` if signed out
- Tier lists built in `/create` save for real to a `tierlists` collection in Firestore,
  tied to the logged-in user, and appear on that user's `/profile`
- Home, Explore (tabs + category filters), Categories, and Leaderboard pages use
  demo/mock data (`src/data/mock.js`) — swap these for real Firestore queries
  (see `getRecentTierLists` in `src/lib/tierlists.js` as a starting point) whenever
  you want the whole app running on real data instead of mocks

## Suggested next steps

- Wire Explore up to `getRecentTierLists()` instead of the mock array
- Add a `follows` subcollection and real follower/following counts on Profile
- Add image upload (Firebase Storage) for tier list items instead of text-only chips
- Replace the simulated "AI Assist" in the builder with a real call to your backend,
  which in turn calls the Anthropic API to generate a first draft
- Add Firestore-backed voting (`votes` subcollection per tier list) instead of the
  static counts shown on cards today
