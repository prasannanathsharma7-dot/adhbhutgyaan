// lifePredictions.js
// Generates the 10-life-area interpretive text, grounded in the actual
// chart's house lords and planet strength (own-sign / exalted / debilitated
// / neutral) rather than generic boilerplate that doesn't vary by person.
//
// Deliberately conservative on Health (area 10): stays at the level of
// classical constitutional TENDENCY, never disease-diagnosis or medical
// claims, and always closes with a "not medical advice, consult a doctor"
// line - matching the site's existing "Zero Fear-Mongering" principle.

const SIGN_LORD = { 1: 'mars', 2: 'venus', 3: 'mercury', 4: 'moon', 5: 'sun', 6: 'mercury', 7: 'venus', 8: 'mars', 9: 'jupiter', 10: 'saturn', 11: 'saturn', 12: 'jupiter' };

const { nakshatraHi, deityHi, lordHi } = require('./hindiTerms');

const OWN_SIGNS = { sun: [5], moon: [4], mars: [1, 8], mercury: [3, 6], jupiter: [9, 12], venus: [2, 7], saturn: [10, 11] };
const EXALTED_SIGN = { sun: 1, moon: 2, mars: 10, mercury: 6, jupiter: 4, venus: 12, saturn: 7 };
const DEBILITATED_SIGN = { sun: 7, moon: 8, mars: 4, mercury: 12, jupiter: 10, venus: 6, saturn: 1 };

const PLANET_NAME_HI = { sun: 'सूर्य', moon: 'चंद्रमा', mars: 'मंगल', mercury: 'बुध', jupiter: 'गुरु', venus: 'शुक्र', saturn: 'शनि', rahu: 'राहु', ketu: 'केतु' };
const PLANET_NAME_EN = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn', rahu: 'Rahu', ketu: 'Ketu' };

/** houseData: the same {1: {rashiId}, ...} structure used throughout. */
function lordOfHouse(houseData, houseNum) {
    return SIGN_LORD[houseData[houseNum].rashiId];
}

/** planets: the report's `planets` array (has .key and .rashi -> need sign number). */
function strengthOf(planetKey, signNum) {
    if (EXALTED_SIGN[planetKey] === signNum) return 'exalted';
    if (DEBILITATED_SIGN[planetKey] === signNum) return 'debilitated';
    if (OWN_SIGNS[planetKey]?.includes(signNum)) return 'own';
    return 'neutral';
}

function findPlanetSign(planets, key) {
    const p = planets.find(pl => pl.key === key);
    return p ? p.signNum : null;
}

/**
 * Builds the full set of 10 life-area predictions.
 * report: the object from computeFullKundliReport (needs .houseData,
 * .planets - but .planets currently stores sign NAME not number, so this
 * expects an augmented planets array with signNum added by the caller).
 * lang: 'hi' | 'en'
 */
function generateLifePredictions(report, lang) {
    const T = (hi, en) => (lang === 'hi' ? hi : en);
    const NT = (term, fn) => (lang === 'hi' ? fn(term) : term);
    const pName = (key) => (lang === 'hi' ? PLANET_NAME_HI[key] : PLANET_NAME_EN[key]) || key;
    const { houseData, planets } = report;
    const planetSignNum = {};
    planets.forEach(p => { planetSignNum[p.key] = p.signNum; });

    const lagnaLord = SIGN_LORD[houseData[1].rashiId];
    const strengthLabel = (s) => T(
        { exalted: 'उच्च का', own: 'स्वराशि में', debilitated: 'नीच का', neutral: 'सम स्थिति में' }[s],
        { exalted: 'exalted', own: 'in its own sign', debilitated: 'debilitated', neutral: 'in a neutral position' }[s]
    );
    const tone = (s) => (s === 'exalted' || s === 'own') ? 'strong' : (s === 'debilitated' ? 'challenging' : 'moderate');

    const areas = [];

    // 1. Nature & Personality (Lagna)
    {
        const s = strengthOf(lagnaLord, planetSignNum[lagnaLord]);
        const t = tone(s);
        areas.push({
            title: T('स्वभाव व व्यक्तित्व', 'Nature & Personality'),
            text: T(
                `लग्नेश ${pName(lagnaLord)} ${strengthLabel(s)} है, जो ${t === 'strong' ? 'दृढ़ आत्मविश्वास, स्पष्ट निर्णय-क्षमता एवं प्रभावशाली व्यक्तित्व' : t === 'challenging' ? 'संकोच, आत्म-संदेह की प्रवृत्ति एवं विलंबित आत्मविश्वास' : 'संतुलित किंतु परिस्थिति-निर्भर स्वभाव'} का संकेत देता है।`,
                `The Lagna lord (${pName(lagnaLord)}) is ${strengthLabel(s)}, indicating ${t === 'strong' ? 'strong self-confidence, clear decision-making, and an impactful personality' : t === 'challenging' ? 'a tendency toward hesitation, self-doubt, and confidence that builds slowly over time' : 'a balanced but situation-dependent temperament'}.`
            ),
        });
    }

    // 2. Nakshatra effects
    {
        const nakName = NT(report.nakshatra.name, nakshatraHi);
        const nakLord = NT(report.nakshatra.lord, lordHi);
        const nakDeity = NT(report.nakshatra.deity, deityHi);
        areas.push({
            title: T('नक्षत्र फल', 'Nakshatra Effects'),
            text: T(
                `जन्म नक्षत्र ${nakName} (स्वामी: ${nakLord}, अधिष्ठाता देवता: ${nakDeity}) का प्रभाव मानसिक प्रवृत्तियों एवं जीवन-दिशा पर विशेष रूप से पड़ता है — पद ${report.nakshatra.pada} इस प्रभाव को और सूक्ष्मता से परिभाषित करता है।`,
                `The birth Nakshatra ${report.nakshatra.name} (ruled by ${report.nakshatra.lord}, presiding deity ${report.nakshatra.deity}) particularly shapes mental tendencies and life direction - Pada ${report.nakshatra.pada} refines this influence further.`
            ),
        });
    }

    // 3. Character & Social Conduct (Moon + Mars)
    {
        const moonS = strengthOf('moon', planetSignNum.moon);
        const marsS = strengthOf('mars', planetSignNum.mars);
        areas.push({
            title: T('चरित्र व सामाजिक आचरण', 'Character & Social Conduct'),
            text: T(
                `चंद्रमा ${strengthLabel(moonS)} एवं मंगल ${strengthLabel(marsS)} है — यह संयोजन ${tone(moonS) === 'strong' ? 'भावनात्मक स्थिरता एवं सामाजिक सहजता' : 'भावनात्मक उतार-चढ़ाव के साथ अनुकूलनशीलता'} तथा ${tone(marsS) === 'strong' ? 'साहसिक एवं मुखर आचरण' : 'सोच-समझ कर लिया गया, संयमित आचरण'} दर्शाता है।`,
                `The Moon is ${strengthLabel(moonS)} and Mars is ${strengthLabel(marsS)} - this combination suggests ${tone(moonS) === 'strong' ? 'emotional stability and social ease' : 'emotional fluctuation paired with adaptability'}, along with ${tone(marsS) === 'strong' ? 'bold, assertive conduct' : 'measured, restrained conduct'}.`
            ),
        });
    }

    // 4. Fortune (9th house / Bhagyesh)
    {
        const lord9 = lordOfHouse(houseData, 9);
        const s = strengthOf(lord9, planetSignNum[lord9]);
        const t = tone(s);
        areas.push({
            title: T('सौभाग्य, संतुष्टि व भाग्योदय', 'Fortune & Prosperity'),
            text: T(
                `भाग्येश (नवम भाव स्वामी) ${pName(lord9)} ${strengthLabel(s)} है, जो ${t === 'strong' ? 'गुरुजनों व भाग्य का प्रबल साथ, तीर्थाटन एवं धर्म-कर्म में रुचि' : t === 'challenging' ? 'भाग्योदय में विलंब, स्वप्रयास पर अधिक निर्भरता' : 'मध्यम किंतु स्थिर भाग्य-साथ'} का संकेत देता है।`,
                `The Bhagyesh (9th house lord) ${pName(lord9)} is ${strengthLabel(s)}, indicating ${t === 'strong' ? 'strong support from elders and fortune, an inclination toward pilgrimage and dharmic pursuits' : t === 'challenging' ? 'delayed rise in fortune, requiring greater reliance on self-effort' : 'moderate but steady fortune'}.`
            ),
        });
    }

    // 5. Education & Competitive Exams (5th house + Mercury/Jupiter)
    {
        const lord5 = lordOfHouse(houseData, 5);
        const s = strengthOf(lord5, planetSignNum[lord5]);
        const t = tone(s);
        const mercS = strengthOf('mercury', planetSignNum.mercury);
        areas.push({
            title: T('शिक्षा, बौद्धिक क्षमता व प्रतियोगी परीक्षाएं', 'Education & Competitive Exams'),
            text: T(
                `पंचमेश ${pName(lord5)} ${strengthLabel(s)} है तथा बुध ${strengthLabel(mercS)} है — यह संयोजन ${t === 'strong' ? 'तीव्र बौद्धिक क्षमता, अध्ययन में एकाग्रता एवं प्रतियोगी परीक्षाओं में सफलता की प्रबल संभावना' : t === 'challenging' ? 'अध्ययन में निरंतर परिश्रम की आवश्यकता, किंतु दृढ़ता से सफलता संभव' : 'सामान्य किंतु स्थिर शैक्षणिक प्रगति'} दर्शाता है।`,
                `The 5th house lord ${pName(lord5)} is ${strengthLabel(s)}, and Mercury is ${strengthLabel(mercS)} - this suggests ${t === 'strong' ? 'sharp intellectual capacity, strong focus in studies, and good prospects in competitive exams' : t === 'challenging' ? 'a need for sustained effort in studies, though success is achievable with persistence' : 'steady, if unremarkable, academic progress'}.`
            ),
        });
    }

    // 6. Employment (10th house + Saturn)
    {
        const lord10 = lordOfHouse(houseData, 10);
        const s = strengthOf(lord10, planetSignNum[lord10]);
        const t = tone(s);
        areas.push({
            title: T('रोजगार एवं नौकरी की संभावनाएं', 'Employment & Job Prospects'),
            text: T(
                `कर्मेश (दशम भाव स्वामी) ${pName(lord10)} ${strengthLabel(s)} है, जो ${t === 'strong' ? 'उच्च पद, अधिकार-संपन्न भूमिका एवं व्यावसायिक सम्मान' : t === 'challenging' ? 'प्रारंभिक संघर्ष के बाद स्थायित्व, निरंतर परिश्रम से उन्नति' : 'स्थिर एवं संतोषजनक व्यावसायिक प्रगति'} का संकेत देता है।`,
                `The Karmesh (10th house lord) ${pName(lord10)} is ${strengthLabel(s)}, indicating ${t === 'strong' ? 'a senior position, an authoritative role, and professional respect' : t === 'challenging' ? 'initial struggle followed by stability, with advancement through sustained effort' : 'steady and satisfactory professional progress'}.`
            ),
        });
    }

    // 7. Business & Trade (10th lord nature + Mercury)
    {
        const lord10 = lordOfHouse(houseData, 10);
        const businessInclined = ['mercury', 'venus', 'saturn'].includes(lord10);
        areas.push({
            title: T('व्यवसाय, उद्योग व व्यापारिक योग', 'Business & Trade'),
            text: T(
                businessInclined
                    ? `दशमेश ${pName(lord10)} की प्रकृति स्वतंत्र व्यवसाय अथवा व्यापार की ओर झुकाव दर्शाती है — उचित समय पर उद्यमशीलता लाभदायक हो सकती है।`
                    : `दशमेश ${pName(lord10)} की प्रकृति सेवा (नौकरी) क्षेत्र में अधिक अनुकूल प्रतीत होती है, यद्यपि स्वतंत्र उद्यम भी दशा-अनुसार संभव है।`,
                businessInclined
                    ? `The 10th lord ${pName(lord10)}'s nature suggests an inclination toward independent business or trade - entrepreneurship, undertaken at the right time, could prove beneficial.`
                    : `The 10th lord ${pName(lord10)}'s nature appears more suited to structured employment, though independent enterprise remains possible depending on the active Dasha period.`
            ),
        });
    }

    // 8. Finance & Wealth (2nd + 11th house lords)
    {
        const lord2 = lordOfHouse(houseData, 2);
        const lord11 = lordOfHouse(houseData, 11);
        const s2 = strengthOf(lord2, planetSignNum[lord2]);
        const s11 = strengthOf(lord11, planetSignNum[lord11]);
        areas.push({
            title: T('वित्त, पैतृक संपत्ति व धन संचय', 'Finance & Wealth'),
            text: T(
                `धनेश ${pName(lord2)} ${strengthLabel(s2)} एवं लाभेश ${pName(lord11)} ${strengthLabel(s11)} है — यह संयोजन ${tone(s2) === 'strong' && tone(s11) === 'strong' ? 'स्थिर संचय एवं बहु-स्रोत आय' : 'परिश्रम-आधारित, क्रमिक धन-वृद्धि'} का संकेत देता है। संपत्ति-संबंधी निर्णय शुभ मुहूर्त में लेना उचित रहेगा।`,
                `The 2nd lord ${pName(lord2)} is ${strengthLabel(s2)} and the 11th lord ${pName(lord11)} is ${strengthLabel(s11)} - this combination suggests ${tone(s2) === 'strong' && tone(s11) === 'strong' ? 'steady accumulation and multiple income sources' : 'gradual, effort-based wealth growth'}. Major financial decisions are best timed with an auspicious muhurat.`
            ),
        });
    }

    // 9. Love, Marriage & Married Life (7th house + Venus)
    {
        const lord7 = lordOfHouse(houseData, 7);
        const s = strengthOf(lord7, planetSignNum[lord7]);
        const venusS = strengthOf('venus', planetSignNum.venus);
        const t = tone(s);
        areas.push({
            title: T('प्रेम, विवाह व दांपत्य जीवन', 'Love, Marriage & Married Life'),
            text: T(
                `सप्तमेश ${pName(lord7)} ${strengthLabel(s)} तथा शुक्र ${strengthLabel(venusS)} है — यह ${t === 'strong' ? 'सामंजस्यपूर्ण दांपत्य जीवन एवं अनुकूल जीवनसाथी' : t === 'challenging' ? 'प्रारंभिक तालमेल हेतु धैर्य व समझ की आवश्यकता' : 'सामान्य, स्थिर दांपत्य संबंध'} दर्शाता है। सटीक विवाह-समय हेतु दशा-अनुसार परामर्श उचित रहेगा।`,
                `The 7th lord ${pName(lord7)} is ${strengthLabel(s)} and Venus is ${strengthLabel(venusS)} - this suggests ${t === 'strong' ? 'a harmonious married life and a compatible spouse' : t === 'challenging' ? 'a need for patience and mutual understanding to build early rapport' : 'a generally stable married relationship'}. For precise marriage timing, a Dasha-based consultation is recommended.`
            ),
        });
    }

    // 10. Health (6th house + Lagna lord) - deliberately general, never diagnostic
    {
        const lord6 = lordOfHouse(houseData, 6);
        const s6 = strengthOf(lord6, planetSignNum[lord6]);
        const lagnaS = strengthOf(lagnaLord, planetSignNum[lagnaLord]);
        areas.push({
            title: T('स्वास्थ्य, संवेदनशील अंग व सावधानियां', 'Health & Precautions'),
            text: T(
                `षष्ठेश ${pName(lord6)} ${strengthLabel(s6)} है — शास्त्रोक्त दृष्टि से यह सामान्य शारीरिक क्षमता का सूचक है। यह विश्लेषण पूर्णतः पारंपरिक ज्योतिषीय संकेत है, चिकित्सा निदान नहीं — किसी भी स्वास्थ्य समस्या हेतु कृपया योग्य चिकित्सक से परामर्श लें।`,
                `The 6th house lord ${pName(lord6)} is ${strengthLabel(s6)} - from a classical astrological perspective, this indicates general constitutional tendencies. This is a traditional astrological indication only, not a medical diagnosis - please consult a qualified doctor for any actual health concern.`
            ),
        });
    }

    return areas;
}

module.exports = { generateLifePredictions, SIGN_LORD, lordOfHouse, strengthOf };
