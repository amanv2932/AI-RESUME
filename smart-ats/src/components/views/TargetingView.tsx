"use client";

import { useResumeStore } from '@/store/useResumeStore';
import { JOB_ROLE_PRESETS } from '@/lib/job-presets';
import { useEffect } from 'react';

export default function TargetingView({ setView }: { setView: (v: string) => void }) {
  const {
    targetJob,
    setTargetJob,
    atsScore,
    matchedKeywords,
    missingKeywords,
    suggestions,
    jobRolePreset,
    setJobRolePreset,
  } = useResumeStore();

  useEffect(() => {
    // Basic sync logic if needed, but we removed AI syncing.
  }, []);

  const activePreset = JOB_ROLE_PRESETS.find(p => p.id === jobRolePreset);

  return (
    <div className="w-full max-w-4xl animate-fade-in relative pb-20">
      <div className="space-y-12">
        <div className="space-y-6 mb-8 flex justify-between items-end flex-wrap gap-6 text-left">
          <div className="max-w-2xl">
            <div className="flex flex-col gap-1 text-left">
              <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Step 7 of 8</span>
              <h2 className="text-3xl font-black text-primary tracking-tight">Job targeting</h2>
            </div>
            <p className="text-on-surface-variant text-lg mt-2 text-left">
              Tailor your strategy for <strong>{activePreset?.label || 'Custom Role'}</strong>. Paste the posting to check local ATS matching.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm min-w-[140px]">
              <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest">
                Match score
              </span>
              <span className="text-4xl font-black text-slate-700">{atsScore}%</span>
              <span className="mt-1 block text-[10px] font-semibold text-slate-500 leading-tight px-2">
                Keyword + layout signals
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Role focus</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setJobRolePreset('')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  jobRolePreset === ''
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Custom / Exact JD
              </button>
              {JOB_ROLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setJobRolePreset(p.id);
                    if (!targetJob.trim()) {
                      setTargetJob(`${p.blurb}\n\n[Paste the full job description below]\n`);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    jobRolePreset === p.id
                      ? 'bg-primary text-white border-primary shadow-md'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex flex-col md:flex-row justify-between md:items-center text-xs font-bold text-slate-500 tracking-widest uppercase gap-4">
              <span>Full job description / targeting text</span>
            </label>
            <textarea
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              rows={11}
              placeholder="Paste the full job description here…"
              className="input-field resize-none h-auto bg-slate-50/30 text-sm leading-relaxed"
            />
          </div>

          {(matchedKeywords.length > 0 || missingKeywords.length > 0 || suggestions.length > 0) && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6 mt-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 mb-4">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Matched keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white text-slate-700 font-bold text-xs rounded-lg border border-slate-200 shadow-sm"
                      >
                        {kw}
                      </span>
                    ))}
                    {matchedKeywords.length === 0 && (
                      <p className="text-xs text-slate-400 italic">None yet — extract keywords or tailor.</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500 mb-4">
                    <span className="material-symbols-outlined text-sm">cancel</span> Missing keywords
                  </h4>
                  <div className="flex flex-wrap gap-2 opacity-80">
                    {missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white text-rose-700 font-bold text-xs rounded-lg border border-rose-200 border-dashed"
                      >
                        {kw}
                      </span>
                    ))}
                    {missingKeywords.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Strong coverage for current keyword set.</p>
                    )}
                  </div>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 mb-3">
                    <span className="material-symbols-outlined text-sm">lightbulb</span> Actionable improvements
                  </h4>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
                    {suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-8 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={() => setView('certifications')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button
            type="button"
            onClick={() => setView('refine')}
            className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-opacity shadow-lg active:scale-95"
          >
            Next: Review <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
