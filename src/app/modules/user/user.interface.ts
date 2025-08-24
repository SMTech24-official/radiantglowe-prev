import { Model, Types } from "mongoose";

export const USER_ROLE = {
  landlord: 'landlord',
  tenant: 'tenant',
  admin: 'admin',
} as const;

export interface IAddress {
  flatOrHouseNo?: string;
  address?: string;
  state?: string;
  city?: string;
  town?: string;
  area?: string;
}

export interface IGuarantor {
  name?: string;
  telephone?: string;
  email?: string;
  profession?: string;
  address?: IAddress;
}

export interface IReference {
  name?: string;
  telephone?: string;
  email?: string;
  profession?: string;
  address?: IAddress;
}

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

export interface IUser {
  uid: string;
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNumber: string;
  address?: IAddress;
  role: 'landlord' | 'tenant' | 'admin';
  isDeleted: boolean;
  registerBy: 'manual' | 'social';
  image?: string;
  isVerified: boolean;
  isActive: boolean;
  profileVerificationImage?: string[];
  websiteUrl?: string;
  lookingPropertyForTenant?: string[];
  guarantor?: IGuarantor;
  references?: IReference[];
}

export interface UserModel extends Model<IUser> {
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}