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
      'focus-visible:ring-orange-500 focus-visible:ring-offset-white',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
      'hover:-translate-y-[2px] active:translate-y-[1px] disabled:hover:translate-y-0 disabled:active:translate-y-0'
    ];

    const variants = {
      primary: [
        'bg-gradient-to-r from-orange-500 to-red-500 text-white border border-transparent',
        'shadow-lg shadow-orange-500/30',
        'hover:from-orange-600 hover:to-red-600',
        'hover:shadow-xl hover:shadow-orange-500/40',
        'active:shadow-md active:shadow-orange-500/25'
      ],
      secondary: [
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-transparent',
        'shadow-lg shadow-gray-200/40',
        'hover:from-gray-200 hover:to-gray-300',
        'hover:shadow-xl hover:shadow-gray-200/50',
        'active:shadow-md active:shadow-gray-200/30'
      ],
      outline: [
        'border border-gray-300 text-gray-700',
        'bg-white hover:bg-gray-50',
        'hover:border-gray-400',
        'shadow-md shadow-gray-200/30',
        'hover:shadow-lg hover:shadow-gray-200/40'
      ],
      ghost: [
        'bg-transparent text-gray-600 border border-transparent',
        'hover:bg-gray-100 hover:text-gray-900'
      ],
      danger: [
        'bg-gradient-to-r from-red-500 to-pink-500 text-white border border-transparent',
        'shadow-lg shadow-red-500/30',
        'hover:from-red-600 hover:to-pink-600',
        'hover:shadow-xl hover:shadow-red-500/40'
      ],
      success: [
        'bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-transparent',
        'shadow-lg shadow-green-500/30',
        'hover:from-green-600 hover:to-emerald-600',
        'hover:shadow-xl hover:shadow-green-500/40'
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
