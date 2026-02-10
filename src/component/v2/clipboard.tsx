

import reactExports, { useCallback as useCallbackFromReact, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
    promptFallbackText = 'Failed to copy to clipboard automatically, please manually copy the text below.',
    onCopyError
}: UseClipboardOption = {}) {
    const [error, setError] = useState<Error | null>(null);
    const [copied, setCopied] = useState(false);
    const copyTimeoutRef = useRef<number | null>(null);

    const stablizedOnCopyError = useStableHandler<[e: Error], void>(onCopyError);

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
                try {

                    window.prompt(promptFallbackText, valueToCopy);
                } catch (e2) {
                    handleCopyError(e2 as Error);
                }
            } else {
                handleCopyError(e as Error);
            }
        }
    }, [handleCopyResult, promptFallbackText, handleCopyError, usePromptAsFallback]);

    const reset = useCallback(() => {
        setCopied(false);
        setError(null);
        if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current);
        }
    }, []);

    return { copy, reset, error, copied };
}