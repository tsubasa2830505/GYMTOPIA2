'use client';

import { CardProps } from '../../types/ui';
import { cn } from '../../lib/utils';

export default function Card({
  variant = 'elevated',
  padding = 'md',
  header,
  footer,
  children,
  className,
  ...props
}: CardProps) {
  const baseStyles = [
    'bg-white rounded-lg overflow-hidden transition-shadow duration-200'
  ];

  const variants = {
    elevated: 'shadow-md hover:shadow-lg',
    outlined: 'border border-gray-200 hover:border-gray-300',
    filled: 'bg-gray-50 border border-gray-100'
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const cardClasses = cn([
    ...baseStyles,
    variants[variant],
    className
  ]);

  const contentPadding = padding !== 'none' ? paddings[padding] : '';

  return (
    <div className={cardClasses} {...props}>
      {header && (
        <div className={`border-b border-gray-200 ${padding !== 'none' ? 'px-4 py-3' : ''}`}>
          {header}
        </div>
      )}

      <div className={contentPadding}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-gray-200 ${padding !== 'none' ? 'px-4 py-3' : ''}`}>
          {footer}
        </div>
      )}
    </div>
  );
}