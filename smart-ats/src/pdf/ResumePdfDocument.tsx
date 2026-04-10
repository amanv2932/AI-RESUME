import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeSnapshotPayload } from '@/lib/resume-snapshot';
import { getResumeSectionOrder, type ResumeSectionKey } from '@/lib/section-order';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10,
    lineHeight: 1.4,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 10,
  },
  contact: {
    fontSize: 9.5,
    color: '#4B5563',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 3,
  },
  role: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  company: { fontSize: 10, color: '#4B5563', marginBottom: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  duration: { fontSize: 9.5, color: '#6B7280', fontFamily: 'Helvetica-Bold' },
  bullet: { marginLeft: 10, marginBottom: 3 },
  skills: { fontSize: 10, color: '#111827' },
});

function SectionHeader({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function ResumePdfDocument({ data }: { data: ResumeSnapshotPayload }) {
  const { personalInfo, experience, education, skills, projects, certifications, jobRolePreset, jobAnalysis } = data;
  const sectionOrder = getResumeSectionOrder(jobRolePreset, jobAnalysis);

  const renderExperience = () =>
    experience.length > 0 ? (
      <View>
        <SectionHeader>Professional Experience</SectionHeader>
        {experience.map((exp) => (
          <View key={exp.id} wrap={false}>
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
        <SectionHeader>Projects</SectionHeader>
        {projects.map((p) => {
          if (!p.name.trim() && !p.description.trim()) return null;
          return (
            <View key={p.id} wrap={false} style={{ marginBottom: 8 }}>
              <View style={styles.metaRow}>
                <Text style={styles.role}>{p.name || 'Project'}</Text>
                {p.projectLink?.trim() ? <Text style={styles.duration}>{p.projectLink.trim()}</Text> : null}
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
        <SectionHeader>Education</SectionHeader>
        {education.map((edu) => (
          <View key={edu.id} wrap={false} style={{ marginBottom: 4 }}>
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.role}>{edu.degree || 'Degree'}</Text>
                <Text style={styles.company}>{edu.institution || 'Institution'}</Text>
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
        <SectionHeader>Technical Skills</SectionHeader>
        <Text style={styles.skills}>{skills.map((s) => s.name).join(', ')}</Text>
      </View>
    ) : null;

  const renderCertifications = () =>
    certifications.some((c) => c.name.trim()) ? (
      <View>
        <SectionHeader>Certifications</SectionHeader>
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{personalInfo.fullName || 'Your Name'}</Text>
        {personalInfo.title?.trim() ? <Text style={styles.title}>{personalInfo.title.trim()}</Text> : null}

        <View style={styles.contact}>
           <Text>{contactItems.slice(0, 3).join('  •  ')}</Text>
           {contactItems.length > 3 && (
             <Text style={{ marginTop: 2 }}>{contactItems.slice(3).join('  •  ')}</Text>
           )}
        </View>

        {sectionOrder.map((k) => (
          <View key={k}>{renderByKey(k)}</View>
        ))}
      </Page>
    </Document>
  );
}

