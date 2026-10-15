import { Link } from 'react-router-dom';
import { SquarePlay, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { videoClips, youtubeUploadsPlaylistId, youtubeChannelId } from '../data/media';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

// Videos & interviews. These used to sit at the bottom of the homepage (3,500+ px on a phone, with
// four embedded players); the homepage now links here instead.
const INTERVIEWS = ['mFPuEkcM2oU', 'Xrawsif2bNs', 'v0JYx-KoB9k'];

export default function Media() {
    const { t } = useLanguage();
    useSEO({
        title: t('वीडियो एवं साक्षात्कार | Adhbhut Gyaan', 'Videos & Interviews | Adhbhut Gyaan'),
        description: t('काशी में सम्पन्न अनुष्ठानों की झलकियाँ एवं डॉ. उमंग नाथ शर्मा के मीडिया साक्षात्कार।', 'Glimpses of rituals performed in Kashi and media interviews with Dr. Umang Nath Sharma.'),
        path: '/media',
        jsonLd: combineJsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Videos & Interviews', path: '/media' }])),
    });

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('वीडियो', 'Videos')}</span></div>
                    <h1>{t('वीडियो एवं साक्षात्कार', 'Videos & Interviews')}</h1>
                    <p className="subtitle">{t('वास्तविक अनुष्ठानों की सजीव झलक — यथावत, बिना किसी बनावट के', 'Real rituals, exactly as they unfold')}</p>
                </div>
            </header>

            <section className="section">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('जीवंत झलकियाँ', 'Live Glimpses')}</span>
                        <h2 className="section-title">{t('वीडियो में हमारी पूजा सेवाएं', 'Our Pooja Services, Captured on Video')}</h2>
                    </div>
                    <div className="video-showcase-grid" style={{ marginTop: '1.5rem' }}>
                        {videoClips.map(clip => (
                            <div className="video-showcase-card" key={clip.src}>
                                <video controls preload="none" poster={clip.poster} playsInline>
                                    <source src={clip.src} type="video/mp4" />
                                </video>
                                <p className="video-showcase-caption">{t(clip.capHi, clip.capEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-warm">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label"><Mic size={14} style={{ marginRight: '0.4rem' }} />{t('मीडिया साक्षात्कार', 'Media Interviews')}</span>
                        <h2 className="section-title">{t('डॉ. उमंग नाथ शर्मा के साक्षात्कार', 'Interviews with Dr. Umang Nath Sharma')}</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
                        {INTERVIEWS.map((id, i) => (
                            <div key={id} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'white', border: '1px solid var(--border-light)' }}>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${id}`} title={`Interview ${i + 1} with Dr. Umang Nath Sharma`}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy"
                                    />
                                </div>
                                <p style={{ padding: '0.85rem 1rem', margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    {t('साक्षात्कार', 'Interview')} {i + 1} — {t('डॉ. उमंग नाथ शर्मा', 'Dr. Umang Nath Sharma')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container text-center">
                    <h3 style={{ marginBottom: '1rem' }}>{t('हमारे YouTube चैनल पर और देखें', 'More on our YouTube channel')}</h3>
                    <div className="youtube-embed-wrapper">
                        <iframe src={`https://www.youtube.com/embed/videoseries?list=${youtubeUploadsPlaylistId}`} title="YouTube video playlist" allowFullScreen loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    </div>
                    <p style={{ marginTop: '1.25rem' }}>
                        <a href={`https://www.youtube.com/channel/${youtubeChannelId}`} target="_blank" rel="noreferrer" className="btn btn-gold">
                            <SquarePlay size={16} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} />{t('YouTube पर सब्सक्राइब करें', 'Subscribe on YouTube')}
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
