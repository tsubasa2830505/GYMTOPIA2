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
        'bg-[var(--gt-primary)] text-[var(--gt-on-primary)] border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(18,44,150,0.48)]',
        'hover:shadow-[0_20px_38px_-20px_rgba(18,44,150,0.5)]',
        'active:shadow-[0_12px_24px_-18px_rgba(18,44,150,0.46)]'
      ],
      secondary: [
        'bg-[var(--gt-secondary)] text-[var(--gt-on-secondary)] border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(17,40,142,0.42)]',
        'hover:shadow-[0_20px_36px_-20px_rgba(17,40,142,0.45)]',
        'active:shadow-[0_12px_22px_-18px_rgba(17,40,142,0.42)]'
      ],
      outline: [
        'border border-[rgba(44,82,190,0.35)] text-[var(--gt-text-main)]',
        'bg-[rgba(244,248,255,0.92)] hover:bg-[rgba(244,248,255,0.98)]',
        'hover:border-[rgba(44,82,190,0.55)]',
        'shadow-[0_12px_30px_-22px_rgba(18,44,150,0.32)]'
      ],
      ghost: [
        'bg-transparent text-[var(--gt-text-sub)] border border-transparent',
        'hover:bg-[rgba(31,79,255,0.08)] hover:text-[var(--gt-text-main)]'
      ],
      danger: [
        'bg-[#b7413e] text-white border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(183,65,62,0.45)]',
        'hover:shadow-[0_20px_38px_-20px_rgba(183,65,62,0.45)]'
      ],
      success: [
        'bg-[#2f7b63] text-white border border-transparent',
        'shadow-[0_16px_32px_-22px_rgba(47,123,99,0.48)]',
        'hover:shadow-[0_20px_38px_-20px_rgba(47,123,99,0.48)]'
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
