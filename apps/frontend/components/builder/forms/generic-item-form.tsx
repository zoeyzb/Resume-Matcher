'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// Lazy-load TipTap-based editor — keeps it out of the initial bundle.
const RichTextEditor = dynamic(
  () => import('@/components/ui/rich-text-editor').then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[100px] rounded-lg border border-border bg-white" aria-busy="true" />
    ),
  }
);
import { Plus, Trash2 } from 'lucide-react';
import type { CustomSectionItem } from '@/components/dashboard/resume-component';
import { useTranslations } from '@/lib/i18n';

interface GenericItemFormProps {
  items: CustomSectionItem[];
  onChange: (items: CustomSectionItem[]) => void;
  itemLabel?: string;
  addLabel?: string;
  showSubtitle?: boolean;
  showLocation?: boolean;
  showYears?: boolean;
  titlePlaceholder?: string;
  subtitlePlaceholder?: string;
  locationPlaceholder?: string;
  yearsPlaceholder?: string;
  descriptionPlaceholder?: string;
}

/**
 * Generic Item Form Component
 *
 * Used for ITEM_LIST type sections (like Experience, Education, Projects).
 * Renders a list of items with configurable fields.
 */
export const GenericItemForm: React.FC<GenericItemFormProps> = ({
  items,
  onChange,
  itemLabel,
  addLabel,
  showSubtitle = true,
  showLocation = true,
  showYears = true,
  titlePlaceholder,
  subtitlePlaceholder,
  locationPlaceholder,
  yearsPlaceholder,
  descriptionPlaceholder,
}) => {
  const { t } = useTranslations();

  const finalItemLabel = itemLabel ?? t('builder.genericItemForm.itemLabel');
  const finalAddLabel =
    addLabel ?? t('builder.genericItemForm.addItemLabel', { label: finalItemLabel });

  const finalTitlePlaceholder = titlePlaceholder ?? t('builder.genericItemForm.placeholders.title');
  const finalSubtitlePlaceholder =
    subtitlePlaceholder ?? t('builder.genericItemForm.placeholders.organization');
  const finalLocationPlaceholder =
    locationPlaceholder ?? t('builder.genericItemForm.placeholders.location');
  const finalYearsPlaceholder = yearsPlaceholder ?? t('builder.genericItemForm.placeholders.years');
  const finalDescriptionPlaceholder =
    descriptionPlaceholder ?? t('builder.genericItemForm.placeholders.description');

  const handleAdd = () => {
    const newId = Math.max(...items.map((d) => d.id), 0) + 1;
    onChange([
      ...items,
      {
        id: newId,
        title: '',
        subtitle: '',
        location: '',
        years: '',
        description: [''],
      },
    ]);
  };

  const handleRemove = (id: number) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleChange = (id: number, field: keyof CustomSectionItem, value: string | string[]) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleDescriptionChange = (id: number, index: number, value: string) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          const newDesc = [...(item.description || [])];
          newDesc[index] = value;
          return { ...item, description: newDesc };
        }
        return item;
      })
    );
  };

  const handleAddDescription = (id: number) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, description: [...(item.description || []), ''] };
        }
        return item;
      })
    );
  };

  const handleRemoveDescription = (id: number, index: number) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          const newDesc = [...(item.description || [])];
          newDesc.splice(index, 1);
          return { ...item, description: newDesc };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4" /> {finalAddLabel}
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl border border-border bg-white p-6"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 text-steel-grey opacity-0 transition-opacity duration-150 hover:text-destructive hover:bg-destructive/10 group-hover:opacity-100 motion-reduce:transition-none"
              onClick={() => handleRemove(item.id)}
              aria-label={t('a11y.removeItem')}
              title={t('a11y.removeItem')}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
              <div className="space-y-2">
                <Label>{t('builder.genericItemForm.fields.title')}</Label>
                <Input
                  value={item.title || ''}
                  onChange={(e) => handleChange(item.id, 'title', e.target.value)}
                  placeholder={finalTitlePlaceholder}
                />
              </div>
              {showSubtitle && (
                <div className="space-y-2">
                  <Label>{t('builder.genericItemForm.fields.organization')}</Label>
                  <Input
                    value={item.subtitle || ''}
                    onChange={(e) => handleChange(item.id, 'subtitle', e.target.value)}
                    placeholder={finalSubtitlePlaceholder}
                  />
                </div>
              )}
              {showLocation && (
                <div className="space-y-2">
                  <Label>{t('builder.genericItemForm.fields.location')}</Label>
                  <Input
                    value={item.location || ''}
                    onChange={(e) => handleChange(item.id, 'location', e.target.value)}
                    placeholder={finalLocationPlaceholder}
                  />
                </div>
              )}
              {showYears && (
                <div className="space-y-2">
                  <Label>{t('builder.genericItemForm.fields.years')}</Label>
                  <Input
                    value={item.years || ''}
                    onChange={(e) => handleChange(item.id, 'years', e.target.value)}
                    placeholder={finalYearsPlaceholder}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>{t('builder.genericItemForm.fields.descriptionPoints')}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddDescription(item.id)}
                  className="h-7 text-xs text-primary hover:bg-emerald-50 hover:text-primary"
                >
                  <Plus className="w-3 h-3" /> {t('builder.genericItemForm.actions.addPoint')}
                </Button>
              </div>
              {item.description?.map((desc, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex-1">
                    <RichTextEditor
                      value={desc}
                      onChange={(html) => handleDescriptionChange(item.id, idx, html)}
                      placeholder={finalDescriptionPlaceholder}
                      minHeight="60px"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDescription(item.id, idx)}
                    className="h-[60px] w-8 text-steel-grey hover:text-destructive self-end"
                    aria-label={t('a11y.removeDescription')}
                    title={t('a11y.removeDescription')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-paper-tint/40 py-12 text-center">
            <p className="mb-4 text-sm text-steel-grey">
              {t('builder.genericItemForm.noEntries', { label: finalItemLabel })}
            </p>
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              {t('builder.genericItemForm.addFirstItem', { label: finalItemLabel })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
