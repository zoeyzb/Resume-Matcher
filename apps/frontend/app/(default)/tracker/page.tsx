'use client';

import React from 'react';
import { KanbanBoard } from '@/components/tracker/kanban-board';

export default function TrackerPage() {
  return (
    // Fill the space handed down by the app shell's <main> (viewport minus
    // the top nav) so the board area flexes to the available height and the
    // columns scroll internally.
    <div className="flex h-full w-full flex-col overflow-hidden bg-background px-4 py-4 md:px-6">
      <div className="mx-auto flex min-h-0 w-full max-w-[104rem] flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sw-xs">
        <KanbanBoard />
      </div>
    </div>
  );
}
