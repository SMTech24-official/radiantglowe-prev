import { Types } from 'mongoose';

export interface IProperty {
  PID?: number;
  landlordId?: Types.ObjectId | string;
  headlineYourProperty?: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchen: number;
  location: {
    flatOrHouseNo?: string;
    address: string;
    state: string;
    city: string;
    town: string;
    area: string;
  };
  description?: string;
  images: string[];
  status: 'available' | 'rented' | 'pending' | 'booking';
  gender?: string;
  features?: string[];
  formAvailable: string;
  furnished?: 'fully_furnished' | 'semi_furnished' | 'unfurnished';
  ages?: string;
  rentPerYear: number;
  rentPerMonth?: number;
  rentPerDay?: number;
  serviceCharge?: number;
  depositAmount?: number;
  isIncludeAllUtilityWithService?: boolean;
  minimumLengthOfContract?: number;
  isReferenceRequired?: boolean;
  accessYourProperty?: string[];
  mediaLink?: string;
  isAcceptTermsAndCondition?: boolean;
  isRemoteVideoView?: boolean;
  isHomePageView?: boolean;
  isActive: boolean;
}