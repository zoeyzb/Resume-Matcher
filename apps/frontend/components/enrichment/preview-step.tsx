'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Briefcase, FolderKanban } from 'lucide-react';
import type { EnhancedDescription } from '@/lib/api/enrichment';
import { useTranslations } from '@/lib/i18n';

interface PreviewStepProps {
  enhancements: EnhancedDescription[];
  onApply: () => void;
  onCancel: () => void;
}

export function PreviewStep({ enhancements, onApply, onCancel }: PreviewStepProps) {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1.5 text-ink">{t('enrichment.preview.title')}</h2>
        <p className="text-sm text-steel-grey">{t('enrichment.preview.description')}</p>
      </div>

      {/* Enhancements list */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {enhancements.map((enhancement) => (
          <EnhancementCard key={enhancement.item_id} enhancement={enhancement} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
          {t('common.cancel')}
        </Button>
        <Button onClick={onApply}>
          <Check className="w-4 h-4" />
          {t('enrichment.preview.applyButton')}
        </Button>
      </div>
    </div>
  );
}

interface EnhancementCardProps {
  enhancement: EnhancedDescription;
}

function EnhancementCard({ enhancement }: EnhancementCardProps) {
  const { t } = useTranslations();
  const itemTypeLabel =
    enhancement.item_type === 'experience'
      ? t('enrichment.itemType.experience')
      : t('enrichment.itemType.project');

  return (
    <div className="rounded-xl border border-border bg-white">
      {/* Card header */}
      <div className="flex items-center gap-2 border-b border-border bg-paper-tint/40 px-4 py-3">
        {enhancement.item_type === 'experience' ? (
          <Briefcase className="w-4 h-4 text-steel-grey" />
        ) : (
          <FolderKanban className="w-4 h-4 text-steel-grey" />
        )}
        <Badge variant="neutral">{itemTypeLabel}</Badge>
        <span className="font-semibold text-ink">{enhancement.title}</span>
      </div>

      {/* Content preview */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Existing bullets - keeping */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-ink-soft">
                {t('enrichment.preview.keepingLabel')}
              </span>
              <span className="text-xs text-steel-grey">
                {t('enrichment.preview.existingCount', {
                  count: enhancement.original_description.length,
                })}
              </span>
            </div>
            <ul className="space-y-2">
              {enhancement.original_description.map((bullet, i) => (
                <li key={i} className="text-sm text-ink-soft pl-4">
                  {bullet}
                </li>
              ))}
              {enhancement.original_description.length === 0 && (
                <li className="text-sm text-steel-grey italic">
                  {t('enrichment.preview.noExistingDescription')}
                </li>
              )}
            </ul>
          </div>

          {/* New bullets - adding */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-600">
                {t('enrichment.preview.addingLabel')}
              </span>
              <span className="text-xs text-emerald-600">
                {t('enrichment.preview.newCount', {
                  count: enhancement.enhanced_description.length,
                })}
              </span>
            </div>
            <ul className="space-y-2">
              {enhancement.enhanced_description.map((bullet, i) => (
                <li
                  key={i}
                  className="rounded-lg bg-emerald-50/60 py-1.5 pl-4 pr-3 text-sm text-ink-soft"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
