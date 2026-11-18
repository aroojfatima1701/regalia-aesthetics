// Photography from Pexels (free licence). Photo IDs are listed in the README.
import t_anti_wrinkle from '../assets/photos/t-anti-wrinkle.webp';
import t_fillers from '../assets/photos/t-fillers.webp';
import t_skin_boosters from '../assets/photos/t-skin-boosters.webp';
import t_microneedling from '../assets/photos/t-microneedling.webp';
import t_peel from '../assets/photos/t-peel.webp';
import t_hydrafacial from '../assets/photos/t-hydrafacial.webp';
import t_signature_facial from '../assets/photos/t-signature-facial.webp';
import t_pico_laser from '../assets/photos/t-pico-laser.webp';
import t_co2 from '../assets/photos/t-co2.webp';
import t_laser_hair from '../assets/photos/t-laser-hair.webp';
import t_hifu from '../assets/photos/t-hifu.webp';
import t_threads from '../assets/photos/t-threads.webp';
import h1 from '../assets/photos/hero-1.webp';
import h2 from '../assets/photos/hero-2.webp';
import h3 from '../assets/photos/hero-3.webp';
import h4 from '../assets/photos/hero-4.webp';
import h5 from '../assets/photos/hero-5.webp';
import h6 from '../assets/photos/hero-6.webp';
import d_layla from '../assets/photos/doc-layla.webp';
import d_omar from '../assets/photos/doc-omar.webp';
import d_claire from '../assets/photos/doc-claire.webp';
import d_daniel from '../assets/photos/doc-daniel.webp';
import faceImg from '../assets/photos/face.webp';

export const treatmentPhoto: Record<string, string> = { 'anti-wrinkle': t_anti_wrinkle, 'fillers': t_fillers, 'skin-boosters': t_skin_boosters, 'microneedling': t_microneedling, 'peel': t_peel, 'hydrafacial': t_hydrafacial, 'signature-facial': t_signature_facial, 'pico-laser': t_pico_laser, 'co2': t_co2, 'laser-hair': t_laser_hair, 'hifu': t_hifu, 'threads': t_threads };
export const doctorPhoto: Record<string, string> = { layla: d_layla, omar: d_omar, claire: d_claire, daniel: d_daniel };
export const facePhoto = faceImg;
export const heroSlides = [
  { src: h1, label: 'Anti-wrinkle injections', to: '/treatment/anti-wrinkle', alt: 'A doctor in black gloves giving a woman a fine injection beside her eye' },
  { src: h2, label: 'Dermal fillers', to: '/treatment/fillers', alt: 'A woman receiving a lip filler injection' },
  { src: h3, label: 'Hydrating facial', to: '/treatment/hydrafacial', alt: 'A woman relaxing during a hydrating facial with a handheld device' },
  { src: h4, label: 'Pico laser', to: '/treatment/pico-laser', alt: 'A woman wearing protective glasses during a laser skin treatment' },
  { src: h5, label: 'LED light therapy', to: '/treatment/signature-facial', alt: 'A red LED light therapy mask glowing on a face' },
  { src: h6, label: 'Consultation first', to: '/book', alt: 'A doctor examining a patient’s skin before treatment' },
];
