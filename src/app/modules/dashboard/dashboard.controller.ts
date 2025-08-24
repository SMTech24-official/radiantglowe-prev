import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { DashboardService } from './dashboard.services';
import httpStatus from 'http-status';
import { generateEarningsReportPDF } from './dashboard.utils';

const getLandlordDashboard = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user.userId;
  const dashboardData = await DashboardService.getLandlordDashboardData(landlordId);

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Landlord dashboard data retrieved successfully',
    data: dashboardData,
  });
});

const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  const dashboardData = await DashboardService.getAdminDashboardData();

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Admin dashboard data retrieved successfully',
    data: dashboardData,
  });
});

const getEarningsData = catchAsync(async (req: Request, res: Response) => {
  const earningsData = await DashboardService.getEarningsReportData();

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Earnings data retrieved successfully',
    data: earningsData,
  });
});

const generateEarningsReport = catchAsync(async (req: Request, res: Response) => {
  const reportData = await DashboardService.getEarningsReportData();
  const pdfBuffer = await generateEarningsReportPDF(reportData);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=earnings-report.pdf',
  });
  res.send(pdfBuffer);
});

const getLandlordDetails = catchAsync(async (req: Request, res: Response) => {
  const { landlordId } = req.params;
  const data = await DashboardService.getLandlordDetailsService(landlordId);

  res.status(200).json({
    success: true,
    data,
    message: 'Landlord details fetched successfully',
  });
});

export const DashboardController = {
  getLandlordDashboard,
  getAdminDashboard,
  getEarningsData,
  generateEarningsReport,
  getLandlordDetails
};