// tenancyAgreement.validation.ts
import { z } from 'zod';

const tenancyAgreementSchema = z.object({
  propertyId: z.string(),
  landlordId: z.string(),
  tenantId: z.string(),
  tenancyPeriod: z.string().optional(),
  renewalNoticeDays: z.string().optional(),
  terminationNoticeWeeks: z.string().optional(),
  arbitrationState: z.string().optional(),
  governingLawState: z.string().optional(),
  landlordSignature: z.string().optional(),
  tenantSignature: z.string().optional(),
  witnessSignature: z.string().optional(),
  isActiveLandlord: z.boolean().optional(),
  isActiveTenant: z.boolean().optional(),
  status: z.enum(['draft', 'enable', 'complete']).optional(),
  agreementDate: z.date().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  rejectionReason: z.string().optional(),
});

const updateTenancyAgreementSchema = tenancyAgreementSchema.partial().omit({
  propertyId: true,
  landlordId: true,
  tenantId: true,
  landlordSignature: true,
  tenantSignature: true,
  isActiveLandlord: true,
  isActiveTenant: true,
  agreementDate: true
});

const initiateSchema = z.object({
  propertyId: z.string(),
  otherPartyId: z.string(),
});

const reviewSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().optional(),
});

const signSchema = z.object({
  signature: z.string(),
});

export const initiateTenancyAgreementValidationSchema = z.object({
  body: initiateSchema,
});

export const updateTenancyAgreementValidationSchema = z.object({
  body: updateTenancyAgreementSchema,
});

export const reviewTenancyAgreementValidationSchema = z.object({
  body: reviewSchema,
});

export const signTenancyAgreementValidationSchema = z.object({
  body: signSchema,
});