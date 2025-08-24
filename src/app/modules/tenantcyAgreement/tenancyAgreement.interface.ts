// tenancyAgreement.interface.ts
import { Types } from 'mongoose';

export interface ITenancyAgreement {
  agreementId?: number; // Auto-generated sequential ID
  propertyId: Types.ObjectId | string;
  landlordId: Types.ObjectId | string;
  tenantId: Types.ObjectId | string;
  tenancyPeriod?: string;
  renewalNoticeDays?: string;
  terminationNoticeWeeks?: string;
  arbitrationState?: string;
  governingLawState?: string;
  landlordSignature?: string;
  tenantSignature?: string;
  witnessSignature?: string;
  isActiveLandlord?: boolean;
  isActiveTenant?: boolean;
  status?: 'draft' | 'enable' | 'complete';
  agreementDate?: Date;
  startDate?: Date;
  endDate?: Date;
  rejectionReason?: string;
}