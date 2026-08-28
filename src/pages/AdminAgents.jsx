import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

const AGENTS = [
    { id: 'agent1', name: 'Agent 1: Kundli Pre-Analyzer', icon: '🔮', desc: 'Vedic chart, doshas & Pandit dossier' },
    { id: 'agent2', name: 'Agent 2: WhatsApp Concierge', icon: '💬', desc: 'Intent classification & response simulator' },
    { id: 'agent3', name: 'Agent 3: Daily Panchang Cron', icon: '☀️', desc: 'Varanasi ephemeris & subscriber broadcast' },
    { id: 'agent4', name: 'Agent 4: Post-Pooja Delivery', icon: '📹', desc: 'Video proof, sankalp letter & feedback' },
    { id: 'agent5', name: 'Agent 5: Vedic SEO Studio', icon: '📝', desc: 'Schema-ready Markdown article generator' },
];

export default function AdminAgents() {
    useSEO({ title: 'AI Automation Suite | Adhbhut Gyaan Admin', noindex: true });

    // Authentication from URL parameter or Session Storage
    const [adminKey, setAdminKey] = useState(() => {
        try {
            if (typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                const urlKey = params.get('key') || params.get('auth') || params.get('secret');
                if (urlKey && urlKey.trim()) {
                    const cleanKey = urlKey.trim();
                    try {
                        sessionStorage.setItem('ag_admin_key', cleanKey);
                        sessionStorage.setItem('ag_admin_auth', cleanKey);
                    } catch { /* ignore */ }
                    return cleanKey;
                }
            }
            return sessionStorage.getItem('ag_admin_key') || sessionStorage.getItem('ag_admin_auth') || '';
        } catch {
            return '';
        }
    });

    const [keyInput, setKeyInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [activeTab, setActiveTab] = useState('agent1');
    const [copiedKey, setCopiedKey] = useState('');

    // Agent 1 State (Kundli Pre-Analyzer)
    const [a1Form, setA1Form] = useState({
        name: 'Rahul Sharma',
        gotra: 'Kashyap',
        birthDate: '1996-08-15',
        birthTime: '07:45',
        birthPlace: 'Varanasi, Uttar Pradesh',
        concern: 'Career stagnation and marriage delay. Is there any active Kalsarp or Manglik dosh?',
    });
    const [a1Result, setA1Result] = useState(null);
    const [a1Loading, setA1Loading] = useState(false);
    const [a1Error, setA1Error] = useState('');

    // Agent 2 State (WhatsApp Concierge)
    const [a2Query, setA2Query] = useState('Namaste Pandit Ji, I want to book Kalsarp Dosh pooja in Kashi for my family. What are the dates and samagri?');
    const [a2Name, setA2Name] = useState('Ananya Verma');
    const [a2Result, setA2Result] = useState(null);
    const [a2Loading, setA2Loading] = useState(false);
    const [a2Error, setA2Error] = useState('');

    // Agent 3 State (Daily Panchang)
    const [a3Date, setA3Date] = useState(() => new Date().toISOString().slice(0, 10));
    const [a3Broadcast, setA3Broadcast] = useState(false);
    const [a3Result, setA3Result] = useState(null);
    const [a3Loading, setA3Loading] = useState(false);
    const [a3Error, setA3Error] = useState('');

    // Agent 4 State (Post-Pooja Delivery)
    const [a4Form, setA4Form] = useState({
        name: 'Vikramaditya Roy',
        gotra: 'Bharadwaj',
        serviceName: 'Kashi Rudrabhishek with Namakam-Chamakam',
        phone: '919876543210',
        email: 'devotee.sample@example.com',
        mediaUrl: 'https://drive.google.com/file/d/1SampleKashiSankalpProofVideo/view?usp=sharing',
        notes: 'Pooja completed at Dashashwamedh Ghat with milk, belpatra, and bhasma.',
    });
    const [a4Result, setA4Result] = useState(null);
    const [a4Loading, setA4Loading] = useState(false);
    const [a4Error, setA4Error] = useState('');

    // Agent 5 State (Vedic SEO Studio)
    const [a5Topic, setA5Topic] = useState('rudrabhishek');
    const [a5ViewMode, setA5ViewMode] = useState('markdown'); // markdown | faqs | jsonld
    const [a5Result, setA5Result] = useState(null);
    const [a5Loading, setA5Loading] = useState(false);
    const [a5Error, setA5Error] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const trimmed = keyInput.trim();
        if (!trimmed) return;
        setAuthError('');
        try {
            sessionStorage.setItem('ag_admin_key', trimmed);
            sessionStorage.setItem('ag_admin_auth', trimmed);
        } catch { /* ignore */ }
        setAdminKey(trimmed);
    };

    const handleLogout = () => {
        try {
            sessionStorage.removeItem('ag_admin_key');
            sessionStorage.removeItem('ag_admin_auth');
        } catch { /* ignore */ }
        setAdminKey('');
        setKeyInput('');
    };

    const copyToClipboard = (text, keyName) => {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedKey(keyName);
                setTimeout(() => setCopiedKey(''), 2500);
            });
        } else {
            prompt('Copy text:', text);
        }
    };

    // Agent 1 Execution
    const runAgent1 = async () => {
        setA1Loading(true);
        setA1Error('');
        setA1Result(null);
        try {
            const res = await fetch('/api/agents/kundli-preanalyzer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-auth': adminKey,
                },
                body: JSON.stringify(a1Form),
            });
            const data = await res.json();
            if (res.status === 401) {
                setAuthError('Authentication failed. Please re-enter Admin Key.');
                setAdminKey('');
                return;
            }
            if (data.ok) {
                setA1Result(data.draft);
            } else {
                setA1Error(data.error || 'Failed to analyze Vedic chart.');
            }
        } catch (err) {
            setA1Error('Network error connecting to Agent 1 endpoint.');
        } finally {
            setA1Loading(false);
        }
    };

    // Agent 2 Execution
    const runAgent2 = async () => {
        setA2Loading(true);
        setA2Error('');
        setA2Result(null);
        try {
            const res = await fetch('/api/agents/whatsapp-concierge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-auth': adminKey,
                },
                body: JSON.stringify({
                    message: a2Query,
                    name: a2Name,
                    phone: '919278148269',
                }),
            });
            const data = await res.json();
            if (res.status === 401) {
                setAuthError('Authentication failed.');
                setAdminKey('');
                return;
            }
            if (data.ok) {
                setA2Result(data);
            } else {
                setA2Error(data.error || 'Failed to classify message.');
            }
        } catch (err) {
            setA2Error('Network error connecting to Agent 2 endpoint.');
        } finally {
            setA2Loading(false);
        }
    };

    // Agent 3 Execution
    const runAgent3 = async () => {
        setA3Loading(true);
        setA3Error('');
        setA3Result(null);
        try {
            const res = await fetch('/api/agents/daily-panchang-cron', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-auth': adminKey,
                },
                body: JSON.stringify({
                    date: a3Date,
                    broadcast: a3Broadcast,
                }),
            });
            const data = await res.json();
            if (res.status === 401) {
                setAuthError('Authentication failed.');
                setAdminKey('');
                return;
            }
            if (data.ok) {
                setA3Result(data);
            } else {
                setA3Error(data.error || 'Failed to calculate Panchang.');
            }
        } catch (err) {
            setA3Error('Network error connecting to Agent 3 endpoint.');
        } finally {
            setA3Loading(false);
        }
    };

    // Agent 4 Execution
    const runAgent4 = async () => {
        setA4Loading(true);
        setA4Error('');
        setA4Result(null);
        try {
            const res = await fetch('/api/agents/post-pooja-delivery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-auth': adminKey,
                },
                body: JSON.stringify(a4Form),
            });
            const data = await res.json();
            if (res.status === 401) {
                setAuthError('Authentication failed.');
                setAdminKey('');
                return;
            }
            if (data.ok) {
                setA4Result(data);
            } else {
                setA4Error(data.error || 'Failed to dispatch post-pooja proof.');
            }
        } catch (err) {
            setA4Error('Network error connecting to Agent 4 endpoint.');
        } finally {
            setA4Loading(false);
        }
    };

    // Agent 5 Execution
    const runAgent5 = async () => {
        setA5Loading(true);
        setA5Error('');
        setA5Result(null);
        try {
            const res = await fetch('/api/agents/seo-content-drafter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-auth': adminKey,
                },
                body: JSON.stringify({
                    topic: a5Topic,
                    saveToDb: true,
                }),
            });
            const data = await res.json();
            if (res.status === 401) {
                setAuthError('Authentication failed.');
                setAdminKey('');
                return;
            }
            if (data.ok) {
                setA5Result(data.article);
            } else {
                setA5Error(data.error || 'Failed to generate SEO article.');
            }
        } catch (err) {
            setA5Error('Network error connecting to Agent 5 endpoint.');
        } finally {
            setA5Loading(false);
        }
    };

    if (!adminKey) {
        return (
            <div className="section" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
                <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🤖</span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>AI Automation Suite</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Visual Control Center for 5 Vedic AI Microservices
                            </p>
                        </div>
                        <form onSubmit={handleLogin}>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label" htmlFor="agent-admin-key" style={{ fontWeight: 600 }}>
                                    Admin Secret Key
                                </label>
                                <input
                                    id="agent-admin-key"
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter ADMIN_SECRET_KEY"
                                    value={keyInput}
                                    onChange={e => setKeyInput(e.target.value)}
                                    autoFocus
                                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                                />
                            </div>
                            {authError && <p className="form-error" style={{ marginBottom: '1rem' }}>⚠ {authError}</p>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                                🔓 Access AI Control Center
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <header className="page-header" style={{ padding: '2rem 0', background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-850) 100%)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '1.6rem' }}>🤖</span>
                            <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 3.5vw, 1.85rem)', color: 'white' }}>5-Agent AI Automation Suite</h1>
                        </div>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
                            Visual execution & simulation center for Adhbhut Gyaan Vedic AI Microservices
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to="/admin" className="btn btn-outline-light" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                            📋 Bookings
                        </Link>
                        <Link to="/admin/analytics" className="btn btn-outline-light" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                            📊 Analytics
                        </Link>
                        <button type="button" onClick={handleLogout} className="btn btn-outline-light" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Agent Selector Tabs */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div className="container" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                    {AGENTS.map(agent => (
                        <button
                            key={agent.id}
                            type="button"
                            onClick={() => setActiveTab(agent.id)}
                            style={{
                                padding: '0.65rem 1.1rem',
                                border: 'none',
                                background: activeTab === agent.id ? 'var(--navy-900)' : 'transparent',
                                color: activeTab === agent.id ? 'var(--gold-400)' : 'var(--text-secondary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <span>{agent.icon}</span>
                            <span>{agent.name.split(':')[1] || agent.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <section className="section" style={{ paddingTop: '2rem', paddingBottom: '4rem', background: '#f8fafc' }}>
                <div className="container">

                    {/* ========================================================================= */}
                    {/* AGENT 1: KUNDLI PRE-ANALYZER & ASTROLOGICAL DRAFTER */}
                    {/* ========================================================================= */}
                    {activeTab === 'agent1' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
                            {/* Input Form */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900)' }}>🔮 Agent 1: Kundli Pre-Analyzer</h2>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vedic Ephemeris & Dosha Detection Engine</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setA1Form({
                                            name: 'Amitabh Mishra',
                                            gotra: 'Vashistha',
                                            birthDate: '1993-11-22',
                                            birthTime: '18:30',
                                            birthPlace: 'Varanasi, India',
                                            concern: 'Severe business losses and Shani Sade Sati period. Seeking Kashi remedy.',
                                        })}
                                        className="btn btn-outline-dark"
                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                                    >
                                        Fill Sample Profile
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Devotee Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={a1Form.name}
                                            onChange={e => setA1Form({ ...a1Form, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Gotra</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={a1Form.gotra}
                                            onChange={e => setA1Form({ ...a1Form, gotra: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Birth Date (DOB)</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={a1Form.birthDate}
                                            onChange={e => setA1Form({ ...a1Form, birthDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Birth Time (TOB)</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={a1Form.birthTime}
                                            onChange={e => setA1Form({ ...a1Form, birthTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Birth Place (POB)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={a1Form.birthPlace}
                                        onChange={e => setA1Form({ ...a1Form, birthPlace: e.target.value })}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Devotee's Concern / Question</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        value={a1Form.concern}
                                        onChange={e => setA1Form({ ...a1Form, concern: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={runAgent1}
                                    disabled={a1Loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                >
                                    {a1Loading ? '⚡ Analyzing Ephemeris & Doshas…' : '🔮 Generate Vedic Chart & Draft Dossier'}
                                </button>
                                {a1Error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠ {a1Error}</p>}
                            </div>

                            {/* Output Preview */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900)' }}>Preliminary Chart Dossier</h3>
                                    {a1Result && (
                                        <span style={{ background: 'rgba(37,211,102,0.15)', color: 'var(--whatsapp-dark)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            ✓ Ready for Pandit Review
                                        </span>
                                    )}
                                </div>

                                {!a1Result ? (
                                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📜</span>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Fill devotee birth parameters and run Agent 1 to view planetary calculations & Pandit draft.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Chart Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lagna (Ascendant)</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>{a1Result.birthChartSummary?.lagna?.rashi}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--gold-800)' }}>Lord: {a1Result.birthChartSummary?.lagna?.lord}</div>
                                            </div>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Moon Sign (Chandra)</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)' }}>{a1Result.birthChartSummary?.moonSign?.rashi}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--whatsapp-dark)' }}>Gem: {a1Result.birthChartSummary?.moonSign?.luckyGem}</div>
                                            </div>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nakshatra</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>{a1Result.birthChartSummary?.nakshatra?.name} (Pada {a1Result.birthChartSummary?.nakshatra?.pada})</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Deity: {a1Result.birthChartSummary?.nakshatra?.deity}</div>
                                            </div>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sun Sign (Surya)</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>{a1Result.birthChartSummary?.sunSign?.rashi}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Lord: {a1Result.birthChartSummary?.sunSign?.lord}</div>
                                            </div>
                                        </div>

                                        {/* Doshas Detected */}
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>🔥 Vedic Dosha Matrix:</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.6rem', background: a1Result.doshaMatrix?.manglik?.hasDosh ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', borderRadius: '4px' }}>
                                                    <span><b>Manglik Dosh:</b> {a1Result.doshaMatrix?.manglik?.severity}</span>
                                                    <span>{a1Result.doshaMatrix?.manglik?.hasDosh ? '⚠ Active' : '✓ Shanta'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.6rem', background: a1Result.doshaMatrix?.kalsarp?.hasDosh ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', borderRadius: '4px' }}>
                                                    <span><b>Kalsarp:</b> {a1Result.doshaMatrix?.kalsarp?.type}</span>
                                                    <span>{a1Result.doshaMatrix?.kalsarp?.hasDosh ? '⚠ Active' : '✓ Shanta'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.6rem', background: a1Result.doshaMatrix?.shaniSadeSati?.active ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.1)', borderRadius: '4px' }}>
                                                    <span><b>Shani Transit:</b> {a1Result.doshaMatrix?.shaniSadeSati?.phase}</span>
                                                    <span>{a1Result.doshaMatrix?.shaniSadeSati?.active ? '⏳ Phase Active' : '✓ Clear'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Executive Pandit Note */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)' }}>📜 Pandit Executive Dossier:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(a1Result.executiveDraftForPandit, 'a1')}
                                                    className="btn btn-outline-dark"
                                                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                                                >
                                                    {copiedKey === 'a1' ? '✓ Copied' : 'Copy Dossier'}
                                                </button>
                                            </div>
                                            <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }}>
                                                {a1Result.executiveDraftForPandit}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* AGENT 2: WHATSAPP DEVOTEE CONCIERGE */}
                    {/* ========================================================================= */}
                    {activeTab === 'agent2' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
                            {/* Input Form */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900)' }}>💬 Agent 2: WhatsApp Concierge Simulator</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Devotee Intent Classifier & Response Engine</p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Devotee Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={a2Name}
                                        onChange={e => setA2Name(e.target.value)}
                                    />
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Sample Devotee Inquiries:</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {[
                                            'I want to book Rudrabhishek with Namakam Chamakam for peace and health.',
                                            'What is the auspicious muhurat and samagri for Kalsarp Shanti in Kashi?',
                                            'How can I get Dr. Umang Nath Sharma to personally analyze my Janam Kundli?',
                                            'Where is your Vedic ashram located near Dashashwamedh Ghat in Varanasi?',
                                        ].map((promptText, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setA2Query(promptText)}
                                                style={{
                                                    background: 'var(--warm-100)',
                                                    border: '1px solid var(--border-light)',
                                                    textAlign: 'left',
                                                    padding: '0.45rem 0.65rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    color: 'var(--navy-800)',
                                                }}
                                            >
                                                👉 "{promptText}"
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Inbound Message Text</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        value={a2Query}
                                        onChange={e => setA2Query(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={runAgent2}
                                    disabled={a2Loading}
                                    className="btn btn-whatsapp"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                >
                                    {a2Loading ? '⚡ Classifying & Formulating…' : '💬 Simulate Concierge Response'}
                                </button>
                                {a2Error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠ {a2Error}</p>}
                            </div>

                            {/* Response Preview */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900)' }}>Concierge WhatsApp Preview</h3>
                                    {a2Result && (
                                        <span style={{ background: 'rgba(33,150,243,0.15)', color: '#1565c0', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            Intent: {a2Result.intent} ({Math.round((a2Result.confidence || 0.9) * 100)}%)
                                        </span>
                                    )}
                                </div>

                                {!a2Result ? (
                                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📱</span>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Type an inbound devotee question and trigger Agent 2 to preview classified intent & formatted reply.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Simulated WhatsApp Bubble */}
                                        <div style={{ background: '#e2f7cb', borderRadius: '8px', padding: '1rem', border: '1px solid #c5e1a5', marginBottom: '1.25rem', position: 'relative' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#1c2150', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                                                {a2Result.responseText}
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#689f38', marginTop: '0.35rem' }}>
                                                ✓✓ Delivered · Just now
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(a2Result.responseText, 'a2')}
                                                className="btn btn-outline-dark"
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                {copiedKey === 'a2' ? '✓ Copied' : 'Copy Message Text'}
                                            </button>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                Target: {a2Result.serviceHint || 'General Guide'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* AGENT 3: DAILY PANCHANG & TRANSIT ALERT CRON */}
                    {/* ========================================================================= */}
                    {activeTab === 'agent3' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
                            {/* Control Panel */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900)' }}>☀️ Agent 3: Daily Panchang Cron</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Varanasi Ephemeris (25.3176° N, 82.9739° E)</p>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Calculation Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={a3Date}
                                        onChange={e => setA3Date(e.target.value)}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem', background: 'var(--warm-100)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                                        <input
                                            type="checkbox"
                                            checked={a3Broadcast}
                                            onChange={e => setA3Broadcast(e.target.checked)}
                                        />
                                        <span>Dispatch live email broadcast to subscribers</span>
                                    </label>
                                    <p style={{ margin: '0.35rem 0 0 1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        When checked, sends daily Vedic digest to active newsletter subscribers in MongoDB.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={runAgent3}
                                    disabled={a3Loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                >
                                    {a3Loading ? '⚡ Computing Planetary Ephemeris…' : '☀️ Calculate & Preview Varanasi Panchang'}
                                </button>
                                {a3Error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠ {a3Error}</p>}
                            </div>

                            {/* Panchang Output Preview */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900)' }}>Dainik Panchang Output</h3>
                                    {a3Result && (
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(a3Result.broadcastPayload?.whatsappText, 'a3')}
                                            className="btn btn-outline-dark"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                        >
                                            {copiedKey === 'a3' ? '✓ Copied' : 'Copy WhatsApp Digest'}
                                        </button>
                                    )}
                                </div>

                                {!a3Result ? (
                                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>☀️</span>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Click calculate to compute Tithi, Nakshatra, Shubh Muhurats & Rahu Kaal for Kashi.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-800)', marginBottom: '0.75rem' }}>
                                            📍 {a3Result.panchang?.dateFormatted} · Varanasi
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.6rem', borderRadius: '4px' }}>
                                                <b>📜 Tithi:</b> {a3Result.panchang?.tithi?.name}
                                            </div>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.6rem', borderRadius: '4px' }}>
                                                <b>⭐ Nakshatra:</b> {a3Result.panchang?.nakshatra?.name}
                                            </div>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.6rem', borderRadius: '4px' }}>
                                                <b>✨ Yoga:</b> {a3Result.panchang?.yoga?.name}
                                            </div>
                                            <div style={{ background: 'var(--warm-100)', padding: '0.6rem', borderRadius: '4px' }}>
                                                <b>🌙 Chandra:</b> {a3Result.panchang?.transits?.chandraRashi}
                                            </div>
                                        </div>

                                        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                                            <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '0.2rem' }}>✨ Shubh Muhurats (Varanasi):</div>
                                            <div><b>Abhijit:</b> {a3Result.panchang?.timings?.abhijitMuhurat}</div>
                                            <div><b>Brahma:</b> {a3Result.panchang?.timings?.brahmaMuhurat}</div>
                                        </div>

                                        <div style={{ background: '#fff7ed', border: '1px solid #f97316', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8rem' }}>
                                            <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: '0.2rem' }}>⏳ Rahu Kaal:</div>
                                            <div>{a3Result.panchang?.timings?.rahuKaal}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* AGENT 4: POST-POOJA CRM & VIDEO DELIVERY */}
                    {/* ========================================================================= */}
                    {activeTab === 'agent4' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
                            {/* Input Form */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900)' }}>📹 Agent 4: Post-Pooja Delivery</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sankalp Video Proof & Devotee Letter Dispatch</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Devotee Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={a4Form.name}
                                            onChange={e => setA4Form({ ...a4Form, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Gotra</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={a4Form.gotra}
                                            onChange={e => setA4Form({ ...a4Form, gotra: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '0.75rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Service Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={a4Form.serviceName}
                                        onChange={e => setA4Form({ ...a4Form, serviceName: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone (WhatsApp)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={a4Form.phone}
                                            onChange={e => setA4Form({ ...a4Form, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={a4Form.email}
                                            onChange={e => setA4Form({ ...a4Form, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Video Proof Link (Drive / YouTube)</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={a4Form.mediaUrl}
                                        onChange={e => setA4Form({ ...a4Form, mediaUrl: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={runAgent4}
                                    disabled={a4Loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                >
                                    {a4Loading ? '⚡ Dispatching Proof & Blessing…' : '📹 Dispatch Post-Pooja Proof & Review Link'}
                                </button>
                                {a4Error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠ {a4Error}</p>}
                            </div>

                            {/* Preview */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy-900)' }}>Delivery Dispatch Confirmation</h3>
                                    {a4Result && (
                                        <span style={{ background: 'rgba(37,211,102,0.15)', color: 'var(--whatsapp-dark)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            ✓ {a4Result.deliveryStatus}
                                        </span>
                                    )}
                                </div>

                                {!a4Result ? (
                                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📹</span>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Fill devotee media proof and trigger Agent 4 to test automated WhatsApp and email dispatch.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-light)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                            <div><b>Devotee:</b> {a4Result.devoteeName}</div>
                                            <div><b>Service:</b> {a4Result.serviceName}</div>
                                            <div style={{ wordBreak: 'break-all', marginTop: '0.35rem' }}>
                                                <b>Media Proof:</b> <a href={a4Result.mediaUrl} target="_blank" rel="noreferrer">{a4Result.mediaUrl}</a>
                                            </div>
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
                                                <span style={{ color: a4Result.emailDispatched ? '#10b981' : '#f59e0b' }}>
                                                    Email: {a4Result.emailDispatched ? '✓ Sent' : 'Skipped/No Auth'}
                                                </span>
                                                <span style={{ color: a4Result.whatsappDispatched ? '#10b981' : '#64748b' }}>
                                                    WhatsApp: {a4Result.whatsappDispatched ? '✓ Sent' : 'Queued'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* AGENT 5: VEDIC SEO & CONTENT GENERATOR */}
                    {/* ========================================================================= */}
                    {activeTab === 'agent5' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
                            {/* Input Form */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--navy-900)' }}>📝 Agent 5: Vedic SEO Studio</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Schema-Ready Markdown & FAQ Generator</p>
                                </div>

                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Select Ritual Theme / Keyword Topic:</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        {[
                                            { id: 'rudrabhishek', label: 'Rudrabhishek Vidhi' },
                                            { id: 'kalsarp', label: 'Kalsarp Dosh Nivaran' },
                                            { id: 'tripindi', label: 'Tripindi Shradh Kashi' },
                                            { id: 'shani_sade_sati', label: 'Shani Sade Sati Upay' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setA5Topic(opt.id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    borderRadius: '4px',
                                                    border: `1px solid ${a5Topic === opt.id ? 'var(--gold-500)' : 'var(--border-light)'}`,
                                                    background: a5Topic === opt.id ? 'var(--gold-50)' : 'white',
                                                    color: a5Topic === opt.id ? 'var(--gold-900)' : 'var(--navy-900)',
                                                    fontWeight: 600,
                                                    fontSize: '0.78rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Custom Keyword Phrase</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={a5Topic}
                                        onChange={e => setA5Topic(e.target.value)}
                                        placeholder="e.g. Mahamrityunjaya Jaap Vidhi Kashi"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={runAgent5}
                                    disabled={a5Loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                >
                                    {a5Loading ? '⚡ Drafting Article & JSON-LD…' : '📝 Generate Schema-Ready Article'}
                                </button>
                                {a5Error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>⚠ {a5Error}</p>}
                            </div>

                            {/* Output Preview */}
                            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => setA5ViewMode('markdown')}
                                            style={{
                                                padding: '0.3rem 0.6rem',
                                                fontSize: '0.75rem',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: a5ViewMode === 'markdown' ? 'var(--navy-900)' : 'var(--warm-100)',
                                                color: a5ViewMode === 'markdown' ? 'white' : 'var(--navy-900)',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Markdown
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setA5ViewMode('faqs')}
                                            style={{
                                                padding: '0.3rem 0.6rem',
                                                fontSize: '0.75rem',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: a5ViewMode === 'faqs' ? 'var(--navy-900)' : 'var(--warm-100)',
                                                color: a5ViewMode === 'faqs' ? 'white' : 'var(--navy-900)',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Schema FAQs
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setA5ViewMode('jsonld')}
                                            style={{
                                                padding: '0.3rem 0.6rem',
                                                fontSize: '0.75rem',
                                                borderRadius: '4px',
                                                border: 'none',
                                                background: a5ViewMode === 'jsonld' ? 'var(--navy-900)' : 'var(--warm-100)',
                                                color: a5ViewMode === 'jsonld' ? 'white' : 'var(--navy-900)',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                            }}
                                        >
                                            JSON-LD Graph
                                        </button>
                                    </div>

                                    {a5Result && (
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(a5ViewMode === 'jsonld' ? JSON.stringify(a5Result.jsonLd, null, 2) : a5Result.markdown, 'a5')}
                                            className="btn btn-outline-dark"
                                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                                        >
                                            {copiedKey === 'a5' ? '✓ Copied' : 'Copy Content'}
                                        </button>
                                    )}
                                </div>

                                {!a5Result ? (
                                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📝</span>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Select a ritual theme and trigger Agent 5 to draft a high-ranking Vedic article with Google Schema.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                                            <span><b>Slug:</b> /blog/{a5Result.slug}</span>
                                            <span><b>Words:</b> {a5Result.wordCount}</span>
                                            <span><b>Read:</b> {a5Result.readingTime}</span>
                                        </div>

                                        {a5ViewMode === 'markdown' && (
                                            <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', maxHeight: '350px', overflowY: 'auto' }}>
                                                {a5Result.markdown}
                                            </pre>
                                        )}

                                        {a5ViewMode === 'faqs' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '350px', overflowY: 'auto' }}>
                                                {(a5Result.faqs || []).map((faq, i) => (
                                                    <div key={i} style={{ background: 'var(--warm-100)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--navy-900)' }}>Q: {faq.q}</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{faq.a}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {a5ViewMode === 'jsonld' && (
                                            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.72rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', maxHeight: '350px', overflowY: 'auto' }}>
                                                {JSON.stringify(a5Result.jsonLd, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </section>
        </div>
    );
}
