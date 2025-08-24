export interface ILandlordDashboard {
  totalProperties: number;
  totalBookedProperties: number;
  totalTenants: number;
  bookingOverview: { month: string; count: number }[];
}

export interface IAdminDashboard {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  totalListingProperties: number;
  totalEarnings: number;
  bookingOverview: { month: string; count: number }[];
}

export interface IEarningsReport {
  monthly: { month: string; earnings: number }[];
  yearly: { year: string; earnings: number }[];
  overall: number;
}