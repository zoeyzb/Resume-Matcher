'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Linkedin, Mail } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export interface OutreachPreviewProps {
  /** Outreach message content */
  content: string;
  /** Additional class names */
  className?: string;
}

export function OutreachPreview({ content, className }: OutreachPreviewProps) {
  const { t } = useTranslations();
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white shadow-sw-card overflow-hidden',
        className
      )}
    >
      {/* Preview Header */}
      <div className="border-b border-border bg-paper-tint/40 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-[#0077B5]" />
            <span className="text-xs text-ink-soft">{t('outreach.preview.channels.linkedin')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-steel-grey" />
            <span className="text-xs text-ink-soft">{t('outreach.preview.channels.email')}</span>
          </div>
        </div>
      </div>

      {/* Message Preview */}
      <div className="p-6 md:p-8">
        {content ? (
          <div className="space-y-4">
            {/* Message Bubble Style */}
            <div className="rounded-xl border border-border bg-paper-tint/40 p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">{content}</p>
            </div>

            {/* Usage Tips */}
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold text-ink-soft">
                {t('outreach.preview.howToUseTitle')}
              </p>
              <ul className="space-y-1 text-xs text-steel-grey">
                <li>{t('outreach.preview.steps.step1')}</li>
                <li>{t('outreach.preview.steps.step2')}</li>
                <li>{t('outreach.preview.steps.step3')}</li>
                <li>{t('outreach.preview.steps.step4')}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-steel-grey">
            <p className="text-sm">{t('outreach.preview.emptyTitle')}</p>
            <p className="text-xs mt-2">{t('outreach.preview.emptyDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
