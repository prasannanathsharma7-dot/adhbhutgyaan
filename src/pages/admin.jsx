import { useState, useEffect, useCallback } from 'react';
import useSEO from '../hooks/useSEO';

const TABS = [
    { id: 'bookings', label: 'Bookings', endpoint: '/api/bookings' },
    { id: 'messages', label: 'Messages', endpoint: '/api/contact' },
    { id: 'reviews', label: 'Reviews', endpoint: '/api/reviews' },
    { id: 'subscribers', label: 'Subscribers', endpoint: '/api/newsletter' },
];

function fmtDate(d) {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return String(d);
    }
}

function StatusBadge({ status }) {
    const colors = {
        new: { bg: 'rgba(255,152,0,0.1)', c: 'var(--gold-700)' },
        pending: { bg: 'rgba(255,152,0,0.1)', c: 'var(--gold-700)' },
        contacted: { bg: 'rgba(33,150,243,0.1)', c: '#1565c0' },
        confirmed: { bg: 'rgba(37,211,102,0.1)', c: 'var(--whatsapp)' },
        approved: { bg: 'rgba(37,211,102,0.1)', c: 'var(--whatsapp)' },
        completed: { bg: 'rgba(37,211,102,0.15)', c: 'var(--whatsapp)' },
        rejected: { bg: 'rgba(183,28,28,0.1)', c: 'var(--red-400)' },
        cancelled: { bg: 'rgba(183,28,28,0.1)', c: 'var(--red-400)' },
    };
    const style = colors[status] || { bg: 'var(--border-light)', c: 'var(--text-secondary)' };
    return (
        <span style={{ background: style.bg, color: style.c, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {status || 'new'}
        </span>
    );
}

function StatusSelect({ value, options, onChange }) {
    return (
        <select
            className="form-input"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
            value={value || options[0]}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    );
}

export default function Admin() {
    useSEO({ title: 'Admin | Adhbhut Gyaan', noindex: true });

    const [key, setKey] = useState(() => {
        try { return sessionStorage.getItem('ag_admin_key') || ''; } catch { return ''; }
    });
    const [keyInput, setKeyInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [tab, setTab] = useState('bookings');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');

    const load = useCallback(async (activeKey, activeTab) => {
        if (!activeKey) return;
        setLoading(true);
        setLoadError('');
        const endpoint = TABS.find(x => x.id === activeTab).endpoint;
        try {
            const res = await fetch(`${endpoint}?limit=100`, { headers: { 'x-admin-key': activeKey } });
            const data = await res.json();
            if (res.status === 401) {
                setAuthError('Invalid admin key.');
                setKey('');
                try { sessionStorage.removeItem('ag_admin_key'); } catch { /* ignore */ }
                setItems([]);
                return;
            }
            if (data.ok) {
                setItems(data.items || []);
            } else {
                setLoadError(data.error || 'Failed to load data.');
            }
        } catch {
            setLoadError('Network error while loading data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (key) load(key, tab);
    }, [key, tab, load]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (!keyInput.trim()) return;
        setAuthError('');
        try { sessionStorage.setItem('ag_admin_key', keyInput.trim()); } catch { /* ignore */ }
        setKey(keyInput.trim());
    };

    const handleLogout = () => {
        try { sessionStorage.removeItem('ag_admin_key'); } catch { /* ignore */ }
        setKey('');
        setKeyInput('');
        setItems([]);
    };

    const reviewAction = async (id, status) => {
        try {
            const res = await fetch('/api/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
                body: JSON.stringify({ id, status }),
            });
            const data = await res.json();
            if (data.ok) {
                setItems(prev => prev.map(it => (it._id === id ? { ...it, status } : it)));
            }
        } catch {
            /* ignore */
        }
    };

    const updateStatus = async (endpoint, id, status, scheduledDate) => {
        try {
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
                body: JSON.stringify({ id, status, ...(scheduledDate ? { scheduledDate } : {}) }),
            });
            const data = await res.json();
            if (data.ok) {
                setItems(prev => prev.map(it => (it._id === id ? { ...it, status, ...(scheduledDate ? { scheduledDate } : {}) } : it)));
            }
        } catch {
            /* ignore */
        }
    };

    if (!key) {
        return (
            <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
                <div className="container" style={{ maxWidth: 380, margin: '0 auto' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        <h2 style={{ marginBottom: '1.25rem', textAlign: 'center' }}>🔐 Admin Login</h2>
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="admin-key">Admin Key</label>
                                <input
                                    id="admin-key"
                                    type="password"
                                    className="form-input"
                                    placeholder="Enter admin key"
                                    value={keyInput}
                                    onChange={e => setKeyInput(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            {authError && <p className="form-error">⚠ {authError}</p>}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <header className="page-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
                    <button type="button" className="btn btn-outline-dark" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <section className="section" style={{ paddingTop: '1.5rem' }}>
                <div className="container">
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {TABS.map(tb => (
                            <button
                                key={tb.id}
                                type="button"
                                onClick={() => setTab(tb.id)}
                                className={tab === tb.id ? 'btn btn-primary' : 'btn btn-outline-dark'}
                            >
                                {tb.label}
                            </button>
                        ))}
                    </div>

                    {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
                    {loadError && <p className="form-error">⚠ {loadError}</p>}

                    {!loading && !loadError && items.length === 0 && (
                        <p style={{ color: 'var(--text-muted)' }}>No entries yet.</p>
                    )}

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {tab === 'bookings' && items.map(it => (
                            <div key={it._id} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <strong>{it.name}</strong>
                                    <StatusBadge status={it.status} />
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                                    📞 <a href={`tel:${it.phone}`}>{it.phone}</a> · {it.serviceName || '—'} {it.packageName ? `(${it.packageName})` : ''}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {it.mode ? `Mode: ${it.mode} · ` : ''}{it.preferredDate ? `Date: ${it.preferredDate} · ` : ''}{fmtDate(it.createdAt)}
                                </div>
                                {it.notes && <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{it.notes}</p>}
                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <StatusSelect
                                        value={it.status}
                                        options={['new', 'contacted', 'confirmed', 'completed', 'cancelled']}
                                        onChange={(status) => updateStatus('/api/bookings', it._id, status, it.scheduledDate)}
                                    />
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        📅 Scheduled:
                                        <input
                                            type="date"
                                            className="form-input"
                                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                                            value={it.scheduledDate || ''}
                                            onChange={(e) => updateStatus('/api/bookings', it._id, it.status || 'confirmed', e.target.value)}
                                        />
                                    </label>
                                    {it.scheduledDate && (
                                        <span style={{ fontSize: '0.75rem', color: it.reminderSent ? 'var(--gold-600)' : 'var(--text-muted)' }}>
                                            {it.reminderSent ? '✓ Reminder sent' : '⏳ Reminder pending'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {tab === 'messages' && items.map(it => (
                            <div key={it._id} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <strong>{it.name}</strong>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <StatusBadge status={it.status} />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmtDate(it.createdAt)}</span>
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                                    📞 <a href={`tel:${it.phone}`}>{it.phone}</a>{it.email ? ` · ✉️ ${it.email}` : ''}{it.subject ? ` · ${it.subject}` : ''}
                                </div>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{it.message}</p>
                                <div style={{ marginTop: '0.75rem' }}>
                                    <StatusSelect
                                        value={it.status}
                                        options={['new', 'contacted', 'resolved']}
                                        onChange={(status) => updateStatus('/api/contact', it._id, status)}
                                    />
                                </div>
                            </div>
                        ))}

                        {tab === 'reviews' && items.map(it => (
                            <div key={it._id} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <strong>{it.name}</strong>
                                    <StatusBadge status={it.status} />
                                </div>
                                <div style={{ color: 'var(--gold-500)', margin: '0.25rem 0' }}>
                                    {'★'.repeat(it.rating || 5)}{'☆'.repeat(5 - (it.rating || 5))}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {it.serviceName ? `${it.serviceName} · ` : ''}{it.location ? `${it.location} · ` : ''}{fmtDate(it.createdAt)}
                                </div>
                                <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>{it.text}</p>
                                {it.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📞 {it.phone}</div>}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }} disabled={it.status === 'approved'} onClick={() => reviewAction(it._id, 'approved')}>Approve</button>
                                    <button type="button" className="btn btn-outline-dark" style={{ padding: '0.4rem 0.9rem' }} disabled={it.status === 'rejected'} onClick={() => { if (window.confirm('Reject this review? It will not be shown on the site.')) reviewAction(it._id, 'rejected'); }}>Reject</button>
                                </div>
                            </div>
                        ))}
                        {tab === 'subscribers' && items.length > 0 && (
                            <button
                                type="button"
                                className="btn btn-outline-dark"
                                style={{ justifySelf: 'start', marginBottom: '0.25rem' }}
                                onClick={() => {
                                    const emails = items.map(it => it.email).join(', ');
                                    navigator.clipboard?.writeText(emails);
                                }}
                            >
                                📋 Copy all {items.length} emails
                            </button>
                        )}

                        {tab === 'subscribers' && items.map(it => (
                            <div key={it._id} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '0.85rem 1.25rem', boxShadow: 'var(--shadow-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span>✉️ {it.email}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmtDate(it.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
