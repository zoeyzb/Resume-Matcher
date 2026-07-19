'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Wand2 from 'lucide-react/dist/esm/icons/wand-2';
import Target from 'lucide-react/dist/esm/icons/target';
import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid';
import { useTranslations } from '@/lib/i18n';

const FEATURES = [
  { key: 'tailor', Icon: Wand2 },
  { key: 'ats', Icon: Target },
  { key: 'track', Icon: LayoutGrid },
] as const;

export default function Hero() {
  const { t } = useTranslations();

  return (
    <section className="relative flex min-h-full w-full flex-col items-center overflow-hidden bg-background px-6 py-20 text-center">
      {/* Soft two-tone glow — emerald + gold, kept subtle so it reads as
          depth, not a decoration competing with the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 30% 0%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%), ' +
            'radial-gradient(50% 40% at 80% 10%, color-mix(in srgb, var(--color-gold) 10%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9"
            aria-hidden="true"
          />
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-3 py-1 text-xs font-semibold text-gold">
          <Wand2 className="h-3 w-3" aria-hidden="true" />
          {t('home.eyebrow')}
        </span>

        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-ink md:text-6xl">
          {t('home.brandLine1')} {t('home.brandLine2')}
        </h1>

        <p className="mt-4 max-w-lg text-balance text-base leading-relaxed text-steel-grey md:text-lg">
          {t('home.subtitle')}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sw-sm transition-colors duration-150 hover:bg-[color:var(--color-primary-hover)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t('home.launchApp')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/zoeyzb/Resume-Matcher"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-lg px-6 text-sm font-medium text-steel-grey transition-colors duration-150 hover:text-ink motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="mt-14 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map(({ key, Icon }) => (
          <div
            key={key}
            className="rounded-2xl border border-border bg-card p-5 shadow-sw-xs transition-shadow duration-150 hover:shadow-sw-sm"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">{t(`home.features.${key}.title`)}</p>
            <p className="mt-1 text-sm leading-relaxed text-steel-grey">
              {t(`home.features.${key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
