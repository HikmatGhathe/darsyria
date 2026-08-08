'use client';

import {useState, useEffect, useCallback} from 'react';
import {useTranslations} from 'next-intl';
import type {PropertyImage} from '@/lib/properties';

// Viewer-facing photo gallery. Renders the same thumbnail grid the detail page
// showed before, but each photo now opens a fullscreen lightbox with prev/next
// navigation (buttons, keyboard arrows, and swipe). This is a client component,
// but because Next.js server-renders client components too, the <img> tags are
// still in the initial HTML — so the photos stay crawlable.
export default function PropertyGallery({
  images,
  title
}: {
  images: PropertyImage[];
  title: string;
}) {
  const t = useTranslations('PropertyDisplay');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  // Keyboard navigation while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    // Lock background scroll while the overlay is up.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, close, next, prev]);

  if (images.length === 0) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-3">{t('imagesSection')}</h2>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={t('galleryOpen', {index: i + 1, total: images.length})}
            className="group relative aspect-square bg-surface-page rounded-lg overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-brand-navy"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.public_url}
              alt={img.original_filename || title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading={i === 0 ? undefined : 'lazy'}
            />
            {img.position === 0 && (
              <span className="absolute top-2 start-2 px-2 py-0.5 bg-brand-navy text-white text-xs font-medium rounded-full">
                {t('coverBadge')}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          {/* Top bar: counter + close */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm font-medium tabular-nums">
              {t('galleryCounter', {current: (openIndex ?? 0) + 1, total: images.length})}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={t('galleryClose')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main image + side arrows */}
          <div className="relative flex-1 flex items-center justify-center px-4 min-h-0">
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label={t('galleryPrev')}
                className="absolute start-3 md:start-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.public_url}
              alt={active.original_filename || title}
              className="max-h-full max-w-full object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label={t('galleryNext')}
                className="absolute end-3 md:end-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto px-4 py-3 justify-start sm:justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={t('galleryOpen', {index: i + 1, total: images.length})}
                  className={`relative h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 transition ${
                    i === openIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.public_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
