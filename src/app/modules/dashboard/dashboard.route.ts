import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middleware/auth';
import isVerified from '../../middleware/isVerified';

const router = Router();

router.get('/landlord', auth('landlord'), isVerified, DashboardController.getLandlordDashboard);
router.get('/admin', auth('admin'), isVerified, DashboardController.getAdminDashboard);
router.get('/admin/earnings', auth('admin'), isVerified, DashboardController.getEarningsData);
router.get('/admin/earnings-report', auth('admin'), isVerified, DashboardController.generateEarningsReport);
router.get('/admin/landlord/:landlordId', auth('admin'), DashboardController.getLandlordDetails);

export const DashboardRoutes = router;