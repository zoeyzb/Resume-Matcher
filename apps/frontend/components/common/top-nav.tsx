'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import { useTranslations } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Persistent top navigation for the app shell. Hidden on the `/` marketing
 * route, which owns its own full-screen hero + CTA nav.
 */

const NAV_ITEMS = [
  { href: '/dashboard', labelKey: 'nav.dashboard' },
  { href: '/builder', labelKey: 'nav.builder' },
  { href: '/tailor', labelKey: 'nav.tailor' },
  { href: '/tracker', labelKey: 'nav.tracker' },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const { t } = useTranslations();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // The marketing landing page has its own full-screen hero + nav; don't
  // stack a second chrome bar on top of it.
  if (pathname === '/') return null;

  const isActive = (href: string) =>
    pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
  const settingsActive = isActive('/settings');

  return (
    <header className="relative z-40 shrink-0 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="text-[15px] font-bold tracking-tight text-ink">NextRole</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  active
                    ? 'bg-accent text-primary'
                    : 'text-ink-soft hover:bg-paper-tint hover:text-ink'
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Settings sits apart from the core workflow tabs so it doesn't
            compete for attention with the primary navigation. */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/settings"
            aria-current={settingsActive ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              settingsActive
                ? 'bg-accent text-primary'
                : 'text-steel-grey hover:bg-paper-tint hover:text-ink'
            )}
          >
            {t('nav.settings')}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-ink-soft md:hidden',
            'transition-colors duration-150 motion-reduce:transition-none hover:bg-paper-tint',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          )}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          className="border-t border-border bg-white shadow-sw-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-150 md:hidden"
        >
          <ul className="flex flex-col gap-1 p-2">
            {[...NAV_ITEMS, { href: '/settings', labelKey: 'nav.settings' } as const].map(
              (item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-[44px] items-center rounded-lg px-3.5 text-[15px] font-medium',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                        active
                          ? 'bg-accent text-primary'
                          : 'text-ink-soft hover:bg-paper-tint hover:text-ink'
                      )}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              }
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
