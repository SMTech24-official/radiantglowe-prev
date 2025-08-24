import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AuthServices } from "./auth.services";
import AppError from "../../error/appError";
import { loginValidationSchema } from "./auth.validation";
import { createToken } from "../../utils/jwt";

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken, user } = result;

  res.cookie("token", result.accessToken, { 
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    domain: config.NODE_ENV === "production" ? ".simpleroomsng.com" : 'localhost',
    maxAge: 1000 * 60 * 60 * 24 * 7, 
   })
   
  res.cookie("role", result.accessToken, { 
    httpOnly: false,
    secure: config.NODE_ENV === "production",
    sameSite: "none",
    domain: config.NODE_ENV === "production" ? ".simpleroomsng.com" : 'localhost',
    maxAge: 1000 * 60 * 60 * 24 * 7, 
   })

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: {
      accessToken,
      user,
    },
  });
});

const logoutUser = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".simpleroomsng.com" : "localhost",
    path: "/", // same path as set
  });

  res.clearCookie("role", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".simpleroomsng.com" : "localhost",
    path: "/",
  });

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: null,
  });
});



const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
  }

  const token = await AuthServices.forgotPassword(email);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Reset link sent to email successfully",
    data: { token },
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;
  
  
  if (!token || !password) {
    throw new AppError(httpStatus.BAD_REQUEST, "Token and new password are required");
  }
  

  const result = await AuthServices.resetPassword(token as string, password);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.userId; // Assuming userId is available from auth middleware

  if (!oldPassword || !newPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, "Old password and new password are required");
  }

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const result = await AuthServices.changePassword(userId, oldPassword, newPassword);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const socialLogin = catchAsync(async (req, res) => {
  const result = await AuthServices.socialLogin(req.body)
  res.cookie("token", result.accessToken, { 
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, 
   })
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  })
})

export const AuthController = {
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  socialLogin,
  logoutUser
};