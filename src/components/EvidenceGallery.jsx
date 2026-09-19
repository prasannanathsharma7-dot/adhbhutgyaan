import { useEffect, useRef, useState } from 'react';
import { Expand, X } from 'lucide-react';

export default function EvidenceGallery({ items, t, theme = 'light', compact = false }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const closeButtonRef = useRef(null);
    const activeItem = activeIndex === null ? null : items[activeIndex];

    useEffect(() => {
        if (!activeItem) return undefined;
        const previousOverflow = document.body.style.overflow;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setActiveIndex(null);
            if (event.key === 'ArrowRight') setActiveIndex(index => (index + 1) % items.length);
            if (event.key === 'ArrowLeft') setActiveIndex(index => (index - 1 + items.length) % items.length);
        };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', onKeyDown);
        requestAnimationFrame(() => closeButtonRef.current?.focus());
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [activeItem, items.length]);

    return (
        <>
            <div className={`evidence-grid ${compact ? 'evidence-grid-compact' : ''} evidence-${theme}`}>
                {items.map((item, index) => (
                    <button
                        type="button"
                        className="evidence-card"
                        key={item.src}
                        onClick={() => setActiveIndex(index)}
                        aria-label={t(`प्रमाण खोलें: ${item.capHi}`, `View proof: ${item.capEn}`)}
                    >
                        <span className="evidence-image-shell">
                            <img src={item.src} alt={t(item.capHi, item.capEn)} loading="lazy" />
                            <span className="evidence-expand"><Expand size={16} /> {t('पूरा प्रमाण देखें', 'View full proof')}</span>
                            <span className="evidence-badge">{t(item.badge, item.badgeEn)}</span>
                        </span>
                        <span className="evidence-caption">{t(item.capHi, item.capEn)}</span>
                    </button>
                ))}
            </div>

            {activeItem && (
                <div
                    className="evidence-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label={t(activeItem.capHi, activeItem.capEn)}
                    onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}
                >
                    <div className="evidence-modal-panel">
                        <button ref={closeButtonRef} type="button" className="evidence-modal-close" onClick={() => setActiveIndex(null)} aria-label={t('बंद करें', 'Close')}>
                            <X size={22} />
                        </button>
                        <img src={activeItem.src} alt={t(activeItem.capHi, activeItem.capEn)} />
                        <div className="evidence-modal-copy">
                            <strong>{t(activeItem.badge, activeItem.badgeEn)}</strong>
                            <p>{t(activeItem.capHi, activeItem.capEn)}</p>
                            <span>{t('मूल दस्तावेज़/फोटो को बिना काटे दिखाया गया है।', 'Original document/photo shown without cropping.')}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
