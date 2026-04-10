import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export type Experience = {
  id: string;
  role: string;
  company: string;
  duration: string;
  bullets: string[];
};

export type Skill = {
  id: string;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  techStack: string;
  projectLink: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

export type PersonalOtherEntry = {
  id: string;
  label: string;
  value: string;
};

export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
  title?: string;
  linkedinSummary?: string;
  otherEntries: PersonalOtherEntry[];
};

export type JobAnalysisMeta = {
  domain: string;
  missingSkillsOrWeakPoints: string;
  requiredSkills: string[];
  responsibilities: string[];
  roleTransitionGuidance?: string;
  actionableRecommendations?: string[];
};

const emptyPersonal: PersonalInfo = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  github: '',
  title: '',
  linkedinSummary: '',
  otherEntries: [],
};

export interface ResumeState {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  targetJob: string;
  jobRolePreset: string;
  autoTailorOnJobChange: boolean;
  atsScore: number;
  /** Extracted / canonical keywords (prefer Gemini analyze-job); used for scoring & highlight */
  keywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  jobAnalysis: JobAnalysisMeta | null;

  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  addExperience: (exp: Omit<Experience, 'id'>) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (edu: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  removeSkill: (id: string) => void;
  addProject: (p: Omit<Project, 'id'>) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  removeProject: (id: string) => void;
  addCertification: (c: Omit<Certification, 'id'>) => void;
  updateCertification: (id: string, c: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  setTargetJob: (jobDesc: string) => void;
  setJobRolePreset: (preset: string) => void;
  setAutoTailorOnJobChange: (v: boolean) => void;
  setKeywords: (keywords: string[]) => void;
  setJobAnalysis: (meta: JobAnalysisMeta | null) => void;
  calculateAtsScore: () => void;
  applyTailoringResult: (payload: {
    optimizedExperience: { id: string; bullets: string[] }[];
    suggestedSkills: { name: string; proficiency?: Skill['proficiency'] }[];
    optimizedProjects?: { id: string; description: string; techStack?: string }[];
    skillOrder?: string[];
  }) => void;
  /** Replace all builder state (e.g. load from cloud) */
  hydrateFromSnapshot: (partial: Partial<ResumeState> & Record<string, unknown>) => void;
}

function normalizeKeyword(w: string): string {
  return w.trim().toLowerCase();
}

/** Match keyword against resume text blobs */
function keywordMatchesResume(
  kw: string,
  state: Pick<ResumeState, 'skills' | 'experience' | 'education' | 'projects' | 'certifications' | 'personalInfo'>
): boolean {
  const k = normalizeKeyword(kw);
  if (k.length < 2) return false;

  const chunks: string[] = [];
  state.skills.forEach((s) => chunks.push(s.name));
  state.experience.forEach((e) => {
    chunks.push(e.role, e.company, ...e.bullets);
  });
  state.education.forEach((e) => {
    chunks.push(e.degree, e.institution);
  });
  state.projects.forEach((p) => {
    chunks.push(p.name, p.description, p.techStack, p.projectLink);
  });
  state.certifications.forEach((c) => {
    chunks.push(c.name, c.issuer);
  });
  if (state.personalInfo.title) chunks.push(state.personalInfo.title);
  state.personalInfo.otherEntries.forEach((o) => chunks.push(o.label, o.value));

  // Escaping regex chars just in case keywords have special symbols
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');

  return chunks.some((c) => c && regex.test(c));
}


export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      personalInfo: { ...emptyPersonal },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      targetJob: '',
      jobRolePreset: '',
      autoTailorOnJobChange: true,
      atsScore: 0,
      keywords: [],
      matchedKeywords: [],
      missingKeywords: [],
      suggestions: [],
      jobAnalysis: null,

      setPersonalInfo: (info) =>
        set((state) => ({ personalInfo: { ...state.personalInfo, ...info } })),

      addExperience: (exp) =>
        set((state) => ({
          experience: [...state.experience, { ...exp, id: newId() }],
        })),

      updateExperience: (id, exp) =>
        set((state) => ({
          experience: state.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
        })),

      removeExperience: (id) =>
        set((state) => ({
          experience: state.experience.filter((e) => e.id !== id),
        })),

      addEducation: (edu) =>
        set((state) => ({
          education: [...state.education, { ...edu, id: newId() }],
        })),

      updateEducation: (id, edu) =>
        set((state) => ({
          education: state.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
        })),

      removeEducation: (id) =>
        set((state) => ({
          education: state.education.filter((e) => e.id !== id),
        })),

      addSkill: (skill) =>
        set((state) => ({
          skills: [...state.skills, { ...skill, id: newId() }],
        })),

      removeSkill: (id) =>
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
        })),

      addProject: (p) =>
        set((state) => ({
          projects: [...state.projects, { ...p, id: newId() }],
        })),

      updateProject: (id, p) =>
        set((state) => ({
          projects: state.projects.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((x) => x.id !== id),
        })),

      addCertification: (c) =>
        set((state) => ({
          certifications: [...state.certifications, { ...c, id: newId() }],
        })),

      updateCertification: (id, c) =>
        set((state) => ({
          certifications: state.certifications.map((x) => (x.id === id ? { ...x, ...c } : x)),
        })),

      removeCertification: (id) =>
        set((state) => ({
          certifications: state.certifications.filter((x) => x.id !== id),
        })),

      setTargetJob: (jobDesc) => {
        set({ targetJob: jobDesc });
        const timeoutId = (globalThis as { _atsDebounce?: ReturnType<typeof setTimeout> })._atsDebounce;
        if (timeoutId) clearTimeout(timeoutId);
        (globalThis as { _atsDebounce?: ReturnType<typeof setTimeout> })._atsDebounce = setTimeout(() => {
          get().calculateAtsScore();
        }, 400);
      },

      setJobRolePreset: (preset) => set({ jobRolePreset: preset }),
      setAutoTailorOnJobChange: (v) => set({ autoTailorOnJobChange: v }),

      setKeywords: (keywords) => {
        const cleaned = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))];
        set({ keywords: cleaned });
        get().calculateAtsScore();
      },

      setJobAnalysis: (meta) => set({ jobAnalysis: meta }),

      calculateAtsScore: () => {
        const state = get();
        const {
          targetJob,
          keywords: storedKeywords,
          jobAnalysis,
          jobRolePreset,
          skills,
          experience,
          education,
          projects,
          certifications,
          personalInfo,
        } = state;

        if (!targetJob.trim() && storedKeywords.length === 0) {
          set({ atsScore: 0, matchedKeywords: [], missingKeywords: [] });
          return;
        }

        const matchTokensRaw: string[] = [];
        if (storedKeywords.length > 0) {
          matchTokensRaw.push(...storedKeywords);
        } else if (targetJob.trim()) {
          matchTokensRaw.push(
            ...new Set(
              targetJob
                .toLowerCase()
                .split(/\W+/)
                .filter((w) => w.length > 3)
            )
          );
        }
        if (jobAnalysis?.requiredSkills?.length) matchTokensRaw.push(...jobAnalysis.requiredSkills);
        if (jobAnalysis?.responsibilities?.length) matchTokensRaw.push(...jobAnalysis.responsibilities);

        const matchTokens = [
          ...new Set(matchTokensRaw.map((k) => normalizeKeyword(k)).filter((k) => k.length > 2)),
        ];

        if (matchTokens.length === 0) {
          set({ atsScore: 0, matchedKeywords: [], missingKeywords: [] });
          return;
        }

        const matchedKeywords: string[] = [];
        matchTokens.forEach((token) => {
          if (
            keywordMatchesResume(token, {
              skills,
              experience,
              education,
              projects,
              certifications,
              personalInfo,
            })
          ) {
            matchedKeywords.push(token);
          }
        });

        const keywordScore = (matchedKeywords.length / matchTokens.length) * 100;

        const actionVerbs = [
          'developed',
          'engineered',
          'led',
          'managed',
          'created',
          'optimized',
          'architected',
          'spearheaded',
          'automated',
          'implemented',
          'delivered',
          'designed',
          'built',
        ];
        let strengthPoints = 0;
        let totalBullets = 0;
        experience.forEach((exp) => {
          exp.bullets.forEach((bullet) => {
            if (!bullet.trim()) return;
            totalBullets++;
            const lowBullet = bullet.toLowerCase();
            if (actionVerbs.some((v) => lowBullet.includes(v))) strengthPoints += 1;
            if (/\d+%|\d+\s*k|\d+\s*m|\$\d+|million|billion|[\d,]+\+?\s*(users|customers|requests)/i.test(lowBullet))
              strengthPoints += 1;
          });
        });
        projects.forEach((p) => {
          if (p.description?.trim()) {
            totalBullets++;
            const low = p.description.toLowerCase();
            if (actionVerbs.some((v) => low.includes(v))) strengthPoints += 1;
            if (/\d+%|\$\d+/i.test(low)) strengthPoints += 1;
          }
        });
        const strengthScore = totalBullets > 0 ? (strengthPoints / (totalBullets * 2)) * 100 : 0;

        let structurePoints = 0;
        if (personalInfo.fullName && personalInfo.email) structurePoints += 20;
        if (experience.length > 0) structurePoints += 20;
        if (education.length > 0) structurePoints += 15;
        if (skills.length > 0) structurePoints += 15;
        if (projects.length > 0) structurePoints += 15;
        if (certifications.length > 0) structurePoints += 15;
        const structureScore = Math.min(structurePoints, 100);

        let formatPoints = 100;
        if (!personalInfo.phone && !personalInfo.linkedin) formatPoints -= 10;
        if (skills.length > 0 && skills.length < 4) formatPoints -= 15;
        const resumeBlob = [
          personalInfo.fullName,
          personalInfo.title,
          ...experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
          ...education.flatMap((e) => [e.degree, e.institution]),
          ...projects.flatMap((p) => [p.name, p.description, p.techStack]),
          ...certifications.flatMap((c) => [c.name, c.issuer]),
          ...skills.map((s) => s.name),
          ...personalInfo.otherEntries.flatMap((o) => [o.label, o.value]),
        ]
          .filter(Boolean)
          .join('\n');
        if (/[\u{1F300}-\u{1FAFF}]/u.test(resumeBlob)) formatPoints -= 20;
        if (/\t/.test(resumeBlob)) formatPoints -= 10;
        if (resumeBlob.length > 9000) formatPoints -= 10;
        formatPoints = Math.max(0, formatPoints);

        const finalScore = Math.floor(
          keywordScore * 0.5 + Math.min(strengthScore, 100) * 0.25 + structureScore * 0.15 + formatPoints * 0.1
        );

        const missingKeywords = matchTokens.filter((t) => !matchedKeywords.includes(t)).slice(0, 20);

        const suggestions: string[] = [];
        if (!storedKeywords.length) {
          suggestions.push('Run “Extract keywords” to score against curated ATS terms instead of raw job text.');
        }
        if (missingKeywords.length > 0) {
          suggestions.push(`Add or reflect missing keywords: ${missingKeywords.slice(0, 8).join(', ')}.`);
        }
        if (experience.length === 0) suggestions.push('Add at least one experience entry (ATS parsers prioritize it).');
        if (experience.length > 0) {
          const emptyBullets = experience.some((e) => e.bullets.filter((b) => b.trim()).length === 0);
          if (emptyBullets) suggestions.push('Add achievement bullets to every experience entry (2–5 strong bullets each).');
        }
        if (skills.length < 4) suggestions.push('Add more skills (ATS match improves with broader, relevant coverage).');
        if (!personalInfo.phone && !personalInfo.linkedin) {
          suggestions.push('Add phone or LinkedIn to strengthen recruiter contact confidence.');
        }
        if (projects.length === 0) suggestions.push('Add 1–2 relevant projects for extra keyword coverage.');
        if (certifications.length === 0 && (jobRolePreset === 'data' || jobRolePreset === 'ml')) {
          suggestions.push('Consider a relevant certification (e.g. cloud/analytics) if the posting lists it.');
        }

        set({
          atsScore: Math.min(finalScore, 100),
          matchedKeywords,
          missingKeywords,
          suggestions: suggestions.slice(0, 10),
        });
      },

      applyTailoringResult: ({
        optimizedExperience,
        suggestedSkills,
        optimizedProjects,
        skillOrder,
      }) => {
        const { experience, skills, projects } = get();

        const updatedExperience = experience.map((e) => {
          const opt = optimizedExperience.find((o) => o.id === e.id);
          return opt ? { ...e, bullets: opt.bullets } : e;
        });

        let updatedSkills = [...skills];
        suggestedSkills.forEach((newSkill) => {
          if (! updatedSkills.some((s) => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
            updatedSkills.push({
              id: newId(),
              name: newSkill.name,
              proficiency: newSkill.proficiency || 'Intermediate',
            });
          }
        });

        if (skillOrder?.length) {
          const orderLower = skillOrder.map((n) => n.toLowerCase());
          updatedSkills = [...updatedSkills].sort((a, b) => {
            const ia = orderLower.indexOf(a.name.toLowerCase());
            const ib = orderLower.indexOf(b.name.toLowerCase());
            const sa = ia === -1 ? 999 : ia;
            const sb = ib === -1 ? 999 : ib;
            if (sa !== sb) return sa - sb;
            return a.name.localeCompare(b.name);
          });
        }

        let updatedProjects = projects;
        if (optimizedProjects?.length) {
          updatedProjects = projects.map((p) => {
            const op = optimizedProjects.find((o) => o.id === p.id);
            return op ? { 
              ...p, 
              description: op.description, 
              techStack: op.techStack ?? p.techStack 
            } : p;
          });
        }

        set({
          experience: updatedExperience,
          skills: updatedSkills,
          projects: updatedProjects,
        });
        get().calculateAtsScore();
      },

      hydrateFromSnapshot: (snapshot) => {
        const s = snapshot as Partial<ResumeState>;
        const cur = get();
        set({
          personalInfo:
            s.personalInfo && typeof s.personalInfo === 'object'
              ? { ...cur.personalInfo, ...s.personalInfo }
              : cur.personalInfo,
          experience: Array.isArray(s.experience) ? s.experience : cur.experience,
          education: Array.isArray(s.education) ? s.education : cur.education,
          skills: Array.isArray(s.skills) ? s.skills : cur.skills,
          projects: Array.isArray(s.projects) ? s.projects : cur.projects,
          certifications: Array.isArray(s.certifications) ? s.certifications : cur.certifications,
          targetJob: typeof s.targetJob === 'string' ? s.targetJob : cur.targetJob,
          jobRolePreset: typeof s.jobRolePreset === 'string' ? s.jobRolePreset : cur.jobRolePreset,
          keywords: Array.isArray(s.keywords) ? s.keywords : cur.keywords,
          jobAnalysis: s.jobAnalysis !== undefined ? s.jobAnalysis : cur.jobAnalysis,
          autoTailorOnJobChange:
            typeof s.autoTailorOnJobChange === 'boolean'
              ? s.autoTailorOnJobChange
              : cur.autoTailorOnJobChange,
        });
        get().calculateAtsScore();
      },
    }),
    {
      name: 'smart-ats-storage',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ResumeState>;
        return {
          ...current,
          ...p,
          personalInfo: { ...current.personalInfo, ...(p.personalInfo ?? {}) },
          projects: Array.isArray(p.projects) ? p.projects : current.projects,
          certifications: Array.isArray(p.certifications) ? p.certifications : current.certifications,
          jobRolePreset: typeof p.jobRolePreset === 'string' ? p.jobRolePreset : current.jobRolePreset,
          autoTailorOnJobChange:
            typeof p.autoTailorOnJobChange === 'boolean' ? p.autoTailorOnJobChange : true,
          jobAnalysis: p.jobAnalysis ?? null,
          keywords: Array.isArray(p.keywords) ? p.keywords : current.keywords,
          suggestions: Array.isArray((p as Partial<ResumeState>).suggestions)
            ? ((p as Partial<ResumeState>).suggestions as string[])
            : current.suggestions,
        };
      },
    }
  )
);
