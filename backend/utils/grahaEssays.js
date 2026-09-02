// grahaEssays.js
// Generates one interpretive essay per graha (Sun through Ketu), grounded
// in that planet's actual computed house placement, sign, and strength
// (own/exalted/debilitated/neutral) - not generic text repeated for every
// chart.

const { lordOfHouse, strengthOf, SIGN_LORD } = require('./lifePredictions');
const { nakshatraHi, lordHi } = require('./hindiTerms');

const PLANET_NAME_HI = { sun: 'सूर्य', moon: 'चन्द्र', mars: 'मंगल', mercury: 'बुध', jupiter: 'गुरु (बृहस्पति)', venus: 'शुक्र', saturn: 'शनि', rahu: 'राहु', ketu: 'केतु' };
const PLANET_NAME_EN = { sun: 'Sun (Surya)', moon: 'Moon (Chandra)', mars: 'Mars (Mangal)', mercury: 'Mercury (Budh)', jupiter: 'Jupiter (Guru)', venus: 'Venus (Shukra)', saturn: 'Saturn (Shani)', rahu: 'Rahu', ketu: 'Ketu' };

// What each planet signifies (karakatva) - standard classical list, kept
// short (3-4 items) rather than exhaustive.
const SIGNIFICATIONS_HI = {
    sun: 'आत्मा, पिता, अधिकार, स्वास्थ्य एवं आत्मविश्वास',
    moon: 'मन, माता, भावनाएं एवं मानसिक शांति',
    mars: 'साहस, भाई-बहन, भूमि-संपत्ति एवं ऊर्जा',
    mercury: 'बुद्धि, वाणी, व्यापार एवं विश्लेषण-क्षमता',
    jupiter: 'ज्ञान, गुरु, संतान, भाग्य एवं धर्म',
    venus: 'प्रेम, विवाह, कला, सुख-सुविधा एवं वैभव',
    saturn: 'अनुशासन, कर्म, दीर्घकालिक परिश्रम एवं न्याय',
    rahu: 'महत्वाकांक्षा, अपरंपरागत सोच एवं अकस्मात परिवर्तन',
    ketu: 'वैराग्य, आध्यात्मिकता एवं पूर्व-जन्म के संस्कार',
};
const SIGNIFICATIONS_EN = {
    sun: 'soul, father, authority, health, and self-confidence',
    moon: 'mind, mother, emotions, and mental peace',
    mars: 'courage, siblings, land/property, and energy',
    mercury: 'intellect, speech, trade, and analytical ability',
    jupiter: 'knowledge, teachers, children, fortune, and dharma',
    venus: 'love, marriage, the arts, comfort, and luxury',
    saturn: 'discipline, karma, long-term effort, and justice',
    rahu: 'ambition, unconventional thinking, and sudden change',
    ketu: 'detachment, spirituality, and past-life tendencies',
};

const HOUSE_THEME_HI = { 1: 'व्यक्तित्व एवं स्वास्थ्य', 2: 'धन एवं वाणी', 3: 'साहस एवं भाई-बहन', 4: 'सुख एवं माता', 5: 'संतान एवं बुद्धि', 6: 'शत्रु एवं रोग', 7: 'विवाह एवं साझेदारी', 8: 'आयु एवं गूढ़ विषय', 9: 'भाग्य एवं धर्म', 10: 'कर्म एवं व्यवसाय', 11: 'लाभ एवं आय', 12: 'व्यय एवं मोक्ष' };
const HOUSE_THEME_EN = { 1: 'personality and health', 2: 'wealth and speech', 3: 'courage and siblings', 4: 'domestic happiness and mother', 5: 'children and intellect', 6: 'obstacles and health challenges', 7: 'marriage and partnerships', 8: 'longevity and hidden matters', 9: 'fortune and dharma', 10: 'career and public standing', 11: 'gains and income', 12: 'expenses and spiritual release' };

function strengthPhrase(s, lang) {
    const hi = { exalted: 'उच्च राशि में स्थित होकर अत्यंत बलवान', own: 'स्वराशि में स्थित होकर बलवान', debilitated: 'नीच राशि में स्थित होकर कमजोर', neutral: 'सम स्थिति में' }[s];
    const en = { exalted: 'exalted, making it particularly strong', own: 'in its own sign, making it strong', debilitated: 'debilitated, making it weaker here', neutral: 'in a neutral position' }[s];
    return lang === 'hi' ? hi : en;
}

/**
 * report: computeFullKundliReport()'s output (needs .planets, .houseData).
 * lang: 'hi' | 'en'
 * Returns an array of 9 { title, text } essays, Sun through Ketu.
 */
function generateGrahaEssays(report, lang) {
    const T = (hi, en) => (lang === 'hi' ? hi : en);
    const pName = (key) => (lang === 'hi' ? PLANET_NAME_HI[key] : PLANET_NAME_EN[key]);
    const order = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

    return order.map(key => {
        const p = report.planets.find(pl => pl.key === key);
        const signNum = p.signNum;
        const house = p.house;
        const strength = (key === 'rahu' || key === 'ketu') ? 'neutral' : strengthOf(key, signNum);
        const sPhrase = strengthPhrase(strength, lang);
        const houseTheme = lang === 'hi' ? HOUSE_THEME_HI[house] : HOUSE_THEME_EN[house];
        const signif = lang === 'hi' ? SIGNIFICATIONS_HI[key] : SIGNIFICATIONS_EN[key];
        const houseLord = SIGN_LORD[report.houseData[house].rashiId];

        const text = T(
            `${pName(key)} — जिसके कारक विषय हैं ${signif} — जन्म कुंडली के ${house}वें भाव (${houseTheme}) में ${p.rashi} राशि में स्थित है, तथा ${sPhrase} है। इस स्थिति के अनुसार, ${key === 'rahu' || key === 'ketu' ? 'यह छाया ग्रह' : pName(key)} का प्रभाव विशेष रूप से ${houseTheme} से संबंधित विषयों पर पड़ता है। इस भाव का स्वामी ${houseLord === key ? 'स्वयं यही ग्रह है, जो इसे और अधिक महत्वपूर्ण बनाता है' : pName(houseLord)} है।`,
            `${pName(key)} - which classically signifies ${signif} - is placed in the ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house (${houseTheme}) of the birth chart, in ${p.rashi}, and is ${sPhrase}. This placement means ${key === 'rahu' || key === 'ketu' ? 'this shadow planet' : pName(key)}'s influence is particularly felt in matters of ${houseTheme}. This house's own lord is ${houseLord === key ? 'this very planet, which gives it added significance' : pName(houseLord)}.`
        );

        return { title: pName(key), text };
    });
}

module.exports = { generateGrahaEssays };
