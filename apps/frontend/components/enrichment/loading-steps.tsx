'use client';

import { Loader2, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n';

interface LoadingStepProps {
  message: string;
  submessage?: string;
}

function LoadingStep({ message, submessage }: LoadingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5">
      <Loader2 className="w-9 h-9 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-lg font-semibold text-ink">{message}</p>
        {submessage && <p className="text-sm text-steel-grey mt-1.5">{submessage}</p>}
      </div>
    </div>
  );
}

export function AnalyzingStep() {
  const { t } = useTranslations();
  return (
    <LoadingStep
      message={t('enrichment.loading.analyzingTitle')}
      submessage={t('enrichment.loading.analyzingDescription')}
    />
  );
}

export function GeneratingStep() {
  const { t } = useTranslations();
  return (
    <LoadingStep
      message={t('enrichment.loading.generatingTitle')}
      submessage={t('enrichment.loading.generatingDescription')}
    />
  );
}

export function ApplyingStep() {
  const { t } = useTranslations();
  return (
    <LoadingStep
      message={t('enrichment.loading.applyingTitle')}
      submessage={t('enrichment.loading.applyingDescription')}
    />
  );
}

interface CompleteStepProps {
  onClose: () => void;
  updatedCount?: number;
}

export function CompleteStep({ onClose, updatedCount }: CompleteStepProps) {
  const { t } = useTranslations();
  const hasUpdatedCount = updatedCount !== undefined;
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-ink">{t('enrichment.complete.title')}</p>
        <p className="text-sm text-steel-grey mt-1.5">
          {hasUpdatedCount
            ? updatedCount === 1
              ? t('enrichment.complete.updatedCountSingular', { count: updatedCount })
              : t('enrichment.complete.updatedCountPlural', { count: updatedCount })
            : t('enrichment.complete.updatedFallback')}
        </p>
      </div>
      <Button onClick={onClose} className="mt-2">
        <Sparkles className="w-4 h-4" />
        {t('enrichment.complete.doneButton')}
      </Button>
    </div>
  );
}

interface NoImprovementsStepProps {
  onClose: () => void;
  summary?: string;
}

export function NoImprovementsStep({ onClose, summary }: NoImprovementsStepProps) {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
      </div>
      <div className="max-w-md text-center">
        <p className="text-xl font-bold text-ink">{t('enrichment.noImprovements.title')}</p>
        <p className="text-sm text-steel-grey mt-1.5">
          {summary || t('enrichment.noImprovements.defaultDescription')}
        </p>
      </div>
      <Button onClick={onClose} className="mt-2">
        <Sparkles className="w-4 h-4" />
        {t('common.close')}
      </Button>
    </div>
  );
}

interface ErrorStepProps {
  error: string;
  onRetry: () => void;
  onClose: () => void;
}

export function ErrorStep({ error, onRetry, onClose }: ErrorStepProps) {
  const { t } = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="w-7 h-7 text-red-600" />
      </div>
      <div className="max-w-md text-center">
        <p className="text-lg font-semibold text-ink">{t('enrichment.error.title')}</p>
        <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      </div>
      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button onClick={onRetry}>{t('common.retry')}</Button>
      </div>
    </div>
  );
}
