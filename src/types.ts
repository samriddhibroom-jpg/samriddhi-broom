export interface ProductCategory {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  suitableFor: string;
  isPlaceholderNotice?: boolean;
}

export interface WhyFeature {
  number: string;
  title: string;
  description: string;
  iconName: 'sparkles' | 'feather' | 'shield' | 'footprints';
}

export interface BrandInfo {
  companyName: string;
  brandName: string;
  brandRelation: string;
  tagline: string;
  phone: string;
  displayPhone: string;
  whatsappUrl: string;
  openingCeremony: {
    dateDisplay: string;
    day: string;
    time: string;
    venueName: string;
    street: string;
    area: string;
    cityState: string;
    fullAddress: string;
    invitationGreeting: string;
    regards: string;
  };
}

export interface BroomImageItem {
  id: string;
  url: string;
  fallbackUrls?: string[];
  label: string;
  caption: string;
  tag?: string;
}

export interface BroomModel {
  id: string;
  name: string;
  modelCode: string;
  subTitle: string;
  tagline: string;
  badge: string;
  minWholesaleQty: number;
  length: string;
  weight: string;
  grassOrigin: string;
  handleType: string;
  bestFor: string;
  features: string[];
  specs: {
    label: string;
    value: string;
  }[];
  isPopular?: boolean;
  image?: string;
  gallery?: BroomImageItem[];
}
