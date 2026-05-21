import type { ReactNode, ElementType } from 'react';
import { cn } from '@/src/lib/utils/cn';

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
  xl:   'p-8',
} as const;

type Padding = keyof typeof PADDING;

interface Props {
  children: ReactNode;
  padding?: Padding;
  hover?: boolean;
  overflow?: boolean;
  className?: string;
  as?: ElementType;
}

export default function Card({
  children,
  padding = 'md',
  hover = false,
  overflow = false,
  className,
  as: Tag = 'div',
}: Props) {
  return (
    <Tag
      className={cn(
        'bg-white rounded-2xl border border-gray-100',
        !overflow && 'overflow-hidden',
        hover && 'transition-shadow hover:shadow-md',
        PADDING[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
