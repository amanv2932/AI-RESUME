"use client";
import { useResumeStore } from '@/store/useResumeStore';
import { useState } from 'react';

export default function ExperienceView({ setView }: { setView: (v: string) => void }) {
  const { experience, updateExperience, addExperience, removeExperience, targetJob } = useResumeStore();
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [lastOriginals, setLastOriginals] = useState<Record<string, string[]>>({});

  const DiffText = ({ oldText, newText }: { oldText: string; newText: string }) => {
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    return (
      <div className="font-mono">
        {newWords.map((word, i) => {
          const isMatch = oldWords.some((w) => w.toLowerCase() === word.toLowerCase().replace(/[.,]$/, ''));
          return (
            <span key={i} className={isMatch ? 'text-slate-500' : 'bg-emerald-100 text-emerald-800 px-0.5 rounded font-bold'}>
              {word}{' '}
            </span>
          );
        })}
      </div>
    );
  };


  const coachBullet = (bullet: string) => {
    const b = bullet.trim();
    if (!b) return null;
    const low = b.toLowerCase();
    const issues: string[] = [];
    if (b.length < 40) issues.push('Too short — add scope + outcome.');
    if (!/[0-9%$]|fold|x\b|kpi|\b\d+k\b|million|billion/i.test(b)) issues.push('Add a metric or scale (%, $, users, latency).');
    const verbs = [
      'led',
      'owned',
      'built',
      'shipped',
      'designed',
      'implemented',
      'optimized',
      'reduced',
      'increased',
      'automated',
      'scaled',
      'architected',
      'launched',
    ];
    if (!verbs.some((v) => low.startsWith(v))) issues.push('Start with a stronger action verb (past tense).');
    if (/\b(responsible for|helped with|worked on)\b/i.test(b)) issues.push('Replace vague duty phrasing with a measurable achievement.');
    if (issues.length === 0) return <p className="text-[11px] text-emerald-700 font-semibold">Looks strong.</p>;
    return (
      <ul className="text-[11px] text-amber-800 space-y-1 list-disc pl-4">
        {issues.slice(0, 3).map((i, j) => (
          <li key={j}>{i}</li>
        ))}
      </ul>
    );
  };

  const handleAddJob = () => {
    addExperience({ role: '', company: '', duration: '', bullets: [] });
  };

  const handleNext = () => {
    if (experience.length > 0) {
      for (const exp of experience) {
        if (!exp.role.trim() || !exp.company.trim()) {
           alert("Please ensure all experience entries have at least a Role and Company filled out.");
           return;
        }
      }
    }
    setView('education');
  };

  
  const handleOptimize = async (expId: string, bullets: string[]) => {
    const cleaned = bullets.map((b) => b.trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    setOptimizingId(expId);
    try {
      const res = await fetch('/api/optimize-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets: cleaned, targetJob }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.bullets) && data.bullets.length > 0) {
        setLastOriginals((prev) => ({ ...prev, [expId]: bullets }));
        updateExperience(expId, { bullets: data.bullets });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setOptimizingId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in relative">
      <div className="space-y-12">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Step 2 of 8</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Experience</h2>
          </div>
          <p className="text-on-surface-variant text-lg">Highlight your track record and professional achievements.</p>
        </div>

        <div className="space-y-6">
          {experience.map((exp, index) => (
             <div key={exp.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-6 relative group transition-all">
               <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined">delete</span>
               </button>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Title <span className="text-rose-500">*</span></label>
                   <input value={exp.role} onChange={(e) => updateExperience(exp.id, { role: e.target.value })} type="text" placeholder="Senior Product Architect" className="input-field" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company <span className="text-rose-500">*</span></label>
                   <input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} type="text" placeholder="Stratos Systems" className="input-field" />
                 </div>
               </div>
               <div className="grid grid-cols-1 gap-6">
                 <div className="space-y-2 max-w-xs">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date Range</label>
                   <input value={exp.duration} onChange={(e) => updateExperience(exp.id, { duration: e.target.value })} type="text" placeholder="Jan 2021 — Present" className="input-field" />
                 </div>
                  <div className="space-y-3">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center mb-1">
                     <span>Key Achievements (Bullets)</span>
                     <button 
                       type="button"
                       onClick={() => void handleOptimize(exp.id, exp.bullets)}
                       disabled={optimizingId === exp.id || exp.bullets.every((b) => !b.trim())}
                       className="text-primary cursor-pointer hover:underline flex items-center gap-1 disabled:opacity-50"
                     >
                       {optimizingId === exp.id ? (
                         <>
                           <span className="material-symbols-outlined text-[14px] animate-spin">autorenew</span>
                           Optimizing...
                         </>
                       ) : (
                         <>
                           <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                           Auto-Optimize
                         </>
                       )}
                     </button>
                   </label>
                  <div className="relative group">
                    <textarea value={exp.bullets.join('\n')} onChange={(e) => updateExperience(exp.id, { bullets: e.target.value.split('\n') })} rows={5} placeholder="Led the redevelopment of the core API..." className="input-field resize-none h-auto"></textarea>
                  </div>
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Line-by-line coaching</p>
                    {exp.bullets.map((b, idx) => {
                      if (!b.trim()) return null;
                      const hasDiff = lastOriginals[exp.id]?.[idx] && lastOriginals[exp.id][idx] !== b;
                      
                      return (
                        <div key={`${exp.id}-${idx}`} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-bold text-slate-700">Bullet {idx + 1}</p>
                            {hasDiff && (
                              <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">AI Optimized</span>
                            )}
                          </div>
                          {hasDiff ? (
                            <div className="text-[11px] leading-relaxed mb-2">
                              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Changes vs Original:</p>
                              <DiffText oldText={lastOriginals[exp.id][idx]} newText={b} />
                            </div>
                          ) : coachBullet(b)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={handleAddJob} className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 rounded-xl transition-all font-bold flex justify-center items-center gap-2">
            <span className="material-symbols-outlined">add</span> Add Another Experience
          </button>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-8">
          <button onClick={() => setView('personal')} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-primary text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
            Next: Education <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
