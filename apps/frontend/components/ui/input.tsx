import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Premium product input — soft border, gentle focus glow (no hard ring).
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-ink',
          'placeholder:text-steel-grey',
          'transition-[border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-paper-tint',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
