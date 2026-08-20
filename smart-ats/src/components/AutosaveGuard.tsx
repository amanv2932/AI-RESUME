"use client";

import { useEffect, useRef } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { getOrCreateUserId } from '@/lib/client-user-id';
import { snapshotFromStore } from '@/lib/resume-snapshot';

export default function AutosaveGuard() {
  const store = useResumeStore();
  const lastSavedJson = useRef<string>('');
  const savedId = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Debounced autosave
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const snapshot = snapshotFromStore(useResumeStore.getState);
      const currentJson = JSON.stringify(snapshot);

      // Only save if content actually changed
      if (currentJson === lastSavedJson.current) return;

      const userId = getOrCreateUserId();
      if (!userId || userId === 'ssr') return;

      try {
        const res = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            id: savedId.current,
            name: store.personalInfo.fullName ? `${store.personalInfo.fullName} — autosave` : 'Autosaved Resume',
            snapshot,
            atsScore: store.atsScore,
            targetPreview: store.targetJob.slice(0, 200),
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { id?: string };
          savedId.current = data.id ?? savedId.current;
          lastSavedJson.current = currentJson;
          console.log('[Autosave] Synced to database.json');
        }
      } catch (err) {
        console.error('[Autosave] Failed to sync:', err);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [store]);

  return null;
}
