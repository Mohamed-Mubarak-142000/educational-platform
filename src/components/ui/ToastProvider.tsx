import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error';

export type ToastMessage = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue>({} as ToastContextValue);

const toastStyles: Record<ToastType, string> = {
  success: 'border-emerald-200/70 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-900/40 dark:text-emerald-100',
  error: 'border-rose-200/70 bg-rose-50/90 text-rose-900 dark:border-rose-800/70 dark:bg-rose-900/40 dark:text-rose-100',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed right-6 top-20 z-[60] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-[280px] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${toastStyles[toast.type]}`}
            >
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && <p className="text-xs opacity-80 mt-1">{toast.description}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
