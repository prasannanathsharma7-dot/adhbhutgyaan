import { useState } from 'react';
import { Play, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// PLACEHOLDER CONTENT NOTICE:
// No real devotee video-testimonial clips exist in this project yet (the
// only video assets on the site are ritual/ceremony footage, not devotees
// speaking to camera - reusing those here with invented names would
// misrepresent what the clip actually shows). The entries below are
// deliberately generic template placeholders (no video src, no specific
// invented name/city/quote presented as if real) so this component is
// ready to receive real content once the business supplies actual
// devotee testimonial clips (with their consent to use name/city/quote).
// Replace each entry's `video`, `name`, `city`, and `quote` with real,
// consented devotee content before this is shown to real site visitors
// as genuine testimonials.
const PLACEHOLDER_TESTIMONIALS = [
    { id: 1, video: null, poster: '/images/gallery/havan-closeup.jpg', name: null, city: null, quoteHi: null, quoteEn: null },
    { id: 2, video: null, poster: '/images/gallery/devi-puja-phal.jpg', name: null, city: null, quoteHi: null, quoteEn: null },
    { id: 3, video: null, poster: '/images/gallery/group-puja.jpg', name: null, city: null, quoteHi: null, quoteEn: null },
];

function TestimonialCard({ item }) {
    const { t } = useLanguage();
    const [playing, setPlaying] = useState(false);
    const hasRealVideo = Boolean(item.video);

    return (
        <div className="testimonial-video-card">
            <div className="testimonial-video-frame">
                {playing && hasRealVideo ? (
                    // Lazy-loaded: the <video> element (and its network
                    // request) only mounts once the user actually clicks
                    // play, not on initial page load.
                    <video src={item.video} controls autoPlay playsInline className="testimonial-video-el" />
                ) : (
                    <button
                        type="button"
                        className="testimonial-video-thumb"
                        onClick={() => hasRealVideo && setPlaying(true)}
                        aria-label={t('वीडियो चलाएं', 'Play video')}
                        style={{ cursor: hasRealVideo ? 'pointer' : 'default' }}
                    >
                        <img src={item.poster} alt="" loading="lazy" />
                        <span className="testimonial-video-play">
                            <Play size={22} fill="white" />
                        </span>
                        {!hasRealVideo && (
                            <span className="testimonial-video-soon-badge">{t('शीघ्र आ रहा है', 'Coming Soon')}</span>
                        )}
                    </button>
                )}
            </div>
            <div className="testimonial-video-body">
                <Quote size={16} style={{ color: 'var(--gold-500)', marginBottom: '0.4rem' }} />
                <p className="testimonial-video-quote">
                    {item.quoteHi || item.quoteEn
                        ? t(item.quoteHi, item.quoteEn)
                        : t('वास्तविक भक्त प्रतिक्रिया शीघ्र जोड़ी जाएगी।', "Real devotee feedback will be added here soon.")}
                </p>
                <p className="testimonial-video-name">
                    {item.name ? `${item.name}${item.city ? `, ${item.city}` : ''}` : t('भक्त — नाम शीघ्र', 'Devotee — name coming soon')}
                </p>
            </div>
        </div>
    );
}

export default function VideoTestimonials() {
    const { t } = useLanguage();
    return (
        <div className="testimonial-video-grid">
            {PLACEHOLDER_TESTIMONIALS.map(item => (
                <TestimonialCard key={item.id} item={item} />
            ))}
        </div>
    );
}
