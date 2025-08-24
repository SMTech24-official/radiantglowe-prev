// src/app/modules/user/user.service.ts
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../error/appError';
import { emailVariable } from '../../utils/constantValue';
import { sendAdminEmail, sendEmail } from '../../utils/sendEmail';
import { IUser } from './user.interface';
import { User } from './user.model';

const createUser = async (userData: IUser): Promise<IUser> => {
    // Check if user already exists
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
    }

    // Password validation
    if (userData.password !== userData.confirmPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
    }

    // Handle social registration
    if (userData.registerBy === 'social') {
        const defaultPassword = config.DEFAULT_PASSWORD || '12345678';
        userData.password = defaultPassword; // Don't hash here, let pre-save do it
        userData.confirmPassword = defaultPassword;
    }

    const user = new User(userData);
    const savedUser = await user.save(); // This ensures pre-save hooks run properly

    // Role specific message
    const roleSpecificMessage = userData.role === 'landlord'
        ? 'After verification, you will be able to list properties.'
        : 'After verification, you will be able to book properties.';

    // Send welcome email
    await sendEmail(
        savedUser.email,
        'Welcome to Simpleroomsng',
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          ${emailVariable.headerLogo}
            <h2 style="color: #333; text-align: center;">Welcome to Simpleroomsng!</h2>
            <p style="color: #555;">Dear ${savedUser.name},</p>
            <p style="color: #555;">Thank you for registering with us as a ${userData.role}. We are excited to have you on board!</p>
            <p style="color: #555;">Your account is currently activated. Please complete your profile and apply for verification.</p>
            <p style="color: #555;">If you have any questions or need assistance, please feel free to contact our support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
            <p style="color: #555;">We look forward to helping you find or list the perfect property!</p>
            <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
           <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
           ${emailVariable.footer}
          </div>
        `
    );

    // send email to admin notification
    await sendAdminEmail(
        config.SUPPORT_EMAIL ?? 'info@simpleroomsng.com',
        'New user registration',
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
           ${emailVariable.headerLogo}
            <h2 style="color: #333; text-align: center;">New User Registration</h2>
            <p style="color: #555;">A new user has registered on the platform:</p>
            <p style="color: #555;"><strong>Name:</strong> ${savedUser.name}</p>
            <p style="color: #555;"><strong>Email:</strong> ${savedUser.email}</p>
            <p style="color: #555;"><strong>Role:</strong> ${savedUser.role}</p>
            <p style="color: #555;">Please review and verify the user's account.</p>
            <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
           <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
          ${emailVariable.footer}
          </div>
        `
    );

    return savedUser;
};

const getAllUser = async (filter: { role?: string }): Promise<IUser[]> => {
    const users = await User.find(filter).sort({ createdAt: -1 }).select('-password -confirmPassword');
    if (!users || users.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'No users found');
    }
    return users;
};

const getMe = async (userId: string): Promise<IUser | null> => {

    const user = await User.findById(userId).select('-password -confirmPassword');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
}

const updateUser = async (userId: string, userData: Partial<IUser>): Promise<IUser | null> => {
    const user = await User.findByIdAndUpdate(userId, userData, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check if profileVerificationImage is included in userData
    const hasVerificationImage = userData.profileVerificationImage && userData.profileVerificationImage.length > 0;

    // User email content
    const userEmailSubject = hasVerificationImage
        ? 'Verification Data Submitted'
        : 'Profile Updated Successfully';
    const userEmailBody = hasVerificationImage
        ? `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            ${emailVariable.headerLogo}
            <h2 style="color: #333; text-align: center;">${userEmailSubject}</h2>
            <p style="color: #555;">Dear ${user.name},</p>
            <p style="color: #555;">Thank you for submitting your verification data. We have received your profile verification images and other details. Our team will review them and get back to you very soon.</p>
            <p style="color: #555;">If you have any questions or need assistance, please feel free to contact our support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
            <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
            <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
            ${emailVariable.footer}
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            ${emailVariable.headerLogo}
            <h2 style="color: #333; text-align: center;">${userEmailSubject}</h2>
            <p style="color: #555;">Dear ${user.name},</p>
            <p style="color: #555;">Your profile has been successfully updated. You can now continue to explore or list properties on Simpleroomsng.</p>
            <p style="color: #555;">If you have any questions or need assistance, please feel free to contact our support team at <a href="mailto:${config.SUPPORT_EMAIL}" style="color: #007BFF;">${config.SUPPORT_EMAIL}</a>.</p>
            <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
            <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
            ${emailVariable.footer}
          </div>
        `;

    // Send email to user
    await sendEmail(user.email, userEmailSubject, userEmailBody);

    // Admin email content (sent only if profileVerificationImage is included or other data is updated)
    if (hasVerificationImage) {
        const adminEmailBody = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            ${emailVariable.headerLogo}
            <h2 style="color: #333; text-align: center;">New Verification Data Submitted</h2>
            <p style="color: #555;">Dear Admin,</p>
            <p style="color: #555;">A user (${user.name}, ${user.email}) has submitted new verification data, including profile verification images. Please review the submitted details in the admin panel.</p>
            <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
            <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
            ${emailVariable.footer}
          </div>
        `;
        // Send email to admin (Assuming config.ADMIN_EMAIL contains the admin email address)
        await sendAdminEmail('', 'New Verification Data Submission', adminEmailBody);
    } else {
        const adminEmailBody = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            ${emailVariable.headerLogo}
            <h2 style="color: #333; text-align: center;">User Profile Updated</h2>
            <p style="color: #555;">Dear Admin,</p>
            <p style="color: #555;">A user (${user.name}, ${user.email}) has updated their profile details. Please review the changes in the admin panel if necessary.</p>
            <p style="color: #555;">Best regards,<br>${emailVariable.regards}</p>
            <hr style="border-top: 1px solid #e0e0e0; margin: 20px 0;">
            ${emailVariable.footer}
          </div>
        `;
        // Send email to admin
        await sendAdminEmail('', 'User Profile Update Notification', adminEmailBody);
    }

    return user;
};

// verify user

const verifyUser = async (userId: string, isVerified: boolean): Promise<IUser | null> => {
    const user = await User.findByIdAndUpdate(userId, { isVerified }, { new: true });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
}

const deleteUser = async (userId: string): Promise<IUser | null> => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
}
const singleUser = async (userId: string): Promise<IUser | null> => {
    const user = await User.findById(userId).select('-password -confirmPassword');
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
}


export const userService = {
    createUser,
    getAllUser,
    getMe,
    updateUser,
    verifyUser,
    deleteUser,
    singleUser
};
