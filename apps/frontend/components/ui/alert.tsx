import * as React from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Info from 'lucide-react/dist/esm/icons/info';
import { cn } from '@/lib/utils';

/**
 * Premium product alert. Soft tinted surface with a colored left accent bar
 * — calmer than a full colored border. `area` names the affected page/
 * section so the message reads as "X — Y went wrong" instead of a bare
 * error string.
 */

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  area?: string;
  title?: string;
  action?: React.ReactNode;
}

const VARIANT_STYLES: Record<
  AlertVariant,
  {
    border: string;
    bg: string;
    iconWrap: string;
    text: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  error: {
    border: 'border-l-red-500',
    bg: 'bg-red-50/60',
    iconWrap: 'bg-red-100 text-red-600',
    text: 'text-red-800',
    Icon: AlertCircle,
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50/60',
    iconWrap: 'bg-amber-100 text-amber-600',
    text: 'text-amber-800',
    Icon: AlertTriangle,
  },
  success: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50/60',
    iconWrap: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-800',
    Icon: CheckCircle2,
  },
  info: {
    border: 'border-l-indigo-500',
    bg: 'bg-indigo-50/60',
    iconWrap: 'bg-indigo-100 text-primary',
    text: 'text-indigo-800',
    Icon: Info,
  },
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', area, title, action, children, ...props }, ref) => {
    const { border, bg, iconWrap, text, Icon } = VARIANT_STYLES[variant];

    return (
      <div
        ref={ref}
        role={variant === 'error' ? 'alert' : 'status'}
        className={cn('rounded-xl border border-l-4 border-transparent p-4', border, bg, className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              iconWrap
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            {(area || title) && (
              <p className={cn('text-sm font-semibold', text)}>
                {area && title ? `${area} — ${title}` : (area ?? title)}
              </p>
            )}
            {children && (
              <div className="mt-1 text-sm leading-relaxed text-ink-soft break-words">
                {children}
              </div>
            )}
            {action && <div className="mt-3">{action}</div>}
          </div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };
