import { useState } from 'react';
import { Play, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// REAL + PLACEHOLDER MIX:
// Entry 1 is a genuine devotee testimonial clip supplied by the business.
// Entries 2-3 remain deliberate template placeholders (no video src, no
// invented name/city/quote presented as if real) until further real,
// consented clips are supplied - reusing ceremony footage or inventing
// names here would misrepresent what those clips actually show.
//
// NOTE on entry 1: the video's spoken content was not transcribed when
// added, so no quote text is asserted for it - the clip speaks for
// itself. Add `quoteHi`/`quoteEn` (and `name`/`city`, with the devotee's
// consent) once those details are confirmed, rather than paraphrasing
// what the devotee might have said.
const TESTIMONIALS = [
    {
        id: 1,
        video: '/videos/testimonial-1.mp4',
        poster: '/images/testimonials/testimonial-1-poster.jpg',
        name: null,
        city: null,
        quoteHi: null,
        quoteEn: null,
    },
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
                        : hasRealVideo
                            ? t('इस भक्त का अनुभव — उन्हीं की आवाज़ में सुनें।', "This devotee's experience — hear it in their own words.")
                            : t('वास्तविक भक्त प्रतिक्रिया शीघ्र जोड़ी जाएगी।', "Real devotee feedback will be added here soon.")}
                </p>
                <p className="testimonial-video-name">
                    {item.name
                        ? `${item.name}${item.city ? `, ${item.city}` : ''}`
                        : hasRealVideo
                            ? t('अद्भुत ज्ञान के भक्त', 'An Adhbhut Gyaan devotee')
                            : t('भक्त — नाम शीघ्र', 'Devotee — name coming soon')}
                </p>
            </div>
        </div>
    );
}

export default function VideoTestimonials() {
    const { t } = useLanguage();
    return (
        <div className="testimonial-video-grid">
            {TESTIMONIALS.map(item => (
                <TestimonialCard key={item.id} item={item} />
            ))}
        </div>
    );
}
