import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export type AccordionItem = {
  title: string;
  content: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean;
  isRtl?: boolean;
  className?: string;
};

export function Accordion({ items, allowMultiple = false, isRtl = false, className = '' }: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const isOpen = prev.includes(index);
      if (allowMultiple) {
        return isOpen ? prev.filter((item) => item !== index) : [...prev, index];
      }
      return isOpen ? [] : [index];
    });
  };

  const openSet = useMemo(() => new Set(openItems), [openItems]);

  return (
    <div className={`space-y-3 ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {items.map((item, index) => {
        const isOpen = openSet.has(index);
        return (
          <div
            key={`${item.title}-${index}`}
            className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/70 dark:bg-slate-900/60 overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-start group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <span className="text-slate-900 dark:text-white font-semibold text-base sm:text-lg">
                {item.title}
              </span>
              <motion.span
                className="text-slate-500 dark:text-slate-300"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 sm:px-5 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
