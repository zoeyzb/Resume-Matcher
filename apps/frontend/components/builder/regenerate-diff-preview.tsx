'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Check,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Briefcase,
  FolderKanban,
  Lightbulb,
} from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import type { RegenerateItemError, RegeneratedItem } from '@/lib/api/enrichment';

interface RegenerateDiffPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regeneratedItems: RegeneratedItem[];
  regenerateErrors?: RegenerateItemError[];
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  isApplying: boolean;
}

/**
 * RegenerateDiffPreview Component
 *
 * Third step of the regenerate wizard.
 * Shows side-by-side comparison of original vs regenerated content.
 * Swiss International Style design.
 */
export const RegenerateDiffPreview: React.FC<RegenerateDiffPreviewProps> = ({
  open,
  onOpenChange,
  regeneratedItems,
  regenerateErrors = [],
  error,
  onAccept,
  onReject,
  isApplying,
}) => {
  const { t } = useTranslations();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set(regeneratedItems.map((item) => item.item_id))
  );

  React.useEffect(() => {
    // Expand all items when regeneratedItems changes
    setExpandedItems(new Set(regeneratedItems.map((item) => item.item_id)));
  }, [regeneratedItems]);

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  type ItemLabelSource = Pick<RegeneratedItem, 'item_id' | 'item_type' | 'title' | 'subtitle'>;

  const getItemLabel = (item: ItemLabelSource) => {
    if (item.item_type === 'skills') {
      return t('builder.regenerate.selectDialog.skills');
    }

    const title = item.title?.trim();
    const subtitle = item.subtitle?.trim();

    if (title && subtitle) {
      return `${title} | ${subtitle}`;
    }

    return title || item.item_id;
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'experience':
        return <Briefcase className="w-4 h-4" />;
      case 'project':
        return <FolderKanban className="w-4 h-4" />;
      case 'skills':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const resolveErrorMessage = (value: string) => {
    if (value === 'No changes to apply') {
      return t('builder.regenerate.errors.noChangesToApply');
    }

    if (/network|fetch/i.test(value) || value.includes('Failed to fetch')) {
      return t('builder.regenerate.errors.networkError');
    }

    if (/resume content changed|uniquely matched|please regenerate/i.test(value)) {
      return t('builder.regenerate.errors.resumeChanged');
    }

    return t('builder.regenerate.errors.applyFailed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>{t('builder.regenerate.diffPreview.title')}</DialogTitle>
          <DialogDescription>{t('builder.regenerate.diffPreview.subtitle')}</DialogDescription>
        </DialogHeader>

        {/* Stats Card */}
        <div className="px-6 pt-4">
          <Badge variant="success">
            <Check className="w-3 h-3" />
            {t('builder.regenerate.diffPreview.changesCount').replace(
              '{count}',
              String(regeneratedItems.length)
            )}
          </Badge>
        </div>

        {error ? (
          <div className="px-6 pt-4">
            <Alert variant="error">{resolveErrorMessage(error)}</Alert>
          </div>
        ) : null}

        {regenerateErrors.length > 0 ? (
          <div className="px-6 pt-4">
            <Alert variant="warning">
              <p>
                {t('builder.regenerate.diffPreview.partialFailures', {
                  count: regenerateErrors.length,
                })}
              </p>
              <ul className="mt-2 space-y-1">
                {regenerateErrors.map((failed) => (
                  <li key={failed.item_id}>· {getItemLabel(failed)}</li>
                ))}
              </ul>
            </Alert>
          </div>
        ) : null}

        {/* Diff Content */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {regeneratedItems.map((item) => (
            <div key={item.item_id} className="rounded-xl border border-border overflow-hidden">
              {/* Item Header */}
              <button
                type="button"
                onClick={() => toggleItem(item.item_id)}
                aria-expanded={expandedItems.has(item.item_id)}
                aria-label={
                  expandedItems.has(item.item_id)
                    ? t('builder.regenerate.diffPreview.collapseItem', { item: getItemLabel(item) })
                    : t('builder.regenerate.diffPreview.expandItem', { item: getItemLabel(item) })
                }
                className="flex w-full cursor-pointer items-center justify-between bg-white p-4 transition-colors duration-150 hover:bg-paper-tint motion-reduce:transition-none"
              >
                <div className="flex items-center gap-3 text-steel-grey">
                  {getItemIcon(item.item_type)}
                  <span className="truncate text-sm font-medium text-ink">
                    {getItemLabel(item)}
                  </span>
                </div>
                {expandedItems.has(item.item_id) ? (
                  <ChevronDown className="w-4 h-4 text-steel-grey" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-steel-grey" />
                )}
              </button>

              {/* Item Diff Content */}
              {expandedItems.has(item.item_id) && (
                <div className="border-t border-border">
                  {/* Change Summary */}
                  {item.diff_summary && (
                    <div className="border-b border-border p-3">
                      <p className="text-xs text-primary">{item.diff_summary}</p>
                    </div>
                  )}

                  {/* Original Content */}
                  <div className="border-b border-border p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-steel-grey">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      {t('builder.regenerate.diffPreview.originalLabel')}
                    </div>
                    <div className="space-y-1 rounded-lg bg-red-50/60 p-3">
                      {item.original_content.length > 0 ? (
                        item.original_content.map((content, idx) => (
                          <p key={idx} className="text-sm text-red-700 line-through">
                            <span className="mr-1.5">−</span>
                            {content}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm italic text-steel-grey">
                          {t('builder.regenerate.diffPreview.noContent')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* New Content */}
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-steel-grey">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {t('builder.regenerate.diffPreview.newLabel')}
                    </div>
                    <div className="space-y-1 rounded-lg bg-emerald-50/60 p-3">
                      {item.new_content.length > 0 ? (
                        item.new_content.map((content, idx) => (
                          <p key={idx} className="text-sm text-emerald-700">
                            <span className="mr-1.5">+</span>
                            {content}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm italic text-steel-grey">
                          {t('builder.regenerate.diffPreview.noContent')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="p-4 bg-paper-tint/40 border-t border-border flex-row justify-between gap-2">
          <Button variant="outline" onClick={onReject} disabled={isApplying}>
            <RefreshCw className="w-4 h-4" />
            {t('builder.regenerate.diffPreview.rejectButton')}
          </Button>
          <Button variant="success" onClick={onAccept} disabled={isApplying}>
            {isApplying ? (
              <>
                <span className="animate-spin">
                  <Check className="w-4 h-4" />
                </span>
                {t('builder.regenerate.diffPreview.applying')}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {t('builder.regenerate.diffPreview.acceptButton')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateDiffPreview;
