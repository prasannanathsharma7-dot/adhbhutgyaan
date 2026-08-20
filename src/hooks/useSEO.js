import { useEffect } from 'react';

const SITE_URL = 'https://www.adhbhutgyaan.com';

function setMetaTag(attr, key, content) {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(path) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', `${SITE_URL}${path}`);
}

function setJsonLd(id, data) {
    let el = document.getElementById(id);
    if (data) {
        if (!el) {
            el = document.createElement('script');
            el.type = 'application/ld+json';
            el.id = id;
            document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(data);
    } else if (el) {
        el.remove();
    }
}

/**
 * Sets a unique document title, meta description, OG/Twitter tags,
 * canonical URL, and (optionally) a page-specific JSON-LD block.
 * Cleans up the JSON-LD block on unmount so it doesn't leak into the next page.
 */
export default function useSEO({ title, description, path, image, jsonLd, noindex }) {
    useEffect(() => {
        if (title) document.title = title;
        setMetaTag('name', 'title', title);
        setMetaTag('name', 'description', description);
        setMetaTag('property', 'og:title', title);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'twitter:title', title);
        setMetaTag('property', 'twitter:description', description);
        setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
        if (image) {
            setMetaTag('property', 'og:image', image);
            setMetaTag('property', 'twitter:image', image);
        }
        if (path) {
            setCanonical(path);
            setMetaTag('property', 'og:url', `${SITE_URL}${path}`);
            setMetaTag('property', 'twitter:url', `${SITE_URL}${path}`);
        }
        if (jsonLd) {
            setJsonLd('page-jsonld', jsonLd);
        }

        return () => {
            if (jsonLd) setJsonLd('page-jsonld', null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, path, image, JSON.stringify(jsonLd)]);
}
