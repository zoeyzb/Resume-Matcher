'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  UploadIcon,
  Loader2Icon,
  AlertCircleIcon,
  FileIcon,
  XIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import { useFileUpload, formatBytes } from '@/hooks/use-file-upload';
import { getUploadUrl } from '@/lib/api/client';
import { useTranslations } from '@/lib/i18n';
import { retryProcessing } from '@/lib/api/resume';

interface ResumeUploadDialogProps {
  trigger?: React.ReactNode;
  onUploadComplete?: (resumeId: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function ResumeUploadDialog({
  trigger,
  onUploadComplete,
  open: controlledOpen,
  onOpenChange,
}: ResumeUploadDialogProps) {
  const { t } = useTranslations();
  const [internalOpen, setInternalOpen] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [failedResumeId, setFailedResumeId] = useState<string | null>(null);
  const [isRetryingProcessing, setIsRetryingProcessing] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const UPLOAD_URL = getUploadUrl();

  const handleUploadSuccess = ({
    resumeId,
    fileId,
    message,
  }: {
    resumeId: string;
    fileId?: string;
    message: string;
  }) => {
    setUploadFeedback({ type: 'success', message });
    setFailedResumeId(null);

    // Defer parent state update to avoid setState during render
    setTimeout(() => {
      onUploadComplete?.(resumeId);
    }, 0);

    // Close dialog after a short delay to show success state
    setTimeout(() => {
      setIsOpen(false);
      setUploadFeedback(null);
      setFailedResumeId(null);
      if (fileId) {
        removeFile(fileId); // Clear file for next time
      }
    }, 1500);
  };

  const [
    { files, isDragging, errors, isUploadingGlobal },
    {
      getInputProps,
      openFileDialog,
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    maxSize: MAX_FILE_SIZE,
    accept: ACCEPTED_FILE_TYPES.join(','),
    multiple: false,
    uploadUrl: UPLOAD_URL,
    onUploadSuccess: (uploadedFile, response) => {
      const data = response as {
        resume_id?: string;
        processing_status?: 'pending' | 'processing' | 'ready' | 'failed';
        is_master?: boolean;
      };
      if (data.resume_id) {
        const processingFailed = data.processing_status === 'failed';
        const successMessage = data.is_master
          ? t('dashboard.uploadDialog.successMaster')
          : t('dashboard.uploadDialog.success');
        if (processingFailed) {
          // Keep dialog open on failure so users can retry processing.
          setUploadFeedback({
            type: 'error',
            message: t('dashboard.uploadDialog.parsingFailedKeepOpen'),
          });
          setFailedResumeId(data.resume_id);
          return;
        }
        handleUploadSuccess({
          resumeId: data.resume_id,
          fileId: uploadedFile.id,
          message: successMessage,
        });
      } else {
        setFailedResumeId(null);
        setUploadFeedback({
          type: 'error',
          message: t('dashboard.uploadDialog.successMissingId'),
        });
      }
    },
    onUploadError: (file, errorMsg) => {
      setFailedResumeId(null);
      setUploadFeedback({
        type: 'error',
        message: errorMsg || t('dashboard.uploadDialog.failed'),
      });
    },
    onFilesChange: (currentFiles) => {
      if (currentFiles.length === 0) {
        setUploadFeedback(null);
        setFailedResumeId(null);
      }
    },
  });

  const currentFile = files[0];
  const displayErrors = uploadFeedback?.type === 'error' ? [uploadFeedback.message] : errors;
  const preventDropzoneInteraction = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRetryProcessing = async () => {
    if (!failedResumeId) return;
    const resumeIdToRetry = failedResumeId;
    const fileIdToRemove = currentFile?.id;
    setIsRetryingProcessing(true);
    try {
      const result = await retryProcessing(resumeIdToRetry);
      if (result.processing_status !== 'ready') {
        setUploadFeedback({ type: 'error', message: t('dashboard.retryFailed') });
        return;
      }

      handleUploadSuccess({
        resumeId: resumeIdToRetry,
        fileId: fileIdToRemove,
        message: t('dashboard.retrySuccess'),
      });
    } catch (err) {
      console.error('Retry processing failed:', err);
      setUploadFeedback({ type: 'error', message: t('dashboard.retryFailed') });
    } finally {
      setIsRetryingProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UploadIcon className="w-4 h-4" />
            {t('dashboard.uploadResume')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle>{t('dashboard.uploadResume')}</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div
            className={`
                            relative rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-150 motion-reduce:transition-none
                            ${isDragging ? 'border-primary bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-paper-tint/40'}
                            ${currentFile ? 'bg-white border-solid border-border' : ''}
                            ${!currentFile && !isRetryingProcessing ? 'cursor-pointer' : 'cursor-default'}
                            ${isRetryingProcessing ? 'opacity-70' : ''}
                        `}
            onClick={!currentFile && !isRetryingProcessing ? openFileDialog : undefined}
            onDragEnter={isRetryingProcessing ? preventDropzoneInteraction : handleDragEnter}
            onDragLeave={isRetryingProcessing ? preventDropzoneInteraction : handleDragLeave}
            onDragOver={isRetryingProcessing ? preventDropzoneInteraction : handleDragOver}
            onDrop={isRetryingProcessing ? preventDropzoneInteraction : handleDrop}
          >
            <input {...getInputProps()} />

            {isUploadingGlobal ? (
              <div className="flex flex-col items-center py-4">
                <Loader2Icon className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm font-semibold text-primary">{t('common.uploading')}</p>
              </div>
            ) : currentFile ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <FileIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate max-w-[200px] text-ink">
                      {currentFile.file.name}
                    </p>
                    <p className="text-xs text-steel-grey">{formatBytes(currentFile.file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isRetryingProcessing}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(currentFile.id);
                  }}
                  className="hover:bg-red-50 hover:text-red-600 text-steel-grey"
                  aria-label={t('a11y.removeFile')}
                  title={t('a11y.removeFile')}
                >
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <UploadIcon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-base mb-1 text-ink">
                  {t('dashboard.uploadDialog.dropzoneTitle')}
                </p>
                <p className="text-sm text-steel-grey">
                  {t('dashboard.uploadDialog.dropzoneSubtitle')}
                </p>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {displayErrors.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 flex items-start gap-2 text-red-700 text-sm">
              <AlertCircleIcon className="w-5 h-5 shrink-0" />
              <div>
                {displayErrors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            </div>
          )}

          {uploadFeedback?.type === 'success' && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 flex items-center gap-2 text-emerald-700 text-sm font-medium">
              <CheckCircle2Icon className="w-5 h-5 shrink-0" />
              <p>{uploadFeedback.message}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-paper-tint/40 rounded-b-2xl flex justify-end gap-2">
          {uploadFeedback?.type === 'error' && failedResumeId && (
            <Button
              variant="outline"
              onClick={handleRetryProcessing}
              disabled={isRetryingProcessing}
            >
              {isRetryingProcessing
                ? t('dashboard.retryingProcessing')
                : t('dashboard.retryProcessing')}
            </Button>
          )}
          {uploadFeedback?.type === 'error' && files.length > 0 && (
            <Button
              variant="outline"
              disabled={isRetryingProcessing}
              onClick={() => {
                if (files[0]) removeFile(files[0].id);
                setUploadFeedback(null);
                setFailedResumeId(null);
              }}
            >
              {t('dashboard.uploadDialog.tryDifferentFile')}
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
