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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Sparkles, Briefcase, FolderKanban, Lightbulb } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import type { RegenerateItemInput } from '@/lib/api/enrichment';

interface RegenerateInstructionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: RegenerateItemInput[];
  instruction: string;
  onInstructionChange: (instruction: string) => void;
  error: string | null;
  onBack: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

/**
 * RegenerateInstructionDialog Component
 *
 * Second step of the regenerate wizard.
 * Shows selected items and allows user to input improvement instructions.
 * Swiss International Style design.
 */
export const RegenerateInstructionDialog: React.FC<RegenerateInstructionDialogProps> = ({
  open,
  onOpenChange,
  selectedItems,
  instruction,
  onInstructionChange,
  error,
  onBack,
  onGenerate,
  isGenerating,
}) => {
  const { t } = useTranslations();

  const resolveErrorMessage = (value: string) => {
    if (value === 'No items selected') {
      return t('builder.regenerate.selectDialog.noItemsSelected');
    }

    if (/network|fetch/i.test(value) || value.includes('Failed to fetch')) {
      return t('builder.regenerate.errors.networkError');
    }

    return t('builder.regenerate.errors.generationFailed');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Enter key in textarea without closing dialog
    if (e.key === 'Enter') {
      e.stopPropagation();
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>{t('builder.regenerate.instructionDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('builder.regenerate.instructionDialog.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {error ? <Alert variant="error">{resolveErrorMessage(error)}</Alert> : null}
          {/* Selected Items Summary */}
          <div className="space-y-2">
            <Label>{t('builder.regenerate.instructionDialog.selectedItems')}</Label>
            <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg bg-paper-tint/50 p-3">
              {selectedItems.map((item) => (
                <div key={item.item_id} className="flex items-center gap-2 text-sm">
                  <span className="text-steel-grey">{getItemIcon(item.item_type)}</span>
                  <span className="font-medium truncate text-ink">{item.title}</span>
                  {item.subtitle && (
                    <span className="truncate text-xs text-steel-grey">· {item.subtitle}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instruction Input */}
          <div className="space-y-2">
            <Label htmlFor="regenerate-instruction">
              {t('builder.regenerate.instructionDialog.hint')}
            </Label>
            <Textarea
              id="regenerate-instruction"
              value={instruction}
              onChange={(e) => onInstructionChange(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={2000}
              placeholder={t('builder.regenerate.instructionDialog.placeholder')}
              className="min-h-[120px]"
              disabled={isGenerating}
            />
          </div>
        </div>

        <DialogFooter className="p-4 bg-paper-tint/40 border-t border-border flex-row justify-between gap-2">
          <Button variant="outline" onClick={onBack} disabled={isGenerating}>
            <ArrowLeft className="w-4 h-4" />
            {t('builder.regenerate.instructionDialog.backButton')}
          </Button>
          <Button onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                {t('builder.regenerate.diffPreview.loading')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('builder.regenerate.instructionDialog.generateButton')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegenerateInstructionDialog;
