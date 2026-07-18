'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Premium underline-indicator tab bar.
 */

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }) => {
  return (
    <div className={cn('flex gap-1 border-b border-border', className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            onClick={() => !isDisabled && onTabChange(tab.id)}
            className={cn(
              'relative px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-md',
              isActive && 'text-primary',
              !isActive && !isDisabled && 'text-steel-grey hover:text-ink',
              isDisabled && 'cursor-not-allowed text-slate-300'
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
};
