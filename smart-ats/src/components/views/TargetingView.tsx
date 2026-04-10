"use client";

import { useResumeStore } from '@/store/useResumeStore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPresetById, JOB_ROLE_PRESETS } from '@/lib/job-presets';
import { buildResumePlainText } from '@/lib/resume-text';

async function postOptimizeResume(payload: Record<string, unknown>) {
  const res = await fetch('/api/optimize-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'optimize failed');
  return data;
}

export default function TargetingView({ setView }: { setView: (v: string) => void }) {
  const {
    targetJob,
    setTargetJob,
    atsScore,
    experience,
    skills,
    projects,
    applyTailoringResult,
    matchedKeywords,
    missingKeywords,
    suggestions,
    setKeywords,
    setJobAnalysis,
    keywords,
    jobRolePreset,
    setJobRolePreset,
    autoTailorOnJobChange,
    setAutoTailorOnJobChange,
    jobAnalysis,
  } = useResumeStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState<string | null>(null);
  const lastAutoTailoredRef = useRef<string>('');
  const lastAutoAnalyzedRef = useRef<string>('');
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [vendorEstimate, setVendorEstimate] = useState<{
    score: number;
    rationale: string;
    risks: string[];
  } | null>(null);

  const mergedKeywordsForOptimize = useMemo(() => keywords, [keywords]);

  const fetchVendorEstimate = useCallback(async () => {
    const t = targetJob.trim();
    if (!t) return;
    setVendorLoading(true);
    setVendorError(null);
    try {
      const s = useResumeStore.getState();
      const resumeText = buildResumePlainText({
        personalInfo: s.personalInfo,
        experience: s.experience,
        education: s.education,
        skills: s.skills,
        projects: s.projects,
        certifications: s.certifications,
      });
      const res = await fetch('/api/ats-vendor-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetJob: t, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vendor estimate failed');
      setVendorEstimate({
        score: Number(data.score),
        rationale: String(data.rationale ?? ''),
        risks: Array.isArray(data.risks) ? data.risks.map((x: unknown) => String(x)) : [],
      });
    } catch (e) {
      setVendorError(e instanceof Error ? e.message : 'Vendor estimate failed');
      setVendorEstimate(null);
    } finally {
      setVendorLoading(false);
    }
  }, [targetJob]);

  const runTailor = useCallback(async () => {
    if (!targetJob.trim()) return;
    if (experience.length === 0) {
      setTailorError('Add at least one experience block before tailoring.');
      return;
    }
    setTailorError(null);
    setIsTailoring(true);
    try {
      const data = await postOptimizeResume({
        targetJob,
        experience,
        skills,
        projects,
        keywords: mergedKeywordsForOptimize,
      });
      applyTailoringResult({
        optimizedExperience: data.optimizedExperience || [],
        suggestedSkills: data.suggestedSkills || [],
        optimizedProjects: data.optimizedProjects,
        skillOrder: data.skillOrder,
      });
      lastAutoTailoredRef.current = targetJob.trim();
      // After mutations land in Zustand, estimate a vendor-style alignment read in plain text form.
      window.setTimeout(() => {
        fetchVendorEstimate().catch(() => {});
      }, 0);
    } catch (e) {
      console.error(e);
      setTailorError(e instanceof Error ? e.message : 'Tailoring failed');
    } finally {
      setIsTailoring(false);
    }
  }, [
    targetJob,
    experience,
    skills,
    projects,
    mergedKeywordsForOptimize,
    applyTailoringResult,
    fetchVendorEstimate,
  ]);

  const handleAnalyze = useCallback(async () => {
    if (!targetJob.trim()) return;
    setIsAnalyzing(true);
    setTailorError(null);
    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: targetJob }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      const preset = jobRolePreset ? getPresetById(jobRolePreset) : undefined;
      const presetKw = preset?.boostKeywords ?? [];
      const combined = [
        ...presetKw,
        ...(Array.isArray(data.keywords) ? data.keywords : []),
        ...(Array.isArray(data.requiredSkills) ? data.requiredSkills : []),
      ];
      setKeywords(combined);

      setJobAnalysis({
        domain: String(data.domain ?? 'General'),
        missingSkillsOrWeakPoints: String(data.missingSkillsOrWeakPoints ?? ''),
        requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
        roleTransitionGuidance: String(data.roleTransitionGuidance ?? ''),
        actionableRecommendations: Array.isArray(data.actionableRecommendations) ? data.actionableRecommendations : [],
      });
      lastAutoAnalyzedRef.current = targetJob.trim();
    } catch (err) {
      console.error('Targeting Analysis Fallback:', err);
      // Fallback Strategy if AI is busy/exhausted
      const preset = jobRolePreset ? getPresetById(jobRolePreset) : undefined;
      const fallbackDomain = preset?.label || 'General Entry';
      const fallbackKeywords = preset?.boostKeywords || ['Professionalism', 'Communication', 'Organization'];
      
      setKeywords(fallbackKeywords);
      setJobAnalysis({
        domain: fallbackDomain,
        missingSkillsOrWeakPoints: `Focus on highlighting your transferable skills for ${fallbackDomain} roles.`,
        requiredSkills: fallbackKeywords.slice(0, 5),
        responsibilities: ['Effectively communicate with stakeholders', 'Organize tasks and project goals', 'Deliver high-impact results'],
        roleTransitionGuidance: `When pivoting into ${fallbackDomain}, emphasize how your previous experience in diverse fields (Arts, College, or Technology) contributes to your unique perspective.`,
        actionableRecommendations: [
          `Integrate the keywords: ${fallbackKeywords.slice(0, 3).join(', ')} into your summary.`,
          `Highlight any projects where you led a team or managed multiple deliverables.`,
          `Quantify your impact using metrics like time saved or growth achieved.`
        ]
      });
      setTailorError("AI Busy: Applied fallback targeting strategy based on your role focus.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [jobRolePreset, setJobAnalysis, setKeywords, targetJob]);

  const handleTailorResume = async () => {
    await runTailor();
  };

  useEffect(() => {
    if (!autoTailorOnJobChange) return;
    const t = targetJob.trim();
    if (!t || experience.length === 0) return;
    if (t === lastAutoTailoredRef.current) return;

    const id = window.setTimeout(() => {
      (async () => {
        // Keep keywords + analysis in sync automatically, then tailor.
        if (t !== lastAutoAnalyzedRef.current) {
          await handleAnalyze();
        }
        await runTailor();
      })().catch(() => {});
    }, 2800);
    return () => window.clearTimeout(id);
  }, [targetJob, autoTailorOnJobChange, experience.length, runTailor, handleAnalyze]);

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
              Tailor your strategy for <strong>{activePreset?.label || 'Custom Role'}</strong>. Paste the posting, extract keywords, and enable full tailoring.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm min-w-[140px]">
              <span className="block text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Match score
              </span>
              <span className="text-4xl font-black text-emerald-500">{atsScore}%</span>
              <span className="mt-1 block text-[10px] font-semibold text-emerald-800/80 leading-tight px-2">
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

          <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-50 p-4 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              checked={autoTailorOnJobChange}
              onChange={(e) => setAutoTailorOnJobChange(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Live sync mode</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.05em]">Auto-tailors your resume after edits to job text</span>
            </div>
          </label>

          <div className="space-y-4">
            <label className="flex flex-col md:flex-row justify-between md:items-center text-xs font-bold text-slate-500 tracking-widest uppercase gap-4">
              <span>Full job description / targeting text</span>
              <button
                type="button"
                onClick={() => void handleAnalyze()}
                disabled={isAnalyzing || !targetJob.trim() || isTailoring}
                className="flex items-center justify-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-lg hover:bg-secondary/20 disabled:opacity-50 transition-colors"
              >
                <span className={`material-symbols-outlined text-sm ${isAnalyzing ? 'animate-spin' : ''}`}>
                  {isAnalyzing ? 'autorenew' : 'psychology'}
                </span>
                {isAnalyzing ? 'ANALYZING…' : 'EXTRACT STRATEGY'}
              </button>
            </label>
            <textarea
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              rows={11}
              placeholder="Paste the full job description here…"
              className="input-field resize-none h-auto bg-slate-50/30 text-sm leading-relaxed"
            />
          </div>

          {jobAnalysis && (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl space-y-8 text-left animate-fade-in shadow-inner">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Targeting Analysis</p>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 rounded-full">{jobAnalysis.domain}</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pivot Strategy</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white p-4 rounded-xl border border-slate-200/50">
                      {jobAnalysis.roleTransitionGuidance || jobAnalysis.missingSkillsOrWeakPoints}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actionable Steps</p>
                    <ul className="text-sm text-slate-700 space-y-3">
                      {(Array.isArray(jobAnalysis.actionableRecommendations) && jobAnalysis.actionableRecommendations.length 
                        ? jobAnalysis.actionableRecommendations 
                        : (Array.isArray(jobAnalysis.responsibilities) ? jobAnalysis.responsibilities.slice(0, 3) : [])
                      ).map((r, i) => (
                        <li key={i} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm font-medium">
                          <span className="text-secondary font-black text-[10px]">0{i+1}</span>
                          <span className="leading-snug">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
               </div>
            </div>
          )}



          {tailorError && (
            <p className="text-sm text-rose-600 font-medium bg-rose-50 border border-rose-100 rounded-lg px-4 py-3">
              {tailorError}
            </p>
          )}


          {(matchedKeywords.length > 0 || missingKeywords.length > 0 || suggestions.length > 0) && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-6 mt-6 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Matched keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 shadow-sm"
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
