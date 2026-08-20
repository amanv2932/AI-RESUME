import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DB_PATH = path.join(process.cwd(), 'database.json');

export type ResumeSnapshotRecord = {
  _id: string;
  userId: string;
  name: string;
  atsScore: number;
  targetPreview: string;
  snapshot: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
};

function readDb(): Record<string, ResumeSnapshotRecord> {
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function writeDb(db: Record<string, ResumeSnapshotRecord>) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export async function listResumes(userId: string): Promise<ResumeSnapshotRecord[]> {
  const db = readDb();
  return Object.values(db)
    .filter((it) => it.userId === userId)
    .sort((a, b) => (new Date(a.updatedAt) < new Date(b.updatedAt) ? 1 : -1));
}

export async function getResume(id: string): Promise<ResumeSnapshotRecord | null> {
  const db = readDb();
  return db[id] || null;
}

export async function deleteResume(id: string, userId: string): Promise<boolean> {
  const db = readDb();
  if (!db[id] || db[id].userId !== userId) return false;
  delete db[id];
  writeDb(db);
  return true;
}

export async function saveResume(data: Omit<ResumeSnapshotRecord, '_id' | 'updatedAt' | 'createdAt'>): Promise<string> {
  const db = readDb();
  const _id = randomUUID();
  const now = new Date().toISOString();
  const record: ResumeSnapshotRecord = {
    ...data,
    _id,
    createdAt: now,
    updatedAt: now,
  };
  db[_id] = record;
  writeDb(db);
  return _id;
}

export async function updateResume(
  id: string,
  userId: string,
  data: Omit<ResumeSnapshotRecord, '_id' | 'updatedAt' | 'createdAt'>
): Promise<boolean> {
  const db = readDb();
  const existing = db[id];
  if (!existing || existing.userId !== userId) return false;
  db[id] = { ...existing, ...data, _id: id, updatedAt: new Date().toISOString() };
  writeDb(db);
  return true;
}
