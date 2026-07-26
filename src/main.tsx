import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import App from './App';
import './global.css';
import './design-system.css';
import './product-redesign.css';
import './i18n';
import { LanguageProvider } from './i18n/LanguageProvider';
import { setApiUrl } from './common/apiurl';

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const render = () => {
        const root = createRoot(rootElement)
        root.render(
            <StrictMode>
                <SWRConfig value={{
                    revalidateOnFocus: false,
                    dedupingInterval: 2000,
                    shouldRetryOnError: false,
                }}>
                    <LanguageProvider>
                        <App />
                    </LanguageProvider>
                </SWRConfig>
            </StrictMode>,
        )
    }

    const params = new URLSearchParams(window.location.search);
    const apiFromQuery = params.get('api');
    if (apiFromQuery !== null) {
        setApiUrl(apiFromQuery);
    }

    if (import.meta.env.DEV) {
        import('./mocks/browser').then(({ worker }) => {
            if (params.has('mock')) {
                return worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
                    sessionStorage.setItem('yuhaiin_msw_active', '1');
                });
            }
            // A previous preview can leave the MSW service worker registered.
            // Stop interception explicitly when switching back to a real API.
            if (sessionStorage.getItem('yuhaiin_msw_active') === '1') {
                worker.stop();
                sessionStorage.removeItem('yuhaiin_msw_active');
            }
            return undefined;
        }).then(render)
    } else {
        render()
    }
}
