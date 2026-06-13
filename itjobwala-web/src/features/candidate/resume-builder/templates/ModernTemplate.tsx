import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type {
  ResumeContent,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeCertification,
} from '../types/resumeBuilder.types';

const S = StyleSheet.create({
  page:          { fontFamily: 'Helvetica', fontSize: 10, paddingHorizontal: 36, paddingVertical: 32, backgroundColor: '#ffffff', color: '#1f2937' },
  header:        { backgroundColor: '#1d4ed8', marginHorizontal: -36, marginTop: -32, paddingHorizontal: 36, paddingTop: 28, paddingBottom: 18, marginBottom: 14 },
  name:          { fontSize: 21, fontFamily: 'Helvetica-Bold', color: '#ffffff', marginBottom: 4 },
  jobTitle:      { fontSize: 10.5, color: '#bfdbfe', marginBottom: 9 },
  contactRow:    { flexDirection: 'row', flexWrap: 'wrap' },
  contactItem:   { fontSize: 8.5, color: '#dbeafe', marginRight: 14, marginBottom: 2 },
  sectionTitle:  { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5, marginTop: 10, paddingBottom: 3, borderBottomWidth: 1.5, borderBottomColor: '#1d4ed8' },
  bodyText:      { fontSize: 9.5, lineHeight: 1.5, color: '#374151' },
  entryBlock:    { marginBottom: 8 },
  entryHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  entryTitle:    { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: '#1f2937' },
  entrySubtitle: { fontSize: 9, color: '#6b7280', marginBottom: 3 },
  entryDate:     { fontSize: 8.5, color: '#6b7280' },
  bulletRow:     { flexDirection: 'row', marginTop: 2 },
  bulletDot:     { width: 10, fontSize: 9.5, color: '#374151' },
  bulletText:    { flex: 1, fontSize: 9, lineHeight: 1.4, color: '#374151' },
  skillsWrap:    { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip:     { backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginRight: 5, marginBottom: 5, borderWidth: 0.5, borderColor: '#bfdbfe' },
});

function fmt(d: string, isCurrent?: boolean) {
  if (isCurrent) return 'Present';
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return d; }
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={S.sectionTitle}>{children}</Text>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.filter(Boolean).map((b, i) => (
        <View key={i} style={S.bulletRow}>
          <Text style={S.bulletDot}>•</Text>
          <Text style={S.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

function ExpSection({ items }: { items: ResumeExperience[] }) {
  if (!items.length) return null;
  return (
    <View>
      <SectionTitle>Experience</SectionTitle>
      {items.map((e, i) => (
        <View key={e.id || i} style={S.entryBlock}>
          <View style={S.entryHeader}>
            <Text style={S.entryTitle}>{e.role || 'Role'}</Text>
            <Text style={S.entryDate}>{fmt(e.start_date)} – {e.is_current ? 'Present' : fmt(e.end_date)}</Text>
          </View>
          <Text style={S.entrySubtitle}>{e.company}{e.location ? ` · ${e.location}` : ''}</Text>
          <Bullets items={e.bullets} />
        </View>
      ))}
    </View>
  );
}

function EduSection({ items }: { items: ResumeEducation[] }) {
  if (!items.length) return null;
  return (
    <View>
      <SectionTitle>Education</SectionTitle>
      {items.map((e, i) => (
        <View key={e.id || i} style={S.entryBlock}>
          <View style={S.entryHeader}>
            <Text style={S.entryTitle}>{[e.degree, e.field].filter(Boolean).join(', ')}</Text>
            <Text style={S.entryDate}>{[e.start_year, e.end_year].filter(Boolean).join(' – ')}</Text>
          </View>
          <Text style={S.entrySubtitle}>{e.institution}{e.grade ? ` · ${e.grade}` : ''}</Text>
        </View>
      ))}
    </View>
  );
}

function SkillsSection({ skills }: { skills: string[] }) {
  const filtered = skills.filter(Boolean);
  if (!filtered.length) return null;
  return (
    <View>
      <SectionTitle>Skills</SectionTitle>
      <View style={S.skillsWrap}>
        {filtered.map((s, i) => <Text key={i} style={S.skillChip}>{s}</Text>)}
      </View>
    </View>
  );
}

function ProjectsSection({ items }: { items: ResumeProject[] }) {
  if (!items.length) return null;
  return (
    <View>
      <SectionTitle>Projects</SectionTitle>
      {items.map((p, i) => (
        <View key={p.id || i} style={S.entryBlock}>
          <Text style={S.entryTitle}>{p.name}</Text>
          {p.description ? <Text style={{ ...S.bodyText, marginTop: 2, fontSize: 9 }}>{p.description}</Text> : null}
          <Bullets items={p.bullets} />
          {p.link ? <Text style={{ fontSize: 8.5, color: '#2563eb', marginTop: 2 }}>{p.link}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function CertsSection({ items }: { items: ResumeCertification[] }) {
  if (!items.length) return null;
  return (
    <View>
      <SectionTitle>Certifications</SectionTitle>
      {items.map((c, i) => (
        <View key={c.id || i} style={S.entryBlock}>
          <View style={S.entryHeader}>
            <Text style={S.entryTitle}>{c.name}</Text>
            <Text style={S.entryDate}>{c.issue_date}</Text>
          </View>
          <Text style={S.entrySubtitle}>{c.issuer}</Text>
        </View>
      ))}
    </View>
  );
}

function renderSection(key: string, content: ResumeContent) {
  switch (key) {
    case 'summary':
      return content.summary ? (
        <View key="summary">
          <SectionTitle>Summary</SectionTitle>
          <Text style={S.bodyText}>{content.summary}</Text>
        </View>
      ) : null;
    case 'experiences':    return <ExpSection     key="exp"   items={content.experiences} />;
    case 'education':      return <EduSection     key="edu"   items={content.education} />;
    case 'skills':         return <SkillsSection  key="skills" skills={content.skills} />;
    case 'projects':       return <ProjectsSection key="proj" items={content.projects} />;
    case 'certifications': return <CertsSection   key="certs" items={content.certifications} />;
    default:               return null;
  }
}

export function ModernTemplate({ content }: { content: ResumeContent }) {
  const c = content.contact;
  const contactParts = [
    c.email, c.phone, c.location,
    c.linkedin && `in: ${c.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')}`,
    c.github   && `gh: ${c.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '')}`,
    c.website,
  ].filter(Boolean) as string[];

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <Text style={S.name}>{c.full_name || 'Your Name'}</Text>
          {c.title ? <Text style={S.jobTitle}>{c.title}</Text> : null}
          <View style={S.contactRow}>
            {contactParts.map((item, i) => <Text key={i} style={S.contactItem}>{item}</Text>)}
          </View>
        </View>
        {(content.section_order || []).map(key => renderSection(key, content))}
      </Page>
    </Document>
  );
}

export default ModernTemplate;
