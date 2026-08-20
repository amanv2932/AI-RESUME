export type ResumeSectionKey = 'experience' | 'projects' | 'skills' | 'education' | 'certifications';

export function getResumeSectionOrder(jobRolePreset: string): ResumeSectionKey[] {
  const base: ResumeSectionKey[] = ['experience', 'projects', 'education', 'skills', 'certifications'];

  if (jobRolePreset === 'data' || jobRolePreset === 'ml') {
    return ['skills', 'projects', 'experience', 'education', 'certifications'];
  }

  if (jobRolePreset === 'pm') {
    return ['experience', 'skills', 'projects', 'education', 'certifications'];
  }

  return base;
}
