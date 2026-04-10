"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useResumeStore } from '@/store/useResumeStore';
import HydrationGuard from '@/components/HydrationGuard';
import AutosaveGuard from '@/components/AutosaveGuard';
import DashboardView from '@/components/views/DashboardView';
import PersonalView from '@/components/views/PersonalView';
import ExperienceView from '@/components/views/ExperienceView';
import EducationView from '@/components/views/EducationView';
import SkillView from '@/components/views/SkillView';
import ProjectsView from '@/components/views/ProjectsView';
import CertificationsView from '@/components/views/CertificationsView';
import TargetingView from '@/components/views/TargetingView';
import RefineView from '@/components/views/RefineView';
import ResumePreview from '@/components/preview/ResumePreview';

const NAV_STEPS = [
  { id: 'personal', icon: 'person', label: 'Personal Info' },
  { id: 'experience', icon: 'work', label: 'Experience' },
  { id: 'education', icon: 'school', label: 'Education' },
  { id: 'skills', icon: 'psychology', label: 'Skills' },
  { id: 'projects', icon: 'deployed_code', label: 'Projects' },
  { id: 'certifications', icon: 'verified', label: 'Certifications' },
  { id: 'targeting', icon: 'target', label: 'Targeting' },
  { id: 'refine', icon: 'description', label: 'Review' },
] as const;

export default function AppWrapper() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const { personalInfo, setPersonalInfo } = useResumeStore();

  useEffect(() => {
    // One-time data cleaning for duplicated names
    const name = personalInfo.fullName || '';
    if (name.length > 0) {
      const half = name.length / 2;
      const part1 = name.substring(0, half);
      const part2 = name.substring(half);
      if (part1 === part2) {
        setPersonalInfo({ fullName: part1 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepIndex = NAV_STEPS.findIndex((s) => s.id === currentView);
  const progressPct =
    stepIndex >= 0 ? Math.round(((stepIndex + 1) / NAV_STEPS.length) * 100) : 0;

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col items-center overflow-hidden">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] z-50 h-[72px]">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-2xl">grid_view</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
              ExecutiveDesk
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] hidden sm:block">
              Smart ATS Resume Builder
            </span>
          </div>
        </div>

        {currentView !== 'dashboard' && (
          <div className="flex-1 max-w-xl mx-8 hidden lg:block">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Builder Progress
              </span>
              <span className="text-[10px] font-black text-primary tracking-widest">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-2 mr-6 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                currentView === 'dashboard'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('personal')}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                currentView !== 'dashboard'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Builder
            </button>
          </nav>
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg relative">
            <Image
              alt="User profile photo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8EmXsO6uexYpnPJC8bAlS8GqY62mDesT-T2yfyL3NvI_wztOauNYm7zF_yiW9J98BW8z3vdyRtS9ZbifJkvXCF2FrGljX-CpFCDnlp0DOLPoI6ca5xFf0MAWwaiU43xFI6UGktn-O3KSVIl5s7gMzH5Ztx0WNB1EltS-2T2I2NEiydxV8a10cTbfLXL3Uv1a1B0JO6ZCi3dw40ikUvLJQjH9UPoTJi-cBLeYUbL2CKyue2Pmv2FRhrK6iIwoGSdtA1Ad3tRayxADD"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      </header>

      <div className="w-full h-[calc(100vh-72px)] mt-[72px] flex">
        {currentView === 'dashboard' ? (
          <div className="w-full h-full overflow-y-auto bg-slate-50/50">
            <DashboardView setView={setCurrentView} />
          </div>
        ) : (
          <HydrationGuard>
            <AutosaveGuard />
            <div className="w-full lg:w-[45%] h-full flex overflow-hidden bg-white relative z-10 shadow-2xl">
              <aside className="w-64 shrink-0 border-r border-slate-100 bg-slate-50/40 backdrop-blur-md flex flex-col pt-8 px-4 h-full overflow-y-auto">
                <nav className="flex flex-col gap-1.5">
                  {NAV_STEPS.map((step) => {
                    const isActive = currentView === step.id;
                    return (
                      <div
                        key={step.id}
                        onClick={() => setCurrentView(step.id)}
                        className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl font-[Manrope] font-bold text-sm cursor-pointer transition-all duration-300 relative overflow-hidden
                          ${
                            isActive
                              ? 'bg-white text-primary shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                          }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />
                        )}
                        <span
                          className={`material-symbols-outlined transition-transform duration-300 ${
                            isActive ? 'scale-110' : 'group-hover:translate-x-1'
                          }`}
                        >
                          {step.icon}
                        </span>
                        <span className="tracking-tight">{step.label}</span>
                      </div>
                    );
                  })}
                </nav>
              </aside>

              <div className="flex-grow h-full overflow-y-auto p-8 hide-scrollbar">
                {currentView === 'personal' && <PersonalView setView={setCurrentView} />}
                {currentView === 'experience' && <ExperienceView setView={setCurrentView} />}
                {currentView === 'education' && <EducationView setView={setCurrentView} />}
                {currentView === 'skills' && <SkillView setView={setCurrentView} />}
                {currentView === 'projects' && <ProjectsView setView={setCurrentView} />}
                {currentView === 'certifications' && <CertificationsView setView={setCurrentView} />}
                {currentView === 'targeting' && <TargetingView setView={setCurrentView} />}
                {currentView === 'refine' && <RefineView setView={setCurrentView} />}
              </div>
            </div>

            <div className="hidden lg:flex lg:w-[55%] h-full bg-slate-200/60 items-start justify-center overflow-y-auto p-8">
              <div className="w-full max-w-[21cm] bg-white min-h-[29.7cm] shadow-2xl p-8 transform origin-top transition-all scale-95 border border-slate-200 group">
                <ResumePreview />
              </div>
            </div>
          </HydrationGuard>
        )}
      </div>
    </div>
  );
}
