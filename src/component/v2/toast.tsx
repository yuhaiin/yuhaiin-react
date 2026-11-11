
import * as ToastPrimitive from '@radix-ui/react-toast';
import { clsx } from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import React, { createContext, useCallback, useState } from 'react';
import { motionTiming } from './styles';
import { CircleAlert, Info, X } from 'lucide-react';
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
  const reduced = useReducedMotion();
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
              <motion.li data-ui-transition="toast"
                layout
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: reduced ? 0 : motionTiming.fast } }}
                transition={{ duration: reduced ? 0 : motionTiming.normal, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 300 }}
                dragElastic={0.05}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) {
                    handleOpenChange(toast.id, false);
                  }
                }}
                className="pointer-events-auto flex items-start gap-3 rounded-ui-lg border border-ui-border bg-ui-surface-raised py-1.5 pl-3 pr-1 shadow-ui-elevated"
                style={{ listStyle: 'none' }} // Ensure checking CSS doesn't fail
              >
                <span aria-hidden className={clsx(
                  "mt-2 flex size-7 shrink-0 items-center justify-center rounded-full",
                  toast.type === 'error' ? "bg-ui-danger-soft text-ui-danger" : "bg-ui-info-soft text-ui-info",
                )}>
                  {toast.type === 'error' ? <CircleAlert size={16} /> : <Info size={16} />}
                </span>

                {/* A notice is one line of text; only errors carry a visible heading. */}
                <div className="min-w-0 flex-1 py-3">
                  <ToastPrimitive.Title className={toast.type === 'error' ? "m-0 mb-0.5 text-sm font-semibold leading-5 text-ui-danger" : "sr-only"}>
                    {toast.type === 'error' ? t('toast.systemError') : t('toast.notification')}
                  </ToastPrimitive.Title>
                  <ToastPrimitive.Description className="m-0 max-h-40 overflow-y-auto break-words text-sm leading-5 text-ui-fg">
                    {toast.text}
                  </ToastPrimitive.Description>
                </div>

                <ToastPrimitive.Close className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-ui-md border-0 bg-transparent text-ui-muted transition-colors duration-200 hover:text-ui-fg focus-visible:ring-2 focus-visible:ring-ui-focus" aria-label={t('action.close')}>
                  <X size={16} aria-hidden />
                </ToastPrimitive.Close>
              </motion.li>
            </ToastPrimitive.Root>
          ))}
        </AnimatePresence>

        {/* The phone App Bar (below lg) owns the top edge, so notices sit just below it
            and follow it up when it scrolls away; the bottom holds the tab bar and
            sticky Save bars. The empty viewport must not swallow taps on the page. */}
        <ToastPrimitive.Viewport className="pointer-events-none fixed inset-x-0 top-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top)-var(--app-bar-collapse,0px))] z-[2147483647] m-0 flex list-none flex-col gap-2 px-[var(--page-gutter)] pt-2 outline-none transition-[top] duration-[var(--motion-slow)] ease-[var(--ease-standard)] sm:left-auto sm:w-[380px] lg:top-[env(safe-area-inset-top)] lg:p-5" />
      </ToastPrimitive.Provider>
    </GlobalToastContext.Provider>
  );
};
