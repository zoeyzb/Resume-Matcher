import * as React from 'react';
import { cn } from '@/lib/utils';

export interface MatchScoreRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

function bandColor(value: number): { stroke: string; text: string } {
  if (value >= 80) return { stroke: '#059669', text: 'text-emerald-600' };
  if (value >= 60) return { stroke: '#d97706', text: 'text-amber-600' };
  return { stroke: '#dc2626', text: 'text-red-600' };
}

/**
 * Circular match-score gauge. Numeric value is always rendered as visible
 * text (not color-only), per WCAG guidance for gauge charts.
 */
export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({
  value,
  size = 96,
  strokeWidth = 8,
  label,
  className,
}) => {
  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const { stroke, text } = bandColor(clamped);

  return (
    <div className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          role="img"
          aria-label={`${label ? `${label}: ` : ''}${clamped.toFixed(0)} out of 100`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-xl font-bold tabular-nums', text)}>{clamped.toFixed(0)}</span>
          <span className="text-[11px] text-steel-grey">/ 100</span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-ink-soft">{label}</span>}
    </div>
  );
};
