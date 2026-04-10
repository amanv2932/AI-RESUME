# Smart ATS Resume Builder

A modern, AI-powered Resume Builder designed to create ATS-optimized professional resumes using React and Next.js.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

### AI (Gemini)

- `GEMINI_API_KEY`

### MongoDB snapshots (optional)

- `MONGODB_URI`

### Firebase snapshots (optional)

Create a Firestore database (test mode is fine for local dev) and set:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Collection: `resumeSnapshots` (created automatically on first save)

## Install note

This repo now includes `@react-pdf/renderer` + `firebase`. After pulling changes, run:

```bash
npm install
```
