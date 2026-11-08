import useSWR from 'swr';
import { getAndroidCapabilities, getAndroidStatus, type AndroidCapabilities } from '@/api/android';

/**
 * Android device controls are available only inside the app's WebView, which
 * holds the platform session. Other clients get null and hide them.
 */
export function useAndroidPlatform(): AndroidCapabilities | null {
    const { data } = useSWR('android/capabilities', () => getAndroidCapabilities(), {
        revalidateOnFocus: true,
        shouldRetryOnError: false,
        dedupingInterval: 30_000,
    });
    return data?.session ? data : null;
}

/** Polls status while visible; VPN reconfiguration never reloads the page. */
export function useAndroidStatus(enabled: boolean) {
    return useSWR(enabled ? 'android/status' : null, getAndroidStatus, {
        refreshInterval: 2000,
        revalidateOnFocus: true,
        keepPreviousData: true,
    });
}
