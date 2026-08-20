"use client";
import { useResumeStore } from '@/store/useResumeStore';

export default function EducationView({ setView }: { setView: (v: string) => void }) {
  const { education, updateEducation, addEducation, removeEducation } = useResumeStore();

  const handleAddEducation = () => {
    addEducation({ degree: '', institution: '', startDate: '', endDate: '', scoreType: 'Percentage', scoreValue: '' });
  };

  const handleNext = () => {
    if (education.length > 0) {
      for (const edu of education) {
        if (!edu.degree.trim() || !edu.institution.trim()) {
           alert("Please ensure all education entries have a Degree and Institution filled out.");
           return;
        }
      }
    }
    setView('skills');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in relative">
      <div className="space-y-12">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Step 3 of 8</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Education</h2>
          </div>
          <p className="text-on-surface-variant text-lg">Detail your academic background and qualifications.</p>
        </div>

        <div className="space-y-6">
          {education.map((edu) => (
             <div key={edu.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-6 relative group transition-all">
               <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined">delete</span>
               </button>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Degree / Certificate <span className="text-rose-500">*</span></label>
                   <input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} type="text" placeholder="B.S. Computer Science" className="input-field" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Institution <span className="text-rose-500">*</span></label>
                   <input value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} type="text" placeholder="Stanford University" className="input-field" />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                   <input value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} type="text" placeholder="Sep 2018" className="input-field" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">End Date</label>
                   <input value={edu.endDate} onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })} type="text" placeholder="May 2022" className="input-field" />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Score Type</label>
                   <select 
                     value={edu.scoreType || 'Percentage'} 
                     onChange={(e) => updateEducation(edu.id, { scoreType: e.target.value as 'CGPA' | 'Percentage' })} 
                     className="input-field bg-white"
                   >
                     <option value="Percentage">Percentage</option>
                     <option value="CGPA">CGPA</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Score</label>
                   <input 
                     value={edu.scoreValue || ''} 
                     onChange={(e) => updateEducation(edu.id, { scoreValue: e.target.value })} 
                     type="text" 
                     placeholder={edu.scoreType === 'CGPA' ? "8.5" : "85"} 
                     className="input-field" 
                   />
                 </div>
               </div>
             </div>
          ))}

          <button onClick={handleAddEducation} className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 rounded-xl transition-all font-bold flex justify-center items-center gap-2">
            <span className="material-symbols-outlined">add</span> Add Another Education
          </button>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-8">
          <button onClick={() => setView('experience')} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button onClick={handleNext} className="flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-primary text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
            Next: Skills <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
