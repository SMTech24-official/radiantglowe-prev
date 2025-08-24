import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import AppError from "../../error/appError";
import { createToken } from "../../utils/jwt";
import { sendEmail } from "../../utils/sendEmail";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { TLoginUser } from "./auth.interface";
import { emailVariable } from "../../utils/constantValue";

const loginUser = async (payload: TLoginUser) => {
  // Validate input
  if (!payload.email || !payload.password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email and password are required");
  }

  // Check if the user exists and is not deleted
  const user = await User.findOne({ email: payload.email, isDeleted: false }).select("+password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Verify password
  const isPasswordMatched = await User.isPasswordMatched(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect password");
  }

  // Create JWT token
  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = createToken(
    jwtPayload,
    config.JWT_SECRET as string,
    config.JWT_EXPIRY as string
  );

  // Remove password from response
  user.password = undefined as unknown as string;
  user.confirmPassword = undefined as unknown as string;

  return {
    accessToken,
    user,
  };
};

const forgotPassword = async (email: string) => {
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }

  const user = await User.findOne({ email, isDeleted: false });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Create reset token with short expiry (e.g., 15 minutes)
  const resetToken = createToken(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    config.JWT_SECRET as string,
    "15m" // Short expiry for reset tokens
  );

  const resetLink = `${config.RESET_PASSWORD_LINK}?token=${resetToken}`;

  await sendEmail(
    user.email,
    "Reset Your Password",
    `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
       ${emailVariable.headerLogo}
        <p>Dear ${user.name || "User"},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetLink}" style="text-decoration: none;">
          <button style="background-color: #007BFF; color: white; padding: 10px 20px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
            Reset Password
          </button>
        </a>
        <p>This link will expire in 15 minutes. If you didn’t request this, please ignore this email.</p>
         ${emailVariable.footer}
      </div>
    `
  );

  return resetToken;
};

const resetPassword = async (token: string, password: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, "Token is required");
  }
  if (!password) {
    throw new AppError(httpStatus.BAD_REQUEST, "New password is required");
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET as string) as JwtPayload;
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }

  const user = await User.findById(decoded.userId).select("+password");

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Update password (hashing should be handled by Mongoose pre-save hook)
  user.password = password;
  await user.save();

  // Remove password from response
  user.password = undefined as unknown as string;

  await sendEmail(
    user.email,
    "Password Changed Successfully",
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Dear ${user.name || "User"},</p>
      <p>Your password has been <strong>successfully changed</strong>.</p>
      <p>If you made this change, you can safely ignore this email.</p>
      <p>If you did <strong>not</strong> change your password, please reset it immediately or contact our support team for help.</p>
      ${emailVariable.footer}
    </div>
  `
  );


  return user;
};

const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  if (!userId || !oldPassword || !newPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID, old password, and new password are required");
  }

  // Find user
  const user = await User.findById(userId).select("+password");

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Verify old password
  const isPasswordMatched = await User.isPasswordMatched(oldPassword, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect old password");
  }

  // Update password (hashing should be handled by Mongoose pre-save hook)
  user.password = newPassword;
  await user.save();

  await sendEmail(
    user.email,
    "Your Password Was Changed Successfully",
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Dear ${user.name || "User"},</p>
      <p>Your password has been changed successfully.</p>
      <p>If you made this change, no further action is needed.</p>
      <p>If you did not change your password, please reset it immediately or contact our support team.</p>
      ${emailVariable.footer}
    </div>
  `
  );

  // Remove password from response
  user.password = undefined as unknown as string;
  user.confirmPassword = undefined as unknown as string;

  return user;
};
const socialLogin = async (payload: Partial<IUser>) => {
  let user = await User.findOne({ email: payload.email }).select("-password -confirmPassword");

  // If not found, create new user
  if (!user) {
    if (!payload.role) {
      throw new AppError(httpStatus.BAD_REQUEST, "Role is required");
    }

    const defaultPassword = config.DEFAULT_PASSWORD as string;

    user = await User.create({
      email: payload.email,
      name: payload.name,
      password: defaultPassword || "12345678",
      confirmPassword: defaultPassword || "12345678",
      image: payload.image || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740",
      registerBy: "social",
      role: payload.role,
    });

    const roleSpecificMessage = payload.role === 'landlord'
      ? 'After verification, you will be able to list properties.'
      : 'After verification, you will be able to book properties.';

    await sendEmail(
      user.email,
      'Welcome to Simpleroomsng',
      `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
               ${emailVariable.headerLogo}
                <h2 style="color: #333; text-align: center;">Welcome to Simpleroomsng!</h2>
                <p style="color: #555;">Dear ${user.name},</p>
                <p style="color: #555;">Thank you for registering with us as a ${payload.role}. We are excited to have you on board!</p>
                <p style="color: #555;">Your account is currently activated and under review for account verification. ${roleSpecificMessage}</p>
                <p style="color: #555;">You will receive a confirmation email once your account has been verified. If you have any questions or need assistance, please feel free to contact our support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
                <p style="color: #555;">We look forward to helping you find or list the perfect property!</p>
                <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
              <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
              ${emailVariable.footer}
              </div>
            `
    );
  }

  // Generate access token
  const accessToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    config.JWT_SECRET as string,
    {
      expiresIn: config.JWT_EXPIRY as number,
    }
  );

  return {
    accessToken: accessToken,
    data: user,
  };
}




export const AuthServices = {
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  socialLogin
};