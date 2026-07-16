'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/src/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize    = 'sm' | 'md' | 'lg';

// "Secondary Button" per the design spec is weight 500 — SIZE_CLASSES defaults
// to font-semibold(600) for md/lg, so secondary/outline override it with an
// !important weight (same-layer Tailwind utilities don't reliably win by
// class order alone).
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-white hover:opacity-90 active:opacity-80 transition-opacity',
  secondary: 'bg-surface border border-token-mid text-body hover:bg-surface-alt transition-colors !font-medium',
  outline:   'border border-token-mid text-body-secondary hover:border-primary/60 hover:text-primary transition-colors !font-medium',
  ghost:     'bg-primary/5 border border-primary/10 text-primary hover:bg-primary/10 transition-colors',
  danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors',
  success:   'bg-success text-white hover:opacity-90 active:opacity-80 transition-opacity',
};

// Design-spec button sizes:
//   sm = "Small Button"   (36px, 14px/medium)
//   md = "Primary Button" (44px tablet/mobile -> 48px desktop, 15px -> 16px/semibold)
//   lg = "Large CTA"      (56px, 18px/semibold)
// ("Secondary Button" in the spec is a color/border style, not a distinct
// size — it uses the same md height as Primary, just via variant="secondary"
// or variant="outline".)
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[14px] font-medium',
  md: 'h-11 lg:h-12 px-5 lg:px-6 text-[15px] lg:text-[16px] font-semibold',
  lg: 'h-14 px-8 text-[18px] font-semibold',
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'w-7 h-7 p-0',
  md: 'w-8 h-8 p-0',
  lg: 'w-9 h-9 p-0',
};

const ROUNDED_CLASSES = {
  sm:   'rounded-sm', // 8px — design-spec default for all buttons
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  full: 'rounded-full',
} as const;

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === 'sm' ? 12 : 14;
  return (
    <svg className="animate-spin shrink-0" width={dim} height={dim} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  iconOnly?:  boolean;
  fullWidth?: boolean;
  rounded?:   keyof typeof ROUNDED_CLASSES;
}

/** Generate button className string — use on <Link> or other non-button elements. */
export function buttonVariants(options: {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  fullWidth?: boolean;
  rounded?:   keyof typeof ROUNDED_CLASSES;
  className?: string;
} = {}): string {
  const {
    variant   = 'primary',
    size      = 'md',
    fullWidth = false,
    rounded   = 'sm',
    className,
  } = options;

  return cn(
    'inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/40',
    ROUNDED_CLASSES[rounded],
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className,
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      leftIcon,
      rightIcon,
      iconOnly  = false,
      fullWidth = false,
      rounded   = 'sm',
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/40',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          ROUNDED_CLASSES[rounded],
          VARIANT_CLASSES[variant],
          iconOnly ? ICON_SIZE_CLASSES[size] : SIZE_CLASSES[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={size} />
            {!iconOnly && children}
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
