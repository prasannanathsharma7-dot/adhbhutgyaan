import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
// Fonts are self-hosted (was a render-blocking <link> to fonts.googleapis.com).
// Each face carries a unicode-range, so the browser still downloads only the
// subset+weight a page actually uses - Devanagari files load only for Hindi text.
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/800.css';
import '@fontsource/tiro-devanagari-hindi/400.css';
import '@fontsource/tiro-devanagari-hindi/400-italic.css';
import './index.css';

const rootEl = document.getElementById('root');
const app = (
    <React.StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </BrowserRouter>
    </React.StrictMode>
);

// Pages are pre-rendered to real HTML at build time (src/entry-server.jsx), so there is
// something to hydrate: React attaches to the existing markup instead of rebuilding it
// (no flicker, no replayed animations). If a page was not pre-rendered, render normally.
if (rootEl.hasChildNodes()) {
    ReactDOM.hydrateRoot(rootEl, app);
} else {
    ReactDOM.createRoot(rootEl).render(app);
}
