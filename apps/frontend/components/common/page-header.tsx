import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page-level heading used across Dashboard, Tailor, Tracker,
 * Settings, and Builder: title + one-line plain-language explanation +
 * a single primary action slot.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  eyebrow,
  className,
}) => (
  <div
    className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
  >
    <div className="min-w-0">
      {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-sm text-steel-grey">{description}</p>}
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);
