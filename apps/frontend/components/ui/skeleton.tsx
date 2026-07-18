import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Loading placeholder. Pulses gently; when the user has requested reduced
 * motion, holds at a static muted tone instead of animating.
 */
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none', className)}
    aria-hidden="true"
    {...props}
  />
);
