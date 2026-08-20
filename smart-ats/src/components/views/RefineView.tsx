"use client";

import { useResumeStore } from '@/store/useResumeStore';
import ResumePreview from '@/components/preview/ResumePreview';
import { buildResumePlainText } from '@/lib/resume-text';
import { snapshotFromStore } from '@/lib/resume-snapshot';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import dynamic from 'next/dynamic';
import { ResumePdfDocument } from '@/pdf/ResumePdfDocument';

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function RefineView({ setView }: { setView: (v: string) => void }) {
  const store = useResumeStore();
  const { atsScore, personalInfo, themeId, setThemeId } = store;
  const printRef = useRef<HTMLDivElement>(null);
  const isClient = typeof window !== 'undefined';

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: personalInfo.fullName
      ? `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume`
      : 'Resume',
  });

  const plain = buildResumePlainText({
    personalInfo,
    experience: store.experience,
    education: store.education,
    skills: store.skills,
    projects: store.projects,
    certifications: store.certifications,
  });

  const downloadPlainText = () => {
    const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = personalInfo.fullName
      ? `${personalInfo.fullName.replace(/\s+/g, '_')}_resume.txt`
      : 'resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPlainText = async () => {
    await navigator.clipboard.writeText(plain);
  };

  const snapshot = snapshotFromStore(useResumeStore.getState);

  return (
    <div className="w-full max-w-4xl animate-fade-in relative">
      <div className="fixed left-[-12000px] top-0 w-[210mm] pointer-events-none opacity-0" aria-hidden>
        <div ref={printRef}>
          <ResumePreview />
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase italic">Step 8 of 8</span>
            <h2 className="text-3xl font-black text-primary tracking-tight">Review & export</h2>
          </div>
          <p className="text-on-surface-variant text-lg">
            Finalize your professional resume. Pick a theme, download a PDF, or export plain text.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-6 text-center">
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <label className="text-sm font-bold text-slate-700">Select Theme:</label>
            <select 
              value={themeId} 
              onChange={(e) => setThemeId(e.target.value)} 
              className="input-field max-w-xs bg-white text-sm"
            >
              <option value="modern">Modern (Default)</option>
              <option value="classic">Classic / Traditional</option>
              <option value="minimal">Minimal / Clean</option>
              <option value="creative-blue">Creative Blue (Sidebar)</option>
              <option value="executive-accent">Executive Accent (Colored)</option>
            </select>
          </div>

          <span className="material-symbols-outlined text-[64px] text-slate-500 mb-4 inline-block">verified</span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Resume optimized & ready</h3>
          <p className="text-slate-600 max-w-lg mx-auto text-sm leading-relaxed mt-2">
            Your <strong>local ATS alignment score</strong> is{' '}
            <span className="font-black text-slate-600 underline underline-offset-4 decoration-slate-200">{atsScore}%</span>. 
            This reflects your match for the target role based on keywords and formatting.
          </p>

          <div className="my-8 w-full block lg:hidden">
            <h4 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4">Live preview</h4>
            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl max-h-[500px] overflow-y-auto p-4 flex justify-center shadow-inner relative">
              <div className="w-full max-w-[21cm] transform origin-top-left scale-[0.6] sm:scale-[0.8] mb-[-40%] sm:mb-[-20%] bg-white shadow-md">
                <ResumePreview />
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3 max-w-sm mx-auto">
            {isClient ? (
              <PDFDownloadLink
                document={<ResumePdfDocument data={snapshot} />}
                fileName={personalInfo.fullName ? `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf'}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg active:scale-95 transition-all"
              >

                {({ loading }) => (
                  <>
                    <span className="material-symbols-outlined">{loading ? 'sync' : 'download'}</span>
                    <span>{loading ? 'Preparing PDF...' : 'Download professional PDF'}</span>
                  </>
                )}
              </PDFDownloadLink>
            ) : (
              <div className="w-full bg-slate-100 text-slate-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                <span className="material-symbols-outlined animate-spin">sync</span> Loading...
              </div>
            )}
            
            <button
              type="button"
              onClick={() => void handlePrint()}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              <span className="material-symbols-outlined">print</span> Print preview (browser PDF)
            </button>
            <button
              type="button"
              onClick={downloadPlainText}
              className="w-full py-4 border-2 border-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              <span className="material-symbols-outlined">description</span> Export Plain Text
            </button>
            <button
              type="button"
              onClick={() => void copyPlainText()}
              className="w-full py-3 text-slate-400 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span> Copy to clipboard
            </button>
          </div>
        </div>

        <div className="pt-8 flex items-center justify-between border-t border-slate-200">
          <button
            type="button"
            onClick={() => setView('targeting')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="py-3 px-8 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
