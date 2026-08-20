"use client";
import { useResumeStore } from '@/store/useResumeStore';

export default function ExperienceView({ setView }: { setView: (v: string) => void }) {
  const { experience, updateExperience, addExperience, removeExperience } = useResumeStore();

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
          {experience.map((exp) => (
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
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                     Key Achievements (Bullets)
                   </label>
                   <div className="relative group">
                     <textarea value={exp.bullets.join('\n')} onChange={(e) => updateExperience(exp.id, { bullets: e.target.value.split('\n') })} rows={5} placeholder="Led the redevelopment of the core API..." className="input-field resize-none h-auto"></textarea>
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
