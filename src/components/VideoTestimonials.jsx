import { useState } from 'react';
import { Play, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Both entries are genuine devotee testimonial clips supplied by the
// business. Keep this section real-only: do not render empty placeholders.
//
// NOTE on entries 1-2: neither clip's spoken content was transcribed
// when added, so no quote text is asserted for either - the clips
// speak for themselves. Add `quoteHi`/`quoteEn` (and `name`/`city`,
// with the devotee's consent) once those details are confirmed, rather
// than paraphrasing what the devotee might have said.
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
    {
        id: 2,
        video: '/videos/testimonial-2.mp4',
        poster: '/images/testimonials/testimonial-2-poster.jpg',
        name: null,
        city: null,
        quoteHi: null,
        quoteEn: null,
    },
];

function TestimonialCard({ item }) {
    const { t } = useLanguage();
    const [playing, setPlaying] = useState(false);
    return (
        <div className="testimonial-video-card">
            <div className="testimonial-video-frame">
                {playing ? (
                    // Lazy-loaded: the <video> element (and its network
                    // request) only mounts once the user actually clicks
                    // play, not on initial page load.
                    <video src={item.video} controls autoPlay playsInline className="testimonial-video-el" />
                ) : (
                    <button
                        type="button"
                        className="testimonial-video-thumb"
                        onClick={() => setPlaying(true)}
                        aria-label={t('वीडियो चलाएं', 'Play video')}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={item.poster} alt="" loading="lazy" />
                        <span className="testimonial-video-play">
                            <Play size={22} fill="white" />
                        </span>
                    </button>
                )}
            </div>
            <div className="testimonial-video-body">
                <Quote size={16} style={{ color: 'var(--gold-500)', marginBottom: '0.4rem' }} />
                <p className="testimonial-video-quote">
                    {item.quoteHi || item.quoteEn
                        ? t(item.quoteHi, item.quoteEn)
                        : t('इस भक्त का सत्यापित वीडियो अनुभव — उन्हीं की आवाज़ में सुनें।', "A verified video experience from this devotee — hear it in their own words.")}
                </p>
                <p className="testimonial-video-name">
                    {item.name
                        ? `${item.name}${item.city ? `, ${item.city}` : ''}`
                        : t('सत्यापित अद्भुत ज्ञान भक्त', 'Verified Adhbhut Gyaan devotee')}
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
