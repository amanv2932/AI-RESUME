"use client";

import { useResumeStore } from '@/store/useResumeStore';
import styles from './preview.module.css';
import { getResumeSectionOrder, type ResumeSectionKey } from '@/lib/section-order';

/** Helper to render a clickable link if value looks like a URL, otherwise just text */
function SmartLink({ value, prefix = '' }: { value: string; prefix?: string }) {
  if (!value) return null;
  const isUrl = value.includes('.') || value.startsWith('http') || value.includes('/');
  
  if (isUrl) {
    const href = value.startsWith('http') ? value : `https://${value}`;
    const display = value.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    return (
      <span className={styles.contactItem}>
        {prefix && ` • `}
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline text-sky-600 font-semibold transition-colors">
          {display}
        </a>
      </span>
    );
  }

  return (
    <span className={styles.contactItem}>
      {prefix && ` • `}
      {value}
    </span>
  );
}

export default function ResumePreview() {
  const {
    personalInfo,
    experience,
    education = [],
    skills,
    projects = [],
    certifications = [],
    jobRolePreset,
    themeId,
  } = useResumeStore();

  const sectionOrder = getResumeSectionOrder(jobRolePreset);

  const renderExperience = () =>
    experience.length > 0 ? (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Professional Experience</h2>
        <div className={styles.experiences}>
          {experience.map((exp) => (
            <div key={exp.id} className={styles.expItem}>
              <div className={styles.expHeader}>
                <div>
                  <div className={styles.role}>{exp.role || 'Job Title'}</div>
                  <div className={styles.company}>{exp.company || 'Company'}</div>
                </div>
                <span className={styles.duration}>{exp.duration}</span>
              </div>
              <ul className={styles.bulletList}>
                {exp.bullets.map((bullet, idx) => (bullet ? <li key={idx}>{bullet}</li> : null))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const renderProjects = () =>
    projects.some((p) => p.name.trim() || p.description.trim() || p.projectLink?.trim()) ? (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        <div className={styles.experiences}>
          {projects.map((p) => {
            if (!p.name.trim() && !p.description.trim()) return null;
            return (
              <div key={p.id} className={styles.expItem}>
                <div className={styles.expHeader}>
                  <div className="w-full">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className={styles.role}>{p.name || 'Project'}</div>
                      {p.projectLink?.trim() && (
                         <div className="text-[10px] font-bold">
                           <a href={p.projectLink.startsWith('http') ? p.projectLink : `https://${p.projectLink}`} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline transition-colors">
                             {p.projectLink.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                           </a>
                         </div>
                      )}
                    </div>
                    {p.techStack.trim() && (
                      <div className={styles.company}>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-2">Stack:</span>
                        {p.techStack.trim()}
                      </div>
                    )}
                  </div>
                </div>
                {p.description.trim() && (
                  <p className={`${styles.projectBody} mt-2 text-justify`}>
                    {p.description.trim()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ) : null;

  const renderEducation = () =>
    education.length > 0 ? (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Education</h2>
        <div className={styles.experiences}>
          {education.map((edu) => (
            <div key={edu.id} className={styles.expItem}>
              <div className={styles.expHeader}>
                <div>
                  <div className={styles.role}>{edu.degree || 'Degree'}</div>
                  <div className={styles.company}>
                    {edu.institution || 'Institution'}
                    {edu.scoreValue && (
                      <span className="text-slate-900 font-bold ml-1"> | {edu.scoreType || 'Score'}: {edu.scoreValue}</span>
                    )}
                  </div>
                </div>
                <span className={styles.duration}>
                  {edu.startDate ? `${edu.startDate} — ` : ''}
                  {edu.endDate || 'Present'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  const renderSkills = () =>
    skills.length > 0 ? (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Technical Skills & Core Competencies</h2>
        <div className={styles.skillsList}>
          {skills.map((skill) => (
            <span key={skill.id} className={styles.skillItem}>
              • {skill.name}
            </span>
          ))}
        </div>
      </div>
    ) : null;

  const renderCertifications = () =>
    certifications.some((c) => c.name.trim()) ? (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Certifications</h2>
        <div className={styles.experiences}>
          {certifications.map((c) => {
            if (!c.name.trim()) return null;
            return (
              <div key={c.id} className={styles.expItem}>
                <div className={styles.expHeader}>
                  <div>
                    <div className={styles.role}>{c.name}</div>
                    <div className={styles.company}>
                      {c.issuer}
                      {c.date ? ` • ${c.date}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : null;

  const renderByKey = (key: ResumeSectionKey) => {
    switch (key) {
      case 'experience':
        return renderExperience();
      case 'projects':
        return renderProjects();
      case 'skills':
        return renderSkills();
      case 'education':
        return renderEducation();
      case 'certifications':
        return renderCertifications();
      default:
        return null;
    }
  };

  const renderContactInfo = () => (
    <div className={styles.contactInfo}>
      {personalInfo.email && <span className={styles.contactItem}>{personalInfo.email}</span>}
      {personalInfo.phone && <span className={styles.contactItem}> • {personalInfo.phone}</span>}
      {personalInfo.location && <span className={styles.contactItem}> • {personalInfo.location}</span>}
      <SmartLink value={personalInfo.linkedin} prefix="linkedin" />
      <SmartLink value={personalInfo.github} prefix="github" />
      <SmartLink value={personalInfo.portfolio} prefix="portfolio" />
      {personalInfo.otherEntries?.map((entry) => (
        <SmartLink key={entry.id} value={entry.value} prefix={entry.label} />
      ))}
    </div>
  );

  return (
    <div className={styles.resumeDocument} id="resume-preview" data-theme={themeId || 'modern'}>
      {themeId === 'creative-blue' ? (
        <div className={styles.twoColumnLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.sidebarHeader}>
              <h1 className={styles.sidebarName}>{personalInfo.fullName || 'Your Name'}</h1>
              {personalInfo.title?.trim() && (
                <p className={styles.sidebarTitle}>{personalInfo.title.trim()}</p>
              )}
            </div>
            
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarSectionTitle}>Contact</h2>
              <div className={styles.sidebarContactList}>
                {personalInfo.email && <div className={styles.sidebarContactItem}>{personalInfo.email}</div>}
                {personalInfo.phone && <div className={styles.sidebarContactItem}>{personalInfo.phone}</div>}
                {personalInfo.location && <div className={styles.sidebarContactItem}>{personalInfo.location}</div>}
                {personalInfo.linkedin && <div className={styles.sidebarContactItem}>{personalInfo.linkedin}</div>}
                {personalInfo.portfolio && <div className={styles.sidebarContactItem}>{personalInfo.portfolio}</div>}
              </div>
            </div>

            <div className={styles.sidebarSection}>
              {renderByKey('skills')}
            </div>
            
            <div className={styles.sidebarSection}>
              {renderByKey('education')}
            </div>

            <div className={styles.sidebarSection}>
              {renderByKey('certifications')}
            </div>
          </div>

          <div className={styles.rightColumn}>
             {renderByKey('experience')}
             {renderByKey('projects')}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <h1 className={styles.name}>{personalInfo.fullName || 'Your Name'}</h1>
            {personalInfo.title?.trim() && (
              <p className={styles.titleLine}>{personalInfo.title.trim()}</p>
            )}
            {renderContactInfo()}
          </div>

          {sectionOrder.map((k) => (
            <div key={k}>{renderByKey(k)}</div>
          ))}
        </>
      )}
    </div>
  );
}
