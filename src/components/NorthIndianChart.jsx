// North Indian Kundli Chart (Diamond Layout) SVG Component
// File: src/components/NorthIndianChart.jsx

export default function NorthIndianChart({ houseData, devoteeName, lagnaName }) {
    if (!houseData) return null;

    // Coordinate positions for Rashi Number and Planet Badges for all 12 houses
    const houseCoords = {
        1: { num: { x: 200, y: 135 }, planets: { x: 200, y: 80 } },
        2: { num: { x: 125, y: 65 }, planets: { x: 85, y: 40 } },
        3: { num: { x: 65, y: 125 }, planets: { x: 40, y: 85 } },
        4: { num: { x: 135, y: 200 }, planets: { x: 80, y: 200 } },
        5: { num: { x: 65, y: 275 }, planets: { x: 40, y: 315 } },
        6: { num: { x: 125, y: 335 }, planets: { x: 85, y: 360 } },
        7: { num: { x: 200, y: 265 }, planets: { x: 200, y: 320 } },
        8: { num: { x: 275, y: 335 }, planets: { x: 315, y: 360 } },
        9: { num: { x: 335, y: 275 }, planets: { x: 360, y: 315 } },
        10: { num: { x: 265, y: 200 }, planets: { x: 320, y: 200 } },
        11: { num: { x: 335, y: 125 }, planets: { x: 360, y: 85 } },
        12: { num: { x: 275, y: 65 }, planets: { x: 315, y: 40 } },
    };

    return (
        <div style={{ maxWidth: '420px', margin: '0 auto', background: '#fffefb', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border-gold)', boxShadow: '0 10px 25px rgba(212,168,67,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.4rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--navy-950)', display: 'block' }}>
                    ✦ जन्म लग्न कुण्डली (Lagna Chart) ✦
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold-800)', fontWeight: 600 }}>
                    {devoteeName} · {lagnaName}
                </span>
            </div>

            <svg viewBox="0 0 400 400" width="100%" height="auto" style={{ display: 'block', margin: '0 auto' }}>
                {/* Background Box */}
                <rect x="0" y="0" width="400" height="400" fill="#fffdfa" stroke="#c49a2c" strokeWidth="2.5" />

                {/* Diagonal Lines */}
                <line x1="0" y1="0" x2="400" y2="400" stroke="#d4a843" strokeWidth="1.75" />
                <line x1="0" y1="400" x2="400" y2="0" stroke="#d4a843" strokeWidth="1.75" />

                {/* Inner Diamond */}
                <polygon points="200,0 400,200 200,400 0,200" fill="#fdfaf3" stroke="#c49a2c" strokeWidth="2" />

                {/* Center Om Watermark */}
                <text x="200" y="208" textAnchor="middle" fill="rgba(212,168,67,0.18)" fontSize="48" fontFamily="serif" fontWeight="bold">
                    ॐ
                </text>

                {/* 12 House Labels & Planets */}
                {Object.keys(houseData).map(hNum => {
                    const h = houseData[hNum];
                    const coord = houseCoords[hNum];
                    if (!coord) return null;

                    return (
                        <g key={hNum}>
                            {/* Rashi Number in House */}
                            <text
                                x={coord.num.x}
                                y={coord.num.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#9a3412"
                                fontSize="12"
                                fontWeight="800"
                                fontFamily="sans-serif"
                            >
                                {h.rashiId}
                            </text>

                            {/* Planets in House */}
                            {h.planets && h.planets.length > 0 && (
                                <text
                                    x={coord.planets.x}
                                    y={coord.planets.y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="#1c2150"
                                    fontSize="11"
                                    fontWeight="700"
                                    fontFamily="sans-serif"
                                >
                                    {h.planets.map((p, idx) => (
                                        <tspan
                                            key={idx}
                                            x={coord.planets.x}
                                            dy={idx === 0 ? (h.planets.length > 2 ? '-0.8em' : (h.planets.length > 1 ? '-0.4em' : '0')) : '1.1em'}
                                            fill={p === 'Asc' ? '#c49a2c' : (['Ra', 'Ke', 'Sa', 'Ma'].includes(p) ? '#b91c1c' : '#0f172a')}
                                        >
                                            {p}
                                        </tspan>
                                    ))}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>✦ Red = Shani/Ketu/Rahu/Mars</span>
                <span>✦ Gold = Asc (Lagna)</span>
            </div>
        </div>
    );
}
