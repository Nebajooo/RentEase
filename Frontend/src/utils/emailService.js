const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const templates = {
  verification: (name, token) => ({
    subject: "Verify Your Email - RentEase",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Email</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #3B82F6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RentEase!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for registering with RentEase! Please verify your email address to get started.</p>
            <p>Click the button below to verify your email:</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/verify-email/${token}" class="button">Verify Email</a>
            </div>
            <p>Or copy and paste this link: <br> ${process.env.FRONTEND_URL}/verify-email/${token}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with RentEase, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
            <p>Find your perfect home with RentEase</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: (name, role) => ({
    subject: "Welcome to RentEase!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to RentEase</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .feature { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RentEase, ${name}!</h1>
          </div>
          <div class="content">
            <p>We're excited to have you on board as a ${role}!</p>
            <h3>Here's what you can do with RentEase:</h3>
            ${
              role === "landlord"
                ? `
              <div class="feature">
                <strong>🏠 List Your Properties</strong>
                <p>Showcase your properties to thousands of potential tenants</p>
              </div>
              <div class="feature">
                <strong>📊 Manage Bookings</strong>
                <p>Track and manage all your rental requests in one place</p>
              </div>
              <div class="feature">
                <strong>💰 Track Earnings</strong>
                <p>Monitor your rental income and property performance</p>
              </div>
            `
                : `
              <div class="feature">
                <strong>🔍 Search Properties</strong>
                <p>Find your perfect home with our advanced search</p>
              </div>
              <div class="feature">
                <strong>📅 Easy Booking</strong>
                <p>Book properties with just a few clicks</p>
              </div>
              <div class="feature">
                <strong>⭐ Leave Reviews</strong>
                <p>Share your experience and help others</p>
              </div>
            `
            }
            <p>Get started by logging into your account and exploring the platform!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  resetPassword: (name, token) => ({
    subject: "Reset Your Password - RentEase",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Password</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #EF4444; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning { background: #FEF3C7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password for your RentEase account.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/reset-password/${token}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link: <br> ${process.env.FRONTEND_URL}/reset-password/${token}</p>
            <div class="warning">
              <strong>⚠️ Security Note:</strong> This link will expire in 10 minutes. If you didn't request this, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  bookingRequest: (tenantName, landlordName, propertyTitle, bookingId) => ({
    subject: `New Booking Request: ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>New Booking Request</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #3B82F6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 10px;
          }
          .button-secondary {
            background: #6B7280;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Request!</h1>
          </div>
          <div class="content">
            <h2>Hello ${landlordName},</h2>
            <p><strong>${tenantName}</strong> has requested to book your property.</p>
            
            <div class="info-box">
              <h3>Property Details:</h3>
              <p><strong>🏠 Property:</strong> ${propertyTitle}</p>
              <p><strong>👤 Tenant:</strong> ${tenantName}</p>
            </div>

            <p>Please review the request and take action:</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/landlord/booking-requests" class="button">View Request</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  bookingApproved: (tenantName, landlordName, propertyTitle, startDate) => ({
    subject: `Booking Approved: ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Booking Approved</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #10B981; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Approved! 🎉</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${tenantName}!</h2>
            <p>Great news! <strong>${landlordName}</strong> has approved your booking request.</p>
            
            <div class="info-box">
              <h3>Booking Details:</h3>
              <p><strong>🏠 Property:</strong> ${propertyTitle}</p>
              <p><strong>📅 Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
            </div>

            <p>Next steps:</p>
            <ol>
              <li>Complete the payment to secure your booking</li>
              <li>Review and sign the lease agreement</li>
              <li>Prepare for your move-in</li>
            </ol>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/tenant/bookings" class="button">View My Bookings</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  bookingRejected: (tenantName, landlordName, propertyTitle, reason) => ({
    subject: `Booking Update: ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Booking Update</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .info-box { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .reason-box { background: #FEF2F2; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #3B82F6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${tenantName},</h2>
            <p>We have an update regarding your booking request for <strong>${propertyTitle}</strong>.</p>
            
            <div class="reason-box">
              <p><strong>Status:</strong> Not Approved</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            </div>

            <p>Don't worry! There are many other great properties available. Keep exploring!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/properties" class="button">Browse More Properties</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentConfirmation: (name, propertyTitle, amount, bookingId) => ({
    subject: `Payment Confirmation - ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #10B981; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Thank you, ${name}!</h2>
            <p>Your payment has been successfully processed.</p>
            
            <div class="payment-details">
              <h3>Payment Details:</h3>
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p><strong>Amount Paid:</strong> <span class="amount">$${amount.toLocaleString()}</span></p>
              <p><strong>Booking ID:</strong> ${bookingId}</p>
            </div>

            <p>Your booking is now confirmed! You can view all details in your dashboard.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/tenant/bookings/${bookingId}" class="button">View Booking</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  newReview: (landlordName, tenantName, propertyTitle, rating, comment) => ({
    subject: `New Review for ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>New Review Received</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .review-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .rating { color: #F59E0B; font-size: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #F59E0B; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Review!</h1>
          </div>
          <div class="content">
            <h2>Hello ${landlordName},</h2>
            <p><strong>${tenantName}</strong> has left a review for your property.</p>
            
            <div class="review-box">
              <h3>${propertyTitle}</h3>
              <div class="rating">
                ${"★".repeat(rating)}${"☆".repeat(5 - rating)}
              </div>
              <p><strong>Rating:</strong> ${rating}/5</p>
              <p><strong>Comment:</strong> "${comment}"</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/landlord/properties" class="button">Respond to Review</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  kycApproved: (name) => ({
    subject: "KYC Verification Approved",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>KYC Approved</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .success-box { background: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KYC Verification Approved!</h1>
          </div>
          <div class="content">
            <div class="success-box">
              <h2>Congratulations ${name}! 🎉</h2>
              <p>Your KYC verification has been approved.</p>
            </div>
            <p>You now have access to all landlord features:</p>
            <ul>
              <li>✅ List unlimited properties</li>
              <li>✅ Verified badge on your profile</li>
              <li>✅ Priority support</li>
              <li>✅ Higher visibility in search results</li>
            </ul>
            <p>Start listing your properties and connect with tenants today!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  kycRejected: (name, reason) => ({
    subject: "KYC Verification Update",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>KYC Update</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .info-box { background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #3B82F6; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KYC Verification Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <div class="info-box">
              <p><strong>Status:</strong> Not Approved</p>
              <p><strong>Reason:</strong> ${reason || "Please provide clearer documentation"}</p>
            </div>
            <p>Please review the requirements and resubmit your KYC documents.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/profile" class="button">Resubmit KYC</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  reminderPayment: (name, propertyTitle, amount, dueDate) => ({
    subject: `Payment Reminder: ${propertyTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Reminder</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .reminder-box { background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #F59E0B; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <div class="reminder-box">
              <p><strong>Property:</strong> ${propertyTitle}</p>
              <p><strong>Amount Due:</strong> $${amount.toLocaleString()}</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>
            <p>Please make sure to complete your payment before the due date.</p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/tenant/payments" class="button">Make Payment</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 RentEase. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Main send email function
const sendEmail = async ({ email, subject, html }) => {
  try {
    const mailOptions = {
      from: `"RentEase" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Specific email functions
const sendVerificationEmail = async (user, token) => {
  const template = templates.verification(user.name, token);
  return await sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendWelcomeEmail = async (user) => {
  const template = templates.welcome(user.name, user.role);
  return await sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const template = templates.resetPassword(user.name, token);
  return await sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendBookingRequestEmail = async (booking) => {
  const template = templates.bookingRequest(
    booking.tenant.name,
    booking.landlord.name,
    booking.property.title,
    booking._id,
  );
  return await sendEmail({
    email: booking.landlord.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendBookingApprovedEmail = async (booking) => {
  const template = templates.bookingApproved(
    booking.tenant.name,
    booking.landlord.name,
    booking.property.title,
    booking.startDate,
  );
  return await sendEmail({
    email: booking.tenant.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendBookingRejectedEmail = async (booking, reason) => {
  const template = templates.bookingRejected(
    booking.tenant.name,
    booking.landlord.name,
    booking.property.title,
    reason,
  );
  return await sendEmail({
    email: booking.tenant.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendPaymentConfirmationEmail = async (booking, amount) => {
  const template = templates.paymentConfirmation(
    booking.tenant.name,
    booking.property.title,
    amount,
    booking._id,
  );
  return await sendEmail({
    email: booking.tenant.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendReviewNotificationEmail = async (review) => {
  const template = templates.newReview(
    review.landlord.name,
    review.tenant.name,
    review.property.title,
    review.rating,
    review.comment,
  );
  return await sendEmail({
    email: review.landlord.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendKYCStatusEmail = async (user, status, reason = null) => {
  let template;
  if (status === "approved") {
    template = templates.kycApproved(user.name);
  } else {
    template = templates.kycRejected(user.name, reason);
  }
  return await sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html,
  });
};

const sendPaymentReminderEmail = async (booking, amount, dueDate) => {
  const template = templates.reminderPayment(
    booking.tenant.name,
    booking.property.title,
    amount,
    dueDate,
  );
  return await sendEmail({
    email: booking.tenant.email,
    subject: template.subject,
    html: template.html,
  });
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookingRequestEmail,
  sendBookingApprovedEmail,
  sendBookingRejectedEmail,
  sendPaymentConfirmationEmail,
  sendReviewNotificationEmail,
  sendKYCStatusEmail,
  sendPaymentReminderEmail,
  sendEmail,
};
