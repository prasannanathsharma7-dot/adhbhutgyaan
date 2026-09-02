// lalKitab.js
// Lal Kitab system. NOTE: Lal Kitab uses its own non-Parashari methodology
// throughout (fixed house-numbering distinct from sign-lordship, its own
// aspect rules, etc.) - genuinely more uncertain ground than Vimshottari/
// divisional charts. Scoped here to the pieces with clear, corroborated
// sourcing: Pakka Ghar (permanent house) assignments, a simplified Soya/
// Jaaga (sleeping/awake) status, a Kendra/Trikona-based Nek/Manda proxy,
// the 35-year Dasha (sequence+years corroborated by two independent
// sources citing the same primary reference, Arun Sanhita 1952 p.10), and
// standard remedy suggestions. Each simplification is disclosed in
// comments, not silently presented as the complete classical method.

const PAKKA_GHAR = { sun: [1], moon: [4], mars: [1, 8], mercury: [3, 6], jupiter: [2, 5, 9, 12], venus: [7], saturn: [10, 11], rahu: [3, 6], ketu: [9, 12] };

const DASHA_ORDER = ['jupiter', 'sun', 'moon', 'venus', 'mars', 'mercury', 'saturn', 'rahu', 'ketu'];
const DASHA_YEARS = { jupiter: 6, sun: 2, moon: 1, venus: 3, mars: 6, mercury: 2, saturn: 6, rahu: 6, ketu: 3 };

const KENDRA_TRIKONA = [1, 4, 5, 7, 9, 10];
const DUSTHANA = [6, 8, 12];

const REMEDIES_HI = {
    sun: ['रविवार को उगते सूर्य को जल अर्पित करें', 'पिता एवं वृद्धजनों का सम्मान करें', 'गेहूं व गुड़ का दान करें'],
    moon: ['सोमवार को शिवलिंग पर दूध चढ़ाएं', 'चांदी धारण करें', 'माता का सम्मान एवं सेवा करें'],
    mars: ['मंगलवार को हनुमान चालीसा का पाठ करें', 'मीठी वस्तु का दान करें', 'क्रोध पर नियंत्रण रखें'],
    mercury: ['बुधवार को गणेश जी की पूजा करें', 'हरी वस्तुएं दान करें', 'बहनों/बुआ का सम्मान करें'],
    jupiter: ['गुरुवार को पीली वस्तुओं का दान करें', 'गुरुजनों का आशीर्वाद लें', 'केसर का तिलक लगाएं'],
    venus: ['शुक्रवार को सफेद वस्तुओं का दान करें', 'गाय की सेवा करें', 'स्त्रियों का सम्मान करें'],
    saturn: ['शनिवार को तेल व काले तिल का दान करें', 'मजदूरों/गरीबों की सहायता करें', 'लोहे की वस्तु दान करें'],
    rahu: ['नारियल प्रवाहित करें', 'चांदी का टुकड़ा जल में प्रवाहित करें', 'वृद्ध व्यक्तियों की सेवा करें'],
    ketu: ['कुत्तों को भोजन खिलाएं', 'तिल का दान करें', 'कंबल दान करें'],
};
const REMEDIES_EN = {
    sun: ['Offer water to the rising Sun on Sundays', 'Respect father and elders', 'Donate wheat and jaggery'],
    moon: ['Offer milk to a Shivling on Mondays', 'Wear silver', 'Respect and care for the mother'],
    mars: ['Recite Hanuman Chalisa on Tuesdays', 'Donate sweets', 'Practice controlling anger'],
    mercury: ["Worship Lord Ganesha on Wednesdays", 'Donate green items', "Respect sisters/father's sisters"],
    jupiter: ['Donate yellow items on Thursdays', "Seek elders' blessings", 'Apply a saffron tilak'],
    venus: ['Donate white items on Fridays', 'Serve/care for cows', 'Respect women'],
    saturn: ['Donate oil and black sesame on Saturdays', 'Help laborers/the needy', 'Donate iron items'],
    rahu: ['Float a coconut in flowing water', 'Immerse a piece of silver in water', 'Serve elderly people'],
    ketu: ['Feed dogs', 'Donate sesame seeds', 'Donate blankets'],
};

/** planets: report.planets (has .key, .house). */
function analyzeLalKitab(planets, lang) {
    const T = (hi, en) => (lang === 'hi' ? hi : en);

    const grahaSthiti = planets.map(p => {
        const isPakka = (PAKKA_GHAR[p.key] || []).includes(p.house);
        // Simplified Soya/Jaaga: a planet in its Pakka Ghar is always
        // Jagta (awake) per the explicit Lal Kitab 1952 rule; otherwise,
        // as a defensible proxy for the full aspect-based rule, a planet
        // sharing its house with another planet is treated as Jagta
        // (conjunction giving mutual influence), and a planet alone in a
        // non-Pakka house is treated as Soya (sleeping).
        const conjunctCount = planets.filter(other => other.key !== p.key && other.house === p.house).length;
        const isJagta = isPakka || conjunctCount > 0;
        const nekManda = KENDRA_TRIKONA.includes(p.house) ? T('नेक', 'Nek (Benefic)') : DUSTHANA.includes(p.house) ? T('मंदा', 'Manda (Malefic)') : T('सम', 'Neutral');
        return {
            key: p.key,
            house: p.house,
            status: isJagta ? T('जागृत', 'Jagta (Awake)') : T('सोया हुआ', 'Soya (Sleeping)'),
            isPakkaGhar: isPakka,
            nekManda,
        };
    });

    // "Kismat jagane wala graha" (the planet that awakens fortune) - the
    // simplified convention used here: the strongest Nek planet already
    // Jagta and in a Kendra/Trikona house.
    const kismatJagane = grahaSthiti.find(g => g.nekManda.startsWith(T('नेक', 'Nek')) && g.status.startsWith(T('जागृत', 'Jagta')));

    return { grahaSthiti, kismatJaganeWala: kismatJagane ? kismatJagane.key : null };
}

/** startingPlanet: which of the 9 DASHA_ORDER planets the cycle should
 *  begin from. Simplified convention: the person's own Lagna lord
 *  (a defensible starting point given the classical birth-time-table
 *  method isn't clearly, consistently documented across sources). */
function calculateLalKitab35YearDasha(startingPlanet, birthDate) {
    const startIdx = DASHA_ORDER.indexOf(startingPlanet) >= 0 ? DASHA_ORDER.indexOf(startingPlanet) : 0;
    const periods = [];
    let cursor = new Date(birthDate);
    for (let i = 0; i < 9; i++) {
        const planet = DASHA_ORDER[(startIdx + i) % 9];
        const years = DASHA_YEARS[planet];
        const startDate = new Date(cursor);
        const endDate = new Date(cursor.getTime() + years * 365.25 * 86400000);
        periods.push({ planet, years, startDate, endDate });
        cursor = endDate;
    }
    return periods;
}

function getRemedies(planetKey, lang) {
    return lang === 'hi' ? REMEDIES_HI[planetKey] : REMEDIES_EN[planetKey];
}

module.exports = { analyzeLalKitab, calculateLalKitab35YearDasha, getRemedies, PAKKA_GHAR, DASHA_ORDER, DASHA_YEARS };
