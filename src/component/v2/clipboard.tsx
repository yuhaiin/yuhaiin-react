

import { Copy, MousePointer2 } from 'lucide-react';
import reactExports, { useCallback as useCallbackFromReact, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from './button';
import { Textarea } from './input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from './modal';

// useIsomorphicInsertionEffect
const useInsertionEffect
    = typeof window === 'undefined'
        // useInsertionEffect is only available in React 18+

        ? useEffect
        : reactExports.useInsertionEffect || useLayoutEffect;

/**
 * @see https://foxact.skk.moe/use-stable-handler-only-when-you-know-what-you-are-doing-or-you-will-be-fired
 * Similar to useCallback, with a few subtle differences:
 * - The returned function is a stable reference, and will always be the same between renders
 * - No dependency lists required
 * - Properties or state accessed within the callback will always be "current"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useStableHandler<Args extends any[], Result>(
    callback: (...args: Args) => Result
): typeof callback {
    // Keep track of the latest callback:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestRef = useRef<typeof callback>(shouldNotBeInvokedBeforeMount as any);
    useInsertionEffect(() => {
        latestRef.current = callback;
    }, [callback]);

    return useCallbackFromReact<typeof callback>((...args) => {
        const fn = latestRef.current;
        return fn(...args);
    }, []);
}

/**
 * Render methods should be pure, especially when concurrency is used,
 * so we will throw this error if the callback is called while rendering.
 */
function shouldNotBeInvokedBeforeMount() {
    throw new Error(
        'foxact: the stablized handler cannot be invoked before the component has mounted.'
    );
}

/** @see https://foxact.skk.moe/use-typescript-happy-callback */
const useTypeScriptHappyCallback: <Args extends unknown[], R>(
    fn: (...args: Args) => R,
    deps: React.DependencyList
) => (...args: Args) => R = useCallbackFromReact;

const useCallback = useTypeScriptHappyCallback;

class UseClipboardError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UseClipboardError';
    }
}

interface UseClipboardOption {
    timeout?: number,
    usePromptAsFallback?: boolean,
    promptFallbackText?: string,
    onCopyError?: (error: Error) => void
}

/** @see https://foxact.skk.moe/use-clipboard */
export function useClipboard({
    timeout = 1000,
    usePromptAsFallback = false,
    promptFallbackText = 'Your browser blocked automatic clipboard access. Copy the text below manually.',
    onCopyError
}: UseClipboardOption = {}) {
    const [error, setError] = useState<Error | null>(null);
    const [copied, setCopied] = useState(false);
    const [fallbackValue, setFallbackValue] = useState("");
    const fallbackTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const copyTimeoutRef = useRef<number | null>(null);

    const stablizedOnCopyError = useStableHandler<[e: Error], void>(onCopyError ?? (() => undefined));

    const handleCopyResult = useCallback((isCopied: boolean) => {
        if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current);
        }
        if (isCopied) {
            copyTimeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
        }
        setCopied(isCopied);
    }, [timeout]);

    const handleCopyError = useCallback((e: Error) => {
        setError(e);
        stablizedOnCopyError(e);
    }, [stablizedOnCopyError]);

    const selectFallbackText = useCallback(() => {
        const textarea = fallbackTextareaRef.current;
        if (!textarea) return;

        textarea.focus();
        textarea.select();
    }, []);

    const resizeFallbackTextarea = useCallback(() => {
        const textarea = fallbackTextareaRef.current;
        if (!textarea) return;

        const minHeight = 320;
        const maxHeight = Math.max(minHeight, Math.floor(window.innerHeight * 0.58));

        textarea.style.height = 'auto';
        const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = `${nextHeight}px`;
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, []);

    const closeFallback = useCallback(() => {
        setFallbackValue("");
    }, []);

    const copyFallbackText = useCallback(async () => {
        if (!fallbackValue) return;

        try {
            if ('clipboard' in navigator) {
                await navigator.clipboard.writeText(fallbackValue);
            } else {
                selectFallbackText();
                if (!document.execCommand('copy')) {
                    throw new UseClipboardError('[foxact/use-clipboard] document.execCommand copy failed');
                }
            }

            closeFallback();
            handleCopyResult(true);
        } catch (e) {
            selectFallbackText();
            handleCopyError(e as Error);
        }
    }, [closeFallback, fallbackValue, handleCopyError, handleCopyResult, selectFallbackText]);

    useEffect(() => {
        if (!fallbackValue) return;

        const setupTimer = window.setTimeout(() => {
            resizeFallbackTextarea();
            selectFallbackText();
        }, 80);
        window.addEventListener('resize', resizeFallbackTextarea);

        return () => {
            window.clearTimeout(setupTimer);
            window.removeEventListener('resize', resizeFallbackTextarea);
        };
    }, [fallbackValue, resizeFallbackTextarea, selectFallbackText]);

    const copy = useCallback(async (valueToCopy: string) => {
        try {
            if ('clipboard' in navigator) {
                await navigator.clipboard.writeText(valueToCopy);
                handleCopyResult(true);
            } else {
                throw new UseClipboardError('[foxact/use-clipboard] navigator.clipboard is not supported');
            }
        } catch (e) {
            if (usePromptAsFallback) {
                setError(e as Error);
                setFallbackValue(valueToCopy);
            } else {
                handleCopyError(e as Error);
            }
        }
    }, [handleCopyResult, handleCopyError, usePromptAsFallback]);

    const reset = useCallback(() => {
        setCopied(false);
        setError(null);
        setFallbackValue("");
        if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current);
        }
    }, []);

    const manualCopyModal = useMemo(() => (
        <Modal open={fallbackValue !== ""} onOpenChange={(open) => !open && closeFallback()}>
            <ModalContent style={{ maxWidth: '900px' }}>
                <ModalHeader closeButton className="border-b-0 pb-0">
                    <ModalTitle className="font-bold">Copy Manually</ModalTitle>
                </ModalHeader>
                <ModalBody className="pt-2">
                    <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-5">
                        <p className="mb-4 text-sm leading-relaxed text-ui-muted">
                            {promptFallbackText}
                        </p>
                        <Textarea
                            ref={fallbackTextareaRef}
                            readOnly
                            rows={10}
                            wrap="soft"
                            value={fallbackValue}
                            className="min-h-[320px] max-h-[58vh] font-mono text-sm leading-relaxed bg-ui-bg resize-y whitespace-pre-wrap break-all overflow-auto"
                            style={{ height: 320, overflowWrap: 'anywhere' }}
                            onFocus={(e) => e.currentTarget.select()}
                        />
                    </div>
                </ModalBody>
                <ModalFooter bordered={false}>
                    <Button variant="outline-secondary" onClick={selectFallbackText}>
                        <MousePointer2 size={16} className="mr-2" /> Select Text
                    </Button>
                    <Button variant="primary" onClick={copyFallbackText}>
                        <Copy size={16} className="mr-2" /> Copy
                    </Button>
                    <Button onClick={closeFallback}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    ), [closeFallback, copyFallbackText, fallbackValue, promptFallbackText, selectFallbackText]);

    return { copy, reset, error, copied, manualCopyModal };
}
