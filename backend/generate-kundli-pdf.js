// generate-kundli-pdf.js
// Generates the full 24-page, bilingual (Hindi/English) Kundali PDF report
// in a traditional Kashi red-ink booklet style, branded with the Adhbhut
// Gyaan logo and Dr. Umang Nath Sharma's name at the top of every page.
//
// Built with pdfkit (Node-native) rather than puppeteer/@sparticuz/chromium
// deliberately - a headless-browser dependency is heavy, and this project
// has no way to verify it actually works within Cloud Run's memory/timeout
// limits from a local sandbox before shipping it. pdfkit has no such risk.

const PDFDocument = require('pdfkit');
const path = require('path');
const { withCors, getDb, checkRateLimit } = require('./_db');
const { computeFullKundliReport, SIGN_NAMES } = require('./utils/fullKundliReport');
const { maitriLabel } = require('./utils/lodhaRules');

const FONT_DIR = path.join(__dirname, 'fonts');
const FONT_REGULAR = path.join(FONT_DIR, 'NotoSansDevanagari-Regular.ttf');
const FONT_BOLD = path.join(FONT_DIR, 'NotoSansDevanagari-Bold.ttf');
const LOGO_PATH = path.join(__dirname, 'assets', 'logo-rgb.png');

const RED = '#b91c1c';
const GOLD = '#c49a2c';
const NAVY = '#0d1030';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 36;

const PLANET_LABEL = { sun: 'Sun (Surya)', moon: 'Moon (Chandra)', mars: 'Mars (Mangal)', mercury: 'Mercury (Budh)', jupiter: 'Jupiter (Guru)', venus: 'Venus (Shukra)', saturn: 'Saturn (Shani)', rahu: 'Rahu', ketu: 'Ketu' };
const PLANET_LABEL_HI = { sun: 'सूर्य', moon: 'चन्द्र', mars: 'मंगल', mercury: 'बुध', jupiter: 'गुरु', venus: 'शुक्र', saturn: 'शनि', rahu: 'राहु', ketu: 'केतु' };
const PLANET_ORDER = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

function drawPageBorder(doc) {
    doc.save();
    doc.rect(MARGIN, MARGIN, PAGE_W - MARGIN * 2, PAGE_H - MARGIN * 2).lineWidth(2).stroke(RED);
    doc.rect(MARGIN + 6, MARGIN + 6, PAGE_W - MARGIN * 2 - 12, PAGE_H - MARGIN * 2 - 12).lineWidth(0.75).stroke(RED);
    doc.restore();
}

function drawBrandedHeader(doc, lang, pageLabel) {
    const top = MARGIN + 14;
    try {
        doc.image(LOGO_PATH, PAGE_W / 2 - 18, top, { width: 36, height: 36 });
    } catch (e) { /* logo embed failure is non-fatal - report still generates */ }
    doc.font(FONT_BOLD).fontSize(13).fillColor(NAVY)
        .text(lang === 'hi' ? 'अद्भुत ज्ञान' : 'Adhbhut Gyaan', 0, top + 40, { align: 'center', width: PAGE_W });
    doc.font(FONT_REGULAR).fontSize(8).fillColor(GOLD)
        .text(lang === 'hi' ? 'डॉ. उमंग नाथ शर्मा — काशी की 400+ वर्षों की वैदिक परंपरा' : "Dr. Umang Nath Sharma — 400+ Years of Kashi's Vedic Tradition", 0, top + 56, { align: 'center', width: PAGE_W });
    if (pageLabel) {
        doc.font(FONT_REGULAR).fontSize(8).fillColor('#999').text(pageLabel, PAGE_W - MARGIN - 100, top, { width: 100, align: 'right' });
    }
    doc.moveTo(MARGIN + 60, top + 72).lineTo(PAGE_W - MARGIN - 60, top + 72).lineWidth(0.5).stroke(GOLD);
    return top + 84;
}

function startPage(doc, lang, pageLabel) {
    doc.addPage({ size: 'A4', margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } });
    drawPageBorder(doc);
    return drawBrandedHeader(doc, lang, pageLabel);
}

function sectionTitle(doc, text, y) {
    doc.font(FONT_BOLD).fontSize(13).fillColor(RED).text(text, 0, y, { align: 'center', width: PAGE_W });
    return y + 26;
}

function kvRow(doc, label, value, x, y, labelWidth = 150) {
    const valueWidth = PAGE_W - 2 * MARGIN - labelWidth - 40;
    doc.font(FONT_BOLD).fontSize(9.5).fillColor(NAVY).text(`${label}:`, x, y, { width: labelWidth });
    doc.font(FONT_REGULAR).fontSize(9.5).fillColor('#333').text(String(value), x + labelWidth, y, { width: valueWidth });
    // The label and value can wrap to different numbers of lines - measure
    // both and advance by whichever is taller, so a long value never
    // overlaps the next row (this previously assumed a fixed single-line
    // height, which broke visibly once a value wrapped to 2+ lines).
    const valueHeight = doc.heightOfString(String(value), { width: valueWidth, fontSize: 9.5 });
    const labelHeight = doc.heightOfString(`${label}:`, { width: labelWidth, fontSize: 9.5 });
    return y + Math.max(valueHeight, labelHeight, 14) + 4;
}

/** North Indian diamond chart with a plug-in per-house data source. */
function drawNorthIndianVarga(doc, x, y, size, houseOf, lang, title) {
    const s = size, cx = x + s / 2, cy = y + s / 2;
    if (title) doc.font(FONT_BOLD).fontSize(10).fillColor(RED).text(title, x, y - 16, { width: s, align: 'center' });
    doc.save();
    doc.rect(x, y, s, s).lineWidth(1.25).stroke(GOLD);
    doc.moveTo(x, y).lineTo(x + s, y + s).lineWidth(0.75).stroke(GOLD);
    doc.moveTo(x + s, y).lineTo(x, y + s).lineWidth(0.75).stroke(GOLD);
    doc.moveTo(cx, y).lineTo(x + s, cy).lineTo(cx, y + s).lineTo(x, cy).closePath().lineWidth(1).stroke(GOLD);
    const frac = {
        1: [0.5, 0.24], 2: [0.24, 0.11], 3: [0.11, 0.24], 4: [0.24, 0.5],
        5: [0.11, 0.76], 6: [0.24, 0.89], 7: [0.5, 0.76], 8: [0.76, 0.89],
        9: [0.89, 0.76], 10: [0.76, 0.5], 11: [0.89, 0.24], 12: [0.76, 0.11],
    };
    for (let h = 1; h <= 12; h++) {
        const { rashiId, planets } = houseOf(h);
        const [fx, fy] = frac[h];
        const px = x + fx * s, py = y + fy * s;
        doc.fillColor('#9a3412').font(FONT_BOLD).fontSize(7).text(String(rashiId), px - 8, py - 12, { width: 16, align: 'center' });
        if (planets && planets.length) {
            doc.fillColor(planets.includes('Asc') ? GOLD : '#0f172a').font(FONT_REGULAR).fontSize(6.5)
                .text(planets.map(p => (p === 'Asc' ? (lang === 'hi' ? 'लग्न' : 'Asc') : p)).join(' '), px - 26, py, { width: 52, align: 'center' });
        }
    }
    doc.restore();
}

/**
 * Builds a diamond-chart house-lookup for a divisional chart (D2-D30):
 * places each planet's SIGN (from that varga) relative to the varga's own
 * Lagna sign, exactly like the D1 chart does with houseData.
 */
function vargaHouseData(vargaPlanets, vargaLagnaSign) {
    const houseData = {};
    for (let h = 1; h <= 12; h++) {
        const rashiId = ((vargaLagnaSign + h - 2) % 12) + 1;
        const glyphMap = { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
        const planets = Object.entries(vargaPlanets)
            .filter(([, v]) => v.sign === rashiId)
            .map(([k]) => glyphMap[k]);
        houseData[h] = { rashiId, planets };
    }
    return houseData;
}

module.exports = async (req, res) => {
    withCors(req, res);
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    try {
        const params = req.method === 'POST' ? req.body : req.query;
        const { name = 'Devotee', fatherName = '', dob, tob, pob, lat = 25.3176, lng = 82.9739, tzOffset = 5.5, lang = 'hi' } = params || {};
        if (!dob) return res.status(400).json({ ok: false, error: 'dob is required (YYYY-MM-DD)' });

        // Input validation - this is now a public, unauthenticated endpoint,
        // so malformed input must fail cleanly (400) rather than crash deep
        // inside the calculation pipeline (500 with a confusing stack-trace
        // message), and a genuinely invalid calendar date (e.g. 30 Feb, which
        // JS silently rolls forward into March) must be REJECTED rather than
        // silently producing a wrong chart for the wrong date.
        const dobMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
        if (!dobMatch) {
            return res.status(400).json({ ok: false, error: 'dob must be in YYYY-MM-DD format' });
        }
        const checkDate = new Date(Date.UTC(Number(dobMatch[1]), Number(dobMatch[2]) - 1, Number(dobMatch[3])));
        const isRealCalendarDate = checkDate.getUTCFullYear() === Number(dobMatch[1])
            && checkDate.getUTCMonth() === Number(dobMatch[2]) - 1
            && checkDate.getUTCDate() === Number(dobMatch[3]);
        if (!isRealCalendarDate) {
            return res.status(400).json({ ok: false, error: 'dob is not a real calendar date' });
        }
        if (tob && !/^\d{1,2}:\d{1,2}/.test(String(tob))) {
            return res.status(400).json({ ok: false, error: 'tob must start with HH:MM' });
        }
        const latNum = Number(lat), lngNum = Number(lng), tzNum = Number(tzOffset);
        if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
            return res.status(400).json({ ok: false, error: 'lat must be a number between -90 and 90' });
        }
        if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) {
            return res.status(400).json({ ok: false, error: 'lng must be a number between -180 and 180' });
        }
        if (!Number.isFinite(tzNum) || tzNum < -12 || tzNum > 14) {
            return res.status(400).json({ ok: false, error: 'tzOffset must be a number between -12 and 14' });
        }
        const safeName = String(name || 'Devotee').trim().slice(0, 70) || 'Devotee';
        const safeFatherName = String(fatherName || '').trim().slice(0, 70);
        const safePob = String(pob || '').trim().slice(0, 100);

        // Now that the full PDF is free/public (no payment gate), rate-limit
        // per IP so it can't be spammed into a CPU-load or MongoDB-load
        // problem. 10 reports per 10 minutes is generous for a real visitor
        // trying a few family members' charts, while still bounding abuse.
        try {
            const db = await getDb();
            const allowed = await checkRateLimit(db, req, 'generate-kundli-pdf', { limit: 10, windowMs: 10 * 60 * 1000 });
            if (!allowed) {
                return res.status(429).json({ ok: false, error: 'Too many requests - please try again in a few minutes.' });
            }
        } catch (rateLimitErr) {
            // If the rate-limit check itself fails (e.g. DB unreachable),
            // don't block a legitimate free user over an infra hiccup - log
            // and continue rather than fail the whole request.
            console.error('Rate limit check failed (continuing):', rateLimitErr.message);
        }

        const R = computeFullKundliReport(dob, tob || '06:30', safePob, latNum, lngNum, tzNum);
        const T = (hi, en) => (lang === 'hi' ? hi : en);
        const PL = lang === 'hi' ? PLANET_LABEL_HI : PLANET_LABEL;

        const doc = new PDFDocument({ size: 'A4', autoFirstPage: false, info: { Title: `${safeName} - Vedic Kundli - Adhbhut Gyaan` } });
        doc.registerFont('Devanagari', FONT_REGULAR);
        doc.registerFont('Devanagari-Bold', FONT_BOLD);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Kundli-${safeName.replace(/[^a-zA-Z0-9]/g, '_')}-24page.pdf"`);
        doc.pipe(res);

        // ============ PAGE 1: COVER ============
        let y = startPage(doc, lang, '1 / 24');
        y += 16;
        doc.font(FONT_BOLD).fontSize(18).fillColor(RED).text(T('श्री गणेशाय नमः', 'Shri Ganeshaya Namah'), 0, y, { align: 'center', width: PAGE_W });
        y += 30;
        doc.font(FONT_BOLD).fontSize(15).fillColor(NAVY).text(T('जन्म पत्रिका', 'Vedic Birth Chart (Kundli)'), 0, y, { align: 'center', width: PAGE_W });
        y += 34;
        const fx = MARGIN + 60;
        y = kvRow(doc, T('नाम', 'Name'), safeName, fx, y);
        if (safeFatherName) y = kvRow(doc, T('पिता का नाम', "Father's Name"), safeFatherName, fx, y);
        y = kvRow(doc, T('जन्म तिथि', 'Date of Birth'), dob, fx, y);
        y = kvRow(doc, T('जन्म समय', 'Time of Birth'), tob || 'N/A', fx, y);
        y = kvRow(doc, T('जन्म स्थान', 'Place of Birth'), safePob || 'N/A', fx, y);
        y = kvRow(doc, T('अक्षांश / रेखांश', 'Latitude / Longitude'), `${latNum}, ${lngNum}`, fx, y);
        y = kvRow(doc, T('सूर्योदय', 'Sunrise'), R.panchang.timings.sunrise, fx, y);
        y = kvRow(doc, T('अयनांश (लाहिड़ी)', 'Ayanamsa (Lahiri)'), R.ayanamsa, fx, y);
        y = kvRow(doc, T('जन्मनाम / राशि', 'Janma Naam / Rashi'), `${R.nakshatra.name} · ${R.moon.rashi}`, fx, y);
        y += 16;
        y = sectionTitle(doc, T('सारांश', 'Summary'), y) - 10;
        [
            T(`लग्न (Ascendant): ${R.lagna.rashi} (${R.lagna.deg})`, `Lagna (Ascendant): ${R.lagna.rashi} (${R.lagna.deg})`),
            T(`चंद्र राशि (Moon Sign): ${R.moon.rashi}`, `Moon Sign: ${R.moon.rashi}`),
            T(`नक्षत्र: ${R.nakshatra.name}, पद ${R.nakshatra.pada}`, `Nakshatra: ${R.nakshatra.name}, Pada ${R.nakshatra.pada}`),
        ].forEach(line => { doc.font(FONT_REGULAR).fontSize(10).fillColor('#333').text(line, fx - 24, y, { width: PAGE_W - 2 * (fx - 24) }); y += 18; });

        // ============ PAGE 2: PANCHANG & SAMVATSARA ============
        y = startPage(doc, lang, '2 / 24');
        y = sectionTitle(doc, T('पंचांग एवं संवत्सर', 'Panchang & Samvatsara'), y);
        const gYear = Number(dob.split('-')[0]);
        const vikramSamvat = gYear + 57;
        const shalivahanaShaka = gYear - 78;
        [
            [T('विक्रम संवत् (अनुमानित)', 'Vikram Samvat (approx.)'), vikramSamvat],
            [T('शालिवाहन शक (अनुमानित)', 'Shalivahana Shaka (approx.)'), shalivahanaShaka],
            [T('अयन', 'Ayana'), R.panchang.transits.suryaRashi],
            [T('मास', 'Masa'), R.panchang.tithi.paksha],
            [T('तिथि', 'Tithi'), R.panchang.tithi.name],
            [T('वार', 'Vaar'), R.panchang.vara.name],
            [T('नक्षत्र', 'Nakshatra'), `${R.panchang.nakshatra.name} (${T('स्वामी', 'Lord')}: ${R.panchang.nakshatra.lord})`],
            [T('योग', 'Yoga'), R.panchang.yoga.name],
            [T('करण', 'Karana'), R.panchang.karana.name],
            [T('दिनमान (सूर्योदय-सूर्यास्त)', 'Dinamana (Sunrise-Sunset)'), `${R.panchang.timings.sunrise} - ${R.panchang.timings.sunset}`],
            [T('अयनांश', 'Ayanamsha'), R.ayanamsa],
        ].forEach(([l, v]) => { y = kvRow(doc, l, v, fx, y); });

        // ============ PAGE 3: AVAKAHADA CHAKRA & DASHA BALANCE ============
        y = startPage(doc, lang, '3 / 24');
        y = sectionTitle(doc, T('अवकहड़ा चक्र', 'Avakahada Chakra'), y);
        [
            [T('जन्म लग्न', 'Birth Lagna'), R.lagna.rashi],
            [T('नक्षत्र / पद', 'Nakshatra / Pada'), `${R.nakshatra.name} / ${R.nakshatra.pada}`],
            [T('राशि', 'Rashi'), R.moon.rashi],
            [T('राशीश', 'Rashisha (Lord)'), R.moon.lord],
            [T('वर्ण', 'Varna'), R.avakahada.varna],
            [T('वश्य', 'Vashya'), R.avakahada.vashya],
            [T('योनि', 'Yoni'), R.avakahada.yoni],
            [T('गण', 'Gana'), R.avakahada.gana],
            [T('नाड़ी', 'Nadi'), R.avakahada.nadi],
        ].forEach(([l, v]) => { y = kvRow(doc, l, v, fx, y); });
        y += 12;
        y = sectionTitle(doc, T('दशा बलम्', 'Dasha Balance'), y);
        const bYears = Math.floor(R.dasha.balanceYears);
        const bMonths = Math.floor((R.dasha.balanceYears - bYears) * 12);
        const bDays = Math.round((((R.dasha.balanceYears - bYears) * 12) - bMonths) * 30);
        const dashaYearsTable = require('./utils/vimshottariDasha').DASHA_YEARS;
        y = kvRow(doc, T('जन्म महादशा', 'Janma Mahadasha'), PL[R.dasha.startingLord.toLowerCase()] || R.dasha.startingLord, fx, y);
        y = kvRow(doc, T('भुक्त (व्यतीत)', 'Bhukta (elapsed)'), `${(dashaYearsTable[R.dasha.startingLord] - R.dasha.balanceYears).toFixed(2)} ${T('वर्ष', 'years')}`, fx, y);
        y = kvRow(doc, T('भोग्य (शेष)', 'Bhogya (balance)'), `${bYears}${T('व', 'y')}-${bMonths}${T('मा', 'm')}-${bDays}${T('दि', 'd')}`, fx, y);

        // ============ PAGE 4: GRAHA SPASHTA TABLE ============
        y = startPage(doc, lang, '4 / 24');
        y = sectionTitle(doc, T('ग्रह स्पष्ट सारणी', 'Graha Spashta Table'), y);
        const gCols = [fx, fx + 110, fx + 210, fx + 290, fx + 370];
        const gHeaders = T(['ग्रह', 'राशि', 'भाव', 'अंश', 'दशा स्वामी'], ['Planet', 'Sign', 'House', 'Degree', 'Dasha Lord']);
        doc.font(FONT_BOLD).fontSize(9).fillColor(NAVY);
        gHeaders.forEach((h, i) => doc.text(h, gCols[i], y, { width: 90 }));
        y += 16; doc.moveTo(fx, y).lineTo(PAGE_W - MARGIN - 40, y).lineWidth(0.5).stroke(GOLD); y += 8;
        doc.font(FONT_BOLD).fontSize(9).fillColor(RED);
        [T('लग्न (Asc)', 'Asc (Lagna)'), R.lagna.rashi, '1', R.lagna.deg, '—'].forEach((v, i) => doc.text(String(v), gCols[i], y, { width: 90 }));
        y += 18;
        doc.font(FONT_REGULAR).fontSize(8.7).fillColor('#333');
        R.planets.forEach(p => {
            [p.nameEn, p.rashi, String(p.house), p.deg, p.key].forEach((v, i) => doc.text(String(v), gCols[i], y, { width: 90 }));
            y += 17;
        });

        // ============ PAGE 5: D1 LAGNA CHART ============
        y = startPage(doc, lang, '5 / 24');
        y = sectionTitle(doc, T('जन्म लग्न कुण्डली (D1)', 'D1 Lagna Kundali'), y);
        drawNorthIndianVarga(doc, PAGE_W / 2 - 130, y + 20, 260, (h) => R.houseData[h], lang);

        // ============ PAGE 6: D1 RASHI (Aries always 1st house) ============
        y = startPage(doc, lang, '6 / 24');
        y = sectionTitle(doc, T('राशि कुण्डली (D1)', 'D1 Rashi Kundali'), y);
        doc.font(FONT_REGULAR).fontSize(9).fillColor('#555').text(
            T('राशि कुण्डली में सदैव मेष राशि प्रथम भाव में रहती है — ग्रह अपनी वास्तविक राशि के अनुसार स्थित होते हैं (लग्न कुण्डली से भिन्न, जो लग्न-आधारित होती है)।',
              'In the Rashi chart, Aries always occupies the 1st house - planets are placed by their actual sign (unlike the Lagna chart, which is Ascendant-based).'),
            fx - 24, y, { width: PAGE_W - 2 * (fx - 24) }
        );
        const rashiHouseData = {};
        for (let h = 1; h <= 12; h++) {
            const glyphMap = { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
            const planets = R.planets.filter(p => SIGN_NAMES.indexOf(p.rashi) + 1 === h).map(p => glyphMap[p.key]);
            rashiHouseData[h] = { rashiId: h, planets };
        }
        drawNorthIndianVarga(doc, PAGE_W / 2 - 130, y + 40, 260, (h) => rashiHouseData[h], lang);

        // ============ PAGE 7: PANCHADHA MAITRI TABLE ============
        y = startPage(doc, lang, '7 / 24');
        y = sectionTitle(doc, T('पंचधा मैत्री चक्र', 'Panchadha Maitri Table'), y);
        const maitriKeys = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
        const cellW = 58;
        doc.font(FONT_BOLD).fontSize(7.5).fillColor(NAVY);
        doc.text('', fx, y, { width: 50 });
        maitriKeys.forEach((k, i) => doc.text(PL[k], fx + 50 + i * cellW, y, { width: cellW, align: 'center' }));
        y += 16;
        doc.font(FONT_REGULAR).fontSize(7.2);
        maitriKeys.forEach(from => {
            doc.font(FONT_BOLD).fillColor(NAVY).text(PL[from], fx, y, { width: 50 });
            maitriKeys.forEach((to, i) => {
                if (from === to) { doc.font(FONT_REGULAR).fillColor('#ccc').text('—', fx + 50 + i * cellW, y, { width: cellW, align: 'center' }); return; }
                const tier = R.panchadhaMaitri[from][to];
                doc.font(FONT_REGULAR).fillColor('#333').text(maitriLabel(tier, lang), fx + 50 + i * cellW, y, { width: cellW, align: 'center' });
            });
            y += 15;
        });

        // ============ PAGE 8: BHAVA SPASHTA TABLE ============
        y = startPage(doc, lang, '8 / 24');
        y = sectionTitle(doc, T('तन्वादयो द्वादश भाव स्पष्ट', 'Tanvadayo Dvadasha Bhava Spashta'), y);
        const bhavaNamesHi = ['तनु', 'धन', 'सहज', 'सुख', 'सुत', 'रिपु', 'जाया', 'आयु', 'भाग्य', 'कर्म', 'लाभ', 'व्यय'];
        const bhavaNamesEn = ['Tanu (Self)', 'Dhana (Wealth)', 'Sahaja (Siblings)', 'Sukha (Comforts)', 'Suta (Children)', 'Ripu (Enemies)', 'Jaya (Spouse)', 'Ayu (Longevity)', 'Bhagya (Fortune)', 'Karma (Career)', 'Labha (Gains)', 'Vyaya (Losses)'];
        doc.font(FONT_BOLD).fontSize(9).fillColor(NAVY);
        [T('भाव', 'House'), T('नाम', 'Name'), T('राशि', 'Sign')].forEach((h, i) => doc.text(h, fx + [0, 50, 220][i], y, { width: [50, 170, 150][i] }));
        y += 16; doc.moveTo(fx, y).lineTo(PAGE_W - MARGIN - 40, y).lineWidth(0.5).stroke(GOLD); y += 8;
        doc.font(FONT_REGULAR).fontSize(9).fillColor('#333');
        for (let h = 1; h <= 12; h++) {
            const rashiId = R.houseData[h].rashiId;
            doc.text(String(h), fx, y, { width: 50 });
            doc.text(T(bhavaNamesHi[h - 1], bhavaNamesEn[h - 1]), fx + 50, y, { width: 170 });
            doc.text(SIGN_NAMES[rashiId - 1], fx + 220, y, { width: 150 });
            y += 17;
        }

        // ============ PAGE 9: BHAVA CHALIT ============
        y = startPage(doc, lang, '9 / 24');
        y = sectionTitle(doc, T('भाव चलित चक्र', 'Bhava Chalit Chakra'), y);
        doc.font(FONT_REGULAR).fontSize(8.5).fillColor('#666').text(
            T('नोट: यह चार्ट सरलीकृत सम-भाव (equal-house) पद्धति पर आधारित है। संपूर्ण श्रीपति (Sripati) पद्धति हेतु कृपया व्यक्तिगत परामर्श लें।',
              'Note: This chart uses the simplified equal-house method. For the full Sripati house-cusp system, please book a personal consultation.'),
            fx - 24, y, { width: PAGE_W - 2 * (fx - 24) }
        );
        drawNorthIndianVarga(doc, PAGE_W / 2 - 130, y + 30, 260, (h) => R.houseData[h], lang);

        // ============ PAGES 10-15: DIVISIONAL CHARTS D2,D3,D7,D9,D12,D30 ============
        const vargaPages = [
            { key: 'd2', num: 10, titleHi: 'द्विभाग (होरा चक्र)', titleEn: 'D2 Hora Chakra', descHi: 'धन एवं पारिवारिक समृद्धि', descEn: 'Wealth & family prosperity' },
            { key: 'd3', num: 11, titleHi: 'त्रिभाग (द्रेष्काण चक्र)', titleEn: 'D3 Drekkana Chakra', descHi: 'भाई-बहन एवं साहस', descEn: 'Siblings & courage' },
            { key: 'd7', num: 12, titleHi: 'सप्तमांश चक्र', titleEn: 'D7 Saptamsha Chakra', descHi: 'संतान सुख', descEn: 'Progeny' },
            { key: 'd9', num: 13, titleHi: 'नवमांश चक्र', titleEn: 'D9 Navamsha Chakra', descHi: 'विवाह, जीवनसाथी एवं भाग्य', descEn: 'Marriage, spouse & fortune' },
            { key: 'd12', num: 14, titleHi: 'द्वादशांश चक्र', titleEn: 'D12 Dwadashamsha Chakra', descHi: 'माता-पिता का सुख', descEn: "Parents' wellbeing" },
            { key: 'd30', num: 15, titleHi: 'त्रिंशांश चक्र', titleEn: 'D30 Trimshamsha Chakra', descHi: 'अरिष्ट एवं दोष', descEn: 'Arishta (misfortunes) & doshas' },
        ];
        vargaPages.forEach(vp => {
            y = startPage(doc, lang, `${vp.num} / 24`);
            y = sectionTitle(doc, T(vp.titleHi, vp.titleEn), y);
            doc.font(FONT_REGULAR).fontSize(8.5).fillColor('#666').text(T(vp.descHi, vp.descEn), 0, y, { align: 'center', width: PAGE_W });
            drawNorthIndianVarga(doc, PAGE_W / 2 - 110, y + 20, 220, (h) => vargaHouseData(R.divisionalCharts[vp.key], 1)[h], lang);
            let ty = y + 260;
            doc.font(FONT_BOLD).fontSize(9).fillColor(NAVY).text(T('ग्रह स्थिति', 'Planet Positions'), fx, ty); ty += 16;
            doc.font(FONT_REGULAR).fontSize(8.5).fillColor('#333');
            PLANET_ORDER.forEach(k => {
                const v = R.divisionalCharts[vp.key][k];
                doc.text(`${PL[k]}: ${v.signName}${v.lord ? ' (' + v.lord + ')' : ''}`, fx, ty, { width: 240 });
                ty += 14;
            });
        });

        // ============ PAGE 16: 120-YEAR MAHADASHA SUMMARY ============
        y = startPage(doc, lang, '16 / 24');
        y = sectionTitle(doc, T('विंशोत्तरी महादशा सारणी (१२० वर्ष)', '120-Year Vimshottari Mahadasha Summary'), y);
        doc.font(FONT_BOLD).fontSize(9).fillColor(NAVY);
        [T('ग्रह', 'Planet'), T('अवधि', 'Duration'), T('प्रारंभ', 'Start'), T('समाप्ति', 'End')].forEach((h, i) => doc.text(h, fx + [0, 120, 220, 350][i], y, { width: [120, 100, 130, 130][i] }));
        y += 16; doc.moveTo(fx, y).lineTo(PAGE_W - MARGIN - 40, y).lineWidth(0.5).stroke(GOLD); y += 8;
        doc.font(FONT_REGULAR).fontSize(9).fillColor('#333');
        R.dasha.mahadashas.forEach(m => {
            doc.text(PL[m.lord.toLowerCase()] || m.lord, fx, y, { width: 120 });
            doc.text(`${m.years.toFixed(2)} ${T('वर्ष', 'yrs')}`, fx + 120, y, { width: 100 });
            doc.text(m.startDate.toISOString().slice(0, 10), fx + 220, y, { width: 130 });
            doc.text(m.endDate.toISOString().slice(0, 10), fx + 350, y, { width: 130 });
            y += 18;
        });

        // ============ PAGES 17-20: ANTARDASHA DETAIL (first 4 mahadashas in THIS person's actual timeline) ============
        R.dasha.mahadashas.slice(0, 4).forEach((m, idx) => {
            y = startPage(doc, lang, `${17 + idx} / 24`);
            y = sectionTitle(doc, T(`${PL[m.lord.toLowerCase()] || m.lord} महादशा — अंतर्दशा सारणी`, `${PLANET_LABEL[m.lord.toLowerCase()] || m.lord} Mahadasha — Antardasha Table`), y);
            doc.font(FONT_BOLD).fontSize(9).fillColor(NAVY);
            [T('अंतर्दशा स्वामी', 'Antardasha Lord'), T('प्रारंभ', 'Start'), T('समाप्ति', 'End')].forEach((h, i) => doc.text(h, fx + [0, 180, 340][i], y, { width: [180, 160, 160][i] }));
            y += 16; doc.moveTo(fx, y).lineTo(PAGE_W - MARGIN - 40, y).lineWidth(0.5).stroke(GOLD); y += 8;
            doc.font(FONT_REGULAR).fontSize(9).fillColor('#333');
            m.antardashas.forEach(a => {
                doc.text(PL[a.lord.toLowerCase()] || a.lord, fx, y, { width: 180 });
                doc.text(a.startDate.toISOString().slice(0, 10), fx + 180, y, { width: 160 });
                doc.text(a.endDate.toISOString().slice(0, 10), fx + 340, y, { width: 160 });
                y += 18;
            });
        });

        // ============ PAGE 21: SHLOKAS & LAGNA/RASHI CHARACTERISTICS ============
        y = startPage(doc, lang, '21 / 24');
        y = sectionTitle(doc, T('लग्न एवं राशि स्वभाव', 'Lagna & Rashi Characteristics'), y);
        y = kvRow(doc, T('लग्न', 'Lagna'), R.lagna.rashi, fx, y);
        y = kvRow(doc, T('लग्न तत्व', 'Lagna Element'), R.lagna.element, fx, y);
        y = kvRow(doc, T('लग्नेश', 'Lagna Lord'), R.lagna.lord, fx, y);
        y += 16;
        const elementTraitHi = R.lagna.element === 'Fire' ? 'ऊर्जावान, साहसी एवं नेतृत्वक्षम' : R.lagna.element === 'Earth' ? 'स्थिर, व्यावहारिक एवं धैर्यवान' : R.lagna.element === 'Air' ? 'बौद्धिक, संचारकुशल एवं सामाजिक' : 'भावुक, संवेदनशील एवं कल्पनाशील';
        const elementTraitEn = R.lagna.element === 'Fire' ? 'energetic, courageous, and inclined toward leadership' : R.lagna.element === 'Earth' ? 'stable, practical, and patient' : R.lagna.element === 'Air' ? 'intellectual, communicative, and social' : 'emotional, sensitive, and imaginative';
        doc.font(FONT_REGULAR).fontSize(9.5).fillColor('#333').text(
            T(`${R.lagna.rashi} लग्न वाले जातक सामान्यतः ${elementTraitHi} स्वभाव के होते हैं। यह प्रारंभिक विश्लेषण है — विस्तृत व्यक्तित्व-मूल्यांकन हेतु व्यक्तिगत परामर्श आवश्यक है।`,
              `Natives with ${R.lagna.rashi} Lagna are generally ${elementTraitEn} by temperament. This is a preliminary indication - a full personality assessment needs a personal consultation.`),
            fx - 24, y, { width: PAGE_W - 2 * (fx - 24) }
        );

        // ============ PAGE 22: PERSONALITY, VOCATION, FAMILY ============
        y = startPage(doc, lang, '22 / 24');
        y = sectionTitle(doc, T('व्यक्तित्व, रुचि एवं पारिवारिक स्वभाव', 'Personality, Inclinations & Family Nature'), y);
        y = kvRow(doc, T('चंद्र राशि (मानसिकता)', 'Moon Sign (Mentality)'), R.moon.rashi, fx, y);
        y = kvRow(doc, T('गण', 'Gana (Temperament)'), R.avakahada.gana, fx, y);
        y = kvRow(doc, T('वर्ण', 'Varna'), R.avakahada.varna, fx, y);
        y += 12;
        doc.font(FONT_REGULAR).fontSize(9.5).fillColor('#333').text(
            T('चंद्र राशि मानसिक प्रवृत्ति, संवेगात्मक स्वभाव एवं पारिवारिक संबंधों को इंगित करती है। बुध व शुक्र की स्थिति कला, संचार व सामाजिक अभिरुचियों को दर्शाती है — विस्तृत विश्लेषण हेतु परामर्श लें।',
              "The Moon sign indicates mental disposition, emotional nature, and family relationships. Mercury and Venus's placements indicate artistic, communicative, and social inclinations - consult for a detailed reading."),
            fx - 24, y, { width: PAGE_W - 2 * (fx - 24) }
        );

        // ============ PAGE 23: 5th/9th HOUSE, COMBUSTION, GEMSTONES ============
        y = startPage(doc, lang, '23 / 24');
        y = sectionTitle(doc, T('पंचम, नवम भाव एवं रत्न सुझाव', '5th/9th House Analysis & Gemstones'), y);
        y = kvRow(doc, T('पंचम भाव राशि (विद्या)', '5th House Sign (Education)'), SIGN_NAMES[R.houseData[5].rashiId - 1], fx, y);
        y = kvRow(doc, T('नवम भाव राशि (भाग्येश)', '9th House Sign (Bhagyesh)'), SIGN_NAMES[R.houseData[9].rashiId - 1], fx, y);
        y += 8;
        const combustList = R.planets.filter(p => {
            const sunLon = R.planetLongitudes.sun;
            const pLon = R.planetLongitudes[p.key];
            if (p.key === 'sun') return false;
            let diff = Math.abs(sunLon - pLon); if (diff > 180) diff = 360 - diff;
            return diff <= 15;
        });
        y = kvRow(doc, T('अस्तंगत ग्रह (सूर्य-निकट)', 'Combust Planets (near Sun)'), combustList.length ? combustList.map(p => p.nameEn).join(', ') : T('कोई नहीं', 'None'), fx, y);
        y += 16;
        y = sectionTitle(doc, T('भाग्यशाली रत्न सुझाव', 'Recommended Gemstones'), y);
        y = kvRow(doc, T('लग्नेश हेतु', 'For Lagna Lord'), R.lagna.luckyGem, fx, y);
        y = kvRow(doc, T('चंद्र हेतु', 'For Moon'), R.moon.luckyGem, fx, y);

        // ============ PAGE 24: MANGLIK, REMEDIES, SIGNATURE ============
        y = startPage(doc, lang, '24 / 24');
        y = sectionTitle(doc, T('मांगलिक दोष एवं उपाय', 'Manglik Dosha & Remedies'), y);
        y = kvRow(doc, T('मांगलिक दोष', 'Manglik Dosha'), R.doshas.manglik.hasDosh ? R.doshas.manglik.severity : T('अनुपस्थित (शांत)', 'Absent (Shanta)'), fx, y);
        y = kvRow(doc, T('कालसर्प दोष', 'Kalsarp Dosha'), R.doshas.kalsarp.hasDosh ? R.doshas.kalsarp.type : T('अनुपस्थित', 'Absent'), fx, y);
        y = kvRow(doc, T('पितृ दोष', 'Pitru Dosha'), R.doshas.pitraDosh.hasDosh ? R.doshas.pitraDosh.severity : T('अनुपस्थित', 'Absent'), fx, y);
        y += 16;
        y = sectionTitle(doc, T('सुझाए गए उपाय', 'Suggested Remedies'), y);
        const remedies = R.doshas.manglik.hasDosh
            ? [T('चांदी या तांबे का कड़ा धारण करें', 'Wear a silver or copper bangle'), T('मंगलवार को हनुमान चालीसा पाठ करें', 'Recite Hanuman Chalisa on Tuesdays'), T('वाहन चलाते समय विशेष सावधानी रखें', 'Take extra caution while driving/operating vehicles')]
            : [T('नियमित रूप से इष्ट देव की पूजा करें', "Regular worship of one's ishta devata"), T('पितरों हेतु तर्पण करते रहें', 'Continue ancestral tarpan as per family tradition')];
        remedies.forEach(r => { doc.font(FONT_REGULAR).fontSize(9.5).fillColor('#333').text(`•  ${r}`, fx - 10, y, { width: PAGE_W - 2 * (fx - 10) }); y += 18; });

        y = PAGE_H - MARGIN - 110;
        doc.moveTo(fx - 24, y).lineTo(PAGE_W - MARGIN - 40, y).lineWidth(0.5).stroke(GOLD);
        y += 16;
        doc.font(FONT_REGULAR).fontSize(8.5).fillColor('#666').text(
            T('यह विश्लेषण शास्त्रोक्त गणना पर आधारित प्रारंभिक मार्गदर्शन है। विस्तृत व्यक्तिगत परामर्श हेतु कृपया संपर्क करें।', 'This analysis is a preliminary guide based on scriptural calculation. Please consult for a detailed personal reading.'),
            fx - 24, y, { width: PAGE_W - 2 * (fx - 24) }
        );
        y += 36;
        doc.font(FONT_BOLD).fontSize(12).fillColor(NAVY).text(T('ज्योतिषाचार्य पं. डॉ. उमंग नाथ शर्मा', 'Astrologer: Dr. Umang Nath Sharma'), fx - 24, y);
        y += 16;
        doc.font(FONT_REGULAR).fontSize(8.5).fillColor('#666').text('Adhbhut Gyaan · Nati Imli Road, Ishwargangi, Varanasi · +91 92781 48269', fx - 24, y);

        doc.end();
    } catch (err) {
        console.error('Kundli PDF generation error:', err);
        if (!res.headersSent) {
            res.status(500).json({ ok: false, error: 'Failed to generate PDF', detail: err.message });
        }
    }
};
