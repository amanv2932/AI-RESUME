export type JobRolePreset = {
  id: string;
  label: string;
  /** Pulled into keyword/scoring pool when this role is active */
  boostKeywords: string[];
  blurb: string;
};

export const JOB_ROLE_PRESETS: JobRolePreset[] = [
  {
    id: 'frontend',
    label: 'Frontend Developer',
    boostKeywords: [
      'react',
      'typescript',
      'javascript',
      'css',
      'html',
      'accessibility',
      'performance',
      'frontend',
      'ui',
    ],
    blurb:
      'Role: Frontend / UI Engineer. Paste the full posting below. Typical focus: component architecture, performance, accessibility, design systems, TypeScript, and modern frameworks.',
  },
  {
    id: 'backend',
    label: 'Backend Developer',
    boostKeywords: [
      'api',
      'microservices',
      'sql',
      'nosql',
      'docker',
      'kubernetes',
      'distributed',
      'backend',
      'rest',
    ],
    blurb:
      'Role: Backend Engineer. Paste the full posting below. Typical focus: APIs, databases, scalability, reliability, cloud, and system design.',
  },
  {
    id: 'fullstack',
    label: 'Full-Stack Developer',
    boostKeywords: ['full stack', 'react', 'node', 'api', 'sql', 'typescript', 'aws'],
    blurb: 'Role: Full-Stack Engineer. Paste the full posting below.',
  },
  {
    id: 'data',
    label: 'Data Analyst',
    boostKeywords: ['sql', 'python', 'excel', 'visualization', 'analytics', 'dashboards', 'statistics'],
    blurb: 'Role: Data Analyst. Paste the full posting below. Typical focus: SQL, reporting, visualization, experimentation.',
  },
  {
    id: 'ml',
    label: 'ML / Data Scientist',
    boostKeywords: ['python', 'machine learning', 'statistics', 'pandas', 'modeling', 'nlp', 'deep learning'],
    blurb: 'Role: ML / Data Science. Paste the full posting below.',
  },
  {
    id: 'pm',
    label: 'Product Manager',
    boostKeywords: ['roadmap', 'stakeholders', 'metrics', 'discovery', 'prioritization', 'agile'],
    blurb: 'Role: Product Manager. Paste the full posting below.',
  },
  {
    id: 'creative',
    label: 'Creative / Marketing',
    boostKeywords: ['design', 'branding', 'social media', 'content strategy', 'copywriting', 'analytics', 'arts'],
    blurb: 'Role: Creative / Marketing / Arts. Focus: storytelling, brand identity, content creation, and campaign performance.',
  },
  {
    id: 'business',
    label: 'Sales / Business Dev',
    boostKeywords: ['sales', 'crm', 'negotiation', 'prospecting', 'revenue', 'partnerships', 'pipeline'],
    blurb: 'Role: Sales / Business Development. Focus: relationship management, revenue growth, and market expansion.',
  },
  {
    id: 'entry',
    label: 'College Student / Intern',
    boostKeywords: ['internship', 'leadership', 'projects', 'academic', 'learning', 'clubs', 'collaborative'],
    blurb: 'Role: Early Career / Internship. Focus: foundational skills, academic achievements, and rapid learning.',
  },
  {
    id: 'admin',
    label: 'Admin / Operations',
    boostKeywords: ['operations', 'scheduling', 'management', 'efficiency', 'coordination', 'logistics'],
    blurb: 'Role: Administrative / Operations. Focus: process optimization, support, and organizational efficiency.',
  },
];

export function getPresetById(id: string): JobRolePreset | undefined {
  return JOB_ROLE_PRESETS.find((p) => p.id === id);
}
