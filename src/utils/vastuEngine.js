// vastuEngine.js (frontend ES-module mirror of backend/utils/vastuEngine.js)
// Rules cross-referenced across 7+ independent sources, scoped to the 5
// room-types with strong, consistent cross-source agreement.

export const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export const DIRECTION_LABEL_HI = { N: 'उत्तर', NE: 'ईशान (उत्तर-पूर्व)', E: 'पूर्व', SE: 'आग्नेय (दक्षिण-पूर्व)', S: 'दक्षिण', SW: 'नैऋत्य (दक्षिण-पश्चिम)', W: 'पश्चिम', NW: 'वायव्य (उत्तर-पश्चिम)' };
export const DIRECTION_LABEL_EN = { N: 'North', NE: 'Northeast (Ishan)', E: 'East', SE: 'Southeast (Agni)', S: 'South', SW: 'Southwest (Nairitya)', W: 'West', NW: 'Northwest (Vayu)' };

export const ROOM_RULES = {
    mainDoor: { nameHi: 'मुख्य द्वार', nameEn: 'Main Door', ideal: ['N', 'E', 'NE'], acceptable: ['W'], avoid: ['SW'] },
    kitchen: { nameHi: 'रसोई घर', nameEn: 'Kitchen', ideal: ['SE'], acceptable: ['NW'], avoid: ['NE', 'SW'] },
    poojaRoom: { nameHi: 'पूजा घर', nameEn: 'Pooja Room', ideal: ['NE'], acceptable: ['N', 'E'], avoid: ['S'] },
    masterBedroom: { nameHi: 'शयन कक्ष (मुख्य)', nameEn: 'Master Bedroom', ideal: ['SW'], acceptable: ['S', 'W'], avoid: ['NE', 'SE'] },
    toilet: { nameHi: 'शौचालय', nameEn: 'Toilet/Bathroom', ideal: ['NW'], acceptable: ['W'], avoid: ['NE', 'SW'] },
};

const SCORE_IDEAL = 20;
const SCORE_ACCEPTABLE = 12;
const SCORE_AVOID = 2;
const SCORE_NEUTRAL = 8;
const MAX_SCORE_PER_ROOM = SCORE_IDEAL;

export function scoreRoom(roomKey, direction) {
    const rule = ROOM_RULES[roomKey];
    if (!rule || !DIRECTIONS.includes(direction)) return null;
    let tier, points;
    if (rule.ideal.includes(direction)) { tier = 'ideal'; points = SCORE_IDEAL; }
    else if (rule.acceptable.includes(direction)) { tier = 'acceptable'; points = SCORE_ACCEPTABLE; }
    else if (rule.avoid.includes(direction)) { tier = 'avoid'; points = SCORE_AVOID; }
    else { tier = 'neutral'; points = SCORE_NEUTRAL; }
    return { roomKey, direction, tier, points };
}

export function calculateVastuScore(placements) {
    const results = [];
    for (const roomKey of Object.keys(ROOM_RULES)) {
        const direction = placements[roomKey];
        if (!direction) continue;
        const r = scoreRoom(roomKey, direction);
        if (r) results.push(r);
    }
    const totalScore = results.reduce((s, r) => s + r.points, 0);
    const maxScore = results.length * MAX_SCORE_PER_ROOM;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    return { results, totalScore, maxScore, percentage };
}

export function getRemedy(roomKey, lang) {
    const rule = ROOM_RULES[roomKey];
    const idealDir = rule.ideal[0];
    const idealLabel = lang === 'hi' ? DIRECTION_LABEL_HI[idealDir] : DIRECTION_LABEL_EN[idealDir];
    const roomLabel = lang === 'hi' ? rule.nameHi : rule.nameEn;
    if (lang === 'hi') {
        return `${roomLabel} आदर्श रूप से ${idealLabel} दिशा में होना चाहिए। यदि स्थानांतरण संभव न हो, तो संबंधित दिशा में शुभ प्रतीक अथवा वास्तु यंत्र रखकर दोष का शमन करवाएं — व्यक्तिगत परामर्श हेतु संपर्क करें।`;
    }
    return `${roomLabel} is ideally placed in the ${idealLabel} direction. If relocating isn't possible, the affliction can often be mitigated with an appropriate Vastu yantra or remedy placed in that zone - consult for a personalized recommendation.`;
}
