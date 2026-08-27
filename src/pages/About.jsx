import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { gallery, pressHighlights, triptych, videoClips, youtubeUploadsPlaylistId, youtubeChannelId } from '../data/media';
import useSEO from '../hooks/useSEO';
import { breadcrumbJsonLd, combineJsonLd } from '../utils/seo';

const generations = [
    {
        gen: 'I',
        name: 'महामहोपाध्याय पं. अयोध्या नाथ शर्मा',
        nameEn: 'Mahamahopadhyaya Pt. Ayodhya Nath Sharma',
        era: '19वीं शताब्दी — The Genesis',
        eraEn: '19th Century — The Genesis',
        img: '/images/heritage/signboard-1.jpg',
        body: 'काशी में संस्कृत विद्वता और ज्योतिषीय प्रामाणिकता के एक युगपुरुष। बनारस हिंदू विश्वविद्यालय (BHU) की भूमि पूजन कराने का पावन दायित्व इन्हीं को सौंपा गया था। ब्रिटिश शासन द्वारा परखे जाने पर भी इनकी भविष्यवाणियाँ सटीक सिद्ध हुईं, जिससे प्रशासन ने इनकी पाठशाला को औपचारिक मान्यता दी और वाराणसी के एक प्रमुख मार्ग का नाम ही "महामहोपाध्याय पं. अयोध्या नाथ शर्मा मार्ग" रख दिया — जो आज भी विद्यमान है।',
        bodyEn: 'A titan of Sanskrit scholarship and astrological precision in sacred Varanasi. He was entrusted with performing the Bhoomi Pujan for Banaras Hindu University (BHU). When British officials tested his craft with skepticism, his accurate predictions transmuted colonial derision into institutional reverence — the administration formally recognized his Pathshala and named an arterial road after him: "Mahamahopadhyaya Pt. Ayodhya Nath Sharma Marg", a landmark that stands today.',
    },
    {
        gen: 'II',
        name: 'पं. शम्भु नाथ शर्मा',
        nameEn: 'Pandit Shambhu Nath Sharma',
        era: '20वीं शताब्दी — वैश्विक राजदूत',
        eraEn: '20th Century — The Global Ambassador',
        img: '/images/heritage/shambhu-nath-portrait.jpg',
        body: 'सन् 1962 में बिहार और राँची के राजगुरु के रूप में औपचारिक मान्यता प्राप्त। प्रधानमंत्री इंदिरा गांधी और भारत के भूतपूर्व उपराष्ट्रपति श्री बी.डी. जत्ती जैसी विभूतियों को आध्यात्मिक व ज्योतिषीय मार्गदर्शन दिया। सन् 1971 में 50 से अधिक देशों के गणमान्य अतिथि व साधक इनसे मिलने स्वयं भारत आए। फ्रांस के महावाणिज्यदूत श्री Jacques Guepratte सहित यूरोप और उत्तर अमेरिका के अनेक नागरिकों ने इन्हें "प्रबुद्ध आत्मा" कहकर सम्मानित किया। कामदा काली मंदिर की स्थापना व निर्धन संस्कृत विद्यार्थियों को छात्रवृत्ति प्रदान करना इनकी परोपकारिता का प्रमाण है।',
        bodyEn: 'Formally appointed Raj Guru of Bihar and Ranchi in 1962. Trusted confidant providing spiritual and astrological guidance to Prime Minister Indira Gandhi and former Vice President of India, Mr. B.D. Jatti. In 1971, dignitaries and seekers from 50 nations personally traveled to India to seek his presence, with diplomats including the Consul General of France, Mr. Jacques Guepratte, hailing him an "Enlightened Soul." His philanthropy included founding the Kamda Kali Mandir and funding scholarships for underprivileged Sanskrit students.',
    },
    {
        gen: 'III',
        name: 'डॉ. उमंग नाथ शर्मा',
        nameEn: 'Dr. Umang Nath Sharma',
        era: 'वर्तमान — आधुनिक मनीषी',
        eraEn: 'Present Day — The Modern Luminary',
        img: '/images/heritage/umang-with-ayodhya-portrait.jpg',
        body: 'पारिवारिक परम्परा और आधुनिक शैक्षणिक कठोरता के बीच की खाई को सफलतापूर्वक पाटा है। मैरीलैंड स्टेट यूनिवर्सिटी, अमेरिका द्वारा "डॉक्टर ऑफ एस्ट्रोलॉजी" की प्रतिष्ठित उपाधि से सम्मानित। सन् 2019 में जापान के Hulu TV द्वारा इनके जीवन और ज्योतिषीय पद्धति की वैज्ञानिक प्रामाणिकता पर एक विस्तृत वृत्तचित्र (डॉक्यूमेंट्री) बनाई गई।',
        bodyEn: 'Has meticulously bridged the chasm between ancestral tradition and modern academic rigor. Conferred the prestigious degree of Doctor of Astrology by Maryland State University, USA. In 2019, Japan\'s Hulu TV produced a documentary on Dr. Umang Nath Sharma\'s life and methodology.',
    },
];

const heritageSummary = [
    { icon: '📜', label: 'चतुःशताब्दी विरासत', labelEn: 'Four Centuries of Legacy', desc: '400 वर्षों से अधिक की अखंड वैदिक परम्परा', descEn: 'An unbroken Vedic tradition spanning over 400 years' },
    { icon: '🏛️', label: 'संस्थागत मान्यता', labelEn: 'Institutional Recognition', desc: 'BHU की स्थापना से लेकर अमेरिकी डॉक्टरेट तक', descEn: 'From the founding of BHU to an American doctorate' },
    { icon: '🤝', label: 'राजनयिक प्रभाव', labelEn: 'Diplomatic & Political Influence', desc: 'भारतीय प्रधानमंत्रियों व अंतरराष्ट्रीय राजनयिकों का विश्वास', descEn: 'Trusted by Indian Prime Ministers and international diplomats' },
    { icon: '🌏', label: 'वैश्विक मीडिया उपस्थिति', labelEn: 'Global Media Presence', desc: 'जापानी मीडिया द्वारा प्रामाणिक विशेषज्ञ के रूप में दस्तावेज़ीकृत', descEn: 'Documented by Japanese media as an authoritative expert' },
];

const testimonials = [
    { quoteHi: 'अत्यंत सटीक और सहायक परामर्श मिला।', quoteEn: 'Found the reading quite accurate and helpful.', name: 'M. Morow', place: '1983', flag: '' },
    { quoteHi: 'पंडितजी ने कुछ बहुत ही रोचक बातें बताईं जिन्हें सुनकर आश्चर्य हुआ।', quoteEn: 'Surprised to hear some very interesting things.', name: 'Irmgard Fleischer', place: 'Königstein, West Germany · Feb 1982', flag: '🇩🇪' },
    { quoteHi: 'प्रो. एस.एन. शर्मा के ज्योतिषीय ज्ञान और सलाह से हमें बहुत लाभ हुआ।', quoteEn: "We enjoyed and benefitted from Prof. S.N. Sharma's readings and his wisdom in astrological prediction.", name: 'Group Testimonial', place: 'March 1982', flag: '' },
    { quoteHi: 'भ्रमण अत्यंत ज्ञानवर्धक और मूल्यवान रहा।', quoteEn: 'Found the visit very enlightening and valuable.', name: 'Linda Mercurio', place: 'San Francisco, California, USA · Oct 1982', flag: '🇺🇸' },
    { quoteHi: 'हस्तरेखा पाठ पूर्णतः सत्य और सटीक निकला। मैं अत्यंत आभारी हूँ।', quoteEn: 'The palmistry reading and statements regarding my life and business were absolutely true and accurate. I am most grateful.', name: 'House of Spectacles Limited', place: "St. John's, Newfoundland, Canada · Feb 1981", flag: '🇨🇦' },
    { quoteHi: 'मुझे लगता है आप सब कुछ जानते हैं, फिर भी सब कुछ नहीं बताते — मैं आप पर भरोसा करती हूँ।', quoteEn: 'I feel you know everything but you are careful not to tell me everything. I trust you.', name: 'Isabel Y. Rhyne', place: 'Flint, Michigan, USA · Sep 1981', flag: '🇺🇸' },
    { quoteHi: 'मेरे भूतकाल के बारे में जानना बेहद रोचक रहा; भविष्य की जानकारी से भी मैं संतुष्ट हूँ।', quoteEn: 'It was quite interesting to hear about my past and I was very satisfied about my future reading.', name: 'Joshua Soffer', place: 'Kibutz Gan Shmuel, Israel · 1981', flag: '🇮🇱' },
    { quoteHi: 'आपकी सलाह के लिए हार्दिक धन्यवाद।', quoteEn: 'Thank you very much for the good advice you gave us.', name: 'Edith Paither', place: 'Paris, France · Jan 1980', flag: '🇫🇷' },
    { quoteHi: 'आज रात हमसे मिलकर पंडितजी बहुत ही सहृदय रहे; हम इसे कभी नहीं भूलेंगे।', quoteEn: "Mr. Shambhunath Sharma was so good to meet us tonight; we'll not forget it.", name: 'Jacques Guepratte', place: 'Consul General of France, Varanasi · Jan 1980', flag: '🇫🇷', notable: true, notableHi: 'फ्रांस के महावाणिज्यदूत', notableEn: 'Consul General of France' },
    { quoteHi: 'आपकी बुद्धिमत्ता और दयालुता से मैं अत्यंत प्रभावित हूँ — आपके शब्दों के लिए आभारी हूँ। आपने मेरे जीवन की महत्वपूर्ण घटनाओं को सही पहचाना।', quoteEn: 'Impressed by your wisdom and kindness — thankful for your words. You knew the important happenings of my life.', name: 'Aupie Dullingder', place: 'Munich, West Germany · Apr 1980', flag: '🇩🇪' },
    { quoteHi: 'ज्योतिष पर आपके रोचक स्पष्टीकरण हेतु धन्यवाद; यह विज्ञान के रूप में इसके महत्व को समझने में सहायक होगा।', quoteEn: 'Thank you for your very interesting explanation on astrology as a science.', name: 'Télévision Belge', place: 'Brussels, Belgium · May 1980', flag: '🇧🇪', notable: true, notableHi: 'बेल्जियम राष्ट्रीय टेलीविज़न', notableEn: 'Belgian National Television' },
    { quoteHi: 'भविष्य के प्रति आशा जगी और भूतकाल स्पष्ट हुआ।', quoteEn: 'Gave me hope for the future and could see the past.', name: 'Sonia Appelman', place: 'Utrecht, Holland · Sep 1981', flag: '🇳🇱' },
];

const testimonialFlags = [...new Set(testimonials.map(t => t.flag).filter(Boolean))];

// Additional testimonials found in the original 1973-1983 letter archive,
// shown in their own separate section rather than mixed with the first batch.
const moreTestimonials = [
    { quoteHi: 'हम सबसे अधिक प्रभावित हुए श्री शर्मा जी की योग्यता से — एक ऐसा अनुभव जो हमें पहले कभी नहीं हुआ। हमारे भूतकाल का वर्णन करने की उनकी क्षमता विश्वसनीय रूप से सटीक थी।', quoteEn: "We have been most impressed with Mr. Sharma's skills as a fortune teller — an experience we had not known before. His ability to describe our past lives was convincingly accurate; he is worthy of his reputation as palmist, astrologer and mystic.", name: 'Cadetle Reynolds & Siron Areke', place: 'Sydney, Australia · Oct 1980', flag: '🇦🇺' },
    { quoteHi: 'मैं कुछ संशय लेकर आया था, परंतु जो हुआ उससे पूर्णतः आश्वस्त हो गया। एक सर्वांगीण एवं सकारात्मक अनुभव रहा। मैं अत्यंत आभारी हूँ।', quoteEn: 'I came with some cynicism, and was much convinced by what took place. A wholesome and positive experience. I am much obliged.', name: 'E. Shenton', place: 'Stanmore, Middlesex, England · Oct 1980', flag: '🇬🇧' },
    { quoteHi: 'व्यक्तित्व के विषय में रोचक अंतर्दृष्टि तथा कुछ अच्छी सलाह।', quoteEn: 'Interesting insight into personalities and some good advice.', name: 'Linda & Neil Greenhill', place: 'Australia · Jan 1980', flag: '🇦🇺' },
    { quoteHi: 'आपके अत्यंत गंभीर पाठ के लिए धन्यवाद, और भविष्य की घटनाओं की पुष्टि हेतु मैं उत्सुकता से प्रतीक्षा करूँगा। यदि सब सुचारु रहा तो मैं 6 माह में आपके दर्शन हेतु पुनः आऊँगा।', quoteEn: 'I thank you for a most profound reading & shall eagerly check future events for verification. If all goes well I shall return for your Darshan in 6 months.', name: 'Bhavanand Goswami', place: 'Mar 1980', flag: '🌐' },
    { quoteHi: 'मैं पंडितजी से मिला और उनके ज्ञान के लिए हार्दिक धन्यवाद देता हूँ, और आशा करता हूँ कि उनके मार्ग पर चल सकूँ।', quoteEn: 'I met Mr. Panditji and I thank him very much for his knowledge, and I hope to follow his way.', name: 'Jacqueline Mahler', place: 'France · Apr 1980', flag: '🇫🇷' },
    { quoteHi: 'मैं अत्यंत भाग्यशाली हूँ कि मुझे इतनी प्रबुद्ध आत्मा के साथ अपने जीवन के कुछ क्षण बिताने को मिले। मैं अपना प्रेम एवं आपकी सहायता के लिए धन्यवाद देती हूँ — आज का यह पाठ मेरे जीवन को बदल देगा, ऐसा मुझे ज्ञात है। आप एक सुंदर व्यक्ति हैं।', quoteEn: "I am very fortunate to have spared a few moments of my life with such an enlightened soul. I give my thanks for your assistance and know that today's reading will cause my life to change. You are a beautiful person, and I thank you for the honour of being with you.", name: 'Peggie Aurand', place: 'Atlanta, Georgia, USA · Sep 1980', flag: '🇺🇸' },
    { quoteHi: 'श्री शर्मा हस्तरेखा/ज्योतिष में सहायक सिद्ध हुए — जीवन के आगामी पैटर्न के कुछ संकेत एवं दिशाएं बताईं, रत्न आदि की भी सलाह दी। परिवार संबंधी बातें भी सहायक रहीं।', quoteEn: 'Mr. Sharma has been helpful in palmistry/astrology, giving clues to life patterns to come and directions to take; recommending stones etc. Insights on family relations were also helpful.', name: 'John Islone', place: 'Thousand Oaks, California, USA · Oct 1980', flag: '🇺🇸' },
    { quoteHi: 'श्री शर्मा ने मेरे वर्तमान, भूत एवं भविष्य के जीवन के विषय में कुछ प्रबोधक जानकारी दी, जिसके लिए मैं अत्यंत आभारी हूँ ताकि मैं अपने जीवन एवं संसार से संबंध सुधार सकूँ।', quoteEn: 'Mr. Sharma has given me some enlightening information about my present, past and future life, and I am very grateful for this so I can improve my life and my relationship with the world.', name: 'Victor Blocuttik', place: 'Cupertino, California, USA · Oct 1980', flag: '🇺🇸' },
    { quoteHi: 'मेरे जीवन में आपकी सूक्ष्म एवं ईमानदार अंतर्दृष्टि के लिए धन्यवाद। आपके कथनों में मुझे एक सत्यता का आभास होता है जो मुझे अपनी वर्तमान परिस्थितियों को एक बेहतर भविष्य हेतु तैयार करने में सहायक होगी।', quoteEn: 'Thank you for your perceptive and honest insight into my life. I sense a validity in your statements that should help me prepare my present circumstances for a more perfect future.', name: 'Tom Hevsant', place: 'Carlsbad, California, USA · Oct 1980', flag: '🇺🇸' },
    { quoteHi: 'आपकी सलाह के लिए हम हार्दिक धन्यवाद देते हैं, और स्वीकार करते हैं कि हमने यहाँ अत्यंत रोचक एवं महत्वपूर्ण समय व्यतीत किया।', quoteEn: 'We thank you so much for your advice and we hereby admit that we spent a very interesting and important time here.', name: 'Elke Rappold', place: 'Berlin, West Germany · Mar 1981', flag: '🇩🇪' },
    { quoteHi: 'शम्भुजी की गहन दृष्टि एवं उस शक्ति के लिए अनेक धन्यवाद जो बहुत आगे तक जाती है, वहाँ तक भी जहाँ आत्मा स्वयं पुकारती है।', quoteEn: 'Many thanks to Shambhuji for his deep insight and strength which reaches far beyond, even to where the Atman itself calls out.', name: 'Genient Bogrand', place: 'Paris, France · Nov 1980', flag: '🇫🇷' },
    { quoteHi: 'मैं आपका हार्दिक आभारी हूँ। आपका स्थान नई बस्ती एक ऐसी जगह है जहाँ मुझे घर जैसा अनुभव होता है। मुझे बहुत प्रसन्नता है कि मैं आपसे मिला, और अगली बार वाराणसी आने पर पुनः मिलूँगा।', quoteEn: 'I thank you very much. Your place Nai Basti is somewhere I feel at home. I am so glad to have met you, and I will see you again next time I come to Varanasi.', name: 'Alain Extz', place: 'Paris, France · Jan 1979', flag: '🇫🇷' },
    { quoteHi: 'आज मुझे पंडित एस.एन. शर्मा द्वारा हस्तरेखा पाठ प्राप्त हुआ और मैं उनकी अंतर्दृष्टि से अत्यंत आश्चर्यचकित हूँ जो उन्हें किसी के व्यक्तित्व की गहराई तक ले जाती है।', quoteEn: "Today I got a palm reading by Pandit S.N. Sharma and was very amazed by the insight he has into one's personality.", name: 'Klaus Dierolf', place: 'Kirchheim-Teck, West Germany · Mar 1979', flag: '🇩🇪' },
    { quoteHi: 'मुझे एवं मेरे पति एलन को शम्भुनाथ शर्मा द्वारा पुनः कहे गए हमारे भूतकाल की घटनाओं का अत्यंत सटीक विवरण मिला, जिसकी सलाह के लिए हम आभारी हैं।', quoteEn: 'My husband Allan and I had a very accurate account of past incidents of our lives retold by Shambhunath Sharma, and are thankful for the advice he offered.', name: 'J. Hoorn', place: 'Apr 1979', flag: '🌐' },
    { quoteHi: 'मैंने ज्ञान एवं अंतर्दृष्टि देखी, आपकी बातें सहायक थीं, और सच्चाई का सही बोध कराती थीं।', quoteEn: 'I saw knowledge & insight; your words were helpful, and made true sense.', name: 'Sina Sadegh', place: 'Tehran, Iran · May 1979', flag: '🇮🇷' },
    { quoteHi: 'मुझे पंडित शम्भुनाथ शर्मा से मिलकर अत्यंत प्रसन्नता हुई। मेरे भूतकाल के विषय में उनके कुछ कथन अत्यंत सटीक थे। मैं उनकी सलाह को सहेज कर रखूँगा। वे एक अत्यंत सौम्य आत्मा हैं।', quoteEn: 'I was very happy to meet Pandit Shambhunath Sharma. Some of his declarations about my past were very accurate. I shall keep his advice. He is a very gentle soul.', name: 'Sumanta Banerjee', place: 'Paris, France · May 1979', flag: '🇫🇷' },
    { quoteHi: 'मैं आपकी आतिथ्य-सत्कार एवं हस्तरेखा पाठ से अत्यंत प्रसन्न हूँ। मैं केवल यही आशा करता हूँ कि आपकी एक भविष्यवाणी गलत सिद्ध हो।', quoteEn: 'I am very happy with your hospitality and hand reading. I only hope that one of your predictions will be wrong.', name: 'Jacint Paulesa', place: 'Reus, Catalunya, Spain · Aug 1979', flag: '🇪🇸' },
    { quoteHi: 'हम शम्भुनाथ शर्मा से मिले, और उनके अनुसार बताई गई सभी बातें सत्य सिद्ध हुईं। हम उनसे पुनः-पुनः मिलते रहेंगे।', quoteEn: 'We met Shambhunath Sharma; according to what he said, everything proved correct. We will meet him again and again.', name: 'M.A.A. Ariyaratna & G.D. Samarapala', place: 'Sri Lanka · Sep 1974', flag: '🇱🇰' },
    { quoteHi: 'मैंने उन्हें व्यवहार में सुखद पाया और मानता हूँ कि वे एक विद्वान व्यक्ति हैं। उनके साथ मेरा प्रवास अत्यंत सुखद एवं ज्ञानवर्धक रहा, और मैं उनके लिए शांति एवं समृद्धि की कामना करता हूँ।', quoteEn: 'I found him pleasant to deal with and believe him a learned man. My stay with him was most pleasant and informative, and I wish him peace and prosperity in the future.', name: 'Ran Wallace', place: 'Chatham, New Brunswick, Canada · Oct 1974', flag: '🇨🇦' },
    { quoteHi: 'मैंने आपकी प्रोत्साहक सलाह का पूर्ण आनंद लिया।', quoteEn: 'I have thoroughly enjoyed your encouraging advice.', name: 'Esther & Frank Crow', place: 'Chula Vista, California, USA · 1975', flag: '🇺🇸' },
    { quoteHi: 'मैं शम्भुनाथ शर्मा से मिली, उनके साथ बिताया समय मुझे बहुत अच्छा लगा। मैं अगले एक वर्ष की प्रतीक्षा करूँगी।', quoteEn: 'I visited Shambhunath Sharma; I quite enjoyed the time spent talking with him. I will be looking forward to the next year.', name: 'Carol MacMillan', place: 'Vancouver, Canada · Dec 1973', flag: '🇨🇦' },
    { quoteHi: 'यद्यपि शम्भुनाथ शर्मा के साथ मेरा सत्र सीमित था, उन्होंने भूतकाल की कुछ प्रकट घटनाएं तथा भविष्य की भविष्यवाणियां बताईं जिनकी मैं प्रतीक्षा कर रहा हूँ।', quoteEn: "Although my session with Shambhunath Sharma was limited, he came up with some revealing past events and predicted future events which I'm looking forward to.", name: 'M. Farichuk', place: 'Vancouver, Canada · Dec 1973', flag: '🇨🇦' },
    { quoteHi: 'मेरे भूतकाल के विषय में उनकी भविष्यवाणियां पूर्णतः सटीक हैं, जो मेरे लिए आश्चर्यजनक है। कुछ मामलों में वे इतने सटीक हैं कि वे उन दिशाओं को प्रकट करते हैं जिनका मुझे बोध तो था परंतु महत्व समझ नहीं आया था।', quoteEn: "His predictions of my past life are all completely accurate, which is amazing to me. In some respects he is so accurate that he reveals directions I was aware of but could not see the significance of.", name: 'Jim Funk', place: 'Malacca, Malaysia · Sep 1975', flag: '🇲🇾' },
    { quoteHi: 'मुझे लगता है कि उनकी व्याख्या में बहुत सच्चाई है। हम अत्यंत संतुष्ट थे।', quoteEn: 'I think there is a lot of truth in his interpretation. We were very satisfied.', name: 'Leonidas Goulandries', place: 'London, England', flag: '🇬🇧' },
    { quoteHi: 'मुझे अपने हाथों का पाठ प्राप्त हुआ, जिसकी विधि स्पर्श एवं बनावट पर आधारित थी। मेरे भूतकाल के विषय में जो कुछ भी बताया गया वह सटीक एवं अद्भुत था।', quoteEn: 'I was given a reading of my hands; the method he used was touch & texture. Whatever he told me about my past was exact and fantastic.', name: 'Jeanne Sarthreat', place: 'Paris, France', flag: '🇫🇷' },
    { quoteHi: 'आपसे मिलकर अत्यंत प्रसन्नता हुई। मुझे लगता है कि आप मुझे मेरे भूतकाल के जीवन का पाठ देने में सफल रहे, और भविष्य की भविष्यवाणियां भी अत्यंत संभावित प्रतीत होती हैं।', quoteEn: 'It has been a pleasure to meet you. I feel you have been successful in giving me a reading of my past life, and I feel the predictions for the future are very possible.', name: 'Vada V. Beard', place: 'Modesto, California, USA', flag: '🇺🇸' },
    { quoteHi: 'मुझे यह पाठ अत्यंत रोचक लगा और यह भविष्य के विषय में मेरे अंतर्ज्ञान से मेल खाता है।', quoteEn: 'I found the reading most interesting and it conforms to my intuitions as to the future.', name: 'Hony W. Patterson', place: 'New York, USA · Feb 1981', flag: '🇺🇸' },
    { quoteHi: 'मुझे अत्यंत प्रसन्नता है कि मैं आपसे मिलने आई। अब से मैं अपने जीवन की आपकी दी हुई दृष्टि से संतुष्ट अनुभव करती हूँ।', quoteEn: 'I am very happy that I came to see you. I feel contented with your vision of my life from now on.', name: 'June Wilson', place: 'Davison, Michigan, USA', flag: '🇺🇸' },
    { quoteHi: 'मैंने अपने हाथ उन्हें दिखाए और मात्र स्पर्श से उन्होंने भूतकाल की घटनाओं के विषय में बताया जो बिल्कुल सटीक थीं। उन्होंने मेरी कई जिज्ञासाओं का समाधान किया। मैं उनका अत्यंत सम्मान करता हूँ।', quoteEn: 'I showed him my hands, and with a mere touch he spoke of past events which were correct to the point. He resolved several of my queries. I hold him in great respect.', name: 'S.M. Micklason', place: 'Dec 1973', flag: '🌐' },
];

const moreTestimonialFlags = [...new Set(moreTestimonials.map(t => t.flag).filter(Boolean))];

const values = [
    { icon: '📖', title: 'शास्त्रोक्त विधि', titleEn: 'Authentic Vedic Methods', desc: 'प्रत्येक पूजा शुद्ध एवं शास्त्रोक्त विधि से सम्पन्न', descEn: 'Every pooja performed with impeccable, time-honored precision' },
    { icon: '🤝', title: 'विश्वास एवं पारदर्शिता', titleEn: 'Trust & Transparency', desc: 'कोई छिपा हुआ शुल्क नहीं', descEn: 'No concealed costs, ever' },
    { icon: '❤️', title: 'भक्त सेवा', titleEn: 'Devotee First', desc: 'भक्तों का कल्याण ही हमारी सर्वोच्च प्राथमिकता', descEn: "Devotees' wellbeing remains our foremost priority" },
    { icon: '🌍', title: 'वैश्विक पहुँच', titleEn: 'Global Reach', desc: 'देश-विदेश में कहीं भी, काशी की सेवा आपके निकट', descEn: "Kashi's service, delivered wherever you may be in the world" },
];

export default function About() {
    const { t, lang } = useLanguage();

    useSEO({
        title: t('हमारे बारे में — शर्मा परिवार की विरासत | Adhbhut Gyaan', 'About Us — Legacy of the Sharma Family | Adhbhut Gyaan'),
        description: t('400+ वर्षों की वैदिक परंपरा, तीन पीढ़ियों की गाथा — महामहोपाध्याय पं. अयोध्या नाथ शर्मा से डॉ. उमंग नाथ शर्मा तक।', "Four centuries of Vedic tradition across three generations — from Mahamahopadhyaya Pt. Ayodhya Nath Sharma to Dr. Umang Nath Sharma."),
        path: '/about',
        jsonLd: combineJsonLd(breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About Us', path: '/about' },
        ])),
    });

    return (
        <div>
            <header className="page-header">
                <div className="container">
                    <div className="breadcrumb"><Link to="/">{t('होम', 'Home')}</Link><span>›</span><span>{t('हमारे बारे में', 'About Us')}</span></div>
                    <h1>{t('हमारे बारे में', 'About Us')}</h1>
                    <p className="subtitle">{t('About Adhbhut Gyaan — शर्मा परिवार की गौरवशाली विरासत', 'About Adhbhut Gyaan — The Storied Legacy of the Sharma Family')}</p>
                </div>
            </header>

            {/* Quick nav - the page has grown to 13 sections, so a jump-to bar helps */}
            <div style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: '60px', zIndex: 50, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                <div className="container" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem' }}>
                    {[
                        { id: 'press', label: t('मीडिया', 'Press') },
                        { id: 'chief-astrologer', label: t('प्रधान ज्योतिषाचार्य', 'Chief Astrologer') },
                        { id: 'generations', label: t('तीन पीढ़ियाँ', 'Generations') },
                        { id: 'testimonials-1980', label: t('प्रशंसापत्र', 'Testimonials') },
                        { id: 'our-testimonials', label: t('और पत्र', 'More Letters') },
                        { id: 'gallery', label: t('यादें', 'Gallery') },
                    ].map(item => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            style={{ flexShrink: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold-700)', background: 'white', border: '1px solid var(--border-gold)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-xl)', textDecoration: 'none' }}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Triptych - evocative opener */}
            <section className="section" style={{ paddingBottom: 0 }}>
                <div className="container">
                    <div className="triptych">
                        {triptych.map(item => (
                            <div className="triptych-card" key={item.capEn}>
                                <img src={item.src} alt={item.capEn} loading="lazy" />
                                <div className="triptych-overlay">
                                    <span className="triptych-caption">{lang === 'hi' ? item.capHi : item.capEn} <span className="arrow">›</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="section">
                <div className="container">
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/temple-diyas.jpg" alt="Temple Diyas" loading="lazy" />
                        </div>
                        <div>
                            <span className="section-label">{t('हमारी कहानी', 'Our Story')}</span>
                            <h2 className="section-title">{t('काशी की प्राचीन परम्परा के वाहक', "Carrying Kashi's Ancient Tradition Forward")}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                                {t(
                                    'शर्मा परिवार की गाथा मात्र एक वंशावली नहीं, बल्कि चार शताब्दियों से अधिक समय तक वैदिक विज्ञान की अक्षुण्ण शक्ति का प्रमाण है। यह वंश प्राचीन आध्यात्मिक ज्ञान और आधुनिक वैश्विक मान्यता के दुर्लभ संगम का प्रतीक है। पीढ़ी-दर-पीढ़ी परिवार के पंडितों द्वारा वाराणसी एवं विश्व भर के भक्तों की सेवा करते हुए यह विरासत आज एक विशाल एवं निरंतर अनुष्ठान-सेवा का रूप ले चुकी है।',
                                    'The saga of the Sharma family is a profound testament to the enduring potency of Vedic sciences, spanning over four centuries — a rare confluence of ancient metaphysical wisdom and modern global recognition, born in the ghats of Varanasi. Across generations of family Pandits serving devotees from Varanasi and around the world, this legacy has grown into a large and continuing body of ritual service.'
                                )}
                            </p>
                            <Link to="/booking" className="btn btn-primary"><img src="/images/logo.png" alt="" className="inline-logo" /> {t('पूजा बुक करें', 'Book a Pooja')}</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Heritage Summary strip */}
            <section className="section section-dark">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '1rem' }}>
                        <h2 className="section-title" style={{ color: 'var(--gold-300)' }}>{t('विरासत का सारांश', 'Summary of the Heritage')}</h2>
                    </div>
                    <div className="stats-grid">
                        {heritageSummary.map(h => (
                            <div className="stat-card" key={h.labelEn}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{h.icon}</div>
                                <div className="stat-label" style={{ fontWeight: 700, color: 'var(--gold-300)', marginBottom: '0.35rem' }}>{t(h.label, h.labelEn)}</div>
                                <div className="stat-label" style={{ fontSize: '0.8rem' }}>{t(h.desc, h.descEn)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Press & Recognition - the family's most prestigious credibility
                markers get their own showcase instead of blending into the
                general photo gallery further down the page. */}
            <section className="section" id="press">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('मीडिया एवं मान्यता', 'Press & Recognition')}</span>
                        <h2 className="section-title">{t('विश्व स्तर पर सम्मानित', 'Recognized on the World Stage')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
                        {pressHighlights.map(item => (
                            <div key={item.src} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-gold)', background: 'white' }}>
                                <div style={{ position: 'absolute', top: '0.9rem', left: '0.9rem', zIndex: 2, background: 'var(--gold-600)', color: 'white', fontWeight: 700, fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-xl)', letterSpacing: '0.02em' }}>
                                    {t(item.badge, item.badgeEn)}
                                </div>
                                <img src={item.src} alt={item.badgeEn} loading="lazy" style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }} />
                                <p style={{ padding: '1rem 1.1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t(item.capHi, item.capEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chief Astrologer Spotlight */}
            <section className="section" id="chief-astrologer">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('वर्तमान प्रधान', 'Current Head')}</span>
                        <h2 className="section-title">{t('प्रधान ज्योतिषाचार्य — डॉ. उमंग नाथ शर्मा', 'Chief Astrologer — Dr. Umang Nath Sharma')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="about-story">
                        <div className="about-image">
                            <img src="/images/heritage/umang-with-ayodhya-portrait.jpg" alt="Dr. Umang Nath Sharma" loading="lazy" style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t(
                                    'डॉ. उमंग नाथ शर्मा शर्मा परिवार की वैदिक परंपरा के वर्तमान प्रधान एवं परिवार के एकमात्र प्रशिक्षित ज्योतिषाचार्य हैं — इनसे वरिष्ठ या इनके समकक्ष अन्य कोई नहीं है। अद्भुत ज्ञान से जुड़े अन्य सभी पंडितगण शास्त्रोक्त कर्मकांड — पूजा, हवन, अनुष्ठान — सम्पन्न कराने में दक्ष एवं प्रशिक्षित हैं, जबकि ज्योतिषीय परामर्श, कुंडली विश्लेषण एवं भविष्यवाणी का दायित्व विशेष रूप से डॉ. शर्मा ही वहन करते हैं।',
                                    'Dr. Umang Nath Sharma is the current head of the Sharma family\'s Vedic tradition and the family\'s sole trained astrologer — no one is senior to him or his equal in this role. Every other Pandit associated with Adhbhut Gyaan is skilled and trained in performing scripture-based karmakand — pooja, havan, and rituals — while astrological consultation, horoscope analysis, and prediction are Dr. Sharma\'s exclusive responsibility.'
                                )}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                {t(
                                    'मैरीलैंड स्टेट यूनिवर्सिटी, अमेरिका द्वारा "डॉक्टर ऑफ एस्ट्रोलॉजी" की उपाधि से सम्मानित, और सन् 2019 में जापान के Hulu TV द्वारा जिन पर एक वृत्तचित्र बनाई गई — डॉ. शर्मा ही अद्भुत ज्ञान की समस्त ज्योतिषीय गतिविधियों का मार्गदर्शन करते हैं।',
                                    'Conferred the degree of "Doctor of Astrology" by Maryland State University, USA, and the subject of a 2019 documentary by Japan\'s Hulu TV — Dr. Sharma personally guides every astrological activity at Adhbhut Gyaan.'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Three Generations Timeline */}
            <section className="section section-warm" id="generations">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('तीन पीढ़ियाँ, एक विरासत', 'Three Generations, One Legacy')}</span>
                        <h2 className="section-title">{t('शर्मा वंश की गाथा', 'Chronicles of the Sharma Lineage')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('वैदिक विद्वता की एक चतुःशताब्दी यात्रा', 'A Four-Century Odyssey of Vedic Erudition')}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '640px', margin: '0.75rem auto 0', lineHeight: 1.7 }}>
                            {t(
                                'परिवार की वैदिक परंपरा चार शताब्दियों से अधिक पुरानी मानी जाती है। नीचे हम तीन प्रलेखित पीढ़ियों की गाथा प्रस्तुत करते हैं, जिनके चित्र व प्रमाण आज भी उपलब्ध हैं।',
                                "The family's Vedic tradition is held to stretch back over four centuries. Below, we present the story of the three most recent, documented generations — those for whom photographs and records survive today."
                            )}
                        </p>
                    </div>
                    <div className="om-divider">ॐ</div>

                    {generations.map((g, i) => (
                        <div key={g.gen} className="about-story" style={{ marginBottom: i === generations.length - 1 ? 0 : 'clamp(2.5rem, 6vw, 4rem)' }}>
                            {i % 2 === 0 ? (
                                <>
                                    <div className="about-image">
                                        <img src={g.img} alt={g.nameEn} loading="lazy" style={{ objectFit: 'cover' }} />
                                    </div>
                                    <GenText g={g} t={t} lang={lang} />
                                </>
                            ) : (
                                <>
                                    <GenText g={g} t={t} lang={lang} />
                                    <div className="about-image">
                                        <img src={g.img} alt={g.nameEn} loading="lazy" style={{ objectFit: 'cover' }} />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="section section-dark">
                <div className="container">
                    <div className="stats-grid">
                        {[
                            { num: '400+', label: t('वर्षों का अनुभव', 'Years of Experience') },
                            { num: '1,000,000+', label: t('सफल पूजन', 'Poojas Performed') },
                            { num: '100,000+', label: t('संतुष्ट भक्तगण', 'Happy Devotees') },
                            { num: '50+', label: t('पूजा प्रकार', 'Service Types') },
                        ].map(s => (
                            <div className="stat-card" key={s.num}>
                                <div className="stat-number">{s.num}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* International Testimonials */}
            <section className="section" id="testimonials-1980">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('अंतरराष्ट्रीय प्रशंसापत्र', 'International Testimonials')}</span>
                        <h2 className="section-title">{t('चार दशकों से भक्तों का विश्वास', "Devotees' Trust for Four Decades")}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('1979 से संरक्षित', 'Preserved Since 1979')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <p style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {t(
                            '1979 से 1983 के बीच दुनिया भर से आए साधकों ने पं. शम्भु नाथ शर्मा को धन्यवाद-पत्र लिखे। इनमें से कुछ मूल पत्र, उनके नाम और स्थान सहित, यहाँ प्रस्तुत हैं।',
                            'Between 1979 and 1983, seekers from around the world wrote letters of gratitude to Pandit Shambhu Nath Sharma. A selection of these original testimonials, with names and locations as given, is presented below.'
                        )}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                        <span style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            ✉️ {testimonials.length} {t('पत्र', 'Letters')}
                        </span>
                        <span style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>{testimonialFlags.join(' ')}</span>
                            {testimonialFlags.length}+ {t('देश', 'Countries')}
                        </span>
                        <span style={{ background: 'var(--gold-50)', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            📅 1979–1983
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                        {testimonials.map((tst, i) => (
                            <div key={i} style={{
                                position: 'relative',
                                background: 'linear-gradient(165deg, #FFFCF5 0%, var(--cream) 100%)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                boxShadow: 'var(--shadow-lg)',
                                overflow: 'hidden',
                            }}>
                                {/* Airmail stripe - evokes the original international letters */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                                    background: 'repeating-linear-gradient(-45deg, #B8860B 0 10px, #fff 10px 20px, #8B0000 20px 30px, #fff 30px 40px)',
                                    opacity: 0.55,
                                }} />
                                {tst.notable && (
                                    <div style={{ alignSelf: 'flex-start', background: 'var(--dark-100)', color: 'var(--gold-300)', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: 'var(--radius-xl)', letterSpacing: '0.02em' }}>
                                        🎖️ {t(tst.notableHi, tst.notableEn)}
                                    </div>
                                )}
                                <span style={{ fontSize: '1.8rem', color: 'var(--gold-400)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>&ldquo;</span>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, flex: 1, fontStyle: 'italic' }}>{t(tst.quoteHi, tst.quoteEn)}</p>
                                <div style={{ borderTop: '1px dashed var(--border-gold)', paddingTop: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{tst.flag || '🌐'}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--gold-700)', fontSize: '0.9rem' }}>{tst.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{tst.place}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem', fontStyle: 'italic' }}>
                        {t(
                            'मूल पत्रों से लिया गया, भाषा को थोड़ा सरल किया गया है। पूर्ण पते गोपनीयता हेतु संक्षिप्त किए गए हैं।',
                            'Adapted from original letters; full street addresses abbreviated for privacy.'
                        )}
                    </p>
                </div>
            </section>

            {/* Our Testimonials - additional letters found in the same original archive,
                kept in their own section so they display separately from the first batch. */}
            <section className="section section-warm" id="our-testimonials">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('हमारे प्रशंसापत्र', 'Our Testimonials')}</span>
                        <h2 className="section-title">{t('संग्रह से और भी पत्र', 'More Letters From the Archive')}</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('1973 से 1982 के मध्य', 'From Between 1973 and 1982')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                        <span style={{ background: 'white', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            ✉️ {moreTestimonials.length} {t('पत्र', 'Letters')}
                        </span>
                        <span style={{ background: 'white', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>{moreTestimonialFlags.join(' ')}</span>
                            {moreTestimonialFlags.length}+ {t('देश', 'Countries')}
                        </span>
                        <span style={{ background: 'white', border: '1px solid var(--border-gold)', color: 'var(--gold-700)', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-xl)' }}>
                            📅 1973–1982
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
                        {moreTestimonials.map((tst, i) => (
                            <div key={i} style={{
                                position: 'relative',
                                background: 'linear-gradient(165deg, #FFFCF5 0%, var(--cream) 100%)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                boxShadow: 'var(--shadow-lg)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                                    background: 'repeating-linear-gradient(-45deg, #B8860B 0 10px, #fff 10px 20px, #8B0000 20px 30px, #fff 30px 40px)',
                                    opacity: 0.55,
                                }} />
                                <span style={{ fontSize: '1.8rem', color: 'var(--gold-400)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>&ldquo;</span>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, flex: 1, fontStyle: 'italic' }}>{t(tst.quoteHi, tst.quoteEn)}</p>
                                <div style={{ borderTop: '1px dashed var(--border-gold)', paddingTop: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{tst.flag}</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--gold-700)', fontSize: '0.9rem' }}>{tst.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{tst.place}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem', fontStyle: 'italic' }}>
                        {t(
                            'मूल पत्रों से लिया गया, भाषा को थोड़ा सरल किया गया है। पूर्ण पते गोपनीयता हेतु संक्षिप्त किए गए हैं।',
                            'Adapted from original letters; full street addresses abbreviated for privacy.'
                        )}
                    </p>
                </div>
            </section>

            {/* Heritage Gallery */}
            <section className="section section-warm" id="gallery">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('यादें', 'Memories')}</span>
                        <h2 className="section-title">{t('हमारी यात्रा के क्षण', 'Moments from Our Journey')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        {gallery.map(item => (
                            <div key={item.src} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)', background: 'var(--cream)' }}>
                                <img src={item.src} alt={item.capEn} loading="lazy" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
                                <p style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t(item.capHi, item.capEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Videos */}
            <section className="section section-dark">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label" style={{ justifyContent: 'center' }}>{t('जीवंत झलकियाँ', 'Live Glimpses')}</span>
                        <h2 className="section-title" style={{ color: 'var(--gold-300)' }}>{t('वीडियो में हमारी पूजा सेवाएं', 'Our Pooja Services, Captured on Video')}</h2>
                        <p style={{ color: 'var(--warm-200)', marginTop: '0.5rem' }}>{t('वास्तविक अनुष्ठानों की सजीव झलक — यथावत, बिना किसी बनावट के', 'Authentic ceremonies, exactly as they unfold')}</p>
                    </div>
                    <div className="om-divider">ॐ</div>

                    <div className="video-showcase-grid" style={{ marginBottom: '2.5rem' }}>
                        {videoClips.map(clip => (
                            <div className="video-showcase-card" key={clip.src}>
                                <video controls preload="none" poster={clip.poster} playsInline>
                                    <source src={clip.src} type="video/mp4" />
                                </video>
                                <p className="video-showcase-caption">{t(clip.capHi, clip.capEn)}</p>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ textAlign: 'center', color: 'var(--gold-300)', marginBottom: '1rem', fontFamily: 'var(--font-hindi)' }}>
                        {t('हमारे YouTube चैनल पर अधिक देखें', 'Explore Further on Our YouTube Channel')}
                    </h3>
                    <div className="youtube-embed-wrapper">
                        <iframe
                            src={`https://www.youtube.com/embed/videoseries?list=${youtubeUploadsPlaylistId}`}
                            title="YouTube video playlist"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                    <div className="text-center" style={{ marginTop: '1.5rem' }}>
                        <a href={`https://www.youtube.com/channel/${youtubeChannelId}`} target="_blank" rel="noreferrer" className="btn btn-primary">
                            ▶️ {t('YouTube पर सब्सक्राइब करें', 'Subscribe on YouTube')}
                        </a>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section" id="mission">
                <div className="container">
                    <div className="text-center">
                        <span className="section-label">{t('हमारे मूल्य', 'Our Values')}</span>
                        <h2 className="section-title">{t('हमारे मूल सिद्धांत', 'Our Core Values')}</h2>
                    </div>
                    <div className="om-divider">ॐ</div>
                    <div className="features-grid">
                        {values.map((v, i) => (
                            <div className="feature-card" key={i}>
                                <span className="feature-icon">{v.icon}</span>
                                <h3 className="feature-title">{t(v.title, v.titleEn)}</h3>
                                <p className="feature-desc">{t(v.desc, v.descEn)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Kashi */}
            <section className="section section-warm">
                <div className="container">
                    <div className="about-story">
                        <div>
                            <span className="section-label">{t('हमारा ठिकाना', 'Our Home')}</span>
                            <h2 className="section-title">{t('काशी — विश्व की आध्यात्मिक राजधानी', "Kashi — The World's Spiritual Capital")}</h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                                {t(
                                    'बनारस (वाराणसी) दुनिया के सबसे प्राचीन शहरों में से एक है और हिंदू धर्म की आध्यात्मिक राजधानी मानी जाती है। गंगा नदी के तट पर बसा यह पवित्र शहर — काशी विश्वनाथ मंदिर, दशाश्वमेध घाट की गंगा आरती, और अगणित मंदिरों का घर है।',
                                    'Banaras (Varanasi) stands among the oldest cities on Earth, revered as the spiritual capital of Hinduism. This sacred city on the banks of the Ganga is home to the Kashi Vishwanath Temple, the resplendent Ganga Aarti at Dashashwamedh Ghat, and countless other temples.'
                                )}
                            </p>
                            <p style={{ color: 'var(--gold-700)', fontWeight: 600, fontStyle: 'italic' }}>
                                {t('"काशी में जो पूजा होती है, उसका फल सर्वोत्तम होता है।"', '"A pooja performed in Kashi yields the most auspicious results."')}
                            </p>
                        </div>
                        <div className="about-image">
                            <img src="/images/ganga-aarti.jpg" alt="Ganga Aarti" loading="lazy" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function GenText({ g, t, lang }) {
    return (
        <div>
            <span className="section-label" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>{t(`पीढ़ी ${g.gen}`, `Generation ${g.gen}`)}</span>
            {g.gen === 'III' && (
                <span style={{ display: 'inline-block', marginLeft: '0.6rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--navy-950)', background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))', padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-xl)', verticalAlign: 'middle' }}>
                    {t('वर्तमान प्रधान', 'Current Head')}
                </span>
            )}
            <h3 style={{ fontFamily: 'var(--font-hindi)', marginBottom: '0.15rem', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>{lang === 'hi' ? g.name : g.nameEn}</h3>
            {lang === 'en' && <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-hindi)' }}>{g.name}</p>}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{t(g.era, g.eraEn)}</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{t(g.body, g.bodyEn)}</p>
        </div>
    );
}
