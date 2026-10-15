// Builds src/data/festivals.json: each festival's DATE is a verified fact (checked against Drik Panchang and several other
// published panchangs, 14-15 Oct 2026) and its tithi WINDOW is computed from the verified Panchang engine, so the times shown
// on the site come from the same engine that was tested against published panchangs to within a minute.
//   node scripts/build-festivals.mjs          writes the JSON
//   import { buildFestivals }                 used by scripts/test-festivals.mjs to detect drift
// Only festivals with at least two agreeing published sources are listed. To add a festival: add it here WITH the
// basis the shastras use to pick its day, run this script, and extend the expected-date table in the test.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tithiAt, ruleInstant } from '../src/utils/tithiWindows.js';

export const FESTIVAL_DEFINITIONS = [
    { id: 'dussehra', date: '2026-10-20', basis: 'aparahna', tithi: 'Shukla Dashami',
      nameEn: 'Dussehra (Vijayadashami)', nameHi: 'दशहरा (विजयादशमी)',
      noteEn: 'The tenth day after Navratri, observed in the afternoon (aparahna) when Dashami prevails.', noteHi: 'नवरात्रि के बाद दशमी तिथि; अपराह्न में दशमी रहने पर मनाया जाता है।', poojas: [] },
    { id: 'papankusha-ekadashi', date: '2026-10-22', basis: 'udaya', tithi: 'Shukla Ekadashi',
      nameEn: 'Papankusha Ekadashi', nameHi: 'पापांकुशा एकादशी',
      noteEn: 'Ekadashi vrat of Ashwin Shukla paksha, kept on the day Ekadashi is present at sunrise.', noteHi: 'आश्विन शुक्ल पक्ष की एकादशी; सूर्योदय पर एकादशी वाले दिन व्रत।', poojas: ['item:4', 'item:93'] },
    { id: 'sharad-purnima', date: '2026-10-25', basis: 'night', tithi: 'Purnima',
      nameEn: 'Sharad Purnima (Kojagari Lakshmi Puja)', nameHi: 'शरद पूर्णिमा (कोजागरी लक्ष्मी पूजा)',
      noteEn: 'The full-moon night of Ashwin; the night vigil and Lakshmi worship are held while Purnima prevails at night.', noteHi: 'आश्विन की पूर्णिमा; रात्रि में पूर्णिमा रहने पर जागरण व लक्ष्मी पूजन।', poojas: ['svc:shree-suktam', 'item:93'] },
    { id: 'karwa-chauth', date: '2026-10-29', basis: 'moonrise', tithi: 'Krishna Chaturthi',
      nameEn: 'Karwa Chauth', nameHi: 'करवा चौथ',
      noteEn: 'Kartik Krishna Chaturthi; the fast is broken after moonrise (about 8 PM at Varanasi).', noteHi: 'कार्तिक कृष्ण चतुर्थी; चंद्रोदय (वाराणसी में लगभग रात 8 बजे) के बाद व्रत खोला जाता है।', poojas: [] },
    { id: 'ahoi-ashtami', date: '2026-11-01', basis: 'pradosh', tithi: 'Krishna Ashtami',
      nameEn: 'Ahoi Ashtami', nameHi: 'अहोई अष्टमी',
      noteEn: 'Kartik Krishna Ashtami, observed when Ashtami prevails in the evening (pradosh).', noteHi: 'कार्तिक कृष्ण अष्टमी; सायं (प्रदोष) में अष्टमी रहने पर।', poojas: [] },
    { id: 'rama-ekadashi', date: '2026-11-05', basis: 'udaya', tithi: 'Krishna Ekadashi',
      nameEn: 'Rama Ekadashi', nameHi: 'रमा एकादशी',
      noteEn: 'Ekadashi vrat of Kartik Krishna paksha.', noteHi: 'कार्तिक कृष्ण पक्ष की एकादशी का व्रत।', poojas: ['item:4', 'item:93'] },
    { id: 'dhanteras', date: '2026-11-06', basis: 'pradosh', tithi: 'Krishna Trayodashi',
      nameEn: 'Dhanteras (Dhan Trayodashi)', nameHi: 'धनतेरस (धन त्रयोदशी)',
      noteEn: 'Trayodashi at pradosh; Dhanvantari, Kubera and Lakshmi are worshipped in the evening.', noteHi: 'प्रदोष में त्रयोदशी; सायं धन्वंतरि, कुबेर व लक्ष्मी पूजन।', poojas: ['svc:shree-suktam', 'svc:kanakdhara-stotra'] },
    { id: 'diwali', date: '2026-11-08', basis: 'pradosh', tithi: 'Amavasya',
      nameEn: 'Diwali - Lakshmi Puja', nameHi: 'दीपावली - लक्ष्मी पूजन',
      noteEn: 'Kartik Amavasya; Lakshmi-Ganesh puja is done in the pradosh kaal after sunset while Amavasya prevails.', noteHi: 'कार्तिक अमावस्या; सूर्यास्त के बाद प्रदोष काल में अमावस्या रहने पर लक्ष्मी-गणेश पूजन।', poojas: ['svc:shree-suktam', 'svc:kanakdhara-stotra', 'item:84'] },
    { id: 'bhai-dooj', date: '2026-11-11', basis: 'aparahna', tithi: 'Shukla Dwitiya',
      nameEn: 'Bhai Dooj', nameHi: 'भाई दूज',
      noteEn: 'Kartik Shukla Dwitiya, observed in the afternoon (aparahna).', noteHi: 'कार्तिक शुक्ल द्वितीया; अपराह्न में।', poojas: [] },
    { id: 'dev-uthani-ekadashi', date: '2026-11-20', alsoDate: '2026-11-21', basis: 'midday', tithi: 'Shukla Ekadashi',
      nameEn: 'Dev Uthani (Prabodhini) Ekadashi', nameHi: 'देवउठनी (प्रबोधिनी) एकादशी',
      noteEn: 'Ends Chaturmas; Tulsi Vivah follows. Smarta families keep it on 20 Nov, Vaishnava families on 21 Nov - ask your family priest.', noteHi: 'चातुर्मास का समापन; तुलसी विवाह इसके बाद। स्मार्त 20 नवंबर, वैष्णव 21 नवंबर को मनाते हैं — अपने कुल-पुरोहित से पूछें।', poojas: ['item:4', 'item:93'] },
    { id: 'dev-deepawali', date: '2026-11-24', basis: 'pradosh', tithi: 'Purnima',
      nameEn: 'Dev Deepawali (Kartik Purnima)', nameHi: 'देव दीपावली (कार्तिक पूर्णिमा)',
      noteEn: "Kashi's festival of lights on the ghats of the Ganga, held in the evening while Purnima prevails.", noteHi: 'काशी के गंगा घाटों पर दीपोत्सव; सायं पूर्णिमा रहने पर।', poojas: ['item:93'] },
];

const [Y, M, D] = [0, 1, 2];
export function buildFestivals() {
    return FESTIVAL_DEFINITIONS.map((f) => {
        const [y, m, d] = f.date.split('-').map(Number);
        const at = tithiAt(ruleInstant(f.basis, y, m, d));
        const iso = (ms) => (ms === null ? null : new Date(ms).toISOString());
        return { ...f, window: { tithi: at.name, start: iso(at.start), end: iso(at.end) } };
    });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'festivals.json');
    const festivals = buildFestivals();
    writeFileSync(out, JSON.stringify({ _comment: 'GENERATED by scripts/build-festivals.mjs - do not edit by hand. Season: Oct-Nov 2026, Varanasi (Kashi), IST.', generatedFor: 'Varanasi 25.3176N 82.9739E, IST', festivals }, null, 2) + '\n');
    console.log(`wrote ${festivals.length} festivals to src/data/festivals.json`);
    for (const f of festivals) console.log(`${f.date}  ${f.id.padEnd(22)} ${f.window.tithi.padEnd(20)} ${f.window.start || '?'} -> ${f.window.end || '?'}  (expected ${f.tithi})`);
}
