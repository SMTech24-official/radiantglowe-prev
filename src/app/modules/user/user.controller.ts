// src/app/modules/user/user.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { userService } from './user.services';

const registerUser=catchAsync(async(req,res)=>{
    const user = req.body;
    const result = await userService.createUser(user);
    sendResponse(res, {
        status: 200,
        success: true,
        message: 'User created successfully',
        data: result,
    });
})

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.query;
  const filter: { role?: string } = {};
  
  if (role && ['admin', 'tenant', 'landlord'].includes(role as string)) {
    filter.role = role as string;
  }

  const result = await userService.getAllUser(filter);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getMe=catchAsync(async(req,res)=>{
    const userId = req.user.userId; 
    const result = await userService.getMe(userId);
    sendResponse(res, {
        status: 200,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
})

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = req.user.userId;
  const currentUserRole = req.user.role;

  // The target userId to update (if admin is updating someone else)
  const targetUserId = req.params.id || currentUserId;

  // // ✅ Only allow admins to update other users
  // if (currentUserRole !== 'admin' && currentUserId !== targetUserId) {
  //   throw new AppError(httpStatus.FORBIDDEN, 'You are not allowed to update this user');
  // }

  const updatedData = req.body;
  const result = await userService.updateUser(targetUserId, updatedData);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});


  // verify user 

  const verifyUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const { isVerified } = req.body;
    const result = await userService.verifyUser(userId, isVerified );
    sendResponse(res, {
      status: 200,
      success: true,
      message: 'User verified successfully',
      data: result,
    });
  });

  const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id
    const result = await userService.deleteUser(userId);
    sendResponse(res, {
      status: 200,
      success: true,
      message: 'User deleted successfully',
      data: result,
    });
  })

  const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id
    const result = await userService.singleUser(userId);
    sendResponse(res, {
      status: 200,
      success: true,
      message: 'User retrieved successfully',
      data: result,
    });
  })

 

export const UserController = {
    registerUser,
    getAllUser,
    getMe,
    updateUser,
    verifyUser,
    deleteUser,
    getSingleUser
    };
