import { cn } from '@/src/lib/utils/cn';

export type BadgeVariant =
  | 'default' | 'primary' | 'success' | 'warning' | 'error'
  | 'info'    | 'violet'  | 'purple'  | 'indigo'  | 'emerald' | 'yellow';

export type BadgeSize = 'sm' | 'md' | 'lg';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default:  'bg-surface-mid text-body-secondary',
  primary:  'bg-blue-50 text-blue-700',
  success:  'bg-green-50 text-green-700',
  warning:  'bg-amber-50 text-amber-700',
  error:    'bg-red-50 text-red-600',
  info:     'bg-blue-50 text-blue-700',
  violet:   'bg-violet-50 text-violet-700',
  purple:   'bg-purple-50 text-purple-700',
  indigo:   'bg-indigo-50 text-indigo-700',
  emerald:  'bg-emerald-50 text-emerald-700',
  yellow:   'bg-yellow-50 text-yellow-700',
};

// md = design-spec Badge: 28px height, 12px horizontal padding, 12px font
const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-micro',
  md: 'h-7 px-3 text-caption',
  lg: 'px-3 py-1.5 text-caption',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: 'md' | 'full';
  dot?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  dot,
  icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium whitespace-nowrap',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        rounded === 'full' ? 'rounded-full' : 'rounded-lg',
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />}
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      {children}
    </span>
  );
}
