import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global.css';
import './i18n';
import { LanguageProvider } from './i18n/LanguageProvider';

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = createRoot(rootElement)
    root.render(
        <StrictMode>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </StrictMode>,
    )
}
