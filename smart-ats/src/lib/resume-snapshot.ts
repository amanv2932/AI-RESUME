import type {
  Certification,
  Education,
  Experience,
  PersonalInfo,
  Project,
  ResumeState,
  Skill,
} from '@/store/useResumeStore';

export type ResumeSnapshotPayload = {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  targetJob: string;
  jobRolePreset: string;
  keywords: string[];
  atsScore: number;
  autoTailorOnJobChange: boolean;
  themeId: string;
};

export function snapshotFromStore(getState: () => ResumeState): ResumeSnapshotPayload {
  const s = getState();
  return {
    personalInfo: s.personalInfo,
    experience: s.experience,
    education: s.education,
    skills: s.skills,
    projects: s.projects,
    certifications: s.certifications,
    targetJob: s.targetJob,
    jobRolePreset: s.jobRolePreset,
    keywords: s.keywords,
    atsScore: s.atsScore,
    autoTailorOnJobChange: s.autoTailorOnJobChange,
    themeId: s.themeId,
  };
}
