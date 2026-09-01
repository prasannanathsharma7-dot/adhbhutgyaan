// generate-kundli-pdf.js
// Generates a multi-page, bilingual (Hindi/English) Kundali PDF report in a
// traditional Kashi red-ink booklet style, branded with the Adhbhut Gyaan
// logo and Dr. Umang Nath Sharma's name at the top of every page.
//
// Built with pdfkit (Node-native) rather than puppeteer/@sparticuz/chromium
// deliberately - a headless-browser dependency is heavy, and this project
// has no way to verify it actually works within Cloud Run's memory/timeout
// limits from a local sandbox before shipping it. pdfkit has no such risk.

const PDFDocument = require('pdfkit');
const path = require('path');
const { withCors } = require('./_db');
const { computeVedicChartData } = require('./agents/kundli-preanalyzer');

const FONT_DIR = path.join(__dirname, 'fonts');
const FONT_REGULAR = path.join(FONT_DIR, 'NotoSansDevanagari-Regular.ttf');
const FONT_BOLD = path.join(FONT_DIR, 'NotoSansDevanagari-Bold.ttf');
const LOGO_PATH = path.join(__dirname, 'assets', 'logo-rgb.png');

const RED = '#b91c1c';
const GOLD = '#c49a2c';
const NAVY = '#0d1030';
const CREAM = '#fff8f0';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 36;

/** Draws the traditional ornate double red border on the current page. */
function drawPageBorder(doc) {
    doc.save();
    doc.rect(MARGIN, MARGIN, PAGE_W - MARGIN * 2, PAGE_H - MARGIN * 2).lineWidth(2).stroke(RED);
    doc.rect(MARGIN + 6, MARGIN + 6, PAGE_W - MARGIN * 2 - 12, PAGE_H - MARGIN * 2 - 12).lineWidth(0.75).stroke(RED);
    doc.restore();
}

/** Draws the Adhbhut Gyaan + Dr. Umang Nath Sharma branding header, present on every page. */
function drawBrandedHeader(doc, lang) {
    const top = MARGIN + 16;
    try {
        doc.image(LOGO_PATH, PAGE_W / 2 - 22, top, { width: 44, height: 44 });
    } catch (e) {
        // If the logo can't be embedded for any reason, the report still
        // generates - just without the image (name/text branding still shows).
    }
    doc.font(FONT_BOLD).fontSize(15).fillColor(NAVY)
        .text(lang === 'hi' ? 'अद्भुत ज्ञान' : 'Adhbhut Gyaan', 0, top + 48, { align: 'center', width: PAGE_W });
    doc.font(FONT_REGULAR).fontSize(9).fillColor(GOLD)
        .text(lang === 'hi' ? 'डॉ. उमंग नाथ शर्मा — काशी की 400+ वर्षों की वैदिक परंपरा' : "Dr. Umang Nath Sharma — 400+ Years of Kashi's Vedic Tradition", 0, top + 66, { align: 'center', width: PAGE_W });
    doc.moveTo(MARGIN + 60, top + 84).lineTo(PAGE_W - MARGIN - 60, top + 84).lineWidth(0.5).stroke(GOLD);
    return top + 96; // y-coordinate where page content can safely begin
}

function startPage(doc, lang) {
    doc.addPage({ size: 'A4', margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } });
    drawPageBorder(doc);
    return drawBrandedHeader(doc, lang);
}

/**
 * Draws a North Indian (diamond-layout) Kundli chart as vector shapes,
 * matching the same house-position convention as the frontend's
 * NorthIndianChart.jsx (rashi number + planet glyphs per house).
 */
function drawNorthIndianChart(doc, x, y, size, houseData, lang) {
    const s = size;
    const cx = x + s / 2, cy = y + s / 2;

    doc.save();
    doc.rect(x, y, s, s).lineWidth(1.5).stroke(GOLD);
    doc.moveTo(x, y).lineTo(x + s, y + s).lineWidth(1).stroke(GOLD);
    doc.moveTo(x + s, y).lineTo(x, y + s).lineWidth(1).stroke(GOLD);
    doc.moveTo(cx, y).lineTo(x + s, cy).lineTo(cx, y + s).lineTo(x, cy).closePath().lineWidth(1.25).stroke(GOLD);

    const frac = {
        1: [0.5, 0.25], 2: [0.25, 0.12], 3: [0.12, 0.25], 4: [0.25, 0.5],
        5: [0.12, 0.75], 6: [0.25, 0.88], 7: [0.5, 0.75], 8: [0.75, 0.88],
        9: [0.88, 0.75], 10: [0.75, 0.5], 11: [0.88, 0.25], 12: [0.75, 0.12],
    };

    for (let h = 1; h <= 12; h++) {
        const hData = houseData[h];
        if (!hData) continue;
        const [fx, fy] = frac[h];
        const px = x + fx * s;
        const py = y + fy * s;

        doc.fillColor('#9a3412').font(FONT_BOLD).fontSize(8)
            .text(String(hData.rashiId), px - 8, py - 14, { width: 16, align: 'center' });

        if (hData.planets && hData.planets.length) {
            const label = hData.planets.map(p => (p === 'Asc' ? (lang === 'hi' ? 'लग्न' : 'Asc') : p)).join(' ');
            doc.fillColor(hData.planets.includes('Asc') ? GOLD : '#0f172a').font(FONT_REGULAR).fontSize(7.5)
                .text(label, px - 30, py, { width: 60, align: 'center' });
        }
    }
    doc.restore();
}

module.exports = async (req, res) => {
    withCors(req, res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    try {
        const params = req.method === 'POST' ? req.body : req.query;
        const {
            name = 'Devotee',
            dob, tob, pob,
            lat = 25.3176, lng = 82.9739, tzOffset = 5.5,
            lang = 'hi',
        } = params || {};

        if (!dob) {
            return res.status(400).json({ ok: false, error: 'dob is required (YYYY-MM-DD)' });
        }

        const chart = computeVedicChartData(dob, tob || '06:30', pob || '', Number(lat), Number(lng), Number(tzOffset));

        const doc = new PDFDocument({ size: 'A4', autoFirstPage: false, info: { Title: `${name} - Vedic Kundli - Adhbhut Gyaan` } });
        doc.registerFont('Devanagari', FONT_REGULAR);
        doc.registerFont('Devanagari-Bold', FONT_BOLD);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Kundli-${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        doc.pipe(res);

        // ===================== PAGE 1: COVER =====================
        let y = startPage(doc, lang);
        y += 20;

        doc.font(FONT_BOLD).fontSize(20).fillColor(RED)
            .text(lang === 'hi' ? 'श्री गणेशाय नमः' : 'Shri Ganeshaya Namah', 0, y, { align: 'center', width: PAGE_W });
        y += 36;

        doc.font(FONT_BOLD).fontSize(17).fillColor(NAVY)
            .text(lang === 'hi' ? 'जन्म पत्रिका' : 'Vedic Birth Chart (Kundli)', 0, y, { align: 'center', width: PAGE_W });
        y += 40;

        const rowLabelWidth = 150;
        const fieldStartX = MARGIN + 70;
        const fields = lang === 'hi'
            ? [
                ['नाम', name], ['जन्म तिथि', dob], ['जन्म समय', tob || 'N/A'],
                ['जन्म स्थान', pob || 'N/A'], ['अक्षांश / रेखांश', `${lat}, ${lng}`],
                ['अयनांश (लाहिड़ी)', chart.ayanamsa],
            ]
            : [
                ['Name', name], ['Date of Birth', dob], ['Time of Birth', tob || 'N/A'],
                ['Place of Birth', pob || 'N/A'], ['Latitude / Longitude', `${lat}, ${lng}`],
                ['Ayanamsa (Lahiri)', chart.ayanamsa],
            ];

        fields.forEach(([label, value]) => {
            doc.font(FONT_BOLD).fontSize(11).fillColor(NAVY).text(`${label}:`, fieldStartX, y, { continued: false, width: rowLabelWidth });
            doc.font(FONT_REGULAR).fontSize(11).fillColor('#333').text(String(value), fieldStartX + rowLabelWidth, y);
            y += 22;
        });

        y += 20;
        doc.font(FONT_BOLD).fontSize(12).fillColor(RED)
            .text(lang === 'hi' ? 'सारांश' : 'Summary', fieldStartX - 20, y);
        y += 20;
        const summaryLines = lang === 'hi'
            ? [
                `लग्न (Ascendant): ${chart.lagna.rashi} (${chart.lagna.deg})`,
                `चंद्र राशि (Moon Sign): ${chart.moon.rashi}`,
                `नक्षत्र: ${chart.nakshatra.name}, पद ${chart.nakshatra.pada}`,
            ]
            : [
                `Lagna (Ascendant): ${chart.lagna.rashi} (${chart.lagna.deg})`,
                `Moon Sign: ${chart.moon.rashi}`,
                `Nakshatra: ${chart.nakshatra.name}, Pada ${chart.nakshatra.pada}`,
            ];
        summaryLines.forEach(line => {
            doc.font(FONT_REGULAR).fontSize(11).fillColor('#333').text(line, fieldStartX - 20, y, { width: PAGE_W - 2 * (fieldStartX - 20) });
            y += 20;
        });

        // ===================== PAGE 2: LAGNA CHART + PLANETARY POSITIONS =====================
        y = startPage(doc, lang);
        y += 10;
        doc.font(FONT_BOLD).fontSize(14).fillColor(RED)
            .text(lang === 'hi' ? 'जन्म लग्न कुण्डली' : 'Lagna Chart (Birth Chart)', 0, y, { align: 'center', width: PAGE_W });
        y += 30;

        // North-Indian diamond chart, drawn as vectors (not a re-embedded SVG)
        const chartSize = 260;
        const cx = PAGE_W / 2;
        const cTop = y;
        const half = chartSize / 2;
        drawNorthIndianChart(doc, cx - half, cTop, chartSize, chart.houseData, lang);
        y = cTop + chartSize + 30;

        doc.font(FONT_BOLD).fontSize(13).fillColor(RED)
            .text(lang === 'hi' ? 'ग्रह स्थिति सारणी' : 'Planetary Positions', MARGIN + 40, y);
        y += 22;

        const colX = [MARGIN + 40, MARGIN + 160, MARGIN + 280, MARGIN + 380];
        const headers = lang === 'hi' ? ['ग्रह', 'राशि', 'भाव', 'अंश'] : ['Planet', 'Sign', 'House', 'Degree'];
        doc.font(FONT_BOLD).fontSize(10).fillColor(NAVY);
        headers.forEach((h, i) => doc.text(h, colX[i], y, { width: 110 }));
        y += 16;
        doc.moveTo(MARGIN + 40, y).lineTo(PAGE_W - MARGIN - 40, y).lineWidth(0.5).stroke(GOLD);
        y += 8;

        const ascRow = [lang === 'hi' ? 'लग्न (Asc)' : 'Asc (Lagna)', chart.lagna.rashi, '1', chart.lagna.deg];
        doc.font(FONT_BOLD).fontSize(9.5).fillColor(RED);
        ascRow.forEach((v, i) => doc.text(String(v), colX[i], y, { width: 110 }));
        y += 18;

        doc.font(FONT_REGULAR).fontSize(9.5).fillColor('#333');
        chart.planets.forEach(p => {
            const row = [p.nameEn, p.rashi, String(p.house), p.deg];
            row.forEach((v, i) => doc.text(v, colX[i], y, { width: 110 }));
            y += 18;
        });

        // ===================== PAGE 3: DOSHAS + LUCKY ITEMS + SIGNATURE =====================
        y = startPage(doc, lang);
        y += 10;
        doc.font(FONT_BOLD).fontSize(14).fillColor(RED)
            .text(lang === 'hi' ? 'ग्रह दोष विश्लेषण' : 'Dosha Analysis', 0, y, { align: 'center', width: PAGE_W });
        y += 32;

        const doshaRows = lang === 'hi'
            ? [
                ['मांगलिक दोष', chart.doshas.manglik.hasDosh ? chart.doshas.manglik.severity : 'अनुपस्थित (शांत)'],
                ['कालसर्प दोष', chart.doshas.kalsarp.hasDosh ? chart.doshas.kalsarp.type : 'अनुपस्थित'],
                ['पितृ दोष', chart.doshas.pitraDosh.hasDosh ? chart.doshas.pitraDosh.severity : 'अनुपस्थित'],
                ['शनि साढ़े साती / ढैय्या', chart.doshas.shaniSadeSati.phase],
            ]
            : [
                ['Manglik Dosha', chart.doshas.manglik.hasDosh ? chart.doshas.manglik.severity : 'Absent (Shanta)'],
                ['Kalsarp Dosha', chart.doshas.kalsarp.hasDosh ? chart.doshas.kalsarp.type : 'Absent'],
                ['Pitru Dosha', chart.doshas.pitraDosh.hasDosh ? chart.doshas.pitraDosh.severity : 'Absent'],
                ["Shani Sade Sati / Dhaiya", chart.doshas.shaniSadeSati.phase],
            ];

        doshaRows.forEach(([label, value]) => {
            doc.font(FONT_BOLD).fontSize(11).fillColor(NAVY).text(label, MARGIN + 40, y, { width: 180 });
            doc.font(FONT_REGULAR).fontSize(10).fillColor('#333').text(value, MARGIN + 230, y, { width: PAGE_W - 2 * MARGIN - 270 });
            y += 30;
        });

        y += 20;
        doc.font(FONT_BOLD).fontSize(13).fillColor(RED)
            .text(lang === 'hi' ? 'शुभ वस्तुएं (लग्न अनुसार)' : 'Auspicious Items (by Lagna)', MARGIN + 40, y);
        y += 24;
        const luckyRows = lang === 'hi'
            ? [['भाग्यशाली रत्न', chart.lagna.luckyGem], ['भाग्यशाली रंग', chart.lagna.luckyColor]]
            : [['Lucky Gemstone', chart.lagna.luckyGem], ['Lucky Color', chart.lagna.luckyColor]];
        luckyRows.forEach(([label, value]) => {
            doc.font(FONT_BOLD).fontSize(10.5).fillColor(NAVY).text(`${label}:`, MARGIN + 40, y, { continued: true, width: 400 });
            doc.font(FONT_REGULAR).fillColor('#333').text(`  ${value}`);
            y += 20;
        });

        // Signature block
        y = PAGE_H - MARGIN - 130;
        doc.moveTo(MARGIN + 40, y).lineTo(PAGE_W - MARGIN - 40, y).lineWidth(0.5).stroke(GOLD);
        y += 16;
        doc.font(FONT_REGULAR).fontSize(9).fillColor('#666')
            .text(
                lang === 'hi'
                    ? 'यह विश्लेषण शास्त्रोक्त गणना पर आधारित प्रारंभिक मार्गदर्शन है। विस्तृत परामर्श हेतु कृपया संपर्क करें।'
                    : 'This analysis is a preliminary guide based on scriptural calculation. Please consult for a detailed reading.',
                MARGIN + 40, y, { width: PAGE_W - 2 * MARGIN - 80 }
            );
        y += 40;
        doc.font(FONT_BOLD).fontSize(12).fillColor(NAVY).text(lang === 'hi' ? 'ज्योतिषाचार्य पं. डॉ. उमंग नाथ शर्मा' : 'Astrologer: Dr. Umang Nath Sharma', MARGIN + 40, y);
        y += 16;
        doc.font(FONT_REGULAR).fontSize(9).fillColor('#666').text('Adhbhut Gyaan · Nati Imli Road, Ishwargangi, Varanasi · +91 92781 48269', MARGIN + 40, y);

        doc.end();
    } catch (err) {
        console.error('Kundli PDF generation error:', err);
        if (!res.headersSent) {
            res.status(500).json({ ok: false, error: 'Failed to generate PDF', detail: err.message });
        }
    }
};
