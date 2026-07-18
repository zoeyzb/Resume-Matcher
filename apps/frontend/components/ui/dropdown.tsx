'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Check from 'lucide-react/dist/esm/icons/check';
import { useTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  id: string;
  label: string;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: DropdownProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = React.useId();

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-ink-soft">{label}</label>}

      {description && <p className="text-sm text-steel-grey">{description}</p>}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          aria-label={label}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-ink',
            'shadow-sw-xs transition-[border-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
            'hover:border-slate-300',
            isOpen && 'border-primary ring-4 ring-primary/10',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <div className="flex-1 min-w-0 text-left">
            {selectedOption ? (
              <div>
                <div className="truncate font-medium text-ink">{selectedOption.label}</div>
                {selectedOption.description && (
                  <div className="mt-0.5 truncate text-xs font-normal text-steel-grey">
                    {selectedOption.description}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-steel-grey">{t('common.selectOption')}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'ml-2 h-4 w-4 shrink-0 text-steel-grey transition-transform duration-150 motion-reduce:transition-none',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-sw-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-150"
          >
            {options.map((option) => (
              <button
                key={option.id}
                role="menuitemradio"
                aria-checked={option.id === value}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  'flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors duration-100 motion-reduce:transition-none',
                  option.id === value ? 'bg-accent text-accent-foreground' : 'hover:bg-paper-tint'
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink">{option.label}</div>
                  {option.description && (
                    <div className="mt-0.5 text-xs text-steel-grey">{option.description}</div>
                  )}
                </div>
                {option.id === value && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
