'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, FileText, Mail, MessagesSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n';

export interface GeneratePromptProps {
  /** Type of content to generate */
  type: 'cover-letter' | 'outreach' | 'interview-prep';
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Callback to trigger generation */
  onGenerate: () => void;
  /** Whether this is a tailored resume (has job context) */
  isTailoredResume: boolean;
  /** Additional class names */
  className?: string;
}

export function GeneratePrompt({
  type,
  isGenerating,
  onGenerate,
  isTailoredResume,
  className,
}: GeneratePromptProps) {
  const { t } = useTranslations();
  const isOutreach = type === 'outreach';
  const isInterviewPrep = type === 'interview-prep';
  const Icon = isInterviewPrep ? MessagesSquare : isOutreach ? Mail : FileText;
  const title = isInterviewPrep
    ? t('interviewPrep.title')
    : isOutreach
      ? t('outreach.title')
      : t('coverLetter.title');

  // Show a different message if resume is not tailored
  if (!isTailoredResume) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[400px] p-12 text-center',
          className
        )}
      >
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Icon className="h-6 w-6 text-steel-grey" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-ink">
          {t('builder.generatePrompt.notAvailableTitle', { title })}
        </h3>
        <p className="mb-6 max-w-md text-sm leading-relaxed text-steel-grey">
          {t('builder.generatePrompt.notAvailableDescription', { title })}
        </p>
        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <span>{t('builder.generatePrompt.goToDashboard')}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-12 text-center',
        className
      )}
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-ink">
        {t('builder.generatePrompt.generateTitle', { title })}
      </h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-steel-grey">
        {isInterviewPrep
          ? t('builder.generatePrompt.interviewPrepDescription')
          : isOutreach
            ? t('builder.generatePrompt.outreachDescription')
            : t('builder.generatePrompt.coverLetterDescription')}
      </p>
      <Button onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('common.generating')}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t('builder.generatePrompt.generateButton', { title })}
          </>
        )}
      </Button>
      <p className="mt-4 text-xs text-steel-grey">
        {isInterviewPrep
          ? t('builder.generatePrompt.interviewPrepFooter')
          : isOutreach
            ? t('builder.generatePrompt.outreachFooter')
            : t('builder.generatePrompt.coverLetterFooter')}
      </p>
    </div>
  );
}
