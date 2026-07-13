'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import React, { createContext, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- Types ---

interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'error';
}

interface ToastContextType {
  Info: (text: string) => void;
  Error: (text: string) => void;
}

const initialState: ToastContextType = {
  Info: (s: string) => { console.log(s) },
  Error: (s: string) => { console.error(s) }
};

export const GlobalToastContext = createContext<ToastContextType>(initialState);

export const GlobalToastProvider: React.FC<{ children: React.ReactNode, duration?: number }> = ({
  children,
  duration = 4000
}) => {
  const { t } = useTranslation('common');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showMessage = useCallback((text: string, type: 'info' | 'error') => {
    // ID generation with best compatibility: timestamp + random string
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    // Limit max toasts to avoid clutter
    setToasts((prev) => {
      const newToasts = [...prev, { text, type, id }];
      if (newToasts.length > 5) return newToasts.slice(newToasts.length - 5);
      return newToasts;
    });
  }, []);

  const handleOpenChange = (id: string, open: boolean) => {
    if (!open) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const contextValue = React.useMemo(() => ({
    Info: (text: string) => showMessage(text, 'info'),
    Error: (text: string) => showMessage(text, 'error')
  }), [showMessage]);

  return (
    <GlobalToastContext.Provider value={contextValue}>
      {children}

      <ToastPrimitive.Provider duration={duration}>
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((toast) => (
            <ToastPrimitive.Root
              key={toast.id}
              asChild
              forceMount
              onOpenChange={(open) => handleOpenChange(toast.id, open)}
            >
              <motion.li
                layout
                initial={{ opacity: 0, x: 200, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 200, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 300 }}
                dragElastic={0.05}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) {
                    handleOpenChange(toast.id, false);
                  }
                }}
                className={clsx(
                  "bg-ui-surface/80 backdrop-blur-[8px] rounded-ui-sm border border-ui-border shadow-ui-card flex flex-col overflow-hidden",
                  toast.type === 'info' && "border-l-4 border-l-ui-info",
                  toast.type === 'error' && "border-l-4 border-l-ui-danger"
                )}
                style={{ listStyle: 'none' }} // Ensure checking CSS doesn't fail
              >
                <div className="flex justify-between items-center py-[0.5rem] px-[0.75rem] bg-ui-surface-muted/60 border-b border-ui-border">
                  <ToastPrimitive.Title className="text-[0.85rem] font-bold text-ui-fg m-0">
                    {toast.type === 'error' ? t('toast.systemError') : t('toast.notification')}
                  </ToastPrimitive.Title>

                  <div className="flex items-center gap-2">
                    <small className="text-ui-muted text-xs">{t('toast.justNow')}</small>
                    <ToastPrimitive.Close className="bg-transparent border-0 text-ui-muted cursor-pointer opacity-50 transition-opacity duration-200 px-[4px] text-[1.2rem] leading-none hover:opacity-100" aria-label={t('action.close')}>
                      <span aria-hidden>×</span>
                    </ToastPrimitive.Close>
                  </div>
                </div>

                <ToastPrimitive.Description className="py-[0.75rem] px-[1rem] text-ui-fg text-[0.9rem] leading-[1.4]">
                  {toast.text}
                </ToastPrimitive.Description>
              </motion.li>
            </ToastPrimitive.Root>
          ))}
        </AnimatePresence>

        <ToastPrimitive.Viewport className="fixed top-0 right-0 flex flex-col p-[20px] gap-[10px] w-[380px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
      </ToastPrimitive.Provider>
    </GlobalToastContext.Provider>
  );
};
