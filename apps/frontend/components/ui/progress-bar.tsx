import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: 'auto' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

function toneForScore(value: number): string {
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

/** Rounded track + fill progress bar, e.g. sub-score breakdowns. */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  tone = 'auto',
  size = 'md',
  className,
}) => {
  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;
  const pct = max > 0 ? (clamped / max) * 100 : 0;
  const barColor = tone === 'primary' ? 'bg-primary' : toneForScore(pct);
  const height = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm text-ink-soft">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold tabular-nums text-ink">
              {Number.isFinite(value) ? Math.round(value) : '—'}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn('w-full overflow-hidden rounded-full bg-slate-100', height)}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
            barColor
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
