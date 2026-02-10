'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import React, { createContext, useCallback, useState } from 'react';

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
                  "bg-[rgba(var(--bs-body-bg-rgb,255,255,255),0.7)] backdrop-blur-[8px] rounded-[8px] border border-[var(--bs-border-color-translucent,rgba(0,0,0,0.1))] shadow-[0_0.5rem_1rem_rgba(0,0,0,0.1)] flex flex-col overflow-hidden",
                  toast.type === 'info' && "border-l-4 border-l-[var(--bs-info)]",
                  toast.type === 'error' && "border-l-4 border-l-[var(--bs-danger)]"
                )}
                style={{ listStyle: 'none' }} // Ensure checking CSS doesn't fail
              >
                <div className="flex justify-between items-center py-[0.5rem] px-[0.75rem] bg-[rgba(var(--bs-tertiary-bg-rgb,248,249,250),0.5)] border-b border-[var(--bs-border-color-translucent)]">
                  <ToastPrimitive.Title className="text-[0.85rem] font-bold text-[var(--bs-body-color)] m-0">
                    {toast.type === 'error' ? 'System Error' : 'Notification'}
                  </ToastPrimitive.Title>

                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>just now</small>
                    <ToastPrimitive.Close className="bg-transparent border-0 text-[var(--bs-secondary-color)] cursor-pointer opacity-50 transition-opacity duration-200 px-[4px] text-[1.2rem] leading-none hover:opacity-100" aria-label="Close">
                      <span aria-hidden>×</span>
                    </ToastPrimitive.Close>
                  </div>
                </div>

                <ToastPrimitive.Description className="py-[0.75rem] px-[1rem] text-[var(--bs-body-color)] text-[0.9rem] leading-[1.4]">
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
