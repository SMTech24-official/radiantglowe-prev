import nodemailer from "nodemailer"
import config from "../config"

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false, // Use TLS, `false` ensures STARTTLS
      auth: {
        user: "94a997001@smtp-brevo.com", // Your email address
        pass: "AqNd8rGEXJWm6KVf", // Your app-specific password
      },
    })

    const mailOptions = {
      from: `"Simple Rooms " <${"info@simpleroomsng.com"}>`, // Sender's name and email
      to, // Recipient's email
      subject, // Email subject
      text: html.replace(/<[^>]+>/g, ""), // Generate plain text version by stripping HTML tags
      html,
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)

    // Log the success message
    // console.log(`Email sent: ${info.messageId}`)
    return info.messageId
  } catch (error) {
    // @ts-ignore
    console.error(`Error sending email: ${error.message}`)
    throw new Error("Failed to send email. Please try again later.")
  }
}


// 94a997001@smtp-brevo.com
// AqNd8rGEXJWm6KVf
// hello@biodebconsulting.co.uk




export const sendAdminEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false, // Use TLS, `false` ensures STARTTLS
      auth: {
        user: "94a997001@smtp-brevo.com", // Your email address
        pass: "AqNd8rGEXJWm6KVf", // Your app-specific password
      },
    })

    const mailOptions = {
      from: `"Simple Rooms " <${"admin@simpleroomsng.com"}>`,
      to: "info@simpleroomsng.com", 
      subject: subject, // Email subject
      text: html.replace(/<[^>]+>/g, ""),
      html,
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions)

    // Log the success message
    // console.log(`Email sent: ${info.messageId}`)
    return info.messageId
  } catch (error) {
    // @ts-ignore
    console.error(`Error sending email: ${error.message}`)
    throw new Error("Failed to send email. Please try again later.")
  }
}

// import nodemailer from "nodemailer"
// import config from "../config"

// export const sendEmail = async (to: string, subject: string, html: string) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: config.email, 
//         pass: config.APP_PASSWORD, 
//       },
//     })

//     const mailOptions = {
//       from: `"Simple Rooms" <${config.email}>`, // Sender's name and email
//       to, // Recipient's email
//       subject, // Email subject
//       text: html.replace(/<[^>]+>/g, ""), // Plain text version by stripping HTML tags
//       html,
//     }

//     // Send the email
//     const info = await transporter.sendMail(mailOptions)

//     return info.messageId
//   } catch (error) {
//     // @ts-ignore
//     console.error(`Error sending email: ${error.message}`)
//     throw new Error("Failed to send email. Please try again later.")
//   }
// }

