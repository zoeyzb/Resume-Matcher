import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Friendly, consistent empty state — icon, plain-language message, one action. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}
  >
    {Icon && (
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-primary">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <p className="text-base font-semibold text-ink">{title}</p>
    {description && <p className="mt-1.5 max-w-sm text-sm text-steel-grey">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
