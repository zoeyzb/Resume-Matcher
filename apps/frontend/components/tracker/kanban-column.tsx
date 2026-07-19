'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslations } from '@/lib/i18n';
import type { Application, ApplicationStatus } from '@/lib/api/tracker';
import { ApplicationCard } from './application-card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  selectedIds: Set<string>;
  sharedResumeIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export function KanbanColumn({
  status,
  applications,
  selectedIds,
  sharedResumeIds,
  onToggleSelect,
  onOpen,
}: KanbanColumnProps) {
  const { t } = useTranslations();
  // Droppable wrapper so EMPTY columns still accept a dropped card. The id is
  // namespaced ("column:<status>") to disambiguate from card ids.
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col p-3 sm:w-80">
      <div className="mb-2 flex items-center justify-between px-1 pb-2">
        <h2 className="text-sm font-semibold text-ink">{t(`tracker.columns.${status}`)}</h2>
        <span className="rounded-full bg-paper-tint px-2 py-0.5 text-xs font-medium text-steel-grey">
          {applications.length}
        </span>
      </div>

      <SortableContext
        items={applications.map((a) => a.application_id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl p-1 transition-colors duration-150 motion-reduce:transition-none',
            isOver && 'bg-emerald-50/60'
          )}
        >
          {applications.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-2 py-6 text-center text-xs text-steel-grey">
              {t('tracker.columns.empty')}
            </p>
          ) : (
            applications.map((application) => (
              <ApplicationCard
                key={application.application_id}
                application={application}
                selected={selectedIds.has(application.application_id)}
                sharedResume={
                  application.master_resume_id !== null &&
                  sharedResumeIds.has(application.master_resume_id)
                }
                onToggleSelect={onToggleSelect}
                onOpen={onOpen}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
