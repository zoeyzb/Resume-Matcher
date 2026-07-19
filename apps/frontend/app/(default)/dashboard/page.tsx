'use client';

import { ResumeUploadDialog } from '@/components/dashboard/resume-upload-dialog';
import { MasterResumeChoiceDialog } from '@/components/dashboard/master-resume-choice-dialog';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/page-header';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Settings from 'lucide-react/dist/esm/icons/settings';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Upload from 'lucide-react/dist/esm/icons/upload';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Eye from 'lucide-react/dist/esm/icons/eye';

import {
  fetchResume,
  fetchResumeList,
  deleteResume,
  retryProcessing,
  fetchJobDescription,
  type ResumeListItem,
} from '@/lib/api/resume';
import { useStatusCache } from '@/lib/context/status-cache';

type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'loading';

export default function DashboardPage() {
  const { t, locale } = useTranslations();
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('loading');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tailoredResumes, setTailoredResumes] = useState<ResumeListItem[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isMasterChoiceDialogOpen, setIsMasterChoiceDialogOpen] = useState(false);
  const router = useRouter();

  const {
    status: systemStatus,
    isLoading: statusLoading,
    incrementResumes,
    decrementResumes,
    setHasMasterResume,
  } = useStatusCache();

  const loadRequestIdRef = useRef(0);
  const jobSnippetCacheRef = useRef<Record<string, string>>({});

  const isLlmConfigured = !statusLoading && systemStatus?.llm_configured;
  const isTailorEnabled =
    Boolean(masterResumeId) && processingStatus === 'ready' && isLlmConfigured;

  const formatDate = (value: string) => {
    if (!value) return t('common.unknown');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('common.unknown');

    const dateLocale =
      locale === 'es' ? 'es-ES' : locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en-US';

    return date.toLocaleDateString(dateLocale, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const checkResumeStatus = useCallback(async (resumeId: string) => {
    try {
      setProcessingStatus('loading');
      const data = await fetchResume(resumeId);
      const status = data.raw_resume?.processing_status || 'pending';
      setProcessingStatus(status as ProcessingStatus);
    } catch (err: unknown) {
      console.error('Failed to check resume status:', err);
      if (err instanceof Error && err.message.includes('404')) {
        localStorage.removeItem('master_resume_id');
        setMasterResumeId(null);
        return;
      }
      setProcessingStatus('failed');
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem('master_resume_id');
    if (storedId) {
      setMasterResumeId(storedId);
      checkResumeStatus(storedId);
    }
  }, [checkResumeStatus]);

  const loadTailoredResumes = useCallback(async () => {
    try {
      const data = await fetchResumeList(true);
      const masterFromList = data.find((r) => r.is_master);
      const storedId = localStorage.getItem('master_resume_id');
      const resolvedMasterId = masterFromList?.resume_id || storedId;

      if (resolvedMasterId) {
        localStorage.setItem('master_resume_id', resolvedMasterId);
        setMasterResumeId(resolvedMasterId);
        checkResumeStatus(resolvedMasterId);
      } else {
        localStorage.removeItem('master_resume_id');
        setMasterResumeId(null);
      }

      const filtered = data.filter((r) => r.resume_id !== resolvedMasterId);
      setTailoredResumes(filtered);

      const tailoredWithParent = filtered.filter((r) => r.parent_id);
      const requestId = ++loadRequestIdRef.current;

      const jobSnippets: Record<string, string> = {};
      await Promise.all(
        tailoredWithParent.map(async (r) => {
          if (jobSnippetCacheRef.current[r.resume_id]) {
            jobSnippets[r.resume_id] = jobSnippetCacheRef.current[r.resume_id];
            return;
          }
          try {
            const jd = await fetchJobDescription(r.resume_id);
            const snippet = (jd?.content || '').slice(0, 80);
            jobSnippetCacheRef.current[r.resume_id] = snippet;
            jobSnippets[r.resume_id] = snippet;
          } catch {
            jobSnippetCacheRef.current[r.resume_id] = '';
            jobSnippets[r.resume_id] = '';
          }
        })
      );

      if (requestId === loadRequestIdRef.current) {
        setTailoredResumes((prev) =>
          prev.map((r) => ({ ...r, jobSnippet: jobSnippets[r.resume_id] || '' }))
        );
      }
    } catch (err) {
      console.error('Failed to load tailored resumes:', err);
    }
  }, [checkResumeStatus]);

  useEffect(() => {
    loadTailoredResumes();
  }, [loadTailoredResumes]);

  useEffect(() => {
    const handleFocus = () => {
      loadTailoredResumes();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadTailoredResumes, checkResumeStatus]);

  const handleUploadComplete = (resumeId: string) => {
    localStorage.setItem('master_resume_id', resumeId);
    setMasterResumeId(resumeId);
    checkResumeStatus(resumeId);
    incrementResumes();
    setHasMasterResume(true);
  };

  const handleChooseUpload = () => {
    setIsMasterChoiceDialogOpen(false);
    setIsUploadDialogOpen(true);
  };

  const handleChooseWizard = () => {
    setIsMasterChoiceDialogOpen(false);
    router.push('/resume-wizard');
  };

  const handleRetryProcessing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!masterResumeId) return;
    setIsRetrying(true);
    try {
      const result = await retryProcessing(masterResumeId);
      if (result.processing_status === 'ready') {
        setProcessingStatus('ready');
      } else if (
        result.processing_status === 'processing' ||
        result.processing_status === 'pending'
      ) {
        setProcessingStatus(result.processing_status);
      } else {
        setProcessingStatus('failed');
      }
    } catch (err) {
      console.error('Retry processing failed:', err);
      setProcessingStatus('failed');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDeleteAndReupload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDeleteAndReupload = async () => {
    if (!masterResumeId) return;
    try {
      await deleteResume(masterResumeId);
      decrementResumes();
      setHasMasterResume(false);
      localStorage.removeItem('master_resume_id');
      setMasterResumeId(null);
      setProcessingStatus('loading');
      setIsUploadDialogOpen(true);
      await loadTailoredResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const getMonogram = (title: string): string => {
    const words = title.split(/\s+/).filter((w) => /^[a-zA-Z]/.test(w));
    return words
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  };

  const cardPalette = [
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-slate-600',
  ];
  const hashTitle = (title: string): number => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const statusBadge: Record<
    ProcessingStatus,
    { variant: 'neutral' | 'primary' | 'success' | 'warning' | 'danger'; label: string }
  > = {
    loading: { variant: 'neutral', label: t('dashboard.status.checking') },
    processing: { variant: 'primary', label: t('dashboard.status.processing') },
    ready: { variant: 'success', label: t('dashboard.status.ready') },
    failed: { variant: 'danger', label: t('dashboard.status.failed') },
    pending: { variant: 'neutral', label: t('dashboard.status.pending') },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <PageHeader
        title={t('nav.dashboard')}
        description={t('dashboard.selectModule')}
        action={
          masterResumeId ? (
            <Button onClick={() => router.push('/tailor')} disabled={!isTailorEnabled}>
              <Sparkles className="h-4 w-4" />
              {t('dashboard.createResume')}
            </Button>
          ) : undefined
        }
      />

      {/* Configuration Warning Banner */}
      {masterResumeId && !isLlmConfigured && !statusLoading && (
        <Alert
          variant="warning"
          area={t('nav.dashboard')}
          title={t('dashboard.llmNotConfiguredTitle')}
          className="mt-6"
          action={
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Button>
            </Link>
          }
        >
          {t('dashboard.llmNotConfiguredMessage')}
        </Alert>
      )}

      {/* Your resume */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink-soft">{t('dashboard.masterResume')}</h2>

        <div className="mt-3">
          {!masterResumeId ? (
            !isLlmConfigured && !statusLoading ? (
              <Card variant="outline" className="border-amber-200 bg-amber-50/40">
                <EmptyState
                  icon={AlertTriangle}
                  title={t('dashboard.setupRequiredTitle')}
                  description={t('dashboard.setupRequiredMessage')}
                  action={
                    <Link href="/settings">
                      <Button variant="outline">
                        <Settings className="h-4 w-4" />
                        {t('nav.goToSettings')}
                      </Button>
                    </Link>
                  }
                />
              </Card>
            ) : (
              <>
                <Card variant="outline" className="border-dashed">
                  <EmptyState
                    icon={Upload}
                    title={t('dashboard.initializeMasterResume')}
                    description={t('dashboard.initializeSequence')}
                    action={
                      <Button onClick={() => setIsMasterChoiceDialogOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t('dashboard.initializeMasterResume')}
                      </Button>
                    }
                  />
                </Card>
                <MasterResumeChoiceDialog
                  open={isMasterChoiceDialogOpen}
                  onOpenChange={setIsMasterChoiceDialogOpen}
                  onChooseUpload={handleChooseUpload}
                  onChooseWizard={handleChooseWizard}
                />
                <ResumeUploadDialog
                  open={isUploadDialogOpen}
                  onOpenChange={setIsUploadDialogOpen}
                  onUploadComplete={handleUploadComplete}
                  trigger={
                    <button type="button" className="hidden" tabIndex={-1} aria-hidden="true" />
                  }
                />
              </>
            )
          ) : (
            <Card
              variant="interactive"
              className="flex-row items-center gap-4 sm:flex"
              onClick={() => router.push(`/resumes/${masterResumeId}`)}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="mt-4 min-w-0 flex-1 sm:mt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{t('dashboard.masterResume')}</CardTitle>
                  <Badge variant={statusBadge[processingStatus].variant} dot>
                    {processingStatus === 'loading' || processingStatus === 'processing' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : processingStatus === 'failed' ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : null}
                    {statusBadge[processingStatus].label}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {t('dashboard.statusLine', { status: statusBadge[processingStatus].label })}
                </CardDescription>
              </div>
              <div
                className="mt-4 flex shrink-0 items-center gap-2 sm:mt-0"
                onClick={(e) => e.stopPropagation()}
              >
                {(processingStatus === 'failed' || processingStatus === 'processing') && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryProcessing}
                      disabled={isRetrying}
                    >
                      {isRetrying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {isRetrying
                        ? t('dashboard.retryingProcessing')
                        : t('dashboard.retryProcessing')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleDeleteAndReupload}
                    >
                      {t('dashboard.deleteAndReupload')}
                    </Button>
                  </>
                )}
                {processingStatus === 'ready' && (
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Tailored resumes */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">{t('dashboard.tailoredResume')}</h2>
          {masterResumeId && tailoredResumes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tailor')}
              disabled={!isTailorEnabled}
            >
              {t('dashboard.createResume')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-3">
          {masterResumeId && tailoredResumes.length === 0 ? (
            <Card variant="outline" className="border-dashed">
              <EmptyState
                icon={Sparkles}
                title={t('tailor.heroTitle')}
                description={t('tailor.pasteJobDescriptionBelow')}
                action={
                  <Button onClick={() => router.push('/tailor')} disabled={!isTailorEnabled}>
                    <Sparkles className="h-4 w-4" />
                    {t('dashboard.createResume')}
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tailoredResumes.map((resume) => {
                const title =
                  resume.title ||
                  resume.jobSnippet ||
                  resume.filename ||
                  t('dashboard.tailoredResume');
                const color = cardPalette[hashTitle(title) % cardPalette.length];
                return (
                  <Card
                    key={resume.resume_id}
                    variant="interactive"
                    onClick={() => router.push(`/resumes/${resume.resume_id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white ${color}`}
                      >
                        {getMonogram(title)}
                      </div>
                      <Badge variant={resume.processing_status === 'ready' ? 'success' : 'neutral'}>
                        {resume.processing_status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 line-clamp-2 text-base">{title}</CardTitle>
                    <CardDescription className="mt-auto pt-4">
                      {t('dashboard.edited', {
                        date: formatDate(resume.updated_at || resume.created_at),
                      })}
                    </CardDescription>
                  </Card>
                );
              })}

              <Card
                variant="interactive"
                className="flex items-center justify-center border-dashed py-10 text-center"
                onClick={() => isTailorEnabled && router.push('/tailor')}
                role="button"
                aria-disabled={!isTailorEnabled}
              >
                <div>
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-primary">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink-soft">
                    {t('dashboard.createResume')}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {!masterResumeId && statusLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('confirmations.deleteMasterResumeTitle')}
        description={t('confirmations.deleteMasterResumeDescription')}
        confirmLabel={t('dashboard.deleteAndReupload')}
        cancelLabel={t('confirmations.keepResumeCancelLabel')}
        onConfirm={confirmDeleteAndReupload}
        variant="danger"
      />
    </div>
  );
}
