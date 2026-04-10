import type { JobAnalysisMeta } from '@/store/useResumeStore';

export type ResumeSectionKey = 'experience' | 'projects' | 'skills' | 'education' | 'certifications';

export function getResumeSectionOrder(jobRolePreset: string, jobAnalysis: JobAnalysisMeta | null): ResumeSectionKey[] {
  const base: ResumeSectionKey[] = ['experience', 'projects', 'education', 'skills', 'certifications'];

  if (jobRolePreset === 'data' || jobRolePreset === 'ml') {
    return ['skills', 'projects', 'experience', 'education', 'certifications'];
  }

  if (jobRolePreset === 'pm') {
    return ['experience', 'skills', 'projects', 'education', 'certifications'];
  }

  const domain = (jobAnalysis?.domain || '').toLowerCase();
  if (domain.includes('data')) {
    return ['skills', 'projects', 'experience', 'education', 'certifications'];
  }

  return base;
}
