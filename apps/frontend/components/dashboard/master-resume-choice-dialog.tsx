'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';
import Upload from 'lucide-react/dist/esm/icons/upload';
import Bot from 'lucide-react/dist/esm/icons/bot';

interface MasterResumeChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseUpload: () => void;
  onChooseWizard: () => void;
}

export function MasterResumeChoiceDialog({
  open,
  onOpenChange,
  onChooseUpload,
  onChooseWizard,
}: MasterResumeChoiceDialogProps) {
  const { t } = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="border-b border-border p-6 text-left">
          <Badge variant="primary" className="w-fit">
            {t('resumeWizard.entry.kicker')}
          </Badge>
          <DialogTitle className="mt-2 text-2xl">{t('resumeWizard.entry.title')}</DialogTitle>
          <DialogDescription>{t('resumeWizard.entry.description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 bg-paper-tint/40 p-6 md:grid-cols-2">
          <section className="flex min-h-64 flex-col rounded-xl border border-border bg-white p-5">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <Upload className="h-5 w-5 text-ink-soft" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-steel-grey">
              {t('resumeWizard.entry.upload.kicker')}
            </p>
            <h3 className="mt-1.5 text-lg font-semibold text-ink">
              {t('resumeWizard.entry.upload.title')}
            </h3>
            <p className="mt-2 text-sm text-steel-grey">
              {t('resumeWizard.entry.upload.description')}
            </p>
            <Button variant="outline" className="mt-auto w-full" onClick={onChooseUpload}>
              {t('resumeWizard.entry.upload.action')}
            </Button>
          </section>

          <section className="flex min-h-64 flex-col rounded-xl border border-primary/20 bg-white p-5 shadow-sw-sm">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {t('resumeWizard.entry.wizard.kicker')}
            </p>
            <h3 className="mt-1.5 text-lg font-semibold text-ink">
              {t('resumeWizard.entry.wizard.title')}
            </h3>
            <p className="mt-2 text-sm text-steel-grey">
              {t('resumeWizard.entry.wizard.description')}
            </p>
            <Button className="mt-auto w-full" onClick={onChooseWizard}>
              {t('resumeWizard.entry.wizard.action')}
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
