'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Lightweight, dependency-free tooltip. Shows on hover and keyboard focus
 * (not hover-only, per touch/keyboard accessibility guidance) and is
 * reachable without JS state via native `title`-style semantics fallback.
 */
export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'top', className }) => {
  const tooltipId = React.useId();

  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {React.cloneElement(children, {
        'aria-describedby': tooltipId,
      } as React.HTMLAttributes<HTMLElement>)}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-sw-sm',
          'transition-opacity duration-150 ease-out motion-reduce:transition-none',
          'group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        )}
      >
        {content}
      </span>
    </span>
  );
};
