import { cn } from '@/src/lib/utils/cn';
import { getInitials } from '@/src/lib/utils/format';

const SIZE_MAP = {
  sm: { outer: 'w-8 h-8',   text: 'text-micro',   rounded: 'rounded-lg'  },
  md: { outer: 'w-10 h-10', text: 'text-caption',  rounded: 'rounded-xl'  },
  lg: { outer: 'w-11 h-11', text: 'text-sm',       rounded: 'rounded-xl'  },
  xl: { outer: 'w-20 h-20', text: 'text-3xl',      rounded: 'rounded-2xl' },
} as const;

type AvatarSize = keyof typeof SIZE_MAP;

interface Props {
  name: string;
  photo?: string | null;
  size?: AvatarSize;
  className?: string;
}

export default function Avatar({ name, photo, size = 'md', className }: Props) {
  const { outer, text, rounded } = SIZE_MAP[size];

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={cn(outer, rounded, 'object-cover shrink-0', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        outer,
        rounded,
        'bg-primary/10 flex items-center justify-center shrink-0',
        className,
      )}
    >
      <span className={cn(text, 'font-bold text-primary')}>{getInitials(name)}</span>
    </div>
  );
}
