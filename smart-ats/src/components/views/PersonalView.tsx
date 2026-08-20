"use client";
import { useResumeStore } from '@/store/useResumeStore';

export default function PersonalView({ setView }: { setView: (v: string) => void }) {
  const { personalInfo, setPersonalInfo } = useResumeStore();

  const handleChange = (name: string, value: string) => {
    setPersonalInfo({ [name]: value });
  };

  const handleOtherChange = (id: string, field: 'label' | 'value', val: string) => {
    const updated = personalInfo.otherEntries.map(oe => 
      oe.id === id ? { ...oe, [field]: val } : oe
    );
    setPersonalInfo({ otherEntries: updated });
  };

  const addOther = () => {
    const id = Math.random().toString(36).slice(2, 9);
    setPersonalInfo({ 
      otherEntries: [...(personalInfo.otherEntries || []), { id, label: '', value: '' }] 
    });
  };

  const removeOther = (id: string) => {
    setPersonalInfo({ 
      otherEntries: personalInfo.otherEntries.filter(oe => oe.id !== id) 
    });
  };

  const handleNext = () => {
    if (!personalInfo.fullName.trim() || !personalInfo.email.trim()) {
      alert("Please fill in your Full Name and Email Address.");
      return;
    }
    setView('experience');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in relative pb-20">
      <div className="space-y-12">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Step 1 of 8</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Personal Info</h2>
          </div>
          <p className="text-on-surface-variant text-lg">Set the stage with your contact details and professional persona.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-10">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">Full Name <span className="text-rose-500">*</span></label>
              <input value={personalInfo.fullName} onChange={e => handleChange('fullName', e.target.value)} type="text" placeholder="Alex Sterling" className="input-field" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">Professional Title</label>
              <input value={personalInfo.title || ''} onChange={e => handleChange('title', e.target.value)} type="text" placeholder="Senior Product Designer" className="input-field" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">Email Address <span className="text-rose-500">*</span></label>
              <input value={personalInfo.email} onChange={e => handleChange('email', e.target.value)} type="email" placeholder="alex@example.com" className="input-field" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">Phone Number</label>
              <input value={personalInfo.phone} onChange={e => handleChange('phone', e.target.value)} type="tel" placeholder="+1 (555) 000-0000" className="input-field" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">Location</label>
              <input value={personalInfo.location || ''} onChange={e => handleChange('location', e.target.value)} type="text" placeholder="San Francisco, CA" className="input-field" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">LinkedIn Profile</label>
              <input value={personalInfo.linkedin || ''} onChange={e => handleChange('linkedin', e.target.value)} type="text" placeholder="linkedin.com/in/..." className="input-field" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">GitHub Profile</label>
              <input value={personalInfo.github || ''} onChange={e => handleChange('github', e.target.value)} type="text" placeholder="github.com/alex" className="input-field" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase text-[10px]">Portfolio / website</label>
              <input value={personalInfo.portfolio || ''} onChange={e => handleChange('portfolio', e.target.value)} type="text" placeholder="https://you.dev" className="input-field" />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Other Category */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Other Fields</h3>
                <p className="text-xs text-slate-500 mt-1">Add custom links or mentions (Twitter, LeetCode, Blog, etc.)</p>
              </div>
              <button 
                onClick={addOther}
                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add Entry
              </button>
            </div>

            <div className="space-y-4">
              {personalInfo.otherEntries?.map((entry) => (
                <div key={entry.id} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-end bg-slate-50/50 p-4 rounded-lg relative group">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Label</label>
                    <input 
                      value={entry.label} 
                      onChange={e => handleOtherChange(entry.id, 'label', e.target.value)} 
                      placeholder="e.g. LeetCode" 
                      className="bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Value / Link</label>
                    <input 
                      value={entry.value} 
                      onChange={e => handleOtherChange(entry.id, 'value', e.target.value)} 
                      placeholder="leetcode.com/u/alex" 
                      className="bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeOther(entry.id)}
                    className="p-2 text-rose-500 font-bold hover:bg-rose-50 rounded transition-colors flex items-center gap-1 uppercase tracking-wider text-[10px]"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span> Delete
                  </button>
                </div>
              ))}
              
              {(!personalInfo.otherEntries || personalInfo.otherEntries.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400 italic">No custom entries added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 flex items-center justify-end">
          <button onClick={handleNext} className="px-10 py-4 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-lg text-sm uppercase tracking-widest">
            Next: Experience <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

