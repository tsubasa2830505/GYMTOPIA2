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
    'relative overflow-hidden rounded-3xl transition-all duration-200 ease-out transform-gpu'
  ];

  const variants = {
    elevated: 'bg-[rgba(255,253,247,0.96)] border border-[rgba(203,186,160,0.45)] shadow-[0_18px_44px_-30px_rgba(31,39,35,0.46)] hover:-translate-y-[2px] hover:shadow-[0_26px_56px_-28px_rgba(31,39,35,0.52)]',
    outlined: 'bg-[rgba(255,253,247,0.9)] border border-[rgba(203,186,160,0.5)] hover:border-[rgba(173,154,120,0.9)] shadow-[0_12px_32px_-28px_rgba(31,39,35,0.38)]',
    filled: 'bg-[rgba(249,242,229,0.94)] border border-[rgba(203,186,160,0.35)] shadow-[0_16px_36px_-28px_rgba(31,39,35,0.4)]'
  } as const;

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
        <div className={`border-b border-[rgba(203,186,160,0.45)] bg-[rgba(255,253,247,0.96)] ${padding !== 'none' ? 'px-5 py-3' : ''}`}>
          {header}
        </div>
      )}

      <div className={contentPadding}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-[rgba(203,186,160,0.45)] bg-[rgba(255,253,247,0.96)] ${padding !== 'none' ? 'px-5 py-3' : ''}`}>
          {footer}
        </div>
      )}
    </div>
  );
}
