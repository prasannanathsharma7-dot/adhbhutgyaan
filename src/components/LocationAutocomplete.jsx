import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Reusable city/place autocomplete - shows a dropdown of matching
// locations as the user types (debounced), using the same Nominatim
// (OpenStreetMap) API already used for geocoding on submit elsewhere in
// this project. Falls back gracefully to plain free-text entry if the
// API errors out or returns nothing - never blocks the user from typing
// and submitting a location manually.
export default function LocationAutocomplete({ id, value, onChange, onSelect, placeholder, className, hasError }) {
    const { t } = useLanguage();
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const debounceTimer = useRef(null);
    const wrapperRef = useRef(null);
    const abortController = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => () => {
        clearTimeout(debounceTimer.current);
        abortController.current?.abort();
    }, []);

    const fetchSuggestions = (query) => {
        clearTimeout(debounceTimer.current);
        if (!query || query.trim().length < 3) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        debounceTimer.current = setTimeout(async () => {
            abortController.current?.abort();
            abortController.current = new AbortController();
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
                const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: abortController.current.signal });
                if (!res.ok) throw new Error('geocoding failed');
                const results = await res.json();
                setSuggestions(Array.isArray(results) ? results : []);
                setHighlightedIndex(-1);
            } catch (e) {
                if (e.name !== 'AbortError') setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 400);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(val);
        setIsOpen(true);
        fetchSuggestions(val);
    };

    const handleSelect = (suggestion) => {
        const label = suggestion.display_name.split(',').slice(0, 3).join(',').trim();
        onChange(label);
        setIsOpen(false);
        setSuggestions([]);
        onSelect?.({ label, latitude: parseFloat(suggestion.lat), longitude: parseFloat(suggestion.lon), isIndia: suggestion.address?.country_code === 'in' });
    };

    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <input
                id={id}
                className={className}
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onFocus={() => value && value.trim().length >= 3 && setIsOpen(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
            />
            {isLoading && (
                <Loader2 size={15} className="spin" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            )}
            {isOpen && (suggestions.length > 0) && (
                <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)', marginTop: '0.3rem', maxHeight: '220px', overflowY: 'auto',
                    listStyle: 'none', padding: '0.3rem 0',
                }}>
                    {suggestions.map((s, i) => (
                        <li
                            key={s.place_id || i}
                            onMouseDown={() => handleSelect(s)}
                            onMouseEnter={() => setHighlightedIndex(i)}
                            style={{
                                padding: '0.6rem 0.85rem', cursor: 'pointer', fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: i === highlightedIndex ? 'var(--cream)' : 'transparent',
                            }}
                        >
                            <MapPin size={13} style={{ color: 'var(--gold-600)', flexShrink: 0 }} />
                            <span>{s.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
            {isOpen && !isLoading && value && value.trim().length >= 3 && suggestions.length === 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
                    marginTop: '0.3rem', padding: '0.6rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)',
                }}>
                    {t('कोई सुझाव नहीं मिला — आप स्वयं टाइप करना जारी रख सकते हैं।', "No suggestions found - you can keep typing it manually.")}
                </div>
            )}
        </div>
    );
}
