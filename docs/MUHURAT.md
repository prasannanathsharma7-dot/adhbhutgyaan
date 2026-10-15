# The muhurat engine: what it does, what it does not, how it was checked

**What it is.** A day-by-day *screen*. For each day it reads the Varanasi sunrise tithi, nakshatra and weekday (from the verified Panchang engine) and keeps days that match the rules in `CATEGORY_RULES` (`src/utils/muhuratEngine.js`, and a CommonJS copy in `backend/utils/muhuratEngine.js` that produces the paid report). Since October 2026 it also skips **Chaturmas** and **Kharmas** for marriage and griha pravesh (`src/data/muhuratExclusions.json`; both copies read that file and `scripts/test-muhurat.mjs` checks they agree day by day).

**What it is not.** It is not a muhurat. It does not consider Guru / Shukra asta, Panchak, Bhadra, Rahu Kaal, vedha, lunar-month rules beyond Chaturmas, or the person's own chart (tara / chandra bala). Every place that shows its output now says so (Muhurat page, paid report, homepage widget).

**How it was checked (14-15 Oct 2026).**
- Against a published 2026 marriage-date list for Jan-Mar: the base rules matched only **4 of 13** published dates, and proposed dates inside Kharmas and (later in the year) inside Chaturmas. The old homepage widget therefore showed 17 and 24 Oct 2026 as "marriage muhurats" although Chaturmas runs to 20/21 Nov. That was the bug found; it is fixed.
- After the exclusions: no proposals inside Chaturmas (25 Jul-21 Nov 2026, 14 Jul-11 Nov 2027) or Kharmas (about 14 Mar-14 Apr and 16 Dec-14 Jan); 4 Dec 2026 (Friday, Chitra, Ekadashi), which is on published lists, is still proposed.
- The Chaturmas dates were cross-checked across several published panchangs *and* against the Panchang engine (each period starts on a Shukla Ekadashi at Varanasi sunrise).

**Known limits / what to do next.**
1. Exclusion data is verified only through **31 Dec 2027**; past that the report shows a notice. Add a year to the JSON only after checking it against published panchangs.
2. The base rules are coarse (4/13 recall). For a product that sells a "muhurat" the right fix is to feed it from an authoritative source - the owner's own Hrishikesh/Kashi panchang PDFs (the MuhuratNirnay project) - or have Pandit ji review each paid report before it is delivered.
3. Guru / Shukra asta can be computed from the ephemeris (Venus / Jupiter within about 10-11 degrees of the Sun) but was left out until it can be validated against published lists.
