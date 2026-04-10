"use client";

import Image from 'next/image';
import { useResumeStore } from '@/store/useResumeStore';
import { getOrCreateUserId } from '@/lib/client-user-id';
import { snapshotFromStore } from '@/lib/resume-snapshot';
import { buildResumePlainText } from '@/lib/resume-text';
import { useCallback, useEffect, useState } from 'react';
import {
  addLocalSnapshot,
  getLocalSnapshot,
  listLocalSnapshots,
} from '@/lib/local-snapshots';
import {
  firebaseGetResumeSnapshot,
  firebaseListResumeSnapshots,
  firebaseSaveResumeSnapshot,
  isFirebaseConfigured,
} from '@/lib/firebase-client';

type ListItem = {
  backendKey: string;
  name: string;
  atsScore: number;
  targetPreview: string;
  updatedAt: string;
  label: string;
};

export default function DashboardView({ setView }: { setView: (v: string) => void }) {
  const store = useResumeStore();
  const { personalInfo, atsScore, targetJob, hydrateFromSnapshot } = store;

  const [saved, setSaved] = useState<ListItem[]>([]);
  const [dbMessage, setDbMessage] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const [compareLeft, setCompareLeft] = useState('');
  const [compareRight, setCompareRight] = useState('');
  const [customTextA, setCustomTextA] = useState('');
  const [customTextB, setCustomTextB] = useState('');
  const [saving, setSaving] = useState(false);

  const refreshList = useCallback(async () => {
    const userId = getOrCreateUserId();
    if (userId === 'ssr') return;
    try {
      const merged: ListItem[] = [];

      const res = await fetch(`/api/resumes?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      const isLocalServer = !!data.isFallback;
      const mongoConfigured = !isLocalServer;

      if (res.ok && Array.isArray(data.items)) {
        merged.push(
          ...data.items.map(
            (it: { _id: string; name: string; atsScore: number; targetPreview: string; updatedAt: string }) => ({
              backendKey: `mongo:${it._id}`,
              name: it.name,
              atsScore: it.atsScore,
              targetPreview: it.targetPreview,
              updatedAt: String(it.updatedAt),
              label: isLocalServer ? 'Disk-Saved' : 'Cloud-Saved',
            })
          )
        );
      }

      if (isFirebaseConfigured()) {
        const fbItems = await firebaseListResumeSnapshots(userId);
        merged.push(
          ...fbItems.map((it) => ({
            backendKey: `firebase:${it.id}`,
            name: it.name,
            atsScore: it.atsScore,
            targetPreview: it.targetPreview,
            updatedAt: it.updatedAt,
            label: 'Firebase',
          }))
        );
      }

      const localItems = listLocalSnapshots();
      merged.push(
        ...localItems.map((it) => ({
          backendKey: `local:${it.id}`,
          name: it.name,
          atsScore: it.atsScore,
          targetPreview: it.targetPreview,
          updatedAt: it.updatedAt,
          label: 'Local',
        }))
      );

      merged.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      setSaved(merged);

      if (isLocalServer) {
        setDbMessage('Connected to local storage persistence (.json). Cloud sync deactivated.');
      } else {
        setDbMessage(null);
      }
    } catch {
      const localItems = listLocalSnapshots();
      setSaved(
        localItems.map((it) => ({
          backendKey: `local:${it.id}`,
          name: it.name,
          atsScore: it.atsScore,
          targetPreview: it.targetPreview,
          updatedAt: it.updatedAt,
          label: 'Local',
        }))
      );
    }
  }, []);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const saveToCloud = async () => {
    setSaving(true);
    setDbMessage(null);
    try {
      const userId = getOrCreateUserId();
      const snapshot = snapshotFromStore(useResumeStore.getState);
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: personalInfo.fullName ? `${personalInfo.fullName} — saved` : 'Saved resume',
          snapshot,
          atsScore,
          targetPreview: targetJob.slice(0, 200),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshList();
        setDbMessage(data.isFallback ? 'Saved to local disk storage.' : 'Saved to MongoDB.');
        return;
      }

      if (isFirebaseConfigured()) {
        await firebaseSaveResumeSnapshot({
          userId,
          name: personalInfo.fullName ? `${personalInfo.fullName} — saved` : 'Saved resume',
          snapshot,
          atsScore,
          targetPreview: targetJob.slice(0, 200),
        });
        await refreshList();
        setDbMessage('Saved to Firebase.');
        return;
      }

      addLocalSnapshot({
        name: personalInfo.fullName ? `${personalInfo.fullName} — saved` : 'Saved resume',
        snapshot,
        atsScore,
        targetPreview: targetJob.slice(0, 200),
      });
      await refreshList();
      setDbMessage(data.error ? `${data.error} Saved locally instead.` : 'Saved locally.');
    } catch {
      setDbMessage('Save failed (network).');
    } finally {
      setSaving(false);
    }
  };

  const loadSnapshot = async (backendKey: string) => {
    try {
      const [source, id] = backendKey.split(':');
      if (!source || !id) return;

      if (source === 'mongo') {
        const res = await fetch(`/api/resumes/${id}`);
        const data = await res.json();
        if (!res.ok || !data.snapshot) return;
        hydrateFromSnapshot(data.snapshot);
      } else if (source === 'firebase') {
        const snap = await firebaseGetResumeSnapshot(id);
        if (!snap) return;
        hydrateFromSnapshot(snap);
      } else if (source === 'local') {
        const item = getLocalSnapshot(id);
        if (!item) return;
        hydrateFromSnapshot(item.snapshot);
      } else {
        return;
      }
      setHistoryOpen(false);
      setView('refine');
    } catch {
      setDbMessage('Could not load snapshot.');
    }
  };

  const textFromSnapshot = (snap: unknown): string => {
    if (!snap || typeof snap !== 'object') return '';
    const o = snap as Record<string, unknown>;
    try {
      return buildResumePlainText({
        personalInfo: (o.personalInfo as typeof personalInfo) || personalInfo,
        experience: (o.experience as typeof store.experience) || [],
        education: (o.education as typeof store.education) || [],
        skills: (o.skills as typeof store.skills) || [],
        projects: (o.projects as typeof store.projects) || [],
        certifications: (o.certifications as typeof store.certifications) || [],
      });
    } catch {
      return '';
    }
  };

  const runCompare = async () => {
    setDbMessage(null);
    let L = '';
    let R = '';
    try {
      const current = buildResumePlainText({
        personalInfo: store.personalInfo,
        experience: store.experience,
        education: store.education,
        skills: store.skills,
        projects: store.projects,
        certifications: store.certifications,
      });

      if (compareA === 'current') L = current;
      if (compareB === 'current') R = current;
      
      if (compareA === 'custom') L = customTextA;
      if (compareB === 'custom') R = customTextB;

      if (compareA !== 'current' && compareA !== 'custom' && compareA) {
        const [src, id] = compareA.split(':');
        if (src === 'mongo') {
          const res = await fetch(`/api/resumes/${id}`);
          const data = await res.json();
          L = textFromSnapshot(data.snapshot);
        } else if (src === 'firebase') {
          L = textFromSnapshot(await firebaseGetResumeSnapshot(id));
        } else if (src === 'local') {
          L = textFromSnapshot(getLocalSnapshot(id)?.snapshot);
        }
      }
      if (compareB !== 'current' && compareB !== 'custom' && compareB) {
        const [src, id] = compareB.split(':');
        if (src === 'mongo') {
          const res = await fetch(`/api/resumes/${id}`);
          const data = await res.json();
          R = textFromSnapshot(data.snapshot);
        } else if (src === 'firebase') {
          R = textFromSnapshot(await firebaseGetResumeSnapshot(id));
        } else if (src === 'local') {
          R = textFromSnapshot(getLocalSnapshot(id)?.snapshot);
        }
      }
      setCompareLeft(L);
      setCompareRight(R);
    } catch {
      setDbMessage('Compare failed to load snapshots.');
    }
  };

  const DiffView = ({ oldText, newText }: { oldText: string; newText: string }) => {
    if (!oldText || !newText) return <pre className="text-[11px] whitespace-pre-wrap">{newText || oldText}</pre>;
    
    // Normalize and remove punctuation for better set matching of words
    const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
    const oldWordsSet = new Set(oldText.split(/\s+/).map(normalize).filter(Boolean));
    const newWords = newText.split(/\s+/);

    return (
      <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
        {newWords.map((word, i) => {
          const isMatch = oldWordsSet.has(normalize(word));
          return (
            <span key={i} className={isMatch ? 'text-slate-600' : 'bg-emerald-100 text-emerald-900 px-0.5 rounded font-bold'}>
              {word}{' '}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-secondary font-bold tracking-widest uppercase text-xs">Professional Portfolio</p>
          <h2 className="text-5xl font-black text-primary font-headline tracking-tighter">My Resumes</h2>
          <p className="text-sm text-slate-500 max-w-xl">
            ExecutiveDesk · Smart ATS Resume Builder — saves to MongoDB when MONGODB_URI is set, otherwise Firebase when
            NEXT_PUBLIC_FIREBASE_* is configured, otherwise keeps version history locally in this browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all duration-300 font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-lg">compare_arrows</span> Compare versions
          </button>
          <button
            type="button"
            onClick={() => {
              setHistoryOpen(true);
              void refreshList();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-all duration-300 font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-lg">history</span> Cloud history
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveToCloud()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary/5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
            {saving ? 'Saving…' : 'Save to cloud'}
          </button>
          <button
            type="button"
            onClick={() => setView('personal')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all duration-150 font-bold text-sm shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add</span> Open builder
          </button>
        </div>
      </section>

      {dbMessage && (
        <p className="mb-6 text-[11px] font-bold tracking-tight text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">database</span> {dbMessage}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="group relative bg-surface-container-lowest rounded-[2rem] p-1 editorial-shadow transition-transform hover:-translate-y-1 overflow-hidden">
          <div
            className="bg-white rounded-[1.8rem] p-8 space-y-6 cursor-pointer"
            onClick={() => setView('personal')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setView('personal')}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                <h3 className="text-xl font-bold font-headline text-primary truncate pr-2">
                  {personalInfo.fullName
                    ? `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
                    : 'Untitled_Resume.pdf'}
                </h3>
                <p className="text-on-surface-variant text-sm font-medium truncate pr-4">
                  Target: {targetJob ? `${targetJob.substring(0, 48)}…` : 'Not targeted yet'}
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-secondary-container bg-white shadow-inner">
                  <span className="text-secondary font-black text-lg">{atsScore}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-secondary mt-1">
                  ATS score
                </span>
              </div>
            </div>
            <div className="aspect-[4/5] rounded-2xl bg-slate-100 overflow-hidden relative group-hover:shadow-inner transition-all border border-slate-200/50">
              <Image
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                alt="Resume"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzX6Czz7IzrJw3tNt1QNQP66JllTnhKhOFW47ENBeWLy0AHGjCwDxetAFW4yjdcGk4oM7gsGCJ6i8PmY6G_dIbNTlW-bcUJA45D7diF-Q9S3hMQXSqK35ZD9mwC6hs6csblABShlsayhkhFMWSOwSgNVJkercdEUgGSkus5wx8oJopGqae3AWMsHvKyTDS7E5EQqh6im4nlGwuUyYZ0DdWrsHXnUNGCQHZNbG3PcN-0VwSemMzDk8aDsn-mIUIWCBfzcLdzTFrUJRu"
                width={400}
                height={500}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 backdrop-blur-[2px]">
                <span className="bg-white text-primary px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
                  Edit in builder
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">edit_document</span>
                <span className="text-xs font-semibold">Local session (Zustand)</span>
              </div>
              <div
                className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setView('refine');
                }}
              >
                Review <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>

        {saved.slice(0, 5).map((item) => (
          <div
            key={item.backendKey}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-lg font-bold text-slate-900 mt-2 truncate">{item.name}</h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.targetPreview || 'No target note'}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-emerald-600 font-black">{item.atsScore}%</span>
              <button
                type="button"
                onClick={() => void loadSnapshot(item.backendKey)}
                className="text-sm font-bold text-primary hover:underline"
              >
                Load
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}
            </p>
          </div>
        ))}
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900">Cloud history</h3>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-800"
                onClick={() => setHistoryOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {saved.length === 0 ? (
              <p className="text-slate-600 text-sm">
                No saves yet. Click “Save to cloud” — it will use Mongo, Firebase, or local storage depending on your env.
              </p>
            ) : (
              <ul className="space-y-3">
                {saved.map((item) => (
                  <li
                    key={item.backendKey}
                    className="flex justify-between items-center border border-slate-100 rounded-xl p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.targetPreview}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void loadSnapshot(item.backendKey)}
                      className="text-sm font-bold text-primary"
                    >
                      Load
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {compareOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-900">Compare plain-text resumes</h3>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-800"
                onClick={() => setCompareOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Version A
                <select
                  className="input-field mt-1"
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="current">Current session (Builder)</option>
                  <option value="custom">Paste old or external text...</option>
                  {saved.map((s) => (
                    <option key={s.backendKey} value={s.backendKey}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {compareA === 'custom' && (
                  <textarea
                    className="input-field mt-2 h-24 text-sm font-normal normal-case resize-none"
                    placeholder="Paste external resume plain text here..."
                    value={customTextA}
                    onChange={(e) => setCustomTextA(e.target.value)}
                  />
                )}
              </label>
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Version B
                <select
                  className="input-field mt-1"
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="current">Current session (Builder)</option>
                  <option value="custom">Paste old or external text...</option>
                  {saved.map((s) => (
                    <option key={`b-${s.backendKey}`} value={s.backendKey}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {compareB === 'custom' && (
                  <textarea
                    className="input-field mt-2 h-24 text-sm font-normal normal-case resize-none"
                    placeholder="Paste external resume plain text here..."
                    value={customTextB}
                    onChange={(e) => setCustomTextB(e.target.value)}
                  />
                )}
              </label>
            </div>
            <button
              type="button"
              onClick={() => void runCompare()}
              disabled={!compareA || !compareB}
              className="mb-4 px-6 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-40"
            >
              Run compare
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Baseline (Version A)</p>
                <div className="bg-white border rounded-xl p-6 max-h-[50vh] overflow-auto shadow-sm">
                  <pre className="text-[11px] text-slate-500 whitespace-pre-wrap">{compareLeft || '—'}</pre>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Tailored Highlights (Version B)</p>
                <div className="bg-white border rounded-xl p-6 max-h-[50vh] overflow-auto shadow-sm">
                  <DiffView oldText={compareLeft} newText={compareRight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
