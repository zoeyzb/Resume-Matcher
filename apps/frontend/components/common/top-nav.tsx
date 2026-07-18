'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  { href: '/settings', labelKey: 'nav.settings' },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const { t } = useTranslations();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer whenever the route changes (e.g. a link was followed).
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

  return (
    <header className="relative z-40 shrink-0 border-b-2 border-black bg-canvas">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <span className="sr-only sm:not-sr-only">Resume Matcher</span>
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
                  'border border-transparent px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider',
                  'transition-colors duration-100 motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2',
                  active
                    ? 'border-black bg-blue-700 text-white'
                    : 'text-ink-soft hover:bg-paper-tint hover:text-ink'
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center border border-black bg-white md:hidden',
            'shadow-sw-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2'
          )}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          className="border-t-2 border-black bg-canvas motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-150 md:hidden"
        >
          <ul className="flex flex-col divide-y divide-black/10">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider',
                      'focus-visible:outline-none focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-700',
                      active
                        ? 'bg-blue-700 text-white'
                        : 'text-ink-soft hover:bg-paper-tint hover:text-ink'
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
