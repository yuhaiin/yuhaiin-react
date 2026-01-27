'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useCallback, useState } from 'react';
import styles from './toast.module.css';

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
  Info: () => { },
  Error: (s: string) => { console.error(s) }
};

export const GlobalToastContext = createContext<ToastContextType>(initialState);

export const GlobalToastProvider: React.FC<{ children: React.ReactNode, duration?: number }> = ({
  children,
  duration = 4000
}) => {
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
                className={clsx(styles.root, styles[toast.type])}
                style={{ listStyle: 'none' }} // Ensure checking CSS doesn't fail
              >
                <div className={styles.header}>
                  <ToastPrimitive.Title className={styles.title}>
                    {toast.type === 'error' ? 'System Error' : 'Notification'}
                  </ToastPrimitive.Title>

                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>just now</small>
                    <ToastPrimitive.Close className={styles.close} aria-label="Close">
                      <span aria-hidden>×</span>
                    </ToastPrimitive.Close>
                  </div>
                </div>

                <ToastPrimitive.Description className={styles.description}>
                  {toast.text}
                </ToastPrimitive.Description>
              </motion.li>
            </ToastPrimitive.Root>
          ))}
        </AnimatePresence>

        <ToastPrimitive.Viewport className={styles.viewport} />
      </ToastPrimitive.Provider>
    </GlobalToastContext.Provider>
  );
};