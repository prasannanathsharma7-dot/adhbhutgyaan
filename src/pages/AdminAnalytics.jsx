import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

const MASTER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';

function CircularProgress({ percent, size = 64, strokeWidth = 6, color = '#25D366' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" style={{ transform: 'rotate(-90deg)' }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={strokeWidth}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
        </svg>
    );
}

function StatBar({ label, sublabel, count, percent, color = 'var(--gold-500)', icon }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {icon && <span>{icon}</span>}
                    {label}
                    {sublabel && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 400 }}>({sublabel})</span>}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {count} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({percent}%)</span>
                </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                    style={{
                        width: `${Math.min(Math.max(percent, 2), 100)}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '999px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                />
            </div>
        </div>
    );
}

export default function AdminAnalytics() {
    useSEO({ title: 'Data Analytics & Sheet Sync | Adhbhut Gyaan Admin', noindex: true });

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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [copied, setCopied] = useState(false);
    const [syncStatus, setSyncStatus] = useState({ state: 'idle', message: '' });

    const fetchAnalytics = useCallback(async (key) => {
        if (!key) return;
        setLoading(true);
        setLoadError('');
        try {
            const res = await fetch('/api/admin/analytics-summary', {
                headers: {
                    'x-admin-auth': key,
                    'x-admin-key': key,
                },
            });
            const json = await res.json();
            if (res.status === 401) {
                setAuthError('Invalid admin authentication key.');
                setAdminKey('');
                try {
                    sessionStorage.removeItem('ag_admin_key');
                    sessionStorage.removeItem('ag_admin_auth');
                } catch { /* ignore */ }
                setData(null);
                return;
            }
            if (json.ok) {
                setData(json);
            } else {
                setLoadError(json.error || 'Failed to aggregate analytics.');
            }
        } catch (err) {
            setLoadError('Network error while connecting to analytics aggregation engine.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (adminKey) {
            fetchAnalytics(adminKey);
        }
    }, [adminKey, fetchAnalytics]);

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
        setData(null);
    };

    const handleCopyBriefing = () => {
        if (!data) return;
        const kpis = data.kpis || {};
        const rituals = data.ritualDemand?.breakdown || [];
        const concerns = data.concernMatrix || [];
        const dateStr = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

        const topRitualsText = rituals.slice(0, 4).map((r, i) => ` ${i + 1}. *${r.name}*: ${r.count} (${r.sharePercent}%)`).join('\n');
        const topConcernsText = concerns.slice(0, 4).map(c => ` \u2022 *${c.label}*: ${c.count} (${c.sharePercent}%)`).join('\n');

        const briefing = [
            '\u{1F549}\uFE0F *ADBHUT GYAAN \u2014 EXECUTIVE ANALYTICS BRIEFING*',
            '\u{1F4C5} _Generated: ' + dateStr + '_',
            '\u2500'.repeat(28),
            '\u{1F4CA} *LEAD VELOCITY*',
            '\u2022 *30-Day Active Leads:* ' + (kpis.activeLeads30d ?? 0) + ' (7-Day: ' + (kpis.activeLeads7d ?? 0) + ')',
            '\u2022 *Total Lifetime Devotees:* ' + (kpis.totalLifetimeLeads ?? 0),
            '',
            '\u{1F4DC} *KUNDLI REVIEW FUNNEL*',
            '\u2022 *Pending Chart Reviews:* ' + (kpis.pendingKundliReviews ?? 0) + ' \u23F3',
            '\u2022 *Completed Reviews:* ' + (kpis.completedKundliReviews ?? 0) + ' \u2705',
            '\u2022 *Review Completion Rate:* ' + (kpis.kundliReviewCompletionRate ?? 0) + '%',
            '',
            '\u{1F525} *HIGH-DEMAND RITUALS (SHARE)*',
            topRitualsText || ' (No booking volume recorded yet)',
            '',
            '\u{1F52E} *ASTROLOGICAL CONCERNS*',
            topConcernsText || ' (No concern inquiries recorded yet)',
            '',
            '\u2500'.repeat(28),
            '\u{1F4CA} *Master Sheet:* ' + MASTER_SHEET_URL,
            '\u{1F64F} _Dr. Umang Nath Sharma | Kashi Vedic Team_',
        ].join('\n');

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(briefing).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }).catch(() => {
                prompt('Copy Executive Briefing:', briefing);
            });
        } else {
            prompt('Copy Executive Briefing:', briefing);
        }
    };

    const handleTriggerSync = async () => {
        setSyncStatus({ state: 'syncing', message: 'Checking 2-way Google Sheet sync webhook...' });
        try {
            const res = await fetch('/api/admin/sync-from-sheets', {
                method: 'GET',
                headers: { 'x-admin-auth': adminKey },
            });
            const json = await res.json();
            if (json.ok) {
                setSyncStatus({
                    state: 'success',
                    message: '\u2713 2-Way Sync Webhook is Active & Ready. ' + (json.instructions || ''),
                });
                setTimeout(() => fetchAnalytics(adminKey), 1000);
            } else {
                setSyncStatus({ state: 'error', message: json.error || 'Sync check failed.' });
            }
        } catch (err) {
            setSyncStatus({ state: 'error', message: 'Network error communicating with sync handler.' });
        }
    };

    // ── Auth Gate ──────────────────────────────────────────────
    if (!adminKey) {
        return (
            <div className="section" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
                <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2.25rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>{'\u{1F549}\uFE0F'}</span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Adhbhut Gyaan Analytics</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Principal Data Analytics & Google Sheet 2-Way Sync Engine
                            </p>
                        </div>
                        <form onSubmit={handleLogin}>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label" htmlFor="admin-analytics-key" style={{ fontWeight: 600 }}>
                                    Admin Secret Key
                                </label>
                                <input
                                    id="admin-analytics-key"
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter ADMIN_SECRET_KEY"
                                    value={keyInput}
                                    onChange={e => setKeyInput(e.target.value)}
                                    autoFocus
                                    style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                                />
                            </div>
                            {authError && <p className="form-error" style={{ marginBottom: '1rem' }}>{'\u26A0'} {authError}</p>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                                {'\u{1F513}'} Access Analytics Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // ── Data display ──────────────────────────────────────────
    const kpis = data?.kpis || {};
    const rituals = data?.ritualDemand?.breakdown || [];
    const concerns = data?.concernMatrix || [];
    const touchpoints = data?.touchpoints || {};

    return (
        <div>
            {/* Header */}
            <header className="page-header" style={{ padding: '2rem 0', background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-800) 100%)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '1.6rem' }}>{'\u{1F549}\uFE0F'}</span>
                            <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 3.5vw, 1.85rem)', color: 'white' }}>Data Analytics & Operations</h1>
                        </div>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem' }}>
                            Real-time MongoDB aggregations & bi-directional Google Sheet telemetry
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to="/admin" className="btn btn-outline-light" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                            {'\u{1F4CB}'} Manage Bookings
                        </Link>
                        <button type="button" onClick={() => fetchAnalytics(adminKey)} className="btn btn-outline-light" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} disabled={loading}>
                            {loading ? '\u{1F504} Loading\u2026' : '\u{1F504} Refresh'}
                        </button>
                        <button type="button" onClick={handleLogout} className="btn btn-outline-light" style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Quick Action Toolbar */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--border-light)', padding: '0.85rem 0', boxShadow: 'var(--shadow-sm)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--whatsapp)', fontWeight: 600 }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--whatsapp)', display: 'inline-block' }} />
                            MongoDB Aggregations Connected
                        </span>
                        {data?.generatedAt && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Updated: {new Date(data.generatedAt).toLocaleTimeString('en-IN')}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleCopyBriefing}
                            className="btn btn-whatsapp"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            title="Generate and copy executive summary for Dr. Umang Nath Sharma"
                        >
                            <span>{copied ? '\u2713' : '\u{1F4AC}'}</span>
                            {copied ? 'Briefing Copied to Clipboard!' : 'Copy WhatsApp Briefing'}
                        </button>

                        <a
                            href={MASTER_SHEET_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-dark"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                            <span>{'\u{1F4CA}'}</span> Open Master Google Sheet
                        </a>

                        <button
                            type="button"
                            onClick={handleTriggerSync}
                            className="btn btn-outline-dark"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem' }}
                        >
                            {'\u26A1'} Test Sheet Sync
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="section" style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
                <div className="container">
                    {loadError && (
                        <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {'\u26A0'} {loadError}
                        </div>
                    )}

                    {syncStatus.message && (
                        <div style={{
                            background: syncStatus.state === 'success' ? '#ECFDF5' : '#FEF3C7',
                            border: `1px solid ${syncStatus.state === 'success' ? '#10B981' : '#F59E0B'}`,
                            color: syncStatus.state === 'success' ? '#065F46' : '#92400E',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                        }}>
                            {syncStatus.message}
                        </div>
                    )}

                    {/* TOP ROW: 4 PRIMARY KPI SUMMARY CARDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        {/* 30-Day Active Leads */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.4rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    30-Day Active Leads
                                </span>
                                <span style={{ background: 'rgba(255,193,7,0.15)', color: 'var(--gold-800)', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                                    30d Window
                                </span>
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.5rem', lineHeight: 1 }}>
                                {kpis.activeLeads30d ?? 0}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ color: 'var(--whatsapp)', fontWeight: 600 }}>{'\u2191'} {kpis.activeLeads7d ?? 0} in last 7 days</span>
                                <span>{'\u00B7'} {kpis.totalLifetimeLeads > 0 ? Math.round(((kpis.activeLeads30d || 0) / kpis.totalLifetimeLeads) * 100) : 0}% of lifetime</span>
                            </div>
                        </div>

                        {/* Pending Kundli Reviews */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.4rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Pending Kundli Reviews
                                </span>
                                <span style={{ background: (kpis.pendingKundliReviews || 0) > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(37,211,102,0.15)', color: (kpis.pendingKundliReviews || 0) > 0 ? '#B91C1C' : 'var(--whatsapp-dark)', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                                    {(kpis.pendingKundliReviews || 0) > 0 ? 'Action Needed' : 'All Clear'}
                                </span>
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: (kpis.pendingKundliReviews || 0) > 0 ? '#B91C1C' : 'var(--navy-900)', marginTop: '0.5rem', lineHeight: 1 }}>
                                {kpis.pendingKundliReviews ?? 0}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.6rem' }}>
                                {'\u23F3'} Requiring Dr. Umang Nath Sharma review
                            </div>
                        </div>

                        {/* Completed Kundli Charts */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.4rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Completed Charts
                                    </span>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--whatsapp-dark)', marginTop: '0.5rem', lineHeight: 1 }}>
                                        {kpis.completedKundliReviews ?? 0}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.6rem' }}>
                                        {kpis.kundliReviewCompletionRate ?? 0}% overall review rate
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <CircularProgress percent={kpis.kundliReviewCompletionRate || 0} size={54} color="var(--whatsapp)" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--whatsapp-dark)', marginTop: '-34px', marginBottom: '16px' }}>
                                        {kpis.kundliReviewCompletionRate || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Total Lifetime Leads */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.4rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Total Lifetime Leads
                                </span>
                                <span style={{ background: 'rgba(28,33,80,0.1)', color: 'var(--navy-800)', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                                    Master Total
                                </span>
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.5rem', lineHeight: 1 }}>
                                {kpis.totalLifetimeLeads ?? 0}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.6rem' }}>
                                {'\u{1F4FF}'} {kpis.totalLifetimeBookings ?? 0} Poojas {'\u00B7'} {kpis.totalLifetimeKundlis ?? 0} Kundlis
                            </div>
                        </div>
                    </div>

                    {/* TWO COLUMN GRID: DEMAND HEATMAP & ASTROLOGICAL CONCERNS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* High-Demand Ritual Volume & % Share */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                        {'\u{1F525}'} High-Demand Ritual Volume & Share
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Vedic poojas ranked by volume & share of demand
                                    </p>
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-800)', background: 'var(--gold-50)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                                    {data?.ritualDemand?.totalRituals || 0} Total
                                </span>
                            </div>

                            {rituals.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                    No pooja records aggregated yet.
                                </p>
                            ) : (
                                <div>
                                    {rituals.map(ritual => (
                                        <StatBar
                                            key={ritual.id}
                                            label={ritual.name}
                                            sublabel={ritual.nameHi}
                                            count={ritual.count}
                                            percent={ritual.sharePercent}
                                            color={ritual.color || 'var(--gold-500)'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Astrological Concern Matrix */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                        {'\u{1F52E}'} Astrological Concern Matrix
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Semantic analysis of devotee questions & notes
                                    </p>
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1565C0', background: 'rgba(33,150,243,0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                                    5 Vedic Pillars
                                </span>
                            </div>

                            {concerns.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                    No astrological concerns logged yet.
                                </p>
                            ) : (
                                <div>
                                    {concerns.map(concern => (
                                        <StatBar
                                            key={concern.id}
                                            label={concern.label}
                                            sublabel={concern.labelHi}
                                            count={concern.count}
                                            percent={concern.sharePercent}
                                            color={
                                                concern.id === 'career' ? '#3B82F6' :
                                                concern.id === 'marriage' ? '#EC4899' :
                                                concern.id === 'pitra_dosh' ? '#8B0000' :
                                                concern.id === 'shani_sade_sati' ? '#6366F1' :
                                                '#10B981'
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LOWER SECTION: TOUCHPOINT CHANNELS & GOOGLE SHEET SYNC CONSOLE */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                        {/* Touchpoint Channel Distribution */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                {'\u{1F310}'} Touchpoint & Lead Generation Sources
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                <div style={{ background: 'var(--gold-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--gold-800)', fontWeight: 600 }}>{'\u{1F310}'} Website Bookings</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                                        {touchpoints.website_booking || 0}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(37,211,102,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37,211,102,0.3)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--whatsapp-dark)', fontWeight: 600 }}>{'\u{1F4DC}'} Free Kundli Forms</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                                        {touchpoints.free_kundli || 0}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(33,150,243,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(33,150,243,0.3)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#1565C0', fontWeight: 600 }}>{'\u{1F4AC}'} WhatsApp AI Bot</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                                        {touchpoints.whatsapp_bot || 0}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(28,33,80,0.06)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--navy-700)', fontWeight: 600 }}>{'\u2709\uFE0F'} Contact Messages</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                                        {touchpoints.contact_form || 0}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2-Way Google Sheet Sync Status & Docs */}
                        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                    {'\u{1F4CA}'} Master Google Sheet 2-Way Sync
                                </h3>
                                <span style={{ background: 'rgba(37,211,102,0.15)', color: 'var(--whatsapp-dark)', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                    2-Way Enabled
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                                Status updates made in Google Sheets (e.g. marking row as <b>reviewed</b>, <b>completed</b>, adding <b>pooja notes</b> or <b>sankalp media links</b>) automatically sync back to MongoDB via <code>/api/admin/sync-from-sheets</code>.
                            </p>

                            <div style={{ background: 'var(--warm-100)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--navy-800)', border: '1px solid var(--border-light)', marginBottom: '1rem' }}>
                                <div><b>Webhook Endpoint:</b> <code>https://www.adhbhutgyaan.com/api/admin/sync-from-sheets</code></div>
                                <div style={{ marginTop: '0.25rem' }}><b>Header:</b> <code>{'x-admin-auth: <ADMIN_SECRET_KEY>'}</code></div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <a
                                    href={MASTER_SHEET_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                >
                                    Open Master Sheet on Google Drive
                                </a>
                                <button
                                    type="button"
                                    onClick={handleTriggerSync}
                                    className="btn btn-outline-dark"
                                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                                >
                                    Test Webhook Sync
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}