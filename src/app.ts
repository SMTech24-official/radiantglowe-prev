

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import http from "http";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import { AuthRoutes } from "./app/modules/auth/auth.route";
import { BookingRoutes } from "./app/modules/booking/booking.route";
import { PageRoutes } from "./app/modules/cms/page.route";
import { DashboardRoutes } from "./app/modules/dashboard/dashboard.route";
import { HireRoutes } from "./app/modules/hire/hire.route";
import { MessageRoutes } from "./app/modules/message/message.route";
import { PackageRoutes } from "./app/modules/package/package.route";
import { PermissionRoutes } from "./app/modules/permission/permission.route";
import { PropertyRoutes } from "./app/modules/property/property.route";
import { PropertyTypesRoutes } from "./app/modules/propertyElements/propertyElement.route";
import { PropertyReviewRoutes } from "./app/modules/propertyReview/propertyReview.route";
import { ChatRoutes } from "./app/modules/socket/chat.routes";
import { setupWebSocket } from "./app/modules/socket/websocket2";
import { SubscriptionRoutes } from "./app/modules/subscription/subscription.route";
import { SupportTicketRoutes } from "./app/modules/support-ticket/support-ticket.routes";
import { SupportRoutes } from "./app/modules/support/support.route";
import { UploadRoutes } from "./app/modules/uploader/uploader.route";
import { userRoutes } from "./app/modules/user/user.route";
import { TenancyAgreementRoutes } from "./app/modules/tenantcyAgreement/tenancyAgreement.route";

const app = express();
const server = http.createServer(app);

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// WebSocket setup
// const wss = new WebSocketServer({ server });

// Initialize WebSocket logic
// initializeWebSocket(wss);

setupWebSocket(server);

// Middleware setup
app.use(cors({
  origin: ["http://localhost:3000", "https://update.simpleroomsng.com","https://simpleroomsng.com","https://admin.simpleroomsng.com","https://www.admin.simpleroomsng.com","https://www.update.simpleroomsng.com","https://www.simpleroomsng.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use('/static', express.static('assets'));


// Routes
app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    statusCode: httpStatus.OK,
    message: "Welcome to Initial API!",
  });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/uploader", UploadRoutes);
app.use("/api/v1/properties", PropertyRoutes);
app.use("/api/v1/propertyElements", PropertyTypesRoutes);
app.use("/api/v1/packages", PackageRoutes);
app.use("/api/v1/subscription", SubscriptionRoutes);
app.use("/api/v1/propertyReview", PropertyReviewRoutes);
app.use('/api/v1/permissions', PermissionRoutes);
app.use('/api/v1/bookings', BookingRoutes);
app.use('/api/v1/support', SupportRoutes);
app.use('/api/v1/dashboard', DashboardRoutes);
app.use('/api/v1/chats', ChatRoutes);
app.use('/api/v1/hires', HireRoutes);
app.use('/api/v1/ticket', SupportTicketRoutes);
app.use('/api/v1/cms', PageRoutes);
app.use('/api/v1/message', MessageRoutes);
app.use('/api/v1/tenancyAgreement', TenancyAgreementRoutes);


// Error handling
app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default server;
// export default { app, server };