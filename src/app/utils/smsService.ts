import twilio from 'twilio';
import config from '../config';

const accountSid = config.TWILIO_ACCOUNT_SID!;
const authToken = config.TWILIO_AUTH_TOKEN!;
const fromNumber = config.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

interface SendSMSOptions {
  to: string;     
  body: string;  
}

export class SMSService {
  // Helper to sanitize number for Nigeria
  private static sanitizeNumber(to: string): string {
    let sanitized = to.replace(/[\s-]/g, ''); // remove spaces/dashes
    if (!sanitized.startsWith('+')) {
      // If number starts with 0, replace with +234
      if (sanitized.startsWith('0')) {
        sanitized = '+234' + sanitized.slice(1);
      } else {
        // Otherwise just prepend +234
        sanitized = '+234' + sanitized;
      }
    }
    return sanitized;
  }

  static async sendSMS({ to, body }: SendSMSOptions): Promise<string> {
    const sanitizedTo = this.sanitizeNumber(to);

    try {
      const message = await client.messages.create({
        body,
        from: fromNumber,
        to: '+8801757267779',
      });
      console.log(`SMS sent to ${sanitizedTo}: ${message.sid}`);
      return message.sid;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  // OTP helper
  static async sendOTP(to: string, length = 6): Promise<string> {
    const otp = Math.floor(Math.random() * 10 ** length)
      .toString()
      .padStart(length, '0');

    await this.sendSMS({ to, body: `Your OTP code is: ${otp}` });
    return otp;
  }
}
