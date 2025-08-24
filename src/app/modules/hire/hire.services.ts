import { IHire } from './hire.interface';
import { Hire } from './hire.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { sendAdminEmail, sendEmail } from '../../utils/sendEmail';
import { emailVariable } from '../../utils/constantValue';

interface IPayload {
  name: string;
  email: string;
  phoneNumber: string;
  address: {
    state: string;
    city: string;
    town?: string;
    area?: string;
  };
  briefMessage: string;
}

const createHireRequest = async (userId: string, payload: IPayload): Promise<IHire> => {
  // if (!userId) {
  //   throw new AppError(httpStatus.UNAUTHORIZED, 'User ID is required');
  // }

  const hireRequest = await Hire.create({
    userId: userId,
    ...payload,
    status: 'open',
  });

  await sendEmail(
  payload.email,
  "Hire Request Submitted Successfully",
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Dear ${payload.name || "User"},</p>
      <p>Your hire request has been <strong>successfully submitted</strong>.</p>
      
      <h3>Request Details:</h3>
      <ul>
        <li><strong>Phone Number:</strong> ${payload.phoneNumber}</li>
        <li><strong>Address:</strong> ${payload.address.state}, ${payload.address.city}${payload.address.town ? ", " + payload.address.town : ""}${payload.address.area ? ", " + payload.address.area : ""}</li>
        <li><strong>Message:</strong> ${payload.briefMessage}</li>
      </ul>

      <p>Our team will review your request and get back to you shortly.</p>
      ${emailVariable.footer}
    </div>
  `
);

await sendAdminEmail(
  '',
  "New Hire Request Received",
  `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      ${emailVariable.headerLogo}
      <p>Hello Admin,</p>
      <p>A new hire request has been submitted by <strong>${payload.name}</strong>.</p>

      <h3>Request Details:</h3>
      <ul>
        <li><strong>Email:</strong> ${payload.email}</li>
        <li><strong>Phone Number:</strong> ${payload.phoneNumber}</li>
        <li><strong>Address:</strong> ${payload.address.state}, ${payload.address.city}${payload.address.town ? ", " + payload.address.town : ""}${payload.address.area ? ", " + payload.address.area : ""}</li>
        <li><strong>Message:</strong> ${payload.briefMessage}</li>
      </ul>

      <p>Please review and take the necessary action.</p>
      ${emailVariable.footer}
    </div>
  `
);

  return hireRequest;
};

const getAllHireRequests = async (
  filters: { status?: 'open' | 'in_progress' | 'resolved' | 'closed'; email?: string },
  page: number,
  limit: number
) => {
  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.email) query.email = { $regex: filters.email, $options: 'i' };

  const skip = (page - 1) * limit;
  const hireRequests = await Hire.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'name email role')
    .skip(skip)
    .limit(limit);
  const total = await Hire.countDocuments(query);

  return { hireRequests, total };
};

const updateHireRequestStatus = async (id: string, status: 'open' | 'in_progress' | 'resolved' | 'closed'): Promise<IHire | null> => {
  const hireRequest = await Hire.findById(id);
  if (!hireRequest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Hire request not found');
  }

  hireRequest.status = status;
  await hireRequest.save();

  return Hire.findById(id).populate('userId', 'name email role');
};

export const HireService = {
  createHireRequest,
  getAllHireRequests,
  updateHireRequestStatus,
};