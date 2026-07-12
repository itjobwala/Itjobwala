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
  page:          { fontFamily: 'Helvetica', fontSize: 10, paddingHorizontal: 40, paddingVertical: 36, backgroundColor: '#ffffff', color: '#1f2937' },
  name:          { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  jobTitle:      { fontSize: 10, color: '#474d6a', marginBottom: 5 },
  contactRow:    { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
  contactItem:   { fontSize: 8.5, color: '#474d6a', marginRight: 14, marginBottom: 2 },
  divider:       { borderBottomWidth: 1.5, borderBottomColor: '#111827', marginBottom: 10, marginTop: 6 },
  sectionTitle:  { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#111827', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5, marginTop: 9, paddingBottom: 2, borderBottomWidth: 0.75, borderBottomColor: '#474d6a' },
  bodyText:      { fontSize: 9.5, lineHeight: 1.5, color: '#374151' },
  entryBlock:    { marginBottom: 7 },
  entryHeader:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 },
  entryTitle:    { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: '#111827' },
  entrySubtitle: { fontSize: 8.5, color: '#6b7280', marginBottom: 2 },
  entryDate:     { fontSize: 8.5, color: '#6b7280', fontFamily: 'Helvetica-Oblique' },
  bulletRow:     { flexDirection: 'row', marginTop: 1.5 },
  bulletDot:     { width: 10, fontSize: 9.5 },
  bulletText:    { flex: 1, fontSize: 9, lineHeight: 1.4, color: '#374151' },
  skillsText:    { fontSize: 9.5, lineHeight: 1.6, color: '#374151' },
});

function fmt(d: string, isCurrent?: boolean) {
  if (isCurrent) return 'Present';
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={S.sectionTitle}>{children}</Text>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.filter(Boolean).map((b, i) => (
        <View key={i} style={S.bulletRow}>
          <Text style={S.bulletDot}>–</Text>
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
            <Text style={S.entryTitle}>{e.role || 'Role'} {e.company ? `– ${e.company}` : ''}</Text>
            <Text style={S.entryDate}>{fmt(e.start_date)} – {e.is_current ? 'Present' : fmt(e.end_date)}</Text>
          </View>
          {e.location ? <Text style={S.entrySubtitle}>{e.location}</Text> : null}
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
            <Text style={S.entryTitle}>{e.institution}</Text>
            <Text style={S.entryDate}>{[e.start_year, e.end_year].filter(Boolean).join(' – ')}</Text>
          </View>
          <Text style={S.entrySubtitle}>{[e.degree, e.field].filter(Boolean).join(', ')}{e.grade ? ` · ${e.grade}` : ''}</Text>
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
      <Text style={S.skillsText}>{filtered.join('  ·  ')}</Text>
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
          {p.description ? <Text style={{ ...S.bodyText, fontSize: 9, marginTop: 1 }}>{p.description}</Text> : null}
          <Bullets items={p.bullets} />
          {p.link ? <Text style={{ fontSize: 8.5, color: '#2563eb', marginTop: 1 }}>{p.link}</Text> : null}
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
    case 'experiences':    return <ExpSection      key="exp"    items={content.experiences} />;
    case 'education':      return <EduSection      key="edu"    items={content.education} />;
    case 'skills':         return <SkillsSection   key="skills" skills={content.skills} />;
    case 'projects':       return <ProjectsSection key="proj"   items={content.projects} />;
    case 'certifications': return <CertsSection    key="certs"  items={content.certifications} />;
    default:               return null;
  }
}

export function CompactTemplate({ content }: { content: ResumeContent }) {
  const c = content.contact;
  const contactParts = [
    c.email, c.phone, c.location,
    c.linkedin && `linkedin.com/in/${c.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')}`,
    c.github   && `github.com/${c.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '')}`,
    c.website,
  ].filter(Boolean) as string[];

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Text style={S.name}>{c.full_name || 'Your Name'}</Text>
        {c.title ? <Text style={S.jobTitle}>{c.title}</Text> : null}
        <View style={S.contactRow}>
          {contactParts.map((item, i) => <Text key={i} style={S.contactItem}>{item}</Text>)}
        </View>
        <View style={S.divider} />
        {(content.section_order || []).map(key => renderSection(key, content))}
      </Page>
    </Document>
  );
}

export default CompactTemplate;
