# Philodendron Lab

Evidence-led tissue culture research workspace built with Next.js, Firebase Auth and Firestore.

## Local preview without Firebase

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` and choose **Continue in demo mode**. Demo records stay in memory and are not written to cloud storage.

## Connect a Firebase project

1. Create separate Firebase projects for development and production.
2. Enable Google Authentication and create a Firestore database.
3. Copy `.env.example` to `.env.local` and fill all `NEXT_PUBLIC_FIREBASE_*` values from Firebase Web App settings.
4. Deploy `firestore.rules` and `firestore.indexes.json` from a trusted terminal.
5. Add the same public Firebase values to Vercel Environment Variables. Never add a service-account JSON file to this repository.

The browser Firebase SDK is initialized lazily. Missing environment values show a safe demo gate instead of crashing `next build`.

## Firebase emulator

Set the values below in `.env.local` using a demo Firebase configuration and enable emulator routing:

```text
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

Then run:

```powershell
npm run firebase:emulators
npm run dev
```

Auth runs at `127.0.0.1:9099`, Firestore at `127.0.0.1:8080`, and Emulator UI at `127.0.0.1:4000`.

## Data ownership

All cloud records live below `users/{uid}`. Firestore rules require the signed-in UID to match the path owner and reject data whose `ownerId` points to another account.

## Required checks

```powershell
npm test
npm run lint
npm run build
```

Before delivery, also inspect the running site at desktop, tablet and mobile widths and append the results to `handoff.md`.
