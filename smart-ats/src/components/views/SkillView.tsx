"use client";
import { useResumeStore } from '@/store/useResumeStore';

export default function SkillView({ setView }: { setView: (v: string) => void }) {
  const { skills, addSkill, removeSkill } = useResumeStore();

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      addSkill({ name: e.currentTarget.value.trim(), proficiency: 'Intermediate' });
      e.currentTarget.value = '';
    }
  };

  const handleNext = () => {
    if (skills.length === 0) {
      alert("Please add at least one core skill to your profile.");
      return;
    }
      setView('projects');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in relative">
      <div className="space-y-12">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Step 4 of 8</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Skills & Capabilities</h2>
          </div>
          <p className="text-on-surface-variant text-lg">List your technical proficiencies and core competencies.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 tracking-wide uppercase">
              Add a Skill (Press Enter)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">psychology</span>
              <input 
                onKeyDown={handleAddSkill} 
                type="text" 
                placeholder="e.g. React, Python, Data Analysis..." 
                className="input-field pl-12"
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Current Skills</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map(skill => (
                <div key={skill.id} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-slate-100 text-slate-800 rounded-full font-semibold border border-slate-200 hover:border-slate-300 transition-colors">
                  <span>{skill.name}</span>
                  <button onClick={() => removeSkill(skill.id)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 hover:text-rose-500 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
              {skills.length === 0 && (
                 <p className="text-sm text-slate-400 italic">No skills added yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 flex items-center justify-between border-t border-slate-200">
          <button onClick={() => setView('education')} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button onClick={handleNext} className="bg-primary text-on-primary px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-opacity shadow-lg active:scale-95">
            Next: Projects <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
