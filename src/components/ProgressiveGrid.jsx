import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Keeps every item in the page markup while showing a concise first view.
 * Visitors can expand the complete collection without navigating away.
 */
export default function ProgressiveGrid({
    items,
    renderItem,
    initialCount = 6,
    className = '',
    mobileRail = false,
    resetKey,
    itemKey = (_item, index) => index,
}) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const gridId = useId();
    const controlRef = useRef(null);
    const hasMore = items.length > initialCount;

    useEffect(() => {
        setExpanded(false);
    }, [resetKey]);

    const toggle = () => {
        if (expanded) {
            setExpanded(false);
            requestAnimationFrame(() => controlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            return;
        }
        setExpanded(true);
    };

    return (
        <>
            <div
                id={gridId}
                className={`${className} progressive-grid${expanded ? ' is-expanded' : ''}${mobileRail ? ' progressive-grid-mobile-rail' : ''}`}
            >
                {items.map((item, index) => (
                    <div
                        className={`progressive-grid-item${index >= initialCount ? ' progressive-grid-extra' : ''}`}
                        key={itemKey(item, index)}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>

            {mobileRail && items.length > 1 && (
                <p className="progressive-swipe-hint" aria-hidden="true">
                    {t('← सभी कार्ड देखने के लिए स्वाइप करें →', '← Swipe to explore the cards →')}
                </p>
            )}

            {hasMore && (
                <div className="progressive-grid-control" ref={controlRef}>
                    <span aria-live="polite">{t(`अभी ${expanded ? items.length : Math.min(initialCount, items.length)} में से ${items.length} दिख रहे हैं`, `Showing ${expanded ? items.length : Math.min(initialCount, items.length)} of ${items.length}`)}</span>
                    <button type="button" onClick={toggle} aria-expanded={expanded} aria-controls={gridId}>
                        {expanded
                            ? <><ChevronUp size={17} /> {t('कम दिखाएं', 'Show fewer')}</>
                            : <><ChevronDown size={17} /> {t(`सभी ${items.length} देखें`, `View all ${items.length}`)}</>}
                    </button>
                </div>
            )}
        </>
    );
}
