import type {
  Certification,
  Education,
  Experience,
  PersonalInfo,
  Project,
  Skill,
} from '@/store/useResumeStore';

export type ResumeSnapshotForText = {
  personalInfo: PersonalInfo;
  title?: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
};

export function buildResumePlainText(data: ResumeSnapshotForText): string {
  const { personalInfo, experience, education, skills, projects, certifications } = data;
  const lines: string[] = [];

  lines.push((personalInfo.fullName || 'Your Name').toUpperCase());
  if (personalInfo.title?.trim()) {
    lines.push(personalInfo.title.trim());
  }
  lines.push('');

  const contact: string[] = [];
  if (personalInfo.email) contact.push(personalInfo.email);
  if (personalInfo.phone) contact.push(personalInfo.phone);
  if (personalInfo.location) contact.push(personalInfo.location);
  if (personalInfo.linkedin) contact.push(`LinkedIn: ${personalInfo.linkedin}`);
  if (personalInfo.github) contact.push(`GitHub: ${personalInfo.github}`);
  if (personalInfo.portfolio) contact.push(`Portfolio: ${personalInfo.portfolio}`);
  for (const entry of (personalInfo.otherEntries || [])) {
    contact.push(`${entry.label}: ${entry.value}`);
  }
  if (contact.length) {
    lines.push(contact.join(' | '));
    lines.push('');
  }

  if (experience.length) {
    lines.push('PROFESSIONAL EXPERIENCE');
    lines.push('');
    for (const exp of experience) {
      lines.push(`${exp.role} | ${exp.company} | ${exp.duration}`);
      for (const b of exp.bullets) {
        if (b.trim()) lines.push(`• ${b.trim()}`);
      }
      lines.push('');
    }
  }

  if (education.length) {
    lines.push('EDUCATION');
    lines.push('');
    for (const edu of education) {
      lines.push(
        `${edu.degree} — ${edu.institution}${edu.startDate ? ` (${edu.startDate} – ${edu.endDate || 'Present'})` : ''}`
      );
    }
    lines.push('');
  }

  if (projects.length) {
    lines.push('PROJECTS');
    lines.push('');
    for (const p of projects) {
      if (!p.name.trim() && !p.description.trim()) continue;
      lines.push(`${p.name} | ${p.projectLink || 'No link'}`);
      if (p.techStack.trim()) lines.push(`Tech Stack: ${p.techStack.trim()}`);
      if (p.description.trim()) {
        lines.push(p.description.trim());
      }
      lines.push('');
    }
  }

  if (skills.length) {
    lines.push('SKILLS');
    lines.push(skills.map((s) => s.name).join(', '));
    lines.push('');
  }

  if (certifications.length) {
    lines.push('CERTIFICATIONS');
    lines.push('');
    for (const c of certifications) {
      lines.push(`${c.name} — ${c.issuer}${c.date ? ` (${c.date})` : ''}`);
    }
    lines.push('');
  }

  if (personalInfo.linkedinSummary?.trim()) {
    lines.push('LINKEDIN ABOUT (not for resume body — copy to profile)');
    lines.push('');
    lines.push(personalInfo.linkedinSummary.trim());
  }

  return lines.join('\n').trim();
}
