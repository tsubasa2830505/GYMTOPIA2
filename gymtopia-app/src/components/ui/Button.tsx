'use client';

import { forwardRef } from 'react';
import { ButtonProps } from '../../types/ui';
import { cn } from '../../lib/utils';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      startIcon,
      endIcon,
      children,
      className,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex items-center justify-center whitespace-nowrap',
      'font-semibold rounded-2xl transition-all duration-200 ease-out transform-gpu',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'focus-visible:ring-[var(--gt-primary)] focus-visible:ring-offset-[color:var(--gt-background)]',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
      'hover:-translate-y-[2px] active:translate-y-[1px] disabled:hover:translate-y-0 disabled:active:translate-y-0'
    ];

    const variants = {
      primary: [
        'bg-[color:var(--gt-primary)] text-[color:var(--gt-on-primary)] border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(189,101,78,0.44)]',
        'hover:shadow-[0_20px_38px_-20px_rgba(189,101,78,0.48)]',
        'active:shadow-[0_12px_24px_-18px_rgba(189,101,78,0.42)]'
      ],
      secondary: [
        'bg-[color:var(--gt-secondary)] text-[color:var(--gt-on-secondary)] border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(231,103,76,0.28)]',
        'hover:shadow-[0_20px_36px_-20px_rgba(231,103,76,0.3)]',
        'active:shadow-[0_12px_22px_-18px_rgba(231,103,76,0.26)]'
      ],
      outline: [
        'border border-[rgba(231,103,76,0.35)] text-[color:var(--gt-text-main)]',
        'bg-[rgba(254,255,250,0.92)] hover:bg-[rgba(254,255,250,0.98)]',
        'hover:border-[rgba(231,103,76,0.55)]',
        'shadow-[0_12px_30px_-22px_rgba(189,101,78,0.28)]'
      ],
      ghost: [
        'bg-transparent text-[color:var(--gt-text-sub)] border border-transparent',
        'hover:bg-[rgba(231,103,76,0.08)] hover:text-[color:var(--gt-text-main)]'
      ],
      danger: [
        'bg-[color:var(--gt-primary-strong)] text-[color:var(--gt-on-primary)] border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(189,101,78,0.45)]',
        'hover:shadow-[0_20px_38px_-20px_rgba(189,101,78,0.48)]'
      ],
      success: [
        'bg-[color:var(--gt-secondary-strong)] text-[color:var(--gt-on-secondary)] border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(231,103,76,0.38)]',
        'hover:shadow-[0_20px_38px_-20px_rgba(231,103,76,0.4)]'
      ]
    } as const;

    const sizes = {
      sm: 'px-3.5 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3 text-base',
      xl: 'px-8 py-3.5 text-lg'
    } as const;

    const widthClass = fullWidth ? 'w-full' : 'w-auto';

    const buttonClasses = cn([
      ...baseStyles,
      ...variants[variant],
      sizes[size],
      widthClass,
      loading && 'cursor-wait',
      className
    ]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!loading && !disabled && onClick) {
        onClick(event);
      }
    };

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && startIcon && (
          <span className="mr-2 flex-shrink-0">{startIcon}</span>
        )}

        {children}

        {!loading && endIcon && (
          <span className="ml-2 flex-shrink-0">{endIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
