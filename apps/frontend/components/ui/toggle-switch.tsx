'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  const labelId = React.useId();

  const handleToggle = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4',
        disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex-1">
        <div id={labelId} className="text-sm font-medium text-ink">
          {label}
        </div>
        {description && <div className="mt-0.5 text-sm text-steel-grey">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full',
          'transition-colors duration-150 ease-out motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          checked ? 'bg-primary' : 'bg-slate-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none absolute top-1 left-1 block h-4 w-4 rounded-full bg-white shadow-sm',
            'transition-transform duration-150 ease-out motion-reduce:transition-none',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
