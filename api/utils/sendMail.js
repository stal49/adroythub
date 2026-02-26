// require("dotenv").config();
// const nodemailer = require("nodemailer");
// const ejs = require("ejs");
// const path = require("path");

// // Send Email Function
// const sendMail = async ({ email, subject, template, data }) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || "587", 10),
//       service: process.env.SMTP_SERVICE || undefined,
//       auth: {
//         user: process.env.SMTP_MAIL,
//         pass: process.env.SMTP_PASSWORD,
//       },
//     });

//     // Resolve path for the EJS template
//     const templatePath = path.join(__dirname, "../mails", template);

//     // Render the email template with EJS
//     const html = await ejs.renderFile(templatePath, data);

//     // Email options
//     const mailOptions = {
//       from: process.env.SMTP_MAIL,
//       to: email,
//       subject,
//       html,
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfully to ${email}`);
//   } catch (error) {
//     console.error("Error sending email:", error.message);
//     throw new Error("Email sending failed");
//   }
// };

// module.exports = sendMail;


// sendMail.js
require('dotenv').config();
const mailjet = require('node-mailjet');
const nodemailer = require("nodemailer");
const ejs = require('ejs'); // Import EJS for template rendering
const path = require('path'); // Import Path for file paths

const sendMail = async ({ email, subject, template, data }) => {
  try {
    const html = await ejs.renderFile(
      path.join(process.cwd(), "api/mails", template),
      data
    );

    const client = mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    );

    const response = await client
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: "pratikbelote77@gmail.com",
              Name: "AdroytHub"
            },
            To: [
              {
                Email: email,
                Name: data.user.name
              }
            ],
            Subject: subject,
            HTMLPart: html
          }
        ]
      });

    console.log("Email sent successfully:", response.body);
    return response.body;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Email sending failed");
  }
};

const sendMailCalmchase = async ({ email, subject, template, data }) => {
  try {
    const html = await ejs.renderFile(
      path.join(process.cwd(), "api/mails", template),
      data
    );

    const client = mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    );

    const response = await client
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: "pratikbelote77@gmail.com",
              Name: "Calm Chase"
            },
            To: [
              {
                Email: email,
                Name: data.user.name
              }
            ],
            Subject: subject,
            HTMLPart: html
          }
        ]
      });

    console.log("Email sent successfully:", response.body);
    return response.body;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Email sending failed");
  }
};

const sendQuoteEmail = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const {
      name,
      email,
      phone,
      address,
      city,
      zipCode,
      propertyType,
      serviceType,
      sqFootage,
      message
    } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Five Rivers Quotes" <${process.env.SMTP_MAIL}>`,
      to: 'fiveriversductcleaning@gmail.com',
      subject: "New Quote Request from Website",
      text: `
        New Quote Request
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Address: ${address}
        City: ${city}
        ZIP Code: ${zipCode}
        Property Type: ${propertyType}
        Service Needed: ${serviceType}
        Approximate Square Footage: ${sqFootage}
        ${message ? `Additional Message: ${message}` : ""}
      `
    };

    console.log("Mail options:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent info:", info);

    res.status(200).json({ success: true, message: "Quote sent successfully." });
  } catch (error) {
    console.error("Error sending quote email:", error);
    res.status(500).json({ success: false, message: "Failed to send quote." });
  }
};

const sendFeedbackEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Feedback Form" <${process.env.SMTP_MAIL}>`,
      to: 'feedback@calmchase.com', // or your desired feedback recipient
      subject: "New Feedback Submission",
      text: `
        You've received new feedback:

        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Feedback email sent:", info.messageId);

    res.status(200).json({ success: true, message: "Feedback sent successfully." });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    res.status(500).json({ success: false, message: "Failed to send feedback." });
  }
};

const sendResonanceContactEmail = async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Feedback Form" <${process.env.SMTP_MAIL}>`,
      to: 'apply.theresonance@gmail.com',
      subject: "New Feedback Submission",
      text: `
        You've received new feedback:

        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        
        Message:
        ${message}
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Feedback email sent:", info.messageId);

    res.status(200).json({ success: true, message: "Feedback sent successfully." });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    res.status(500).json({ success: false, message: "Failed to send feedback." });
  }
};

// Export both functions in CommonJS format
module.exports = {
  sendMail,
  sendMailCalmchase,
  sendQuoteEmail,
  sendFeedbackEmail,
  sendResonanceContactEmail
};