// Deterministic, Panchang-based horoscope (Rashifal) text generator.
// File: backend/utils/horoscope-generator.js
//
// Replaces the earlier Gemini-AI-generated horoscope text. That approach
// had a real, user-reported failure mode: when every model in the AI
// model list went dead (see backend/_gemini.js's fix history), every
// request silently fell through to a generic fallback template, and all
// 12 rashis looked the same. A template built directly from REAL current
// planetary positions has no such failure mode - it can't "go down", and
// it's always grounded in this moment's actual Gochar (transits), not an
// AI's guess at what a horoscope should sound like.
//
// Approach: for each of the 5 slow-moving grahas that classically drive
// Gochar-based predictions (Moon for the day's mood, Jupiter/Saturn/Rahu/
// Ketu for the broader theme), look up which house it currently occupies
// counted from the person's Rashi (Chandra Gochar convention), and pull a
// short, specific effect-phrase for that planet-in-that-house from a
// hand-written table grounded in classical Gochar-phala principles. These
// phrases are then assembled into the 4 standard categories (career,
// money, relationships, health) - each category pulls in whichever
// planets are actually relevant to it this reading, so the paragraph
// reflects what's really transiting, not a fixed template with the rashi
// name swapped in.

const RASHIS = [
    { id: 'mesha', name: 'मेष', nameEn: 'Aries', lord: 'Mars', symbol: '♈' },
    { id: 'vrishabha', name: 'वृषभ', nameEn: 'Taurus', lord: 'Venus', symbol: '♉' },
    { id: 'mithuna', name: 'मिथुन', nameEn: 'Gemini', lord: 'Mercury', symbol: '♊' },
    { id: 'karka', name: 'कर्क', nameEn: 'Cancer', lord: 'Moon', symbol: '♋' },
    { id: 'simha', name: 'सिंह', nameEn: 'Leo', lord: 'Sun', symbol: '♌' },
    { id: 'kanya', name: 'कन्या', nameEn: 'Virgo', lord: 'Mercury', symbol: '♍' },
    { id: 'tula', name: 'तुला', nameEn: 'Libra', lord: 'Venus', symbol: '♎' },
    { id: 'vrishchika', name: 'वृश्चिक', nameEn: 'Scorpio', lord: 'Mars', symbol: '♏' },
    { id: 'dhanu', name: 'धनु', nameEn: 'Sagittarius', lord: 'Jupiter', symbol: '♐' },
    { id: 'makara', name: 'मकर', nameEn: 'Capricorn', lord: 'Saturn', symbol: '♑' },
    { id: 'kumbha', name: 'कुंभ', nameEn: 'Aquarius', lord: 'Saturn', symbol: '♒' },
    { id: 'meena', name: 'मीन', nameEn: 'Pisces', lord: 'Jupiter', symbol: '♓' },
];

// House-from-Rashi effect phrases, one set per planet. Grounded in
// classical Gochar-phala (transit-result) principles - e.g. Jupiter in
// the 11th from Moon is a well-known strong-gains placement, Saturn in
// the 8th is a classically challenging transit, Rahu in the 3rd/6th/11th
// ("upachaya" houses) is traditionally read as favourable for material
// ambition, etc. Each phrase is written to slot into a sentence about
// one of the 4 categories below.
const GOCHAR_EFFECTS = {
    moon: {
        1: { hi: 'आज मन उत्साहित व सक्रिय रहेगा', en: "today your mind feels energetic and active" },
        2: { hi: 'आज वाणी व धन संबंधी विषयों पर ध्यान रहेगा', en: "today your focus turns to money matters and how you speak" },
        3: { hi: 'आज साहस व संवाद की ऊर्जा प्रबल रहेगी', en: "today you'll feel a strong pull toward courage and communication" },
        4: { hi: 'आज घर व मानसिक शांति प्राथमिकता में रहेगी', en: "today home and inner peace take priority" },
        5: { hi: 'आज रचनात्मकता व भावनाओं का प्रवाह तीव्र रहेगा', en: "today creativity and emotions flow strongly" },
        6: { hi: 'आज कार्यक्षेत्र में थोड़ी बेचैनी या प्रतिस्पर्धा महसूस हो सकती है', en: "today you may feel some restlessness or competitive pressure at work" },
        7: { hi: 'आज रिश्तों व साझेदारी पर मन केंद्रित रहेगा', en: "today your attention centers on relationships and partnerships" },
        8: { hi: 'आज मन थोड़ा अस्थिर व चिंतनशील रह सकता है', en: "today the mind may feel a little unsettled or introspective" },
        9: { hi: 'आज भाग्य व आध्यात्मिकता की ओर झुकाव रहेगा', en: "today you'll feel drawn toward luck-favouring and spiritual thoughts" },
        10: { hi: 'आज कार्य व प्रतिष्ठा से जुड़े विषय मन में रहेंगे', en: "today career and reputation stay on your mind" },
        11: { hi: 'आज लाभ व मित्रों के साथ समय शुभ रहेगा', en: "today gains and time with friends feel favourable" },
        12: { hi: 'आज विश्राम व एकांत की आवश्यकता महसूस होगी', en: "today you'll feel the need for rest and quiet" },
    },
    jupiter: {
        1: { hi: 'गुरु आपकी राशि में गोचर कर रहे हैं, जिससे आत्मविश्वास व व्यक्तित्व निखरेगा', en: "Jupiter is transiting your own sign, boosting confidence and personal presence" },
        2: { hi: 'गुरु धन भाव में हैं, जो आर्थिक स्थिरता व पारिवारिक सुख का संकेत देता है', en: "Jupiter in your money house suggests financial stability and family harmony building" },
        3: { hi: 'गुरु पराक्रम भाव में हैं, साहस व अपने प्रयासों से प्रगति के योग हैं', en: "Jupiter in your effort house favours progress through your own courage and initiative" },
        4: { hi: 'गुरु सुख भाव में हैं, घरेलू सुख व मानसिक संतोष बढ़ेगा', en: "Jupiter in your comfort house brings growing domestic happiness and contentment" },
        5: { hi: 'गुरु पंचम भाव में हैं, जो संतान, शिक्षा व बुद्धि के लिए अत्यंत शुभ है', en: "Jupiter in your 5th house is highly favourable for children, learning, and clarity of intellect" },
        6: { hi: 'गुरु षष्ठ भाव में हैं, प्रतिस्पर्धियों पर विजय व ऋण-मुक्ति के योग हैं', en: "Jupiter in your 6th house favours overcoming competition and easing debts" },
        7: { hi: 'गुरु सप्तम भाव में हैं, विवाह व साझेदारी के लिए शुभ समय है', en: "Jupiter in your partnership house is favourable for marriage and business alliances" },
        8: { hi: 'गुरु अष्टम भाव में हैं, परिवर्तन के दौर में धैर्य रखना लाभकारी रहेगा', en: "Jupiter in your 8th house calls for patience through a period of transformation" },
        9: { hi: 'गुरु भाग्य भाव में हैं, यह गुरु का सर्वाधिक शुभ गोचर है — भाग्योदय के प्रबल योग', en: "Jupiter in your 9th house is one of its most auspicious transits - strong luck-building energy" },
        10: { hi: 'गुरु कर्म भाव में हैं, करियर में उन्नति व सम्मान प्राप्ति के योग हैं', en: "Jupiter in your career house favours advancement and recognition" },
        11: { hi: 'गुरु लाभ भाव में हैं, यह गुरु का अत्यंत शुभ गोचर है — आय व लाभ के प्रबल योग', en: "Jupiter in your gains house is a classically excellent transit for income and fulfilment of wishes" },
        12: { hi: 'गुरु व्यय भाव में हैं, आध्यात्मिक उन्नति के साथ व्यय पर ध्यान आवश्यक है', en: "Jupiter in your 12th house favours spiritual growth, though expenses need watching" },
    },
    saturn: {
        1: { hi: 'शनि स्वराशि में गोचर कर रहे हैं, अनुशासन व दायित्व की परीक्षा का समय है', en: "Saturn is transiting your own sign, testing discipline and how you carry responsibility" },
        2: { hi: 'शनि धन भाव में हैं, व्यय पर संयम व बचत की आदत लाभकारी रहेगी', en: "Saturn in your money house rewards careful spending and disciplined saving" },
        3: { hi: 'शनि पराक्रम भाव में हैं, निरंतर प्रयास से धीरे-धीरे सफलता मिलेगी', en: "Saturn in your effort house rewards steady, sustained work with gradual success" },
        4: { hi: 'शनि सुख भाव में हैं, घरेलू जिम्मेदारियों में धैर्य आवश्यक है', en: "Saturn in your comfort house calls for patience with domestic responsibilities" },
        5: { hi: 'शनि पंचम भाव में हैं, पढ़ाई व निर्णयों में गंभीरता से लाभ होगा', en: "Saturn in your 5th house rewards seriousness in study and decision-making" },
        6: { hi: 'शनि षष्ठ भाव में हैं, यह शनि का शुभ गोचर है — प्रतिस्पर्धियों व रोगों पर विजय', en: "Saturn in your 6th house is a favourable placement for overcoming rivals and health issues through disciplined effort" },
        7: { hi: 'शनि सप्तम भाव में हैं, रिश्तों में परिपक्वता व प्रतिबद्धता की आवश्यकता है', en: "Saturn in your partnership house calls for maturity and commitment in relationships" },
        8: { hi: 'शनि अष्टम भाव में हैं, सतर्कता व धैर्य रखते हुए आगे बढ़ें', en: "Saturn in your 8th house calls for extra caution and patience right now" },
        9: { hi: 'शनि भाग्य भाव में हैं, परंपरा व गुरुजनों के मार्गदर्शन का सम्मान लाभकारी रहेगा', en: "Saturn in your 9th house rewards respecting tradition and the guidance of elders" },
        10: { hi: 'शनि कर्म भाव में हैं, कड़ी मेहनत का फल करियर में स्पष्ट दिखेगा', en: "Saturn in your career house means hard work translates visibly into professional results" },
        11: { hi: 'शनि लाभ भाव में हैं, यह शनि का शुभ गोचर है — स्थिर आय व दीर्घकालिक लाभ', en: "Saturn in your gains house is a favourable placement for steady income and long-term gains" },
        12: { hi: 'शनि व्यय भाव में हैं, विश्राम व आंतरिक अनुशासन पर ध्यान दें', en: "Saturn in your 12th house calls for rest and inward discipline" },
    },
    rahu: {
        1: { hi: 'राहु लग्न में हैं, अपरंपरागत निर्णयों में सोच-समझकर कदम रखें', en: "Rahu in your 1st house calls for careful thought before unconventional decisions" },
        2: { hi: 'राहु धन भाव में हैं, अनावश्यक व्यय से बचें, धैर्य से धन-वृद्धि होगी', en: "Rahu in your money house favours avoiding impulsive spending; patience builds wealth steadily" },
        3: { hi: 'राहु पराक्रम भाव में हैं, यह राहु का शुभ स्थान है — साहसिक प्रयासों में सफलता', en: "Rahu in your effort house is a favourable placement for bold initiatives and self-driven success" },
        4: { hi: 'राहु सुख भाव में हैं, घरेलू मामलों में अनावश्यक चिंता से बचें', en: "Rahu in your comfort house calls for avoiding unnecessary worry over domestic matters" },
        5: { hi: 'राहु पंचम भाव में हैं, निर्णयों में स्पष्टता व शांत मन आवश्यक है', en: "Rahu in your 5th house calls for clarity and a calm mind before key decisions" },
        6: { hi: 'राहु षष्ठ भाव में हैं, यह राहु का शुभ स्थान है — प्रतिस्पर्धियों पर विजय के योग', en: "Rahu in your 6th house is a favourable placement, well suited for overcoming competition" },
        7: { hi: 'राहु सप्तम भाव में हैं, साझेदारी व रिश्तों में पारदर्शिता बनाए रखें', en: "Rahu in your partnership house rewards keeping full transparency in relationships and deals" },
        8: { hi: 'राहु अष्टम भाव में हैं, अनावश्यक जोखिम से बचना उचित रहेगा', en: "Rahu in your 8th house favours avoiding unnecessary risk right now" },
        9: { hi: 'राहु भाग्य भाव में हैं, पारंपरिक मान्यताओं व नए विचारों में संतुलन रखें', en: "Rahu in your 9th house calls for balancing new ideas with respect for tradition" },
        10: { hi: 'राहु कर्म भाव में हैं, करियर में असाधारण अवसर मिल सकते हैं, सतर्क रहें', en: "Rahu in your career house can bring unusual opportunities - stay alert and grounded" },
        11: { hi: 'राहु लाभ भाव में हैं, यह राहु का शुभ स्थान है — आय में अप्रत्याशित वृद्धि संभव', en: "Rahu in your gains house is a favourable placement, capable of bringing unexpected income" },
        12: { hi: 'राहु व्यय भाव में हैं, नींद व मानसिक शांति पर विशेष ध्यान दें', en: "Rahu in your 12th house calls for special attention to sleep and mental calm" },
    },
    ketu: {
        1: { hi: 'केतु लग्न में हैं, आत्म-चिंतन व आध्यात्मिकता की ओर रुझान बढ़ेगा', en: "Ketu in your 1st house deepens a pull toward introspection and spirituality" },
        2: { hi: 'केतु धन भाव में हैं, भौतिक वस्तुओं के प्रति वैराग्य भाव रह सकता है', en: "Ketu in your money house may bring a detached attitude toward material accumulation" },
        3: { hi: 'केतु पराक्रम भाव में हैं, अकेले प्रयासों में विशेष सफलता मिलेगी', en: "Ketu in your effort house favours quiet, self-reliant effort over group initiatives" },
        4: { hi: 'केतु सुख भाव में हैं, घर में शांति के लिए भावनात्मक जुड़ाव आवश्यक है', en: "Ketu in your comfort house calls for emotional connection to maintain domestic peace" },
        5: { hi: 'केतु पंचम भाव में हैं, अंतर्ज्ञान प्रबल रहेगा, निर्णयों में इस पर भरोसा करें', en: "Ketu in your 5th house sharpens intuition - trust it in your decisions" },
        6: { hi: 'केतु षष्ठ भाव में हैं, यह केतु का शुभ स्थान है — शत्रु व बाधाओं पर विजय', en: "Ketu in your 6th house is a favourable placement for overcoming obstacles and rivals" },
        7: { hi: 'केतु सप्तम भाव में हैं, रिश्तों में स्थान व स्वतंत्रता का सम्मान रखें', en: "Ketu in your partnership house rewards giving each other space and independence" },
        8: { hi: 'केतु अष्टम भाव में हैं, गूढ़ विषयों व आत्मिक खोज में रुचि बढ़ेगी', en: "Ketu in your 8th house deepens interest in the mystical and the inner search" },
        9: { hi: 'केतु भाग्य भाव में हैं, गुरु व शास्त्रों के प्रति श्रद्धा बढ़ेगी', en: "Ketu in your 9th house deepens reverence for teachers and sacred texts" },
        10: { hi: 'केतु कर्म भाव में हैं, करियर में पारंपरिक राह से हटकर सोच लाभकारी रहेगी', en: "Ketu in your career house rewards an unconventional approach to your work" },
        11: { hi: 'केतु लाभ भाव में हैं, यह केतु का शुभ स्थान है — इच्छापूर्ति में सहायक', en: "Ketu in your gains house is a favourable placement, quietly supportive of fulfilling wishes" },
        12: { hi: 'केतु व्यय भाव में हैं, यह केतु का सर्वाधिक शुभ गोचर है — गहन आध्यात्मिक अनुभव संभव', en: "Ketu in your 12th house is one of its most favourable transits - deep spiritual experience is possible" },
    },
};

// Which houses (from Rashi) are most relevant to each of the 4 categories
// the horoscope always covers. A planet transiting one of these houses
// gets pulled into that category's paragraph. Houses can appear in more
// than one list (e.g. the 2nd house governs both family and speech, so it
// informs both money and relationships) - each category just checks
// whichever planets happen to be in ITS relevant houses this reading.
const CATEGORY_HOUSES = {
    career: [10, 6, 1],
    money: [2, 11, 4],
    relationships: [7, 5, 2],
    health: [6, 1, 8],
};

const CATEGORY_LABEL = {
    career: { hi: 'करियर एवं कार्यक्षेत्र', en: 'Career & Work' },
    money: { hi: 'धन एवं वित्त', en: 'Money & Finance' },
    relationships: { hi: 'रिश्ते एवं परिवार', en: 'Relationships & Family' },
    health: { hi: 'स्वास्थ्य', en: 'Health' },
};

// Deterministic (date + rashi + category seeded) fallback line for a
// category when no slow-moving planet happens to be transiting any of
// its relevant houses this reading - keeps every paragraph populated
// without ever repeating verbatim within the same day for a given rashi.
const NEUTRAL_LINES = {
    career: [
        { hi: 'कार्यक्षेत्र में स्थिरता बनी रहेगी, निरंतरता बनाए रखें।', en: 'Work stays on a steady footing today - keep up your consistent effort.' },
        { hi: 'कार्यक्षेत्र में सामान्य प्रगति के संकेत हैं, धैर्य रखें।', en: 'Work shows ordinary, steady progress - patience serves you well.' },
    ],
    money: [
        { hi: 'आर्थिक स्थिति सामान्य रहेगी, अनावश्यक व्यय से बचें।', en: 'Finances stay steady - it is a good day to avoid unnecessary spending.' },
        { hi: 'धन संबंधी मामलों में सामान्य स्थिरता रहेगी।', en: 'Money matters remain on an even, stable footing today.' },
    ],
    relationships: [
        { hi: 'पारिवारिक व सामाजिक जीवन में सामान्य सामंजस्य बना रहेगा।', en: 'Family and social life stay on an even, harmonious note today.' },
        { hi: 'रिश्तों में सामान्य समझ व सहयोग बना रहेगा।', en: 'Relationships continue with ordinary understanding and cooperation.' },
    ],
    health: [
        { hi: 'स्वास्थ्य सामान्य रहेगा, हल्का व्यायाम लाभकारी रहेगा।', en: 'Health stays steady - light exercise will serve you well today.' },
        { hi: 'ऊर्जा का स्तर सामान्य रहेगा, नियमित दिनचर्या बनाए रखें।', en: 'Energy levels stay average - maintaining your regular routine helps.' },
    ],
};

const LUCKY_COLORS = [
    { hi: 'लाल', en: 'Red' }, { hi: 'पीला', en: 'Yellow' }, { hi: 'हरा', en: 'Green' },
    { hi: 'सफ़ेद', en: 'White' }, { hi: 'नारंगी', en: 'Orange' }, { hi: 'गुलाबी', en: 'Pink' },
    { hi: 'आसमानी नीला', en: 'Sky Blue' }, { hi: 'सुनहरा', en: 'Golden' },
];

function houseFrom(fromSignIdx, planetSignIdx) {
    return ((planetSignIdx - fromSignIdx + 12) % 12) + 1;
}

function signOf(deg) {
    return Math.floor((((deg % 360) + 360) % 360) / 30);
}

// Simple deterministic hash so the same rashi+period+dateKey always
// produces the same pick from a small variation list (e.g. which neutral
// line, which lucky color) - varied across rashis/days, but stable if
// this function is called again for the same cache key.
function seededPick(seedStr, listLength) {
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    return h % listLength;
}

/**
 * Builds the full horoscope text directly from real current sidereal
 * planetary positions - no AI call, so it cannot fail the way the earlier
 * Gemini-based version did when every model in its list went dead.
 *
 * @param {object} rashi - one entry from RASHIS
 * @param {string} period - 'daily' | 'monthly'
 * @param {{sun,moon,mars,mercury,jupiter,venus,saturn,rahu,ketu}} sid - sidereal longitudes (degrees)
 * @param {string} dateKey - from getDateKey(), used only to seed deterministic variety
 */
function buildPanchangHoroscope(rashi, period, sid, dateKey) {
    const rashiIndex = RASHIS.findIndex(r => r.id === rashi.id);

    // Moon only matters for the 'daily' mood line - it moves too fast
    // (~2.25 days per sign) to anchor a stable monthly reading.
    const housesByPlanet = {
        jupiter: houseFrom(rashiIndex, signOf(sid.jupiter)),
        saturn: houseFrom(rashiIndex, signOf(sid.saturn)),
        rahu: houseFrom(rashiIndex, signOf(sid.rahu)),
        ketu: houseFrom(rashiIndex, signOf(sid.ketu)),
    };
    if (period !== 'monthly') {
        housesByPlanet.moon = houseFrom(rashiIndex, signOf(sid.moon));
    }

    const scope = period === 'monthly' ? { hi: 'इस माह', en: 'this month' } : { hi: 'आज', en: 'today' };

    // Build each category paragraph from whichever slow planets are
    // actually transiting one of that category's relevant houses. A planet
    // already used in an earlier category (houses can overlap between
    // categories, e.g. house 1 appears in both career and health) is
    // skipped on repeat categories, so the same sentence never appears
    // verbatim twice in one reading.
    const categoryParas = { hi: {}, en: {} };
    const usedPlanets = new Set();
    for (const cat of Object.keys(CATEGORY_HOUSES)) {
        const relevantHouses = CATEGORY_HOUSES[cat];
        const hits = [];
        for (const planet of ['jupiter', 'saturn', 'rahu', 'ketu']) {
            if (usedPlanets.has(planet)) continue;
            const h = housesByPlanet[planet];
            if (relevantHouses.includes(h)) {
                hits.push(GOCHAR_EFFECTS[planet][h]);
                usedPlanets.add(planet);
            }
        }
        if (hits.length === 0) {
            const pick = seededPick(`${rashi.id}:${period}:${dateKey}:${cat}`, NEUTRAL_LINES[cat].length);
            hits.push(NEUTRAL_LINES[cat][pick]);
        }
        categoryParas.hi[cat] = hits.map(h => h.hi).join(' ');
        categoryParas.en[cat] = hits.map(h => h.en).join(' ');
    }

    const moonLine = housesByPlanet.moon ? GOCHAR_EFFECTS.moon[housesByPlanet.moon] : null;

    const colorIdx = seededPick(`${rashi.id}:${period}:${dateKey}:color`, LUCKY_COLORS.length);
    const luckyColor = LUCKY_COLORS[colorIdx];
    // Lucky number from the rashi's classical ruling-planet number
    // (1 Sun, 2 Moon, 3 Jupiter, 4 Rahu/Uranus-analogue unused in Vedic,
    // 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars - simplified Vedic
    // numerology mapping) plus the day, for a touch of daily variation.
    const lordNumber = { Sun: 1, Moon: 2, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 6, Saturn: 8 }[rashi.lord] || 1;
    const luckyNumber = ((lordNumber + seededPick(`${rashi.id}:${period}:${dateKey}:num`, 9)) % 9) + 1;

    const hi = `${moonLine ? moonLine.hi + ' ' : ''}${rashi.name} राशि के लिए ${scope.hi} ग्रह-गोचर इस प्रकार रहेंगे:

🔹 करियर: ${categoryParas.hi.career}
🔹 धन: ${categoryParas.hi.money}
🔹 रिश्ते: ${categoryParas.hi.relationships}
🔹 स्वास्थ्य: ${categoryParas.hi.health}

शुभ रंग: ${luckyColor.hi} | शुभ अंक: ${luckyNumber}

(यह वास्तविक ग्रह-स्थितियों पर आधारित सामान्य मार्गदर्शन है। अपनी सटीक जन्म-कुंडली के अनुसार विश्लेषण हेतु डॉ. उमंग नाथ शर्मा से संपर्क करें।)`;

    const en = `${moonLine ? moonLine.en.charAt(0).toUpperCase() + moonLine.en.slice(1) + '. ' : ''}Here's how the real current planetary transits (Gochar) shape ${scope.en} for ${rashi.nameEn}:

🔹 Career: ${categoryParas.en.career}
🔹 Money: ${categoryParas.en.money}
🔹 Relationships: ${categoryParas.en.relationships}
🔹 Health: ${categoryParas.en.health}

Lucky Color: ${luckyColor.en} | Lucky Number: ${luckyNumber}

(This is general guidance based on real current planetary positions. For analysis based on your exact birth chart, consult Dr. Umang Nath Sharma.)`;

    return { hi, en };
}

module.exports = { RASHIS, buildPanchangHoroscope, houseFrom, signOf };
