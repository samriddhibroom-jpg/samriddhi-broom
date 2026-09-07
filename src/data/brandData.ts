import { BrandInfo, ProductCategory, WhyFeature, BroomModel } from '../types';
import samriddhiGoldImg from '../assets/images/samriddhi_gold_broom_1788448431961.jpg';
import samriddhiPremiumImg from '../assets/images/samriddhi_premium_broom_1788448447865.jpg';
import samriddhiWarehouseStockImg from '../assets/images/samriddhi_warehouse_stock_1788448464875.jpg';

export const WAREHOUSE_STOCK_IMAGE = samriddhiWarehouseStockImg;

export const BRAND_DATA: BrandInfo = {
  companyName: 'ADHRIT INDUSTRIES',
  brandName: 'SAMRIDHII BROOM™',
  brandRelation: 'A Unit of Adhrit Industries',
  tagline: 'Ek Vishwash, Ek Kadam Swachhta ki aur',
  phone: '9709117120',
  displayPhone: '+91 97091 17120',
  whatsappUrl: 'https://wa.me/919709117120?text=Hello%20Adhrit%20Industries,%20I%20would%20like%20to%20enquire%20about%20Samriddhi%20Broom',
  openingCeremony: {
    dateDisplay: '27/08/2026',
    day: 'Thursday',
    time: '11:00 AM',
    venueName: 'Aprajita Apartment',
    street: 'Lower Burdwan Compound, Dhobi Ghat',
    area: 'Lalpur',
    cityState: 'Ranchi, Jharkhand',
    fullAddress: 'Aprajita Apartment, Lower Burdwan Compound, Dhobi Ghat, Lalpur, Ranchi, Jharkhand',
    invitationGreeting: 'Cordially invites you to the OPENING CEREMONY of SAMRIDHII BROOM',
    regards: 'ADHRIT INDUSTRIES FAMILY',
  },
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'everyday-cleaning',
    name: 'Everyday Cleaning',
    subtitle: 'Daily Household Care',
    description: 'Carefully balanced for comfortable daily sweeping routines across everyday indoor living spaces.',
    suitableFor: 'Living rooms, bedrooms, and daily cleanups',
    isPlaceholderNotice: true,
  },
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    subtitle: 'Comprehensive Living Space',
    description: 'Designed to reach fine dust particles and corners with steady sweeping coverage.',
    suitableFor: 'Complete home maintenance and multi-room spaces',
    isPlaceholderNotice: true,
  },
  {
    id: 'floor-cleaning',
    name: 'Floor Cleaning',
    subtitle: 'Surface Care Utility',
    description: 'Engineered for smooth motion across various hard flooring surfaces and wide floor corridors.',
    suitableFor: 'Tiled, marble, and smooth hard-floor textures',
    isPlaceholderNotice: true,
  },
  {
    id: 'commercial-cleaning',
    name: 'Commercial Cleaning',
    subtitle: 'Wider Surface Coverage',
    description: 'Sturdy format developed for consistent performance across shops, offices, and larger corridors.',
    suitableFor: 'Offices, showrooms, and retail corridors',
    isPlaceholderNotice: true,
  },
];

export const WHY_FEATURES: WhyFeature[] = [
  {
    number: '01',
    title: 'MADE FOR EVERYDAY CLEANING',
    description: 'Thoughtfully structured to bring ease, balance, and reliability to the everyday sweeping ritual.',
    iconName: 'sparkles',
  },
  {
    number: '02',
    title: 'DESIGNED FOR A CLEANER ROUTINE',
    description: 'Crafted to help keep living spaces neat and hygienic with steady, consistent sweeping motions.',
    iconName: 'feather',
  },
  {
    number: '03',
    title: 'A BRAND BUILT ON TRUST',
    description: 'Backed by Adhrit Industries, focusing on genuine consumer satisfaction and honest home care.',
    iconName: 'shield',
  },
  {
    number: '04',
    title: 'ONE STEP TOWARDS CLEANLINESS',
    description: 'Echoing the philosophy of taking conscious, steady steps toward cleaner homes and cleaner communities.',
    iconName: 'footprints',
  },
];

export const BROOM_MODELS: BroomModel[] = [
  {
    id: 'samriddhi-premium',
    name: 'SAMRIDHII Premium (Dust Free)',
    modelCode: 'SMB-PR95',
    subTitle: 'Fluorescent Ribbed Grip • Natural Hill Grass Broom',
    tagline: 'Carefully combed Meghalaya grass with protective dust-free sleeve.',
    badge: 'HOUSEHOLD FAVORITE',
    retailPrice: 250,
    mrp: 299,
    packOfThreePrice: 699,
    wholesalePricePerPiece: 190,
    minWholesaleQty: 50,
    length: '95 cm (37.5 inches)',
    weight: '380 grams (Optimal featherweight balance)',
    grassOrigin: '100% Selected Natural Hill Grass (Silchar / Meghalaya)',
    handleType: 'Ergonomic fluorescent ribbed grip with brand ring collar',
    bestFor: 'Daily indoor sweeping, marble, vitrified tiles & bedrooms',
    isPopular: false,
    image: samriddhiPremiumImg,
    features: [
      'Pre-combed natural grass — minimal dust ("bhusa") shedding from first sweep',
      'Ergonomic fluorescent ribbed grip reducing hand & wrist fatigue',
      'Signature royal blue dust-free protective jacket ensuring hygiene',
      'Double-braided spine lock preventing bristle looseness over months',
      'Genuine factory barcode and MRP packaging for consumer confidence',
    ],
    specs: [
      { label: 'Model Series', value: 'SAMRIDHII Premium™ SMB-PR95' },
      { label: 'Overall Length', value: '95 cm / 3.1 feet' },
      { label: 'Net Weight', value: '~380 g' },
      { label: 'Bristle Material', value: 'Prime Meghalaya Natural Hill Grass' },
      { label: 'Sweep Path Width', value: '38 cm' },
      { label: 'Handle Grip', value: 'Fluorescent green ribbed comfort sleeve' },
      { label: 'Durability', value: 'Up to 6–9 months standard domestic usage' },
    ],
  },
  {
    id: 'samriddhi-gold',
    name: 'SAMRIDHII Gold (Dust Free)',
    modelCode: 'SMB-GL110',
    subTitle: 'Heavy-Duty Luxury Black & Gold • Long-Reach Broom',
    tagline: 'Zero-bend tall posture with 45% extra bristle volume and deep sweep.',
    badge: 'FLAGSHIP GOLD',
    retailPrice: 270,
    mrp: 325,
    packOfThreePrice: 759,
    wholesalePricePerPiece: 210,
    minWholesaleQty: 50,
    length: '110 cm (43.3 inches - Zero Bend)',
    weight: '520 grams (High-density heavy-duty bristle volume)',
    grassOrigin: 'Premium Grade-A Long-Stem Assam & Meghalaya Hill Grass',
    handleType: 'Reinforced royal blue ribbed grip with dual wire binding',
    bestFor: 'Large living rooms, verandas, courtyards, commercial offices & deep dust',
    isPopular: true,
    image: samriddhiGoldImg,
    features: [
      'Extended 110 cm height allows upright sweeping without lower-back bending',
      'Glossy luxury black & gold dust-free protective packaging jacket',
      '45% higher bristle density traps larger grit, garden debris, and fine dust',
      'Dual-wire brass lock binding ensures zero bristle fallout under heavy pressure',
      'Commercial-grade endurance tested for homes, offices, and high-traffic areas',
    ],
    specs: [
      { label: 'Model Series', value: 'SAMRIDHII Gold™ SMB-GL110' },
      { label: 'Overall Length', value: '110 cm / 3.6 feet (Zero Bend)' },
      { label: 'Net Weight', value: '~520 g (Heavy-Duty)' },
      { label: 'Bristle Material', value: 'Grade-A Long-Stem Assam Hill Grass' },
      { label: 'Sweep Path Width', value: '48 cm (Wide Coverage)' },
      { label: 'Handle Grip', value: 'Royal blue ribbed comfort sleeve + dual wire lock' },
      { label: 'Durability', value: 'Up to 10–14 months heavy-duty usage' },
    ],
  },
];
