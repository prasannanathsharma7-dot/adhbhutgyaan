import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AlertTriangle, Sunrise } from 'lucide-react';

const MONTHS = [
    { value: '01', en: 'January', hi: 'जनवरी', short: 'Jan' },
    { value: '02', en: 'February', hi: 'फ़रवरी', short: 'Feb' },
    { value: '03', en: 'March', hi: 'मार्च', short: 'Mar' },
    { value: '04', en: 'April', hi: 'अप्रैल', short: 'Apr' },
    { value: '05', en: 'May', hi: 'मई', short: 'May' },
    { value: '06', en: 'June', hi: 'जून', short: 'Jun' },
    { value: '07', en: 'July', hi: 'जुलाई', short: 'Jul' },
    { value: '08', en: 'August', hi: 'अगस्त', short: 'Aug' },
    { value: '09', en: 'September', hi: 'सितंबर', short: 'Sep' },
    { value: '10', en: 'October', hi: 'अक्टूबर', short: 'Oct' },
    { value: '11', en: 'November', hi: 'नवंबर', short: 'Nov' },
    { value: '12', en: 'December', hi: 'दिसंबर', short: 'Dec' },
];

/**
 * Friction-free Vedic Birth Date and Time Selector:
 * Direct numeric inputs with auto-tab jumping, 12-hour AM/PM toggle, and unknown time fallback.
 */
export default function BirthDetailsInput({
    dobValue = '',
    tobValue = '',
    onDobChange,
    onTobChange,
    errors = {},
    showTime = true,
    required = true,
}) {
    const { t, lang } = useLanguage();

    // Parse incoming YYYY-MM-DD if available
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('01');
    const [year, setYear] = useState('');

    // Time states
    const [hour, setHour] = useState('06');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');
    const [timeUnknown, setTimeUnknown] = useState(false);

    const monthRef = useRef(null);
    const yearRef = useRef(null);
    const minRef = useRef(null);

    // Sync initial values from props
    useEffect(() => {
        if (dobValue) {
            const parts = dobValue.split('-');
            if (parts.length === 3) {
                setYear(parts[0]);
                setMonth(parts[1]);
                setDay(parts[2]);
            }
        }
    }, [dobValue]);

    // Handle day input with auto-tabbing
    const handleDayChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
        const num = parseInt(val, 10);
        if (val === '' || (num >= 1 && num <= 31)) {
            setDay(val);
            emitDob(val, month, year);
            if (val.length === 2 || num > 3) {
                monthRef.current?.focus();
            }
        }
    };

    const handleMonthChange = (e) => {
        const val = e.target.value;
        setMonth(val);
        emitDob(day, val, year);
        yearRef.current?.focus();
    };

    const handleYearChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
        setYear(val);
        emitDob(day, month, val);
    };

    const emitDob = (d, m, y) => {
        if (!onDobChange) return;
        if (d && m && y && y.length === 4) {
            const paddedDay = d.padStart(2, '0');
            onDobChange(`${y}-${m}-${paddedDay}`);
        } else if (!d && !y) {
            onDobChange('');
        }
    };

    // Time handling
    const emitTob = (h, min, p, unknown) => {
        if (!onTobChange) return;
        if (unknown) {
            onTobChange('Unknown (Assume Sunrise 06:00 AM)');
            return;
        }
        if (h && min) {
            const hNum = parseInt(h, 10);
            let h24 = hNum;
            if (p === 'PM' && hNum < 12) h24 += 12;
            if (p === 'AM' && hNum === 12) h24 = 0;
            const h24Str = String(h24).padStart(2, '0');
            const minStr = String(min).padStart(2, '0');
            onTobChange(`${h24Str}:${minStr} (${h}:${minStr} ${p})`);
        }
    };

    const handleHourChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
        const num = parseInt(val, 10);
        if (val === '' || (num >= 1 && num <= 12)) {
            setHour(val);
            emitTob(val, minute, period, timeUnknown);
            if (val.length === 2 || num > 1) {
                minRef.current?.focus();
            }
        }
    };

    const handleMinuteChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
        const num = parseInt(val, 10);
        if (val === '' || (num >= 0 && num <= 59)) {
            setMinute(val);
            emitTob(hour, val, period, timeUnknown);
        }
    };

    const togglePeriod = (newPeriod) => {
        setPeriod(newPeriod);
        emitTob(hour, minute, newPeriod, timeUnknown);
    };

    const handleUnknownToggle = (e) => {
        const checked = e.target.checked;
        setTimeUnknown(checked);
        emitTob(hour, minute, period, checked);
    };

    return (
        <div>
            {/* Direct DOB Selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('जन्म तिथि (Date of Birth)', 'Date of Birth (DOB)')} {required && '*'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {t('सीधे टाइप करें (दिन / माह / वर्ष)', 'Type directly (Day / Month / Year)')}
                    </span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 90px', gap: '0.5rem', alignItems: 'center' }}>
                    {/* Day Input */}
                    <div>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="DD"
                            maxLength={2}
                            className={`form-input ${errors.dob ? 'has-error' : ''}`}
                            style={{ textAlign: 'center', fontWeight: 600, padding: '0.65rem 0.35rem', fontSize: '0.95rem' }}
                            value={day}
                            onChange={handleDayChange}
                            aria-label="Day of birth"
                        />
                    </div>

                    {/* Month Dropdown */}
                    <div>
                        <select
                            ref={monthRef}
                            className={`form-input ${errors.dob ? 'has-error' : ''}`}
                            style={{ padding: '0.65rem 0.5rem', fontSize: '0.9rem', fontWeight: 500 }}
                            value={month}
                            onChange={handleMonthChange}
                            aria-label="Month of birth"
                        >
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>
                                    {m.value} - {lang === 'hi' ? m.hi : m.en} ({m.short})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Year Input */}
                    <div>
                        <input
                            ref={yearRef}
                            type="text"
                            inputMode="numeric"
                            placeholder="YYYY"
                            maxLength={4}
                            className={`form-input ${errors.dob ? 'has-error' : ''}`}
                            style={{ textAlign: 'center', fontWeight: 600, padding: '0.65rem 0.35rem', fontSize: '0.95rem' }}
                            value={year}
                            onChange={handleYearChange}
                            aria-label="Year of birth (4 digits)"
                        />
                    </div>
                </div>
                {errors.dob && <p className="form-error" style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertTriangle size={13} />{errors.dob}</p>}
            </div>

            {/* Time of Birth Selector (12-hour format + AM/PM) */}
            {showTime && (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>
                            {t('जन्म समय (Time of Birth)', 'Time of Birth (TOB)')}
                        </label>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={timeUnknown}
                                onChange={handleUnknownToggle}
                            />
                            <span>{t('समय ज्ञात नहीं है', 'Exact time unknown')}</span>
                        </label>
                    </div>

                    {!timeUnknown ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Hour (1-12) */}
                            <div style={{ width: '64px' }}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="HH"
                                    maxLength={2}
                                    className="form-input"
                                    style={{ textAlign: 'center', fontWeight: 600, padding: '0.6rem 0.3rem', fontSize: '0.95rem' }}
                                    value={hour}
                                    onChange={handleHourChange}
                                    aria-label="Hour of birth (1-12)"
                                />
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>:</span>

                            {/* Minute (00-59) */}
                            <div style={{ width: '64px' }}>
                                <input
                                    ref={minRef}
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="MM"
                                    maxLength={2}
                                    className="form-input"
                                    style={{ textAlign: 'center', fontWeight: 600, padding: '0.6rem 0.3rem', fontSize: '0.95rem' }}
                                    value={minute}
                                    onChange={handleMinuteChange}
                                    aria-label="Minute of birth (00-59)"
                                />
                            </div>

                            {/* AM / PM Segmented Control */}
                            <div style={{ display: 'flex', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--warm-100)' }}>
                                <button
                                    type="button"
                                    onClick={() => togglePeriod('AM')}
                                    style={{
                                        border: 'none',
                                        padding: '0.55rem 0.85rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        background: period === 'AM' ? 'var(--navy-900)' : 'transparent',
                                        color: period === 'AM' ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => togglePeriod('PM')}
                                    style={{
                                        border: 'none',
                                        padding: '0.55rem 0.85rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        background: period === 'PM' ? 'var(--navy-900)' : 'transparent',
                                        color: period === 'PM' ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    PM
                                </button>
                            </div>

                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                                (12-hour format)
                            </span>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--warm-100)', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--navy-800)', border: '1px solid var(--border-light)' }}>
                            <Sunrise size={13} style={{ verticalAlign: '-2px', marginRight: '0.3rem' }} />{t('सूर्योदय काल (प्रातः 06:00 AM) के आधार पर गणना की जाएगी।', 'Vedic planetary chart will be calculated assuming standard sunrise (06:00 AM).')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
