import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SPLASH_KEY = 'academix_splash_shown';

/**
 * Splash screen shown once per browser session on the very first visit.
 * After the animation completes, it unmounts and never shows again for the session.
 */
export default function SplashScreen() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => {
    // Only show if not already shown this session
    return !sessionStorage.getItem(SPLASH_KEY);
  });

  useEffect(() => {
    if (!visible) return;

    sessionStorage.setItem(SPLASH_KEY, '1');

    // Auto-dismiss after 2.8 s
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 dark:from-blue-900 dark:via-blue-800 dark:to-slate-900"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          {/* Radial light glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center gap-8 px-8">
            {/* Logo — scale in + float */}
            <motion.div
              className="relative"
              initial={{ scale: 0.3, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Ripple rings */}
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-3xl border-2 border-white/30"
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
                />
              ))}
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-2xl flex items-center justify-center">
                <img src="/academix-logo.svg" alt={t('brandName')} className="w-14 h-14 drop-shadow-lg" />
              </div>
            </motion.div>

            {/* Brand text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <h1 className="text-4xl font-extrabold text-white tracking-tight">{t('brandName')}</h1>
              <motion.p
                className="text-blue-100 text-base mt-2 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
              >
                {t('tagline')}
              </motion.p>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-white/60 text-sm text-center max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              {t('splashTagline')}
            </motion.p>

            {/* Loading dots */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/70"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
