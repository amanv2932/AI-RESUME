import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  where,
  type Firestore,
} from 'firebase/firestore';
import type { ResumeSnapshotPayload } from '@/lib/resume-snapshot';

export type FirebaseSavedResumeMeta = {
  id: string;
  name: string;
  atsScore: number;
  targetPreview: string;
  updatedAt: string;
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function isFirebaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function getFirebase() {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length
      ? getApps()[0]!
      : initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        });
  }
  if (!db) db = getFirestore(app);
  return { app, db };
}

export async function firebaseSaveResumeSnapshot(input: {
  userId: string;
  name: string;
  snapshot: ResumeSnapshotPayload;
  atsScore: number;
  targetPreview: string;
}) {
  const fb = getFirebase();
  if (!fb) throw new Error('Firebase not configured');
  const ref = await addDoc(collection(fb.db, 'resumeSnapshots'), {
    userId: input.userId,
    name: input.name,
    snapshot: input.snapshot,
    atsScore: input.atsScore,
    targetPreview: input.targetPreview,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function firebaseListResumeSnapshots(userId: string): Promise<FirebaseSavedResumeMeta[]> {
  const fb = getFirebase();
  if (!fb) return [];
  const q = query(collection(fb.db, 'resumeSnapshots'), where('userId', '==', userId), limit(50));
  const snap = await getDocs(q);
  const items: FirebaseSavedResumeMeta[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const updatedAt = data.updatedAt;
    items.push({
      id: docSnap.id,
      name: String(data.name ?? 'Saved resume'),
      atsScore: Number(data.atsScore ?? 0),
      targetPreview: String(data.targetPreview ?? ''),
      updatedAt:
        updatedAt && typeof updatedAt === 'object' && 'toDate' in updatedAt
          ? (updatedAt as { toDate: () => Date }).toDate().toISOString()
          : new Date().toISOString(),
    });
  });
  return items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function firebaseGetResumeSnapshot(id: string): Promise<ResumeSnapshotPayload | null> {
  const fb = getFirebase();
  if (!fb) return null;
  const ref = doc(fb.db, 'resumeSnapshots', id);
  const s = await getDoc(ref);
  if (!s.exists()) return null;
  const data = s.data() as Record<string, unknown>;
  return (data.snapshot as ResumeSnapshotPayload) ?? null;
}
