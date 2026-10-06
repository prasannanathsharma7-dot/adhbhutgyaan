// Server-side entry used ONLY at build time (scripts/generate-seo-pages.mjs): renders a page's
// real HTML so it is visible before any JavaScript downloads. The browser then hydrates it
// (src/main.jsx) instead of rebuilding it, so nothing flickers or re-animates.
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { Writable } from 'node:stream';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';

export function render(url) {
    return new Promise((resolve, reject) => {
        let html = '';
        const errors = [];
        const sink = new Writable({
            write(chunk, _enc, cb) { html += chunk.toString(); cb(); },
            final(cb) { resolve({ html, errors }); cb(); },
        });
        const { pipe } = renderToPipeableStream(
            <StaticRouter location={url}>
                <LanguageProvider>
                    <App />
                </LanguageProvider>
            </StaticRouter>,
            {
                // Wait for every lazy route chunk, so the output is the complete page,
                // not a loading spinner.
                onAllReady() { pipe(sink); },
                onShellError: reject,
                onError(err) { errors.push(String((err && err.message) || err)); },
            }
        );
    });
}
