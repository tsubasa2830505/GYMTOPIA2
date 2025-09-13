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
      'inline-flex items-center justify-center',
      'font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    ];

    const variants = {
      primary: [
        'bg-blue-600 text-white hover:bg-blue-700',
        'focus:ring-blue-500 active:bg-blue-800'
      ],
      secondary: [
        'bg-gray-200 text-gray-900 hover:bg-gray-300',
        'focus:ring-gray-500 active:bg-gray-400'
      ],
      outline: [
        'border border-gray-300 bg-white text-gray-700',
        'hover:bg-gray-50 focus:ring-blue-500 active:bg-gray-100'
      ],
      ghost: [
        'bg-transparent text-gray-700 hover:bg-gray-100',
        'focus:ring-gray-500 active:bg-gray-200'
      ],
      danger: [
        'bg-red-600 text-white hover:bg-red-700',
        'focus:ring-red-500 active:bg-red-800'
      ],
      success: [
        'bg-green-600 text-white hover:bg-green-700',
        'focus:ring-green-500 active:bg-green-800'
      ]
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

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