'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { useTranslations } from '@/lib/i18n';
import type {
  ResumeDiffSummary,
  ResumeFieldDiff,
} from '@/components/common/resume_previewer_context';

interface DiffPreviewModalProps {
  isOpen: boolean;
  isConfirming?: boolean;
  onClose: () => void;
  onReject: () => void;
  onConfirm: () => void;
  diffSummary?: ResumeDiffSummary;
  detailedChanges?: ResumeFieldDiff[];
  errorMessage?: string;
}

export function DiffPreviewModal({
  isOpen,
  isConfirming = false,
  onClose,
  onReject,
  onConfirm,
  diffSummary,
  detailedChanges,
  errorMessage,
}: DiffPreviewModalProps) {
  const { t } = useTranslations();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['summary', 'skills', 'descriptions', 'experience'])
  );

  // Elapsed timer while confirming
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isConfirming) {
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConfirming]);

  if (!diffSummary || !detailedChanges) {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !isConfirming) {
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden flex flex-col p-0">
          <DialogHeader className="border-b border-border p-6">
            <DialogTitle>{t('tailor.missingDiffDialog.title')}</DialogTitle>
          </DialogHeader>

          <div className="p-6">
            <Alert variant="warning" title={t('tailor.missingDiffDialog.confirmLabel')}>
              {t('tailor.missingDiffDialog.description')}
            </Alert>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border bg-paper-tint/40 px-6 py-4">
            <Button variant="outline" onClick={onClose} disabled={isConfirming}>
              {t('common.cancel')}
            </Button>
            <Button variant="warning" onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('tailor.missingDiffDialog.confirmLabel')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Group changes by type
  const summaryChanges = detailedChanges.filter((c) => c.field_type === 'summary');
  const skillChanges = detailedChanges.filter((c) => c.field_type === 'skill');
  const descChanges = detailedChanges.filter((c) => c.field_type === 'description');
  const certChanges = detailedChanges.filter((c) => c.field_type === 'certification');
  const experienceChanges = detailedChanges.filter((c) => c.field_type === 'experience');
  const educationChanges = detailedChanges.filter((c) => c.field_type === 'education');
  const projectChanges = detailedChanges.filter((c) => c.field_type === 'project');
  const languageChanges = detailedChanges.filter((c) => c.field_type === 'language');
  const awardChanges = detailedChanges.filter((c) => c.field_type === 'award');

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isConfirming) {
          onClose();
        }
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b border-border p-6">
          <DialogTitle>{t('tailor.diffModal.title')}</DialogTitle>
          <p className="mt-1 text-sm text-steel-grey">{t('tailor.diffModal.subtitle')}</p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <StatTile
              label={t('tailor.diffModal.skillsAdded')}
              value={diffSummary.skills_added}
              variant="success"
            />
            <StatTile
              label={t('tailor.diffModal.skillsRemoved')}
              value={diffSummary.skills_removed}
              variant="warning"
            />
            <StatTile
              label={t('tailor.diffModal.certificationsAdded')}
              value={diffSummary.certifications_added}
              variant="info"
            />
            <StatTile
              label={t('tailor.diffModal.descriptionsModified')}
              value={diffSummary.descriptions_modified}
              variant="info"
            />
            <StatTile
              label={t('tailor.diffModal.highRiskChanges')}
              value={diffSummary.high_risk_changes}
              variant={diffSummary.high_risk_changes > 0 ? 'danger' : 'success'}
            />
          </div>

          {diffSummary.high_risk_changes > 0 && (
            <Alert
              variant="warning"
              title={t('tailor.diffModal.warningTitle', { count: diffSummary.high_risk_changes })}
              className="mt-4"
            >
              {t('tailor.diffModal.warningMessage')}
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="error" className="mt-4">
              {errorMessage}
            </Alert>
          )}

          {/* Detailed changes list */}
          <div className="mt-5 space-y-3">
            {summaryChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.summaryChanges')}
                count={summaryChanges.length}
                isExpanded={expandedSections.has('summary')}
                onToggle={() => toggleSection('summary')}
              >
                {summaryChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {skillChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.skillChanges')}
                count={skillChanges.length}
                isExpanded={expandedSections.has('skills')}
                onToggle={() => toggleSection('skills')}
              >
                {skillChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {experienceChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.experienceChanges')}
                count={experienceChanges.length}
                isExpanded={expandedSections.has('experience')}
                onToggle={() => toggleSection('experience')}
              >
                {experienceChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {descChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.descriptionChanges')}
                count={descChanges.length}
                isExpanded={expandedSections.has('descriptions')}
                onToggle={() => toggleSection('descriptions')}
              >
                {descChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {educationChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.educationChanges')}
                count={educationChanges.length}
                isExpanded={expandedSections.has('education')}
                onToggle={() => toggleSection('education')}
              >
                {educationChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {projectChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.projectChanges')}
                count={projectChanges.length}
                isExpanded={expandedSections.has('project')}
                onToggle={() => toggleSection('project')}
              >
                {projectChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {certChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.certificationChanges')}
                count={certChanges.length}
                isExpanded={expandedSections.has('certifications')}
                onToggle={() => toggleSection('certifications')}
              >
                {certChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {languageChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.languageChanges')}
                count={languageChanges.length}
                isExpanded={expandedSections.has('languages')}
                onToggle={() => toggleSection('languages')}
              >
                {languageChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}

            {awardChanges.length > 0 && (
              <ChangeSection
                title={t('tailor.diffModal.awardChanges')}
                count={awardChanges.length}
                isExpanded={expandedSections.has('awards')}
                onToggle={() => toggleSection('awards')}
              >
                {awardChanges.map((change, idx) => (
                  <ChangeItem key={idx} change={change} />
                ))}
              </ChangeSection>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between border-t border-border bg-paper-tint/40 px-6 py-4">
          <Button variant="outline" onClick={onReject} disabled={isConfirming}>
            <X className="w-4 h-4" />
            {t('tailor.diffModal.rejectButton')}
          </Button>
          <div className="flex items-center gap-3">
            {isConfirming && elapsed > 0 && (
              <span className="text-xs text-steel-grey">{elapsed}s</span>
            )}
            <Button variant="success" onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t('tailor.diffModal.confirmButton')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component: stat tile
interface StatTileProps {
  label: string;
  value: number;
  variant: 'success' | 'warning' | 'danger' | 'info';
}

function StatTile({ label, value, variant }: StatTileProps) {
  const colors = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-indigo-50 text-primary',
  };

  return (
    <div className={`rounded-xl p-3 ${colors[variant]}`}>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs font-medium">{label}</div>
    </div>
  );
}

// Helper component: collapsible change section
interface ChangeSectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ChangeSection({ title, count, isExpanded, onToggle, children }: ChangeSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl p-3.5 transition-colors duration-150 hover:bg-paper-tint motion-reduce:transition-none"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-steel-grey" />
          ) : (
            <ChevronRight className="w-4 h-4 text-steel-grey" />
          )}
          <span className="text-sm font-semibold text-ink">
            {title} <span className="text-steel-grey font-normal">({count})</span>
          </span>
        </div>
      </button>

      {isExpanded && <div className="space-y-2 border-t border-border p-3.5">{children}</div>}
    </div>
  );
}

// Helper component: change item
interface ChangeItemProps {
  change: ResumeFieldDiff;
}

function ChangeItem({ change }: ChangeItemProps) {
  const typeBackgrounds = {
    added: 'bg-emerald-50/60',
    removed: 'bg-red-50/60',
    modified: 'bg-indigo-50/60',
  };

  const typeGlyphColors = {
    added: 'text-emerald-600',
    removed: 'text-red-600',
    modified: 'text-primary',
  };

  const typeLabels = {
    added: '+',
    removed: '−',
    modified: '~',
  };

  return (
    <div className={`rounded-lg p-3 ${typeBackgrounds[change.change_type]}`}>
      <div className="flex items-start gap-2.5">
        <span
          className={`text-base font-bold ${typeGlyphColors[change.change_type]}`}
          aria-hidden="true"
        >
          {typeLabels[change.change_type]}
        </span>
        <div className="flex-1 text-sm">
          {change.original_value && (
            <div className="mb-1 text-red-600 line-through">{change.original_value}</div>
          )}
          {change.new_value && <div className="text-ink-soft">{change.new_value}</div>}
        </div>
        {change.change_type === 'added' && change.confidence === 'high' && (
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
        )}
      </div>
    </div>
  );
}
