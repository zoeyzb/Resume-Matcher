import { ResumePreviewProvider } from '@/components/common/resume_previewer_context';
import { StatusCacheProvider } from '@/lib/context/status-cache';
import { LanguageProvider } from '@/lib/context/language-context';
import { LocalizedErrorBoundary } from '@/components/common/error-boundary';
import { TopNav } from '@/components/common/top-nav';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <StatusCacheProvider>
      <LanguageProvider>
        <ResumePreviewProvider>
          <LocalizedErrorBoundary>
            {/* h-screen + flex-col gives TopNav a fixed height and hands the
                remainder to <main> as a definite size, so pages that size
                themselves with h-full (dashboard, builder, tracker) resolve
                correctly instead of overflowing past the viewport. */}
            <div className="flex h-screen flex-col overflow-hidden">
              <TopNav />
              <main className="min-h-0 flex-1 overflow-y-auto flex flex-col">{children}</main>
            </div>
          </LocalizedErrorBoundary>
        </ResumePreviewProvider>
      </LanguageProvider>
    </StatusCacheProvider>
  );
}
