export interface IButton {
  text: string;
  link: string;
}

export interface IHomeContent {
  tag: string;
  title: string;
  description: string;
  listDescription: string[];
  button: IButton;
  image: string;
}

export interface IAboutUsContent {
  tag: string;
  title: string;
  description: string;
  listDescription: string[];
  button: IButton;
  image: string;
}
export interface IPricingContent {
  tag: string;
  title: string;
  description: string;
  listDescription: string[];
  button: IButton;
  image: string;
}

export interface IFAQContent {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ITermsAndConditionsContent {
  title: string;
  contentHtml: string;
}

export interface IPrivacyPolicy {
  title: string;
  contentHtml: string;
}

export interface IContactUsContent {
  email: string;
  phone: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
}

export interface IPage {
  pageName: 'home' | 'aboutUs' | 'faq' | 'termsAndConditions' | 'contactUs' | 'privacyPolicy' | 'pricing';
  content:
    | IHomeContent[]
    | IAboutUsContent[]
    | IFAQContent
    | ITermsAndConditionsContent
    | IContactUsContent
    | IPrivacyPolicy
    | IPricingContent[]
}