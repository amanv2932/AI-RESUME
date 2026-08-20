"use client";
import { useResumeStore } from '@/store/useResumeStore';

export default function CertificationsView({ setView }: { setView: (v: string) => void }) {
  const { certifications, updateCertification, addCertification, removeCertification } = useResumeStore();

  const handleNext = () => {
    for (const c of certifications) {
      if (c.name.trim() && (!c.issuer.trim() || !c.date.trim())) {
        // soft validation — issuer/date strongly recommended
      }
    }
    setView('targeting');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in relative">
      <div className="space-y-12">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Step 6 of 8</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Certifications</h2>
          </div>
          <p className="text-on-surface-variant text-lg">
            Credentials that strengthen ATS keyword coverage for regulated or tooling-heavy roles.
          </p>
        </div>

        <div className="space-y-6">
          {certifications.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-6 relative group transition-all"
            >
              <button
                type="button"
                onClick={() => removeCertification(c.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={c.name}
                    onChange={(e) => updateCertification(c.id, { name: e.target.value })}
                    type="text"
                    placeholder="AWS Solutions Architect"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Issuer <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={c.issuer}
                    onChange={(e) => updateCertification(c.id, { issuer: e.target.value })}
                    type="text"
                    placeholder="Amazon Web Services"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</label>
                  <input
                    value={c.date}
                    onChange={(e) => updateCertification(c.id, { date: e.target.value })}
                    type="text"
                    placeholder="Aug 2024"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addCertification({ name: '', issuer: '', date: '' })}
            className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 rounded-xl transition-all font-bold flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span> Add certification
          </button>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-8">
          <button
            type="button"
            onClick={() => setView('projects')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-primary text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Next: Targeting <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
