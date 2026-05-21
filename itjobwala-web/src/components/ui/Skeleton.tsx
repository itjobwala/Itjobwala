import { cn } from '@/src/lib/utils/cn';

const ROUNDED = {
  none: '',
  sm:   'rounded',
  md:   'rounded-lg',
  lg:   'rounded-xl',
  xl:   'rounded-2xl',
  full: 'rounded-full',
} as const;

type SkeletonRounded = keyof typeof ROUNDED;

interface Props {
  className?: string;
  rounded?: SkeletonRounded;
}

export default function Skeleton({ className, rounded = 'md' }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn('bg-gray-200 animate-pulse', ROUNDED[rounded], className)}
    />
  );
}
