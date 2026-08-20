import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { TextProps } from '@react-pdf/renderer';
import type { ResumeSnapshotPayload } from '@/lib/resume-snapshot';
import { getResumeSectionOrder, type ResumeSectionKey } from '@/lib/section-order';

// Base styles to extend
const getThemeStyles = (themeId: string) => {
  const isClassic = themeId === 'classic';
  const isMinimal = themeId === 'minimal';
  
  const fontFamily = isClassic ? 'Times-Roman' : 'Helvetica';
  const fontBold = isClassic ? 'Times-Bold' : 'Helvetica-Bold';
  
  return StyleSheet.create({
    page: {
      paddingTop: isMinimal ? 40 : 36,
      paddingBottom: 36,
      paddingHorizontal: isMinimal ? 50 : 40,
      fontSize: 10,
      lineHeight: isMinimal ? 1.5 : 1.4,
      fontFamily,
      color: '#111827',
    },
    headerView: {
      alignItems: isClassic || themeId === 'executive-accent' ? 'center' : 'flex-start',
      marginBottom: isMinimal ? 16 : 0,
      backgroundColor: themeId === 'executive-accent' ? '#0f172a' : 'transparent',
      padding: themeId === 'executive-accent' ? 40 : 0,
      marginHorizontal: themeId === 'executive-accent' ? -40 : 0,
      marginTop: themeId === 'executive-accent' ? -36 : 0,
    },
    name: {
      fontSize: isMinimal || themeId === 'executive-accent' ? 24 : 22,
      fontFamily: themeId === 'executive-accent' ? 'Helvetica' : fontBold,
      letterSpacing: isClassic ? 0 : 0.4,
      textTransform: isClassic || themeId === 'executive-accent' ? 'capitalize' : 'uppercase',
      marginBottom: 6,
      color: themeId === 'executive-accent' ? '#ffffff' : '#111827',
    },
    title: {
      fontSize: 11,
      color: '#374151',
      marginBottom: 10,
      fontFamily: isMinimal ? fontFamily : fontBold,
    },
    contact: {
      fontSize: 9.5,
      color: themeId === 'executive-accent' ? '#94a3b8' : '#4B5563',
      marginBottom: 18,
      textAlign: isClassic || themeId === 'executive-accent' ? 'center' : 'left',
    },
    sectionTitle: {
      fontSize: 11,
      fontFamily: themeId === 'executive-accent' ? 'Helvetica' : fontBold,
      color: themeId === 'executive-accent' ? '#b91c1c' : '#111827',
      textTransform: isClassic ? 'capitalize' : 'uppercase',
      letterSpacing: isClassic ? 0 : 1,
      marginTop: 12,
      marginBottom: 6,
      borderBottomWidth: isMinimal ? 0 : (themeId === 'executive-accent' ? 2 : 1),
      borderBottomColor: themeId === 'executive-accent' ? '#b91c1c' : '#E5E7EB',
      paddingBottom: 3,
    },
    role: { 
      fontSize: 11, 
      fontFamily: fontBold 
    },
    company: { 
      fontSize: 10, 
      color: '#4B5563', 
      marginBottom: 2 
    },
    metaRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginBottom: 4 
    },
    duration: { 
      fontSize: 9.5, 
      color: '#6B7280', 
      fontFamily: isClassic ? fontFamily : fontBold 
    },
    bullet: { 
      marginLeft: 10, 
      marginBottom: 3 
    },
    skills: { 
      fontSize: 10, 
      color: '#111827' 
    },
    score: {
      color: '#111827',
      fontFamily: fontBold,
    },
    link: {
      color: themeId === 'executive-accent' ? '#94a3b8' : '#2563EB',
      textDecoration: 'none',
    },
    // Sidebar theme styles
    sidebarContainer: {
      flexDirection: 'row',
      minHeight: '100%',
    },
    sidebarLeft: {
      width: '35%',
      backgroundColor: '#1e3a8a',
      color: '#ffffff',
      padding: 30,
    },
    sidebarRight: {
      width: '65%',
      padding: 30,
      backgroundColor: '#ffffff',
    },
    sidebarName: {
      fontSize: 22,
      fontFamily: fontBold,
      color: '#ffffff',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    sidebarTitle: {
      fontSize: 11,
      color: '#93c5fd',
      marginBottom: 20,
    },
    sidebarSectionTitle: {
      fontSize: 10,
      fontFamily: fontBold,
      color: '#bfdbfe',
      textTransform: 'uppercase',
      borderBottomWidth: 1,
      borderBottomColor: '#3b82f6',
      paddingBottom: 4,
      marginBottom: 10,
      marginTop: 15,
    },
    sidebarText: {
      fontSize: 9.5,
      color: '#e0e7ff',
      marginBottom: 4,
    },
    sidebarLink: {
      fontSize: 9.5,
      color: '#e0e7ff',
      textDecoration: 'none',
    },
  });
};

function SectionHeader({ children, style }: { children: string; style: TextProps['style'] }) {
  return <Text style={style}>{children}</Text>;
}

export function ResumePdfDocument({ data }: { data: ResumeSnapshotPayload & { themeId?: string } }) {
  const { personalInfo, experience, education, skills, projects, certifications, jobRolePreset } = data;
  const sectionOrder = getResumeSectionOrder(jobRolePreset);
  
  const themeId = data.themeId || 'modern';
  const styles = getThemeStyles(themeId);

  const renderExperience = () =>
    experience.length > 0 ? (
      <View>
        <SectionHeader style={styles.sectionTitle}>Professional Experience</SectionHeader>
        {experience.map((exp) => (
          <View key={exp.id} wrap={false} style={{ marginBottom: 6 }}>
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.role}>{exp.role || 'Role'}</Text>
                <Text style={styles.company}>{exp.company || 'Company'}</Text>
              </View>
              <Text style={styles.duration}>{exp.duration}</Text>
            </View>
            {exp.bullets
              .map((b) => b.trim())
              .filter(Boolean)
              .map((b, idx) => (
                <Text key={idx} style={styles.bullet}>
                  • {b}
                </Text>
              ))}
          </View>
        ))}
      </View>
    ) : null;

  const renderProjects = () =>
    projects.some((p) => p.name.trim() || p.description.trim() || p.projectLink?.trim()) ? (
      <View>
        <SectionHeader style={styles.sectionTitle}>Projects</SectionHeader>
        {projects.map((p) => {
          if (!p.name.trim() && !p.description.trim()) return null;
          return (
            <View key={p.id} wrap={false} style={{ marginBottom: 8 }}>
              <View style={styles.metaRow}>
                <Text style={styles.role}>{p.name || 'Project'}</Text>
                {p.projectLink?.trim() ? (
                  <Link src={p.projectLink.trim().startsWith('http') ? p.projectLink.trim() : `https://${p.projectLink.trim()}`} style={[styles.duration, styles.link]}>
                    {p.projectLink.trim()}
                  </Link>
                ) : null}
              </View>
              {p.techStack.trim() ? <Text style={styles.company}>Stack: {p.techStack.trim()}</Text> : null}
              {p.description.trim() ? <Text style={styles.bullet}>{p.description.trim()}</Text> : null}
            </View>
          );
        })}
      </View>
    ) : null;

  const renderEducation = () =>
    education.length > 0 ? (
      <View>
        <SectionHeader style={styles.sectionTitle}>Education</SectionHeader>
        {education.map((edu) => (
          <View key={edu.id} wrap={false} style={{ marginBottom: 6 }}>
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.role}>{edu.degree || 'Degree'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontSize: 10, color: '#4B5563' }}>{edu.institution || 'Institution'}</Text>
                  {edu.scoreValue ? (
                    <Text style={styles.score}>{`  |  ${edu.scoreType || 'Score'}: ${edu.scoreValue}`}</Text>
                  ) : null}
                </View>
              </View>
              <Text style={styles.duration}>
                {edu.startDate ? `${edu.startDate} — ` : ''}
                {edu.endDate || 'Present'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    ) : null;

  const renderSkills = () =>
    skills.length > 0 ? (
      <View>
        <SectionHeader style={styles.sectionTitle}>Technical Skills</SectionHeader>
        <Text style={styles.skills}>{skills.map((s) => s.name).join(', ')}</Text>
      </View>
    ) : null;

  const renderCertifications = () =>
    certifications.some((c) => c.name.trim()) ? (
      <View>
        <SectionHeader style={styles.sectionTitle}>Certifications</SectionHeader>
        {certifications.map((c) => {
          if (!c.name.trim()) return null;
          return (
            <Text key={c.id} style={styles.bullet}>
              • {c.name} — {c.issuer}
              {c.date ? ` (${c.date})` : ''}
            </Text>
          );
        })}
      </View>
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

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.portfolio,
    ...(personalInfo.otherEntries || []).map(oe => `${oe.label}: ${oe.value}`)
  ].filter(Boolean);

  const renderContactItem = (text: string) => {
    let href = '';
    const lower = text.toLowerCase();
    if (lower.includes('@') && !lower.includes('/')) {
      href = `mailto:${text}`;
    } else if (lower.startsWith('http')) {
      href = text;
    } else if (lower.startsWith('www.') || lower.startsWith('github.com') || lower.startsWith('linkedin.com')) {
      href = `https://${text}`;
    }
    
    if (href) {
      return <Link src={href} style={styles.link}>{text}</Link>;
    }
    return <Text>{text}</Text>;
  };

  const renderContactRow = (items: string[]) => {
    return items.map((item, idx) => (
      <Text key={idx}>
        {renderContactItem(item)}
        {idx < items.length - 1 ? '  •  ' : ''}
      </Text>
    ));
  };

  if (themeId === 'creative-blue') {
    return (
      <Document>
        <Page size="A4" style={{ ...styles.page, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}>
          <View style={styles.sidebarContainer}>
            <View style={styles.sidebarLeft}>
              <Text style={styles.sidebarName}>{personalInfo.fullName || 'Your Name'}</Text>
              {personalInfo.title?.trim() ? <Text style={styles.sidebarTitle}>{personalInfo.title.trim()}</Text> : null}
              
              <Text style={styles.sidebarSectionTitle}>Contact</Text>
              {personalInfo.email && <Text style={styles.sidebarText}>{personalInfo.email}</Text>}
              {personalInfo.phone && <Text style={styles.sidebarText}>{personalInfo.phone}</Text>}
              {personalInfo.location && <Text style={styles.sidebarText}>{personalInfo.location}</Text>}
              {personalInfo.linkedin && <Link src={`https://${personalInfo.linkedin}`} style={styles.sidebarLink}>{personalInfo.linkedin}</Link>}
              {personalInfo.portfolio && <Link src={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`} style={styles.sidebarLink}>{personalInfo.portfolio}</Link>}

              <View style={{ marginTop: 10 }}>
                {renderSkills()}
              </View>
              <View style={{ marginTop: 10 }}>
                {renderEducation()}
              </View>
              <View style={{ marginTop: 10 }}>
                {renderCertifications()}
              </View>
            </View>
            
            <View style={styles.sidebarRight}>
              {renderExperience()}
              {renderProjects()}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerView}>
          <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
          {personalInfo.title?.trim() ? <Text style={styles.title}>{personalInfo.title.trim()}</Text> : null}
          
          <View style={styles.contact}>
             <Text>{renderContactRow(contactItems.slice(0, 3))}</Text>
             {contactItems.length > 3 && (
               <Text style={{ marginTop: 2 }}>{renderContactRow(contactItems.slice(3))}</Text>
             )}
          </View>
        </View>

        {sectionOrder.map((k) => (
          <View key={k}>{renderByKey(k)}</View>
        ))}
      </Page>
    </Document>
  );
}
