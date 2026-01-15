import { Resend } from "resend"

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "notifications@samochody.be"
const FROM_EMAIL = process.env.FROM_EMAIL || "Samochody.be <onboarding@resend.dev>"

interface BidNotificationParams {
  bidAmount: number
  auctionTitle: string
  auctionReference: string
  bidderName: string
  bidderEmail: string
  auctionId: string
}

export async function sendBidNotification({
  bidAmount,
  auctionTitle,
  auctionReference,
  bidderName,
  bidderEmail,
  auctionId,
}: BidNotificationParams) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const auctionUrl = `${baseUrl}/auctions/${auctionId}`

  const subject = `New Bid: ${bidAmount.toLocaleString()} PLN on ${auctionTitle}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Bid Notification</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Bid Placed!</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">Auction Details</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Vehicle:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${auctionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Reference:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${auctionReference}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Bid Amount:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #059669; font-size: 18px;">${bidAmount.toLocaleString()} PLN</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Bidder:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${bidderName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Bidder Email:</td>
              <td style="padding: 10px 0;">${bidderEmail}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; text-align: center;">
            <a href="${auctionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Auction</a>
          </div>
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">
          This is an automated notification from Samochody.be.
          <br>Time: ${new Date().toLocaleString()}
        </p>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: [NOTIFICATION_EMAIL],
      subject,
      html,
    })

    if (error) {
      console.error("Failed to send bid notification:", error)
      throw error
    }

    console.log(`Bid notification sent for auction ${auctionReference}`, data)
    return true
  } catch (error) {
    console.error("Failed to send bid notification:", error)
    throw error
  }
}

// Verification email for new users
export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`

  const subject = "Verify your email - Samochody.be"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Samochody.be!</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Thank you for registering. Please verify your email address to activate your account.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Verify Email</a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${verifyUrl}" style="color: #667eea;">${verifyUrl}</a>
        </p>

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject,
      html,
    })

    if (error) {
      console.error("Failed to send verification email:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw error
  }
}
