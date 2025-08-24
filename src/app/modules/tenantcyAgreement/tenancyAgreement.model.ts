// tenancyAgreement.model.ts
import { Schema, model } from 'mongoose';
import { ITenancyAgreement } from './tenancyAgreement.interface';

const tenancyAgreementSchema = new Schema<ITenancyAgreement>(
  {
    agreementId: {
      type: Number,
      unique: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenancyPeriod: {
      type: String,
      required: false,
      default: '',
    },
    renewalNoticeDays: {
      type: String,
      required: false,
      default: '',
    },
    terminationNoticeWeeks: {
      type: String,
      required: false,
      default: '',
    },
    arbitrationState: {
      type: String,
      required: false,
      default: '',
    },
    governingLawState: {
      type: String,
      required: false,
      default: '',
    },
    landlordSignature: {
      type: String,
      default: '',
    },
    tenantSignature: {
      type: String,
      default: '',
    },
    witnessSignature: {
      type: String,
      default: '',
    },
    isActiveLandlord: {
      type: Boolean,
      default: false,
    },
    isActiveTenant: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'enable', 'complete'],
      default: 'draft',
    },
    agreementDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate sequential agreementId based on the highest existing ID
tenancyAgreementSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastAgreement = await this.model('TenancyAgreement')
      .findOne()
      .sort({ agreementId: -1 })
      .select('agreementId');
    this.agreementId = lastAgreement && (lastAgreement as any).agreementId ? (lastAgreement as any).agreementId + 1 : 1;
  }
  next();
});

export const TenancyAgreement = model<ITenancyAgreement>('TenancyAgreement', tenancyAgreementSchema);