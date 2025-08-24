import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import AppError from '../error/appError';
import catchAsync from '../utils/catchAsync';

const isVerified = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById((req.user as JwtPayload).userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found!');
  }

  // if (!user.isVerified) {
  //   throw new AppError(httpStatus.FORBIDDEN, 'Your account is not verified!');
  // }

  next();
});

export default isVerified;