import type { ComponentType } from 'react';
import type { ResumeContent } from '../types/resumeBuilder.types';
import { ModernTemplate } from './ModernTemplate';
import { CompactTemplate } from './CompactTemplate';

type TemplateFC = ComponentType<{ content: ResumeContent }>;

const TEMPLATES: Record<string, TemplateFC> = {
  modern:  ModernTemplate,
  compact: CompactTemplate,
};

export function getTemplate(key: string): TemplateFC {
  return TEMPLATES[key] ?? ModernTemplate;
}

export const TEMPLATE_OPTIONS = [
  { key: 'modern',  label: 'Modern'  },
  { key: 'compact', label: 'Compact' },
];

export default TEMPLATES;
