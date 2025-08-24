// utils/paypal.ts
import axios from "axios"
import config from "../config"

let cachedToken: string | null = null
let tokenExpiryTime: number | null = null

const getPayPalToken = async (): Promise<string> => {
  const now = Date.now()

  if (cachedToken && tokenExpiryTime && now < tokenExpiryTime) {
    return cachedToken
  }

  try {
    const response = await axios.post(
      `${config.paypal.base_url}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: config.paypal.client as string,
          password: config.paypal.secret as string,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )

    cachedToken = response.data.access_token
    tokenExpiryTime = now + 9 * 60 * 60 * 1000 // 9 hours
    return cachedToken!
  } catch (error: any) {
    console.error("❌ PayPal token fetch failed")
    console.error("client:", config.paypal.client)
    console.error("secret:", config.paypal.secret ? "***" : "❌ MISSING")
    console.error("Error response:", error?.response?.data || error.message)
    throw new Error("PayPal Auth failed. See logs.")
  }
}

export const createPayPalOrder = async (amount: string, userId: string) => {
  const accessToken = await getPayPalToken()
  const orderResponse = await axios.post(
    `${config.paypal.base_url}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
        },
      ],
      application_context: {
        return_url: `https://levelupmotorcycletraining.com/payment/payment-success?userId=${userId}`,
        cancel_url: `https://levelupmotorcycletraining.com/payment/payment-cancel`,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return {
    orderId: orderResponse.data.id,
    approvalLink: orderResponse.data.links.find(
      (link: any) => link.rel === "approve"
    )?.href,
  }
}

export const capturePayPalOrder = async (orderId: string) => {
  const accessToken = await getPayPalToken()

  const captureResponse = await axios.post(
    `${config.paypal.base_url}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return captureResponse.data
}

export const verifyPaypalPayment = async (orderId: string) => {
  const accessToken = await getPayPalToken()

  const response = await axios.get(
    `${config.paypal.base_url}/v2/checkout/orders/${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return response.data
}

export const paypalRefundPayment = async (
  captureId: string,
  amount: number
) => {
  const accessToken = await getPayPalToken()

  const response = await axios.post(
    `${config.paypal.base_url}/v2/payments/captures/${captureId}/refund`,
    {
      amount: {
        currency_code: "USD",
        value: amount.toString(),
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return response.data
}
