// Shared media data — used across About, Home, Blog, and Booking pages
// Single source of truth so all pages stay in sync when new photos/videos are added.

export const triptych = [
    { src: '/images/gallery/vedic-paath.jpg', capHi: 'परम्परा', capEn: 'The Tradition', link: '/about#generations' },
    { src: '/images/heritage/umang-with-ayodhya-portrait.jpg', capHi: 'डॉ. उमंग नाथ शर्मा', capEn: 'Dr. Umang Nath Sharma', link: '/about#chief-astrologer' },
    { src: '/images/gallery/ram-katha-event.jpg', capHi: 'सेवा', capEn: 'The Mission', link: '/about#mission' },
];

export const videoClips = [
    { src: '/videos/clip-2.mp4', poster: '/images/gallery/clip-2-poster.jpg', capHi: 'सामूहिक हवन — लाइव झलक', capEn: 'Collective Havan — Live Glimpse' },
    { src: '/videos/clip-4.mp4', poster: '/images/gallery/clip-4-poster.jpg', capHi: 'हवन अग्नि — आहुति क्षण', capEn: 'Havan Fire — Moment of Offering' },
    { src: '/videos/clip-3.mp4', poster: '/images/gallery/clip-3-poster.jpg', capHi: 'माँ का दिव्य श्रृंगार', capEn: "The Goddess's Divine Adornment" },
    { src: '/videos/clip-1.mp4', poster: '/images/gallery/clip-1-poster.jpg', capHi: 'पूजन विधि — क्षण भर', capEn: 'A Moment from the Ritual' },
];

export const youtubeChannelId = 'UCdRLqFjBr4NA4t5ZsTlidJg';
export const youtubeUploadsPlaylistId = 'UU' + youtubeChannelId.slice(2);

// The most prestigious credibility items get their own dedicated showcase
// (see pressHighlights below) instead of sitting as equal-weight thumbnails
// in the general gallery grid.
export const pressHighlights = [
    { src: '/images/heritage/aajtak-interview.jpg', badge: 'आज तक', badgeEn: 'Aaj Tak', capHi: 'आज तक डिजिटल पर डॉ. उमंग नाथ शर्मा का विशेष साक्षात्कार — वाराणसी से राशिफल एवं ज्योतिषीय विश्लेषण', capEn: "Dr. Umang Nath Sharma's exclusive interview on Aaj Tak Digital — horoscope insights and astrological analysis, live from Varanasi" },
    { src: '/images/gallery/umang-with-pm-modi.jpg', badge: 'प्रधानमंत्री', badgeEn: 'Prime Minister', capHi: 'डॉ. उमंग नाथ शर्मा प्रधानमंत्री श्री नरेन्द्र मोदी जी के साथ', capEn: 'Dr. Umang Nath Sharma with Prime Minister Narendra Modi' },
    { src: '/images/gallery/grand-opening-head-office.jpg', badge: 'मुख्य अतिथि', badgeEn: 'Chief Guest', capHi: 'हेड ऑफिस के भव्य उद्घाटन में मुख्य अतिथि के रूप में डॉ. उमंग नाथ शर्मा', capEn: 'Dr. Umang Nath Sharma as Chief Guest at the Grand Opening of the Head Office' },
    { src: '/images/gallery/microtec-office-opening.jpg', badge: 'उद्घाटन', badgeEn: 'Inauguration', capHi: 'माइक्रोटेक ग्रुप के नए हेड ऑफिस का उद्घाटन करते डॉ. उमंग नाथ शर्मा', capEn: "Dr. Umang Nath Sharma inaugurating MicroTec Group's new Head Office" },
    { src: '/images/heritage/shambhu-with-jatti.jpg', badge: 'राजनयिक', badgeEn: 'Diplomatic', capHi: 'भारत के भूतपूर्व उपराष्ट्रपति श्री बी.डी. जत्ती के साथ पं. शम्भु नाथ शर्मा', capEn: 'Pt. Shambhu Nath Sharma with former Vice President of India, B.D. Jatti' },
    { src: '/images/heritage/bbc-newspaper-clip.jpg', badge: 'BBC लंदन', badgeEn: 'BBC London', capHi: 'ज्योतिर्विद् पं. शम्भु नाथ शर्मा का बी.बी.सी. (लंदन) द्वारा साक्षात्कार — "गांडीव" हिंदी दैनिक, 4 फरवरी 1975', capEn: 'Interviewed by BBC (London) — reported in "Gandiv" Hindi Daily, 4 February 1975' },
    { src: '/images/heritage/dainik-jagran-clip.jpg', badge: 'दैनिक जागरण', badgeEn: 'Dainik Jagran', capHi: 'परिवार की ज्योतिषीय परंपरा एवं जापान की Hulu TV द्वारा बनाई जा रही वृत्तचित्र पर रिपोर्ट', capEn: "Coverage on the family's astrological tradition and the documentary being made by Japan's Hulu TV" },
    { src: '/images/heritage/phd-certificate.jpg', badge: 'डॉक्टरेट', badgeEn: 'Doctorate', capHi: 'डॉ. उमंग नाथ शर्मा — ज्योतिष में डॉक्टरेट उपाधि, मैरीलैंड स्टेट यूनिवर्सिटी, USA', capEn: 'Dr. Umang Nath Sharma — Doctorate in Astrology, Maryland State University, USA' },
];

export const gallery = [
    { src: '/images/gallery/havan-closeup.jpg', capHi: 'हवन में आहुति', capEn: 'Offering Ahuti in Havan' },
    { src: '/images/gallery/vedic-paath.jpg', capHi: 'वैदिक पाठ', capEn: 'Vedic Scripture Recitation' },
    { src: '/images/gallery/devi-puja-phal.jpg', capHi: 'देवी पूजन — फल अर्पण', capEn: 'Devi Puja — Fruit Offering' },
    { src: '/images/gallery/group-puja.jpg', capHi: 'सामूहिक देवी पूजन', capEn: 'Collective Devi Puja' },
    { src: '/images/gallery/devi-shringar.jpg', capHi: 'माँ का भव्य श्रृंगार', capEn: 'Divine Adornment of the Goddess' },
    { src: '/images/gallery/ram-sita-jhanki.jpg', capHi: 'राम-लक्ष्मण-सीता झांकी', capEn: 'Ram-Lakshman-Sita Tableau' },
    { src: '/images/gallery/ram-katha-event.jpg', capHi: 'राम कथा — विशेष आयोजन', capEn: 'Ram Katha — Special Event' },
    { src: '/images/heritage/pooja-session-1.jpg', capHi: 'परामर्श सत्र', capEn: 'Consultation Session' },
    { src: '/images/heritage/pooja-session-2.jpg', capHi: 'अंतरराष्ट्रीय भक्त सत्र', capEn: 'International Devotee Session' },
    { src: '/images/heritage/signboard-1.jpg', capHi: 'पं. अयोध्या नाथ शर्मा मार्ग — वाराणसी', capEn: 'Named Road, Varanasi' },
    { src: '/images/heritage/signboard-2.jpg', capHi: 'ऐतिहासिक मार्ग चिन्ह', capEn: 'Historic Street Sign' },
    { src: '/images/gallery/umang-parents-tribute.jpg', capHi: 'डॉ. उमंग नाथ शर्मा एवं श्रीमती शर्मा — पूज्य पिता जी को श्रद्धांजलि', capEn: 'Dr. Umang Nath Sharma & Mrs. Sharma — Paying Tribute to Late Father' },
    { src: '/images/gallery/umang-with-daya-shankar-mishra-1.jpg', capHi: 'डॉ. उमंग नाथ शर्मा राज्य मंत्री (स्वतंत्र प्रभार), आयुष विभाग, उत्तर प्रदेश सरकार, डॉ. दयाशंकर मिश्र के साथ', capEn: "Dr. Umang Nath Sharma with Dr. Daya Shankar Mishra, Hon'ble Minister of State (Independent Charge), AYUSH, Government of Uttar Pradesh" },
    { src: '/images/gallery/umang-with-sp-spokesperson.jpg', capHi: 'डॉ. उमंग नाथ शर्मा मनोज राय धूपचंडी के साथ — राष्ट्रीय प्रवक्ता, समाजवादी पार्टी एवं पूर्व राज्य मंत्री', capEn: 'Dr. Umang Nath Sharma with Manoj Rai Dhoopchandi — National Spokesperson, Samajwadi Party & Former Minister of State' },
    { src: '/images/gallery/daya-shankar-mishra-puja.jpg', capHi: 'डॉ. दयाशंकर मिश्र, राज्य मंत्री (स्वतंत्र प्रभार), आयुष विभाग, उत्तर प्रदेश सरकार — पूजा स्थल पर', capEn: "Dr. Daya Shankar Mishra, Hon'ble Minister of State (Independent Charge), AYUSH, Government of Uttar Pradesh — at the family shrine" },
];
