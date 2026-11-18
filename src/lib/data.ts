// Sample content for the Regalia Aesthetics concept. Prices, doctors and addresses are illustrative.
// In the full build these come from the Laravel API (GET /api/treatments, /api/clinics, /api/doctors).

import { isAr } from './i18n';

export type CityId = 'dxb' | 'nyc';
export type CategoryId = 'injectables' | 'skin' | 'laser' | 'lifting' | 'facials';
export type IconKey = 'syringe' | 'drop' | 'lips' | 'sparkle' | 'needles' | 'peel' | 'beam' | 'leaf' | 'lift' | 'thread' | 'facial' | 'wave';

export interface Clinic {
  id: CityId; city: string; area: string; address: string; timeZone: string; currency: 'AED' | 'USD';
  opens: number; closes: number; hoursLabel: string; phone: string; license: string; consultFee: number;
}
export const clinics: Record<CityId, Clinic> = {
  dxb: { id: 'dxb', city: 'Dubai', area: 'Jumeirah', address: 'Al Wasl Road, Jumeirah 1, Dubai', timeZone: 'Asia/Dubai', currency: 'AED', opens: 10, closes: 21, hoursLabel: 'Saturday to Thursday, 10am to 9pm', phone: '+971 4 000 0000', license: 'Doctors licensed by the Dubai Health Authority (DHA)', consultFee: 300 },
  nyc: { id: 'nyc', city: 'New York', area: 'Upper East Side', address: 'Madison Avenue, Upper East Side, New York, NY', timeZone: 'America/New_York', currency: 'USD', opens: 9, closes: 19, hoursLabel: 'Monday to Saturday, 9am to 7pm', phone: '+1 (212) 000-0000', license: 'Board-certified dermatologists and physicians', consultFee: 150 },
};

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: 'injectables', label: 'Injectables', blurb: 'Soften lines and restore volume with a light, natural hand.' },
  { id: 'skin', label: 'Skin rejuvenation', blurb: 'Texture, glow and repair from the inside out.' },
  { id: 'laser', label: 'Laser', blurb: 'Pigmentation, resurfacing and smooth, hair-free skin.' },
  { id: 'lifting', label: 'Lifting', blurb: 'Non-surgical lift and contour for jaw, brows and neck.' },
  { id: 'facials', label: 'Facials', blurb: 'Medical-grade facials for every skin, every month.' },
];

export interface Step { when: string; what: string }
export interface Treatment {
  id: string; name: string; category: CategoryId; icon: IconKey; short: string; about: string;
  price: { dxb: number; nyc: number }; per?: string; duration: string; downtime: string; sessions: string; lasts: string;
  concerns: string[]; journey: Step[]; faqs: { q: string; a: string }[]; signature?: boolean; downtimeDays: number;
  /** Set by the admin panel. */
  photo?: string; published?: boolean;
  /** Optional Arabic overrides. Without them the built-in translation is used. */
  nameAr?: string; shortAr?: string;
}

export const treatments: Treatment[] = [
  {
    id: 'anti-wrinkle', name: 'Anti-wrinkle injections', category: 'injectables', icon: 'syringe', signature: true, downtimeDays: 0,
    short: 'Soften forehead lines, frown lines and crow’s feet while keeping your expressions.',
    about: 'A purified protein relaxes the small muscles that crease the skin. We plan each point around how your face moves, so you look rested, never frozen.',
    price: { dxb: 1200, nyc: 450 }, per: 'per area', duration: '20 minutes', downtime: 'None', sessions: '1, then every 4 months', lasts: '3 to 4 months',
    concerns: ['forehead', 'eyes'],
    journey: [{ when: 'Day 0', what: 'Consultation, mapping and a few tiny injections. Back to your day straight away.' }, { when: 'Day 3', what: 'The first softening begins to show.' }, { when: 'Day 14', what: 'Full result. Free review visit for fine-tuning.' }, { when: 'Month 4', what: 'Lines slowly return. Book your next session.' }],
    faqs: [{ q: 'Will I look frozen?', a: 'No. We use conservative doses and keep the natural movement of your brows and smile.' }, { q: 'Does it hurt?', a: 'Most people feel a quick pinch. A numbing cream is available.' }],
  },
  {
    id: 'fillers', name: 'Dermal fillers', category: 'injectables', icon: 'lips', signature: true, downtimeDays: 2,
    short: 'Hyaluronic acid to restore volume in cheeks, lips and jawline.',
    about: 'Soft hyaluronic gels replace lost volume and refine contours. Everything is dissolvable, and we always start with less.',
    price: { dxb: 2200, nyc: 750 }, per: 'per syringe', duration: '45 minutes', downtime: '1 to 2 days of mild swelling', sessions: '1', lasts: '9 to 18 months',
    concerns: ['cheeks', 'lips', 'jaw'],
    journey: [{ when: 'Day 0', what: 'Shape is planned with you in a mirror before any product is placed.' }, { when: 'Day 1 to 2', what: 'Mild swelling or tenderness that settles quickly.' }, { when: 'Day 14', what: 'Settled, natural result and a review visit.' }, { when: 'Month 12', what: 'Top up if you like the result.' }],
    faqs: [{ q: 'Can fillers be reversed?', a: 'Yes. Hyaluronic acid fillers can be dissolved with an enzyme if ever needed.' }, { q: 'Will my lips look overdone?', a: 'We follow your natural proportions and build up gradually over visits if you want more.' }],
  },
  {
    id: 'skin-boosters', name: 'Skin boosters', category: 'injectables', icon: 'drop', downtimeDays: 1,
    short: 'Deep hydration that brightens skin and improves firmness.',
    about: 'Micro-injections of hyaluronic acid spread under the skin to hydrate, firm and lift its glow, without changing your features.',
    price: { dxb: 1800, nyc: 650 }, duration: '30 minutes', downtime: 'Small bumps for up to 24 hours', sessions: '2, one month apart', lasts: '6 months',
    concerns: ['texture', 'neck', 'cheeks'],
    journey: [{ when: 'Day 0', what: 'Five small injection points per side.' }, { when: 'Day 1', what: 'Bumps settle overnight.' }, { when: 'Week 4', what: 'Second session.' }, { when: 'Week 8', what: 'Skin looks plumper, smoother and brighter.' }],
    faqs: [{ q: 'Is this the same as filler?', a: 'No. Boosters improve skin quality and hydration; they do not add shape.' }],
  },
  {
    id: 'microneedling', name: 'Microneedling with PRP', category: 'skin', icon: 'needles', downtimeDays: 2,
    short: 'Collagen induction for acne scars, pores and texture.',
    about: 'Fine needles create controlled micro-channels while growth factors from your own blood speed up repair and new collagen.',
    price: { dxb: 1500, nyc: 550 }, duration: '60 minutes', downtime: '1 to 2 days of redness', sessions: '3, four weeks apart', lasts: 'Long-lasting with maintenance',
    concerns: ['acne', 'texture'],
    journey: [{ when: 'Day 0', what: 'Numbing, blood draw for PRP, then treatment.' }, { when: 'Day 1 to 2', what: 'Pink like mild sunburn. Gentle skincare only.' }, { when: 'Week 4', what: 'Next session. Texture already looks refined.' }, { when: 'Month 3', what: 'Visible collagen improvement in scars and pores.' }],
    faqs: [{ q: 'Is it suitable for darker skin tones?', a: 'Yes. Microneedling is safe for all skin types when done by trained doctors.' }],
  },
  {
    id: 'peel', name: 'Medical chemical peel', category: 'skin', icon: 'peel', downtimeDays: 3,
    short: 'Clears dullness, congestion and uneven tone.',
    about: 'A doctor-selected acid blend lifts dead cells and speeds renewal. Strength is matched to your skin type and climate.',
    price: { dxb: 650, nyc: 250 }, duration: '30 minutes', downtime: '2 to 4 days of light flaking', sessions: '3 to 6, two weeks apart', lasts: 'Ongoing with maintenance',
    concerns: ['pigmentation', 'acne', 'texture'],
    journey: [{ when: 'Day 0', what: 'Cleanse, peel, neutralise and SPF.' }, { when: 'Day 2 to 4', what: 'Light flaking. Do not pick.' }, { when: 'Week 2', what: 'Fresher, brighter skin and the next peel.' }],
    faqs: [{ q: 'Can I peel in the Dubai summer?', a: 'Yes, with lighter formulas and strict sun protection. Your doctor adjusts the plan by season.' }],
  },
  {
    id: 'hydrafacial', name: 'Hydrating facial', category: 'facials', icon: 'facial', signature: true, downtimeDays: 0,
    short: 'Deep cleanse, extraction and hydration. Glowing skin in an hour.',
    about: 'Vortex cleansing, painless extractions and infused serums. The perfect monthly reset and a favourite before events.',
    price: { dxb: 750, nyc: 250 }, duration: '50 minutes', downtime: 'None', sessions: 'Monthly', lasts: 'About a week of glow',
    concerns: ['texture', 'acne'],
    journey: [{ when: 'Day 0', what: 'Cleanse, exfoliate, extract and hydrate.' }, { when: 'Same evening', what: 'Glowing skin, ready for an event.' }, { when: 'Monthly', what: 'Keep the results with regular sessions.' }],
    faqs: [{ q: 'Can I wear makeup after?', a: 'We suggest waiting until the next morning to let the serums absorb.' }],
  },
  {
    id: 'signature-facial', name: 'Regalia signature facial', category: 'facials', icon: 'sparkle', downtimeDays: 0,
    short: 'Our 75-minute ritual with LED, lymphatic massage and a gold-leaf mask.',
    about: 'A medical facial with a luxury finish: double cleanse, enzyme peel, LED light therapy, sculpting massage and a soothing mask.',
    price: { dxb: 950, nyc: 320 }, duration: '75 minutes', downtime: 'None', sessions: 'Monthly', lasts: 'About two weeks',
    concerns: ['texture', 'pigmentation'],
    journey: [{ when: 'Day 0', what: '75 minutes of calm. Skin looks lifted and luminous.' }, { when: 'Week 2', what: 'Glow fades gently. Book monthly to keep it.' }],
    faqs: [{ q: 'Is this suitable for sensitive skin?', a: 'Yes. Every step is adjusted after a skin check on the day.' }],
  },
  {
    id: 'pico-laser', name: 'Pico laser for pigmentation', category: 'laser', icon: 'beam', signature: true, downtimeDays: 1,
    short: 'Targets sun spots, melasma and uneven tone with minimal heat.',
    about: 'Ultra-short pulses shatter pigment into tiny particles your body clears naturally. Gentle enough for darker skin tones.',
    price: { dxb: 1400, nyc: 500 }, duration: '30 minutes', downtime: 'Mild redness for a day', sessions: '3 to 5, four weeks apart', lasts: 'Long-lasting with SPF',
    concerns: ['pigmentation'],
    journey: [{ when: 'Day 0', what: 'Cooling, protective eyewear and a quick laser pass.' }, { when: 'Day 1', what: 'Spots may darken slightly before fading.' }, { when: 'Week 4', what: 'Visible fading and your next session.' }, { when: 'Month 4', what: 'Clearer, more even tone.' }],
    faqs: [{ q: 'Does it work on melasma?', a: 'It can help as part of a plan with skincare and sun protection. Your doctor sets realistic goals.' }],
  },
  {
    id: 'co2', name: 'Fractional CO2 resurfacing', category: 'laser', icon: 'wave', downtimeDays: 6,
    short: 'Our strongest skin renewal for deep lines and scarring.',
    about: 'Thousands of micro-columns of laser energy trigger dramatic collagen remodelling. One session can do the work of many.',
    price: { dxb: 2500, nyc: 900 }, duration: '90 minutes including numbing', downtime: '5 to 7 days', sessions: '1 to 2', lasts: 'Years, with sun care',
    concerns: ['acne', 'texture', 'eyes'],
    journey: [{ when: 'Day 0', what: 'One hour of numbing, then a 20-minute treatment.' }, { when: 'Day 1 to 6', what: 'Redness and peeling. Plan a quiet week.' }, { when: 'Week 2', what: 'New, smoother skin appears.' }, { when: 'Month 3', what: 'Collagen keeps building for months.' }],
    faqs: [{ q: 'When is the best time of year?', a: 'In Dubai we recommend October to April, when sun exposure is easier to avoid.' }],
  },
  {
    id: 'laser-hair', name: 'Laser hair removal', category: 'laser', icon: 'leaf', downtimeDays: 0,
    short: 'Smooth, hair-free skin with a laser suited to every skin tone.',
    about: 'Medical-grade diode laser with built-in cooling. Settings are tailored to your skin and hair type for comfort and safety.',
    price: { dxb: 400, nyc: 150 }, per: 'per area', duration: '15 to 60 minutes', downtime: 'None', sessions: '6 to 8', lasts: 'Long-term reduction',
    concerns: [],
    journey: [{ when: 'Day 0', what: 'Patch test and first session.' }, { when: 'Week 2', what: 'Treated hairs shed.' }, { when: 'Every 6 weeks', what: 'Repeat until you reach smooth skin.' }],
    faqs: [{ q: 'Is it safe for darker skin?', a: 'Yes. We use a long-wavelength laser designed for all skin types.' }],
  },
  {
    id: 'hifu', name: 'HIFU face lift', category: 'lifting', icon: 'lift', signature: true, downtimeDays: 0,
    short: 'Ultrasound lift for jawline, brows and neck. No needles.',
    about: 'Focused ultrasound heats the deep lifting layer of the face, the same layer a surgeon tightens, so skin firms over three months.',
    price: { dxb: 3500, nyc: 1200 }, duration: '60 to 90 minutes', downtime: 'None', sessions: '1 a year', lasts: '12 months',
    concerns: ['jaw', 'neck'],
    journey: [{ when: 'Day 0', what: 'A warm, prickly feeling during treatment. No marks after.' }, { when: 'Month 1', what: 'Skin begins to feel firmer.' }, { when: 'Month 3', what: 'Peak lift along the jaw and brows.' }],
    faqs: [{ q: 'Can I go back to work?', a: 'Yes, the same day. There are no wounds or injections.' }],
  },
  {
    id: 'threads', name: 'Thread lift', category: 'lifting', icon: 'thread', downtimeDays: 4,
    short: 'Instant lift for jowls and mid-face with dissolving threads.',
    about: 'Fine dissolving threads lift sagging tissue and stimulate collagen as they dissolve. A step between non-surgical and surgical lifting.',
    price: { dxb: 4500, nyc: 1800 }, duration: '60 minutes', downtime: '3 to 5 days', sessions: '1', lasts: '12 to 18 months',
    concerns: ['jaw', 'cheeks'],
    journey: [{ when: 'Day 0', what: 'Local anaesthetic and threads placed through tiny entry points.' }, { when: 'Day 3 to 5', what: 'Tightness and mild swelling settle.' }, { when: 'Month 2', what: 'Lift settles and collagen builds.' }],
    faqs: [{ q: 'Will I see the threads?', a: 'No. They sit under the skin and dissolve over about six months.' }],
  },
];

export const treatmentById = (id: string) => treatments.find((t) => t.id === id);

/** Hotspots on the face map. x/y are in a 400 x 520 grid over the face photo. */
export const concerns = [
  { id: 'forehead', label: 'Forehead lines', x: 175, y: 168, note: 'Horizontal lines from raising the brows.' },
  { id: 'eyes', label: 'Crow’s feet & under eyes', x: 262, y: 233, note: 'Fine lines at the corners and tired-looking eyes.' },
  { id: 'pigmentation', label: 'Pigmentation', x: 115, y: 278, note: 'Sun spots, melasma and uneven tone.' },
  { id: 'cheeks', label: 'Cheek volume', x: 250, y: 293, note: 'Flattening of the cheeks as we age.' },
  { id: 'lips', label: 'Lips', x: 180, y: 356, note: 'Thin lips or lost definition.' },
  { id: 'acne', label: 'Acne & scarring', x: 110, y: 333, note: 'Breakouts, marks and textured scars.' },
  { id: 'jaw', label: 'Jawline & jowls', x: 255, y: 383, note: 'Softening of the jaw and early jowls.' },
  { id: 'texture', label: 'Dullness & pores', x: 205, y: 298, note: 'Large pores, rough texture and lack of glow.' },
  { id: 'neck', label: 'Neck lines', x: 180, y: 450, note: 'Horizontal neck lines and crepey skin.' },
];

export interface Doctor { id: string; name: string; role: string; city: CityId; bio: string; focus: string[]; languages: string; years: number; quote: string; photo?: string }
export const doctors: Doctor[] = [
  { id: 'layla', name: 'Dr. Layla Haddad', role: 'Consultant dermatologist', city: 'dxb', bio: 'Twelve years in medical and aesthetic dermatology. Known for subtle injectables and pigmentation care for Middle Eastern skin.', focus: ['Injectables', 'Pigmentation'], languages: 'English, Arabic, French', years: 12, quote: 'Good work should look like a great night’s sleep.' },
  { id: 'omar', name: 'Dr. Omar Siddiqui', role: 'Aesthetic physician', city: 'dxb', bio: 'Specialist in non-surgical lifting and laser. Plans every treatment around how the face moves.', focus: ['HIFU & threads', 'Laser'], languages: 'English, Arabic, Urdu', years: 9, quote: 'I treat how a face moves, not just how it looks still.' },
  { id: 'claire', name: 'Dr. Claire Morgan', role: 'Board-certified dermatologist', city: 'nyc', bio: 'Former academic dermatologist with a focus on skin quality, acne scarring and laser resurfacing.', focus: ['Laser resurfacing', 'Acne scars'], languages: 'English', years: 15, quote: 'Healthy skin is the best foundation for any result.' },
  { id: 'daniel', name: 'Dr. Daniel Reyes', role: 'Aesthetic physician', city: 'nyc', bio: 'Facial balancing with fillers and boosters. Believes the best work is the work nobody notices.', focus: ['Fillers', 'Skin boosters'], languages: 'English, Spanish', years: 10, quote: 'The best compliment is when nobody can tell.' },
];

export interface Membership { id: string; name: string; price: { dxb: number; nyc: number }; perks: string[]; featured?: boolean }
export const memberships: Membership[] = [
  { id: 'essential', name: 'Essential', price: { dxb: 650, nyc: 199 }, perks: ['One hydrating facial every month', '10% off all treatments', 'Priority booking'] },
  { id: 'signature', name: 'Signature', price: { dxb: 1250, nyc: 399 }, perks: ['Monthly signature or hydrating facial', 'Skin boosters twice a year', '15% off all treatments', 'Free skin analysis every quarter'], featured: true },
  { id: 'royal', name: 'Royal', price: { dxb: 2400, nyc: 749 }, perks: ['Any facial, every month', 'Anti-wrinkle top-ups every 4 months', '20% off all treatments', 'Private suite and evening appointments'] },
];

export function money(v: number, city: CityId): string {
  if (isAr()) return city === 'dxb' ? `${v.toLocaleString('en-US')} درهم` : `${v.toLocaleString('en-US')} دولار`;
  return city === 'dxb' ? `AED ${v.toLocaleString('en-US')}` : `$${v.toLocaleString('en-US')}`;
}
