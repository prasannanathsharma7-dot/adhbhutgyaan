import { Languages, Hash, Tag } from 'lucide-react';

/**
 * Lightweight settings toggle bar for the Free Kundli results screen -
 * controls language, numeral system, and planet-label style. Lifts state
 * up via onChange so the parent (FreeKundli.jsx) can re-render the chart/
 * table and include the same settings in the PDF-unlock payload.
 *
 * settings: { lang: 'hi'|'en', numeralSystem: 'latin'|'devanagari',
 *             planetLabelStyle: 'short'|'full' }
 */
export default function KundaliSettingsBar({ settings, onChange }) {
    const update = (key, value) => onChange({ ...settings, [key]: value });

    const segmentStyle = (active) => ({
        padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700,
        border: '1px solid var(--border-gold)', cursor: 'pointer',
        background: active ? 'var(--gold-500)' : 'white',
        color: active ? 'var(--navy-950)' : 'var(--text-secondary)',
    });

    return (
        <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'center',
            background: 'var(--warm-100)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
            padding: '0.9rem 1.25rem', marginBottom: '1.5rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Languages size={15} style={{ color: 'var(--gold-600)' }} />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button type="button" style={segmentStyle(settings.lang === 'hi')} onClick={() => update('lang', 'hi')}>हिंदी</button>
                    <button type="button" style={segmentStyle(settings.lang === 'en')} onClick={() => update('lang', 'en')}>English</button>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={15} style={{ color: 'var(--gold-600)' }} />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button type="button" style={segmentStyle(settings.numeralSystem === 'latin')} onClick={() => update('numeralSystem', 'latin')}>1,2,3</button>
                    <button type="button" style={segmentStyle(settings.numeralSystem === 'devanagari')} onClick={() => update('numeralSystem', 'devanagari')}>१,२,३</button>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={15} style={{ color: 'var(--gold-600)' }} />
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button type="button" style={segmentStyle(settings.planetLabelStyle === 'short')} onClick={() => update('planetLabelStyle', 'short')}>सू०/Su</button>
                    <button type="button" style={segmentStyle(settings.planetLabelStyle === 'full')} onClick={() => update('planetLabelStyle', 'full')}>सूर्य/Sun</button>
                </div>
            </div>
        </div>
    );
}
