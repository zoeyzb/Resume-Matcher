'use client';

import * as React from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import { cn } from '@/lib/utils';

/**
 * Expandable section for tucking advanced/rarely-needed controls out of the
 * primary flow. The grid-template-rows 0fr/1fr trick animates height without
 * measuring content in JS, and collapses to an instant snap when the user
 * has requested reduced motion.
 */

export interface DisclosureProps {
  label: string;
  description?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  label,
  description,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  tone = 'default',
  children,
  className,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const contentId = React.useId();

  const toggle = () => {
    const next = !open;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const danger = tone === 'danger';

  return (
    <div
      className={cn(
        'rounded-xl border',
        danger ? 'border-red-200 bg-red-50/40' : 'border-border bg-white',
        className
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left transition-colors duration-150 motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          danger ? 'hover:bg-red-100/50' : 'hover:bg-paper-tint'
        )}
      >
        <span className="min-w-0">
          <span className={cn('block text-sm font-semibold', danger ? 'text-red-700' : 'text-ink')}>
            {label}
          </span>
          {description && (
            <span
              className={cn('mt-0.5 block text-sm', danger ? 'text-red-700/80' : 'text-steel-grey')}
            >
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 text-steel-grey transition-transform duration-150 motion-reduce:transition-none',
            open && 'rotate-180',
            danger && 'text-red-500'
          )}
        />
      </button>
      <div
        id={contentId}
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn('space-y-4 px-4 pb-4 pt-1', danger && 'border-t border-red-200/70 pt-4')}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
