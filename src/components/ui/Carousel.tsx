import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, TouchEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type CarouselPerView = {
  base: number;
  md?: number;
  lg?: number;
};

export type CarouselProps = {
  items: ReactNode[];
  perView?: CarouselPerView;
  autoplayMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
  isRtl?: boolean;
  className?: string;
  ariaPrevLabel?: string;
  ariaNextLabel?: string;
  ariaSlideLabel?: string;
};

export function Carousel({
  items,
  perView = { base: 1, md: 2, lg: 3 },
  autoplayMs = 5000,
  showArrows = true,
  showDots = true,
  isRtl = false,
  className = '',
  ariaPrevLabel,
  ariaNextLabel,
  ariaSlideLabel,
}: CarouselProps) {
  const { t } = useTranslation();
  const [itemsPerView, setItemsPerView] = useState(perView.base);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Use translation defaults if labels not provided
  const prevLabel = ariaPrevLabel || t('previous');
  const nextLabel = ariaNextLabel || t('next');
  const slideLabel = ariaSlideLabel || t('slide');

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerView));
  const safeActiveIndex = activeIndex % totalPages;
  // Clamp the last page's offset so it always shows a full set of items
  // (overlapping the previous page) instead of leaving empty trailing space
  // when items.length isn't a multiple of itemsPerView.
  const maxItemOffset = Math.max(0, items.length - itemsPerView);
  const itemOffset = Math.min(safeActiveIndex * itemsPerView, maxItemOffset);
  const shiftPercent = itemOffset * (100 / itemsPerView);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(perView.base);
      else if (width < 1024) setItemsPerView(perView.md ?? perView.base);
      else setItemsPerView(perView.lg ?? perView.md ?? perView.base);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, [perView.base, perView.md, perView.lg]);

  useEffect(() => {
    if (autoplayMs <= 0 || totalPages <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalPages);
    }, autoplayMs);

    return () => window.clearInterval(intervalId);
  }, [autoplayMs, totalPages]);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalPages);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX || 0;
    touchEndX.current = touchStartX.current;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0]?.clientX || 0;
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (Math.abs(deltaX) < 50) return;

    const shouldGoNext = isRtl ? deltaX < 0 : deltaX > 0;
    if (shouldGoNext) handleNext();
    else handlePrevious();
  };

  const dots = useMemo(() => Array.from({ length: totalPages }), [totalPages]);

  return (
    <div className={`relative ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex w-full"
          animate={{ x: `${(isRtl ? 1 : -1) * shiftPercent}%` }}
          transition={{ type: 'spring', stiffness: 140, damping: 24 }}
        >
          {items.map((item, index) => (
            <div
              key={`carousel-item-${index}`}
              className="px-3 flex-shrink-0"
              style={{ flexBasis: `${100 / itemsPerView}%` }}
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {showArrows && totalPages > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            aria-label={prevLabel}
            className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? '-right-4' : '-left-4'} w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}
          >
            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label={nextLabel}
            className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? '-left-4' : '-right-4'} w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}
          >
            <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </>
      )}

      {showDots && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {dots.map((_, index) => (
            <button
              key={`slide-${index}`}
              type="button"
              aria-label={`${slideLabel} ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${safeActiveIndex === index ? 'w-7 bg-violet-600 dark:bg-violet-400' : 'w-2.5 bg-slate-300 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
