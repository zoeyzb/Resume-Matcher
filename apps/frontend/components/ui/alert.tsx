import * as React from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Info from 'lucide-react/dist/esm/icons/info';
import { cn } from '@/lib/utils';

/**
 * Swiss International Style Alert
 *
 * Pale-100 background, 600/700 border + label in the status hue, per
 * docs/portable/swiss-design-system/components.md. `area` names the
 * affected page/section so the message reads as "X — Y went wrong"
 * instead of a bare error string.
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
  { border: string; bg: string; text: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  error: {
    border: 'border-red-600',
    bg: 'bg-red-50',
    text: 'text-red-700',
    Icon: AlertCircle,
  },
  warning: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    Icon: AlertTriangle,
  },
  success: {
    border: 'border-green-700',
    bg: 'bg-green-50',
    text: 'text-green-700',
    Icon: CheckCircle2,
  },
  info: {
    border: 'border-blue-700',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    Icon: Info,
  },
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', area, title, action, children, ...props }, ref) => {
    const { border, bg, text, Icon } = VARIANT_STYLES[variant];

    return (
      <div
        ref={ref}
        role={variant === 'error' ? 'alert' : 'status'}
        className={cn('rounded-none border-2 p-4 shadow-sw-xs', border, bg, className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', text)} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            {(area || title) && (
              <p className={cn('font-mono text-sm font-bold uppercase tracking-wider', text)}>
                {area && title ? `${area} — ${title}` : (area ?? title)}
              </p>
            )}
            {children && (
              <div className="mt-1 font-sans text-sm text-ink-soft break-words">{children}</div>
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
