"use client";
import { useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';

export default function ProjectsView({ setView }: { setView: (v: string) => void }) {
  const { projects, updateProject, addProject, removeProject, targetJob } = useResumeStore();
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const handleAutoOptimize = async (id: string, name: string, description: string, techStack: string) => {
    if (!description.trim()) {
      alert("Please provide a description first before optimizing.");
      return;
    }
    setOptimizingId(id);
    try {
      const res = await fetch('/api/optimize-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, techStack, targetJob }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Project optimization failed');
      }
      if (data.description) {
        updateProject(id, { 
          description: data.description, 
          techStack: data.techStack || techStack 
        });
      }
      if (data.isFallback) {
        const fallbackMessage =
          typeof data.message === 'string' && data.message.trim()
            ? data.message
            : 'Project optimization used fallback formatting instead of AI.';
        alert(fallbackMessage);
      }
    } catch (err) {
      console.error("Project optimization failed:", err);
      alert("Project optimization failed. Please check your internet connection or API key and try again.");
    } finally {
      setOptimizingId(null);
    }
  };

  const handleNext = () => {
    setView('certifications');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in relative pb-20">
      <div className="space-y-12">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">Step 5 of 8</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Projects</h2>
          </div>
          <p className="text-on-surface-variant text-lg">
            Ship work that is not covered in experience—problem, stack, and searchable result.
          </p>
        </div>

        <div className="space-y-8">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-6 relative group transition-all"
            >
              <button
                type="button"
                onClick={() => removeProject(p.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project name</label>
                  <input
                    value={p.name}
                    onChange={(e) => updateProject(p.id, { name: e.target.value })}
                    type="text"
                    placeholder="Payments reliability dashboard"
                    className="input-field"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                    <button
                      onClick={() => handleAutoOptimize(p.id, p.name, p.description, p.techStack)}
                      disabled={optimizingId === p.id}
                      className="text-[10px] font-black text-secondary flex items-center gap-1.5 hover:underline disabled:opacity-50"
                    >
                      {optimizingId === p.id ? (
                        <div className="flex items-center gap-1.5 animate-pulse-subtle">
                          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          OPTIMIZING...
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                          Auto-Optimize
                        </div>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={p.description}
                    onChange={(e) => updateProject(p.id, { description: e.target.value })}
                    rows={4}
                    placeholder="Describe what you built, constraints, and your role..."
                    className="input-field resize-none h-auto bg-slate-50/30"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tech stack</label>
                    <input
                      value={p.techStack}
                      onChange={(e) => updateProject(p.id, { techStack: e.target.value })}
                      type="text"
                      placeholder="Next.js, Postgres, Redis…"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Project Link</label>
                    <input
                      value={p.projectLink || ''}
                      onChange={(e) => updateProject(p.id, { projectLink: e.target.value })}
                      type="text"
                      placeholder="github.com/alex/dashboard"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              addProject({ name: '', description: '', techStack: '', projectLink: '' })
            }
            className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 rounded-xl transition-all font-bold flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span> Add project
          </button>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-8">
          <button
            type="button"
            onClick={() => setView('skills')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase text-xs"
          >
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-primary text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase"
          >
            Next: Certifications <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
