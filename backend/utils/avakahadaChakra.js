// avakahadaChakra.js
// Classical Nakshatra-based Avakahada Chakra attributes: Varna, Vashya,
// Yoni, Gana, Nadi - used in Ashtakoot marriage-matching and traditionally
// listed on a Janam Patrika. Indexed 0-26 matching the standard Ashwini..
// Revati nakshatra order (same order as NAKSHATRAS in kundli-preanalyzer.js).

const AVAKAHADA = [
    { nakshatra: 'Ashwini', varna: 'Vaishya', vashya: 'Chatushpada', yoni: 'Horse', gana: 'Deva', nadi: 'Adi' },
    { nakshatra: 'Bharani', varna: 'Mlechha', vashya: 'Manav', yoni: 'Elephant', gana: 'Manushya', nadi: 'Madhya' },
    { nakshatra: 'Krittika', varna: 'Vaishya', vashya: 'Chatushpada', yoni: 'Goat (Sheep)', gana: 'Rakshasa', nadi: 'Antya' },
    { nakshatra: 'Rohini', varna: 'Shudra', vashya: 'Chatushpada', yoni: 'Serpent', gana: 'Manushya', nadi: 'Antya' },
    { nakshatra: 'Mrigashira', varna: 'Vaishya', vashya: 'Chatushpada', yoni: 'Serpent', gana: 'Deva', nadi: 'Madhya' },
    { nakshatra: 'Ardra', varna: 'Shudra', vashya: 'Manav', yoni: 'Dog', gana: 'Manushya', nadi: 'Adi' },
    { nakshatra: 'Punarvasu', varna: 'Vaishya', vashya: 'Manav', yoni: 'Cat', gana: 'Deva', nadi: 'Adi' },
    { nakshatra: 'Pushya', varna: 'Kshatriya', vashya: 'Manav', yoni: 'Goat (Sheep)', gana: 'Deva', nadi: 'Madhya' },
    { nakshatra: 'Ashlesha', varna: 'Mlechha', vashya: 'Jalchar', yoni: 'Cat', gana: 'Rakshasa', nadi: 'Antya' },
    { nakshatra: 'Magha', varna: 'Shudra', vashya: 'Vanchar', yoni: 'Rat', gana: 'Rakshasa', nadi: 'Adi' },
    { nakshatra: 'Purva Phalguni', varna: 'Brahmin', vashya: 'Manav', yoni: 'Rat', gana: 'Manushya', nadi: 'Madhya' },
    { nakshatra: 'Uttara Phalguni', varna: 'Kshatriya', vashya: 'Manav', yoni: 'Cow (Ox)', gana: 'Manushya', nadi: 'Antya' },
    { nakshatra: 'Hasta', varna: 'Vaishya', vashya: 'Manav', yoni: 'Buffalo', gana: 'Deva', nadi: 'Adi' },
    { nakshatra: 'Chitra', varna: 'Mlechha', vashya: 'Chatushpada', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya' },
    { nakshatra: 'Swati', varna: 'Shudra', vashya: 'Manav', yoni: 'Buffalo', gana: 'Deva', nadi: 'Antya' },
    { nakshatra: 'Vishakha', varna: 'Mlechha', vashya: 'Chatushpada', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Adi' },
    { nakshatra: 'Anuradha', varna: 'Shudra', vashya: 'Jalchar', yoni: 'Deer (Hare)', gana: 'Deva', nadi: 'Madhya' },
    { nakshatra: 'Jyeshtha', varna: 'Shudra', vashya: 'Manav', yoni: 'Deer (Hare)', gana: 'Rakshasa', nadi: 'Antya' },
    { nakshatra: 'Mula', varna: 'Mlechha', vashya: 'Jalchar', yoni: 'Dog', gana: 'Rakshasa', nadi: 'Adi' },
    { nakshatra: 'Purva Ashadha', varna: 'Kshatriya', vashya: 'Manav', yoni: 'Monkey', gana: 'Manushya', nadi: 'Madhya' },
    { nakshatra: 'Uttara Ashadha', varna: 'Kshatriya', vashya: 'Chatushpada', yoni: 'Mongoose', gana: 'Manushya', nadi: 'Antya' },
    { nakshatra: 'Shravana', varna: 'Mlechha', vashya: 'Chatushpada', yoni: 'Monkey', gana: 'Deva', nadi: 'Adi' },
    { nakshatra: 'Dhanishta', varna: 'Mlechha', vashya: 'Chatushpada', yoni: 'Lion', gana: 'Rakshasa', nadi: 'Madhya' },
    { nakshatra: 'Shatabhisha', varna: 'Mlechha', vashya: 'Chatushpada', yoni: 'Horse', gana: 'Rakshasa', nadi: 'Antya' },
    { nakshatra: 'Purva Bhadrapada', varna: 'Brahmin', vashya: 'Jalchar', yoni: 'Lion', gana: 'Manushya', nadi: 'Adi' },
    { nakshatra: 'Uttara Bhadrapada', varna: 'Kshatriya', vashya: 'Jalchar', yoni: 'Cow (Ox)', gana: 'Manushya', nadi: 'Madhya' },
    { nakshatra: 'Revati', varna: 'Shudra', vashya: 'Jalchar', yoni: 'Elephant', gana: 'Deva', nadi: 'Antya' },
];

/**
 * nakshatraIndex: 0-26 (matching the standard Ashwini..Revati order used
 * by NAKSHATRAS in kundli-preanalyzer.js).
 */
function getAvakahada(nakshatraIndex) {
    return AVAKAHADA[nakshatraIndex] || AVAKAHADA[0];
}

module.exports = { getAvakahada, AVAKAHADA };
