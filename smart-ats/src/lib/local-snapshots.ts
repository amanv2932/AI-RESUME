import type { ResumeSnapshotPayload } from '@/lib/resume-snapshot';

export type LocalSnapshotItem = {
  id: string;
  name: string;
  atsScore: number;
  targetPreview: string;
  updatedAt: string;
  snapshot: ResumeSnapshotPayload;
};

const KEY = 'smart-ats-local-snapshots-v1';

function readAll(): LocalSnapshotItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalSnapshotItem[];
  } catch {
    return [];
  }
}

function writeAll(items: LocalSnapshotItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
}

export function listLocalSnapshots(): LocalSnapshotItem[] {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function addLocalSnapshot(item: Omit<LocalSnapshotItem, 'id' | 'updatedAt'> & { id?: string }) {
  const id = item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`);
  const next: LocalSnapshotItem = {
    id,
    name: item.name,
    atsScore: item.atsScore,
    targetPreview: item.targetPreview,
    snapshot: item.snapshot,
    updatedAt: new Date().toISOString(),
  };
  const all = readAll().filter((x) => x.id !== id);
  writeAll([next, ...all]);
  return next;
}

export function getLocalSnapshot(id: string): LocalSnapshotItem | null {
  return readAll().find((x) => x.id === id) ?? null;
}
