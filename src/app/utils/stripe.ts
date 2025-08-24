// import Stripe from "stripe"
// import AppError from "../error/appError"
// import httpStatus from "http-status"
// import config from "../config"

// // Initialize Stripe
// const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
//   apiVersion: "2025-03-31.basil",
// })

// // Create Checkout Session
// export const createStripeCheckoutSession = async ({
//   courseId,
//   courseName,
//   coursePrice,
//   userId,
// }: {
//   courseId: string
//   courseName: string
//   coursePrice: number
//   userId: string
// }) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: { name: courseName },
//             unit_amount: Math.round(coursePrice * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: { userId, courseId },
//       // success_url: `http://localhost:3000/payment/payment-success?userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
//       // cancel_url: `http://localhost:3000/payment-cancelled`,
//       success_url: `https://levelupmotorcycletraining.com/payment/payment-success?userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `https://levelupmotorcycletraining.com/payment/payment-cancel`,
//     })

//     return session
//   } catch (error: any) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       error.message || "Failed to create Stripe Checkout session"
//     )
//   }
// }

// export const retrieveStripeCheckoutSession = async (sessionId: string) => {
//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId)
//     if (!session) {
//       throw new AppError(httpStatus.NOT_FOUND, "Session not found")
//     }
//     if (session.payment_status !== "paid") {
//       throw new AppError(httpStatus.BAD_REQUEST, "Payment not completed")
//     }
//     return session
//   } catch (error: any) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       error.message || "Failed to retrieve Stripe session"
//     )
//   }
// }

// export const stripeRefundPayment = async (paymentIntentId: string) => {
//   try {
//     const refund = await stripe.refunds.create({
//       payment_intent: paymentIntentId,
//     })

//     if (refund.status !== "succeeded") {
//       throw new Error("Stripe refund did not succeed")
//     }

//     return refund
//   } catch (error: any) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       error.message || "Stripe refund failed"
//     )
//   }
// }
