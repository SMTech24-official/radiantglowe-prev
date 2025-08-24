import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { IUser, UserModel } from './user.interface';

export async function generateUID(role: string): Promise<string> {
  const prefix = rolePrefixes[role] || "U";

  const lastUser = await User.findOne({ role, uid: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;
  if (lastUser?.uid) {
    const numPart = parseInt(lastUser.uid.replace(prefix, ""), 10);
    if (!isNaN(numPart)) {
      nextNumber = numPart + 1;
    }
  }

  // tenant/landlord = 5 digit, admin = 3 digit
  const length = role === "admin" ? 3 : 5;
  return `${prefix}${String(nextNumber).padStart(length, "0")}`;
}

const rolePrefixes: Record<string, string> = {
  tenant: "T",
  landlord: "L",
  admin: "A",
};

const addressSchema = new Schema({
  flatOrHouseNo: { type: String },
  address: { type: String },
  state: { type: String },
  city: { type: String },
  town: { type: String },
  area: { type: String },
});

const guarantorSchema = new Schema({
  name: { type: String },
  telephone: { type: String },
  email: { type: String, trim: true, lowercase: true },
  profession: { type: String },
  address: { type: addressSchema },
});

const referenceSchema = new Schema({
  name: { type: String },
  telephone: { type: String },
  email: { type: String, trim: true, lowercase: true },
  profession: { type: String },
  address: { type: addressSchema },
});

const userSchema = new Schema<IUser, UserModel>(
  {
    uid: { type: String, unique: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    confirmPassword: { type: String },
    phoneNumber: { type: String, required: true },
    address: {
      type: addressSchema,
      required: function () {
        return this.role === 'landlord';
      },
    },
    role: { type: String, enum: ['landlord', 'tenant', 'admin'], default: 'tenant', required: true },
    isDeleted: { type: Boolean, default: false },
    registerBy: { type: String, enum: ['manual', 'social'], default: 'manual' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    image: { type: String },
    profileVerificationImage: { type: [String] },
    websiteUrl: { type: String },
    lookingPropertyForTenant: {
      type: [String],
      validate: {
        validator: function (value: string[]) {
          return this.role === 'tenant' || !value || value.length === 0;
        },
        message: 'lookingPropertyForTenant is only applicable for tenant role',
      },
    },
    guarantor: { type: guarantorSchema },
    references: { type: [referenceSchema] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  const user = this as any;

  // generate UID if missing
  if (!user.uid) {
    user.uid = await generateUID(user.role || 'tenant');
  }

  // hash password + confirmPassword
  if (user.isModified('password')) {
    const saltRounds = Number(config.bcryptSalt) || 12; // Default to 12 if config is invalid

    // Hash password
    if (user.password) {
      user.password = await bcrypt.hash(user.password, saltRounds);
    }

    // Hash confirmPassword only if it exists
    if (user.confirmPassword) {
      user.confirmPassword = await bcrypt.hash(user.confirmPassword, saltRounds);
    }
  }



  next();
});

userSchema.post('save', function (doc, next) {
  doc.password = '';
  doc.confirmPassword = '';
  next();
});

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<IUser, UserModel>('User', userSchema);