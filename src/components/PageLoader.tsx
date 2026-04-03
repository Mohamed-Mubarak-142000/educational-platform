import { motion } from 'framer-motion';

/**
 * Full-screen loading page shown while the app is initializing auth state.
 * Matches the project's blue/slate color scheme and uses the BioVerse logo.
 */
export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-60" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-200 dark:bg-blue-800/20 blur-3xl opacity-40" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo with pulse ring */}
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-3xl bg-blue-200 dark:bg-blue-800/40"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="relative w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <img src="/bioverse-logo.svg" alt="BioVerse" className="w-12 h-12" />
          </motion.div>
        </div>

        {/* Brand name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">BioVerse</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Biology Educational Platform</p>
        </motion.div>

        {/* Animated progress bar */}
        <motion.div
          className="w-48 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </div>
  );
}
