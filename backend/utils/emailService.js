import nodemailer from "nodemailer";

// Create transporter (Gmail SMTP — use SendGrid/AWS SES in production)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,  // Use App Password for Gmail
    },
  });
};

const fromAddress = `"LiftLink" <${process.env.EMAIL_FROM}>`;

// ─── Email Templates ─────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0a192f; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #0d2137; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #001433, #0d1b2a); padding: 2rem; text-align: center; border-bottom: 2px solid #d4af37; }
    .header h1 { color: #f8e3a1; margin: 0; font-size: 1.8rem; }
    .header p { color: rgba(255,255,255,0.5); margin: 0.5rem 0 0; }
    .body { padding: 2rem; color: #e0e0e0; line-height: 1.6; }
    .body h2 { color: #f8e3a1; }
    .btn { display: inline-block; padding: 0.85rem 2rem; background: linear-gradient(135deg, #d4af37, #f8e3a1); color: #0a192f; border-radius: 8px; text-decoration: none; font-weight: 700; margin: 1.5rem 0; }
    .footer { background: #001433; padding: 1.5rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.8rem; border-top: 1px solid rgba(212,175,55,0.15); }
    .highlight { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 1rem 1.25rem; margin: 1rem 0; }
    .status { display: inline-block; padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
  </style>
</head>
<body>
  <div style="padding: 2rem;">
    <div class="wrapper">
      <div class="header">
        <h1>🏢 LiftLink</h1>
        <p>Connecting You with Elevator Excellence</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">© 2025 LiftLink. All rights reserved. | Nashik, Maharashtra, India</div>
    </div>
  </div>
</body>
</html>
`;

// ─── Email Senders ────────────────────────────────────────────────────────────

export const sendWelcomeEmail = async (to, name, role = "user") => {
  const dashboardLink = role === "vendor"
    ? `${process.env.CLIENT_URL}/loginvendor`
    : `${process.env.CLIENT_URL}/login`;

  const html = baseTemplate(`
    <h2>Welcome to LiftLink, ${name}! 🎉</h2>
    <p>Your ${role} account has been created successfully. You're now part of India's leading elevator service platform.</p>
    <div class="highlight">
      <strong>Your Account:</strong> ${to}<br/>
      <strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}
    </div>
    <p>${role === "vendor" ? "Complete your company profile to start receiving inquiries from potential clients." : "Browse verified elevator companies and send inquiries directly."}</p>
    <a href="${dashboardLink}" class="btn">Get Started →</a>
    <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">If you didn't create this account, please ignore this email.</p>
  `);

  await createTransporter().sendMail({
    from: fromAddress,
    to,
    subject: `Welcome to LiftLink, ${name}!`,
    html,
  });
};

export const sendPasswordResetEmail = async (to, name, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = baseTemplate(`
    <h2>Password Reset Request</h2>
    <p>Hi ${name}, we received a request to reset your LiftLink password.</p>
    <div class="highlight">
      This reset link will expire in <strong>1 hour</strong>.
    </div>
    <a href="${resetUrl}" class="btn">Reset My Password →</a>
    <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">If you didn't request this, your account is safe — simply ignore this email.</p>
    <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem; word-break: break-all;">Or copy this URL: ${resetUrl}</p>
  `);

  await createTransporter().sendMail({
    from: fromAddress,
    to,
    subject: "Reset Your LiftLink Password",
    html,
  });
};

export const sendInquiryNotification = async ({ vendorEmail, vendorName, userName, userEmail, message, companyName }) => {
  const html = baseTemplate(`
    <h2>📩 New Inquiry Received</h2>
    <p>Hi ${vendorName}, you have a new inquiry on your LiftLink profile for <strong>${companyName}</strong>.</p>
    <div class="highlight">
      <strong>From:</strong> ${userName} (${userEmail})<br/>
      <strong>Message:</strong><br/>
      <p style="color: #ccc; font-style: italic; margin: 0.5rem 0 0;">"${message}"</p>
    </div>
    <a href="${process.env.CLIENT_URL}/vendorDashboard/inquiries" class="btn">View Inquiry →</a>
    <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">Reply directly to the user at: <a href="mailto:${userEmail}" style="color: #d4af37;">${userEmail}</a></p>
  `);

  await createTransporter().sendMail({
    from: fromAddress,
    to: vendorEmail,
    subject: `New Inquiry from ${userName} — LiftLink`,
    html,
  });
};

export const sendQuoteNotification = async ({ vendorEmail, vendorName, companyName, userName, liftType, description }) => {
  const html = baseTemplate(`
    <h2>📋 New Quote Request</h2>
    <p>Hi ${vendorName}, <strong>${userName}</strong> has requested a quotation from <strong>${companyName}</strong>.</p>
    <div class="highlight">
      <strong>Lift Type:</strong> ${liftType}<br/>
      <strong>Details:</strong> ${description}
    </div>
    <a href="${process.env.CLIENT_URL}/vendorDashboard/quotes" class="btn">View Quote Request →</a>
  `);

  await createTransporter().sendMail({
    from: fromAddress,
    to: vendorEmail,
    subject: `New Quote Request — LiftLink`,
    html,
  });
};

export const sendQuoteStatusUpdate = async ({ userEmail, userName, companyName, status, vendorResponse }) => {
  const statusColors = {
    accepted: "#6ef08a",
    rejected: "#ff6b6b",
    info_requested: "#f8e3a1",
    completed: "#6ef08a",
    contacted: "#64b5f6",
  };

  const html = baseTemplate(`
    <h2>📋 Quote Status Updated</h2>
    <p>Hi ${userName}, your quote request to <strong>${companyName}</strong> has been updated.</p>
    <div class="highlight">
      <strong>New Status:</strong>
      <span class="status" style="background: rgba(255,255,255,0.1); color: ${statusColors[status] || "#f8e3a1"};">
        ${status.replace(/_/g, " ").toUpperCase()}
      </span>
      ${vendorResponse ? `<br/><br/><strong>Vendor Message:</strong><br/><p style="color: #ccc; font-style: italic;">"${vendorResponse}"</p>` : ""}
    </div>
    <a href="${process.env.CLIENT_URL}/userDashboard/quotes" class="btn">View Quote Details →</a>
  `);

  await createTransporter().sendMail({
    from: fromAddress,
    to: userEmail,
    subject: `Your LiftLink Quote has been ${status.replace(/_/g, " ")}`,
    html,
  });
};

export const sendVendorApprovalEmail = async (vendorEmail, companyName, approved) => {
  const html = baseTemplate(approved
    ? `
        <h2>🎉 Your Company Has Been Verified!</h2>
        <p>Congratulations! <strong>${companyName}</strong> has been approved and verified on LiftLink.</p>
        <div class="highlight">
          Your company profile is now live and visible to thousands of potential clients. A verification badge has been added to your profile.
        </div>
        <a href="${process.env.CLIENT_URL}/vendorDashboard" class="btn">View Your Dashboard →</a>
      `
    : `
        <h2>Company Verification Update</h2>
        <p>Your verification request for <strong>${companyName}</strong> on LiftLink requires additional review.</p>
        <div class="highlight">
          Please ensure your company registration documents are accurate and up to date. Contact us if you have questions.
        </div>
        <a href="mailto:liftlink@gmail.com" class="btn">Contact Support →</a>
      `
  );

  await createTransporter().sendMail({
    from: fromAddress,
    to: vendorEmail,
    subject: approved ? `✅ ${companyName} is now verified on LiftLink!` : `LiftLink Verification Update for ${companyName}`,
    html,
  });
};

// Safe wrapper — logs error but doesn't throw (email failure shouldn't break API)
export const sendEmailSafe = async (emailFn, ...args) => {
  try {
    await emailFn(...args);
  } catch (err) {
    console.error("[Email] Failed to send:", err.message);
  }
};
