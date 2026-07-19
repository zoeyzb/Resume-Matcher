'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { useTranslations } from '@/lib/i18n';

export default function Hero() {
  const { t } = useTranslations();

  return (
    <section className="flex h-full w-full flex-col items-center justify-center bg-background px-6 py-16 text-center">
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

      <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-ink md:text-6xl">
        {t('home.brandLine1')} {t('home.brandLine2')}
      </h1>

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
    </section>
  );
}
