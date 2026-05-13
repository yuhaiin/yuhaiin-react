import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import { LanguageProvider } from './i18n/LanguageProvider';
import './global.css';
import App from './App';

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
