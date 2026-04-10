"use client";
import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ResumePdfDocument } from '@/pdf/ResumePdfDocument';
import type { PersonalInfo } from '@/store/useResumeStore';
import type { ResumeSnapshotPayload } from '@/lib/resume-snapshot';

interface Props {
  snapshot: ResumeSnapshotPayload;
  personalInfo: PersonalInfo;
}

export default function PDFExportButton({ snapshot, personalInfo }: Props) {
  return (
    <PDFDownloadLink
      document={<ResumePdfDocument data={snapshot} />}
      fileName={personalInfo.fullName ? `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf'}
      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-[0.98] transition-all group"
    >

      {({ loading }) => (
        <>
          <span className={`material-symbols-outlined text-2xl ${loading ? 'animate-spin' : 'group-hover:translate-y-0.5 transition-transform'}`}>
            {loading ? 'sync' : 'download_for_offline'}
          </span>
          <span className="uppercase tracking-widest text-sm">
            {loading ? 'PREPARING PDF...' : 'DOWNLOAD PROFESSIONAL PDF'}
          </span>
        </>
      )}
    </PDFDownloadLink>
  );
}
