'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { clsx } from 'clsx';
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
  Info: (s: string) => { console.log(s) },
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
    setToasts((prev) => [...prev, { text, type, id }]);
  }, []);

  const handleOpenChange = (id: string, open: boolean) => {
    if (!open) {
      // Delay removal to allow CSS exit animation (data-state='closed') to complete
      // If removed immediately from the array, the component disappears instantly without animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }
  };

  const contextValue = React.useMemo(() => ({
    Info: (text: string) => showMessage(text, 'info'),
    Error: (text: string) => showMessage(text, 'error')
  }), [showMessage]);

  return (
    <GlobalToastContext.Provider value={contextValue}>
      {children}

      <ToastPrimitive.Provider swipeDirection="right" duration={duration}>
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={clsx(styles.root, styles[toast.type])}
            onOpenChange={(open) => handleOpenChange(toast.id, open)}
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
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className={styles.viewport} />
      </ToastPrimitive.Provider>
    </GlobalToastContext.Provider>
  );
};