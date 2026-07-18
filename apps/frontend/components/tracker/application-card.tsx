'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GripVertical from 'lucide-react/dist/esm/icons/grip-vertical';
import Layers from 'lucide-react/dist/esm/icons/layers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';
import type { Application } from '@/lib/api/tracker';
import { cn } from '@/lib/utils';

interface ApplicationCardProps {
  application: Application;
  selected: boolean;
  sharedResume: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export function ApplicationCard({
  application,
  selected,
  sharedResume,
  onToggleSelect,
  onOpen,
}: ApplicationCardProps) {
  const { t } = useTranslations();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.application_id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const company = application.company?.trim();
  const role = application.role?.trim();

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        variant="interactive"
        noPadding
        className={cn('p-3', selected && 'ring-2 ring-primary ring-offset-1')}
      >
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(application.application_id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={t('tracker.card.selectAria')}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-primary"
          />

          <button
            type="button"
            onClick={() => onOpen(application.application_id)}
            className="min-w-0 flex-1 cursor-pointer text-left"
          >
            <p className="truncate text-sm font-semibold text-ink">
              {company || t('tracker.card.companyUnknown')}
            </p>
            <p className="truncate text-xs text-steel-grey">
              {role || t('tracker.card.roleUnknown')}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {application.applied_at && (
                <span className="text-[11px] text-steel-grey">
                  {new Date(application.applied_at).toLocaleDateString()}
                </span>
              )}
              {sharedResume && (
                <Badge variant="neutral" className="gap-1 px-1.5 py-0.5">
                  <Layers className="h-3 w-3" />
                  {t('tracker.card.sharedResume')}
                </Badge>
              )}
            </div>
          </button>

          <button
            type="button"
            className="mt-0.5 shrink-0 cursor-grab text-steel-grey hover:text-ink active:cursor-grabbing"
            aria-label={t('tracker.card.dragAria')}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
