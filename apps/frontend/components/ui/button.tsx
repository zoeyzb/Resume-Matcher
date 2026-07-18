import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Premium product button.
 *
 * Rounded corners, soft layered shadow, subtle press feedback. One primary
 * (indigo) action per region; everything else demotes to outline/ghost.
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * - `default`: Indigo — primary actions (save, submit, create)
   * - `destructive`: Red — destructive actions (delete, remove)
   * - `success`: Emerald — positive actions (download, confirm, complete)
   * - `warning`: Amber — caution actions (reset, clear, undo)
   * - `outline`: White + border — secondary actions
   * - `secondary`: Slate tint — tertiary actions
   * - `ghost`: No background — subtle actions (icon buttons, navigation)
   * - `link`: Text only — inline links
   */
  variant?:
    | 'default'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center gap-2',
      'whitespace-nowrap text-sm font-semibold',
      'transition-[transform,box-shadow,background-color,border-color,color] duration-150 ease-out motion-reduce:transition-none',
      'active:scale-[0.98] motion-reduce:active:scale-100',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:pointer-events-none disabled:opacity-50',
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
      'rounded-lg cursor-pointer'
    );

    const iconHitArea = "before:absolute before:-inset-1.5 before:content-['']";

    const variants = {
      default: cn(
        'bg-primary text-white shadow-sw-xs',
        'hover:bg-[color:var(--color-primary-hover)] hover:shadow-sw-sm'
      ),
      destructive: cn('bg-red-600 text-white shadow-sw-xs', 'hover:bg-red-700 hover:shadow-sw-sm'),
      success: cn(
        'bg-[color:var(--color-success)] text-white shadow-sw-xs',
        'hover:bg-emerald-700 hover:shadow-sw-sm'
      ),
      warning: cn(
        'bg-[color:var(--color-warning)] text-white shadow-sw-xs',
        'hover:bg-amber-700 hover:shadow-sw-sm'
      ),
      outline: cn(
        'bg-white text-ink border border-border shadow-sw-xs',
        'hover:bg-paper-tint hover:border-slate-300'
      ),
      secondary: cn('bg-secondary text-ink', 'hover:bg-slate-200'),
      ghost: cn('bg-transparent text-ink-soft', 'hover:bg-paper-tint hover:text-ink'),
      link: cn(
        'bg-transparent text-primary',
        'underline-offset-4 hover:underline',
        'p-0 h-auto rounded-none'
      ),
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 px-3 text-[13px]',
      lg: 'h-12 px-6 text-base',
      icon: cn('h-10 w-10 p-0', iconHitArea),
    };

    const variantClass = variants[variant];
    const sizeClass = sizes[size];

    return (
      <button ref={ref} className={cn(baseStyles, variantClass, sizeClass, className)} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button };
