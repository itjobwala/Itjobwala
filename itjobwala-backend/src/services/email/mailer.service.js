/**
 * Mailer service — single module that owns all nodemailer interaction.
 * Swap the transporter config here to change SMTP provider without touching callers.
 */

import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

const transporter = nodemailer.createTransport({
  host:       env.email.host,
  port:       env.email.port,
  secure:     env.email.secure,
  requireTLS: !env.email.secure, // enforce STARTTLS upgrade on port 587
  auth: {
    user: env.email.user,
    pass: env.email.pass,
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed/Hostinger intermediate certs
  },
});

console.log('[mailer] transporter config — host:%s port:%d secure:%s',
  env.email.host, env.email.port, env.email.secure);

export async function sendOtpEmail({ to, otp, name }) {
  const greeting = name || 'there';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;margin:0">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;padding:36px">
    <h2 style="color:#2563eb;margin-top:0;margin-bottom:24px">ITJobwala</h2>
    <p style="margin-top:0">Hi ${greeting},</p>
    <p>Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
    <div style="text-align:center;padding:20px 0">
      <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#2563eb">${otp}</span>
    </div>
    <p style="color:#6b7280;font-size:13px">
      If you did not create an account on ITJobwala, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;margin:0">— The ITJobwala Team</p>
  </div>
</body>
</html>`;

  const text = `Hi ${greeting},\n\nYour ITJobwala verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not create an account on ITJobwala, you can safely ignore this email.\n\n— The ITJobwala Team`;

  const response =await transporter.sendMail({
    from:    env.email.from,
    to,
    subject: `${otp} is your ITJobwala verification code`,
    text,
    html,
  });
  console.log("response--->",response, env.email.from)
}

/**
 * Send an interview invitation or reschedule email to the candidate.
 * Soft-fail: logs errors but never throws — scheduling must never be blocked by email.
 */
export async function sendInterviewEmail({ to, name, jobTitle, scheduledAt, type, meetingLink, location, note, isReschedule }) {
  const greeting  = name || 'there';
  const action    = isReschedule ? 'Rescheduled' : 'Scheduled';
  const subject   = `${action}: Interview for "${jobTitle}" – ITJobwala`;
  const typeLabel = type === 'video' ? 'Video Call' : type === 'phone' ? 'Phone Call' : 'In-Person Interview';

  const interviewDate = new Date(scheduledAt).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  });

  const locationLine = location
    ? `<p style="margin:4px 0 0"><strong>Location:</strong> ${location}</p>`
    : '';
  const meetingLine = meetingLink
    ? `<p style="margin:4px 0 0"><strong>Join:</strong> <a href="${meetingLink}" style="color:#2563eb">${meetingLink}</a></p>`
    : '';
  const noteLine = note
    ? `<div style="margin-top:16px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px"><p style="margin:0;font-size:13px;color:#92400e"><strong>Note from recruiter:</strong> ${note}</p></div>`
    : '';
  const rescheduleNote = isReschedule
    ? `<p style="margin-bottom:16px;color:#6b7280;font-size:14px">Your interview has been <strong>rescheduled</strong>. The new details are below.</p>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:36px">
    <h2 style="color:#2563eb;margin-top:0;margin-bottom:24px">ITJobwala</h2>
    <p style="margin-top:0">Hi ${greeting},</p>
    ${rescheduleNote}
    <p>Your interview for the position of <strong>${jobTitle}</strong> has been ${isReschedule ? 'rescheduled' : 'scheduled'}.</p>
    <div style="background:#f0f5ff;border:1px solid #c7d7fe;border-radius:8px;padding:16px 20px;margin:20px 0">
      <p style="margin:0 0 4px"><strong>Date &amp; Time:</strong> ${interviewDate} IST</p>
      <p style="margin:4px 0 0"><strong>Type:</strong> ${typeLabel}</p>
      ${meetingLine}
      ${locationLine}
    </div>
    ${noteLine}
    <p style="margin-top:20px">You can view full details on your <a href="/candidate/applications" style="color:#2563eb">applications page</a>.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;margin:0">— The ITJobwala Team</p>
  </div>
</body>
</html>`;

  const text = `Hi ${greeting},\n\nYour interview for "${jobTitle}" has been ${isReschedule ? 'rescheduled' : 'scheduled'}.\n\nDate & Time: ${interviewDate} IST\nType: ${typeLabel}${meetingLink ? `\nJoin: ${meetingLink}` : ''}${location ? `\nLocation: ${location}` : ''}${note ? `\n\nNote: ${note}` : ''}\n\nView details: /candidate/applications\n\n— The ITJobwala Team`;

  try {
    await transporter.sendMail({ from: env.email.from, to, subject, text, html });
  } catch (err) {
    console.error('[mailer] sendInterviewEmail failed:', err?.message ?? err);
  }
}

/**
 * Send a brief interview cancellation email to the candidate.
 * Soft-fail: never throws.
 */
export async function sendInterviewCancelEmail({ to, name, jobTitle, scheduledAt }) {
  const greeting = name || 'there';
  const interviewDate = scheduledAt
    ? new Date(scheduledAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
      })
    : null;

  const dateNote = interviewDate
    ? `<p>Your interview scheduled for <strong>${interviewDate} IST</strong> has been cancelled by the recruiter.</p>`
    : `<p>Your scheduled interview for <strong>${jobTitle}</strong> has been cancelled by the recruiter.</p>`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:36px">
    <h2 style="color:#2563eb;margin-top:0;margin-bottom:24px">ITJobwala</h2>
    <p style="margin-top:0">Hi ${greeting},</p>
    ${dateNote}
    <p>The recruiter may reach out to reschedule. You can check your application status at any time on your <a href="/candidate/applications" style="color:#2563eb">applications page</a>.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;margin:0">— The ITJobwala Team</p>
  </div>
</body>
</html>`;

  const text = `Hi ${greeting},\n\nYour interview for "${jobTitle}"${interviewDate ? ` scheduled for ${interviewDate} IST` : ''} has been cancelled by the recruiter.\n\nThe recruiter may reach out to reschedule. Check your application: /candidate/applications\n\n— The ITJobwala Team`;

  try {
    await transporter.sendMail({ from: env.email.from, to, subject: `Interview Cancelled: "${jobTitle}" – ITJobwala`, text, html });
  } catch (err) {
    console.error('[mailer] sendInterviewCancelEmail failed:', err?.message ?? err);
  }
}

/**
 * Send a status-change notification to the candidate when a recruiter moves their application
 * to shortlisted, hired, or rejected (optionally interview — see SEND_INTERVIEW_ADVANCE_EMAIL).
 * Soft-fail: logs errors but never throws — status changes must never be blocked by email.
 */
export async function sendApplicationStatusEmail({ to, name, jobTitle, companyName, newStatus, applicationUrl }) {
  const greeting = name   || 'there';
  const company  = companyName || 'the company';
  const appLink  = applicationUrl || '/candidate/applications';

  const STATUS_CONFIG = {
    shortlisted: {
      subject:   `Good news: your application for "${jobTitle}" has been shortlisted – ITJobwala`,
      headline:  "You've been shortlisted!",
      hColor:    '#2563eb',
      body:      `Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been shortlisted. The team is reviewing your profile and may reach out about next steps.`,
    },
    interview: {
      subject:   `You've advanced to the interview stage for "${jobTitle}" – ITJobwala`,
      headline:  "You're moving to the interview stage!",
      hColor:    '#d97706',
      body:      `You've advanced to the interview stage for <strong>${jobTitle}</strong> at <strong>${company}</strong>. Scheduling details will follow shortly.`,
    },
    hired: {
      subject:   `Congratulations! You've been selected for "${jobTitle}" – ITJobwala`,
      headline:  "Congratulations — you're hired! 🎉",
      hColor:    '#16a34a',
      body:      `You've been selected for <strong>${jobTitle}</strong> at <strong>${company}</strong>. This is a wonderful milestone. Check your application page for any next steps.`,
    },
    rejected: {
      subject:   `Your application for "${jobTitle}" at ${company} – ITJobwala`,
      headline:  'Thank you for applying',
      hColor:    '#374151',
      body:      `Thank you for your interest in <strong>${jobTitle}</strong> at <strong>${company}</strong>. After careful consideration, the team has decided to move forward with other candidates. We encourage you to keep applying — the right opportunity is out there.`,
    },
  };

  const cfg = STATUS_CONFIG[newStatus];
  if (!cfg) return; // unsupported status — nothing to send

  const TEXT = {
    shortlisted: `Hi ${greeting},\n\nGood news! Your application for "${jobTitle}" at ${company} has been shortlisted. The team is reviewing your profile and may reach out about next steps.\n\nView your application: ${appLink}\n\n— The ITJobwala Team`,
    interview:   `Hi ${greeting},\n\nGreat news! You've advanced to the interview stage for "${jobTitle}" at ${company}. Scheduling details will follow shortly.\n\nView your application: ${appLink}\n\n— The ITJobwala Team`,
    hired:       `Hi ${greeting},\n\nCongratulations! You've been selected for "${jobTitle}" at ${company}. This is a wonderful milestone. Check your application page for any next steps.\n\nView your application: ${appLink}\n\n— The ITJobwala Team`,
    rejected:    `Hi ${greeting},\n\nThank you for your interest in "${jobTitle}" at ${company}. After careful consideration, the team has decided to move forward with other candidates. We encourage you to keep applying — the right opportunity is out there.\n\nView your application: ${appLink}\n\n— The ITJobwala Team`,
  };

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:36px">
    <h2 style="color:#2563eb;margin-top:0;margin-bottom:24px">ITJobwala</h2>
    <p style="margin-top:0">Hi ${greeting},</p>
    <p style="font-size:17px;font-weight:bold;color:${cfg.hColor};margin-bottom:16px">${cfg.headline}</p>
    <p style="color:#374151;line-height:1.6">${cfg.body}</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${appLink}"
         style="display:inline-block;padding:12px 28px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px">
        View Your Application
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;margin:0">— The ITJobwala Team</p>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({ from: env.email.from, to, subject: cfg.subject, text: TEXT[newStatus], html });
  } catch (err) {
    console.error('[mailer] sendApplicationStatusEmail failed:', err?.message ?? err);
  }
}

/**
 * Send a password-reset OTP email to the user.
 * Soft-fail: logs errors but never throws.
 */
export async function sendPasswordResetEmail({ to, name, otp }) {
  const greeting = name || 'there';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:36px">
    <h2 style="color:#2563eb;margin-top:0;margin-bottom:24px">ITJobwala</h2>
    <p style="margin-top:0">Hi ${greeting},</p>
    <p>We received a request to reset your password. Use the code below — it expires in <strong>10 minutes</strong>.</p>
    <div style="text-align:center;padding:20px 0">
      <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#2563eb">${otp}</span>
    </div>
    <p style="color:#6b7280;font-size:13px">
      If you did not request a password reset, you can safely ignore this email. Your password will not change.
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
    <p style="color:#9ca3af;font-size:12px;margin:0">— The ITJobwala Team</p>
  </div>
</body>
</html>`;

  const text = `Hi ${greeting},\n\nWe received a request to reset your ITJobwala password.\n\nYour reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, you can safely ignore this email.\n\n— The ITJobwala Team`;

  try {
    await transporter.sendMail({
      from:    env.email.from,
      to,
      subject: 'Reset your ITJobwala password',
      text,
      html,
    });
  } catch (err) {
    console.error('[mailer] sendPasswordResetEmail failed:', err?.message ?? err);
  }
}

/**
 * Notify a recruiter of a job moderation decision (admin approve/reject, or auto-block).
 * Soft-fail: logs errors but never throws.
 */
export async function sendJobModerationEmail({ to, name, jobTitle, decision, reason, jobUrl }) {
  const greeting = name || 'there';
  const link = jobUrl || '/recruiter/posted-jobs';

  const isApproved = decision === 'approve';
  const accentColor = isApproved ? '#16a34a' : '#dc2626';
  const headline = isApproved
    ? `Your job listing is now live`
    : `Action required: your job listing needs changes`;
  const body = isApproved
    ? `Your job listing <strong>"${jobTitle}"</strong> has been reviewed and approved. It is now visible to candidates on the platform.`
    : `Your job listing <strong>"${jobTitle}"</strong> could not be published${reason ? ` for the following reason:` : '.'}<br><br>${reason ? `<em style="color:#7f1d1d">${reason}</em>` : ''}`;
  const subject = isApproved
    ? `Your job "${jobTitle}" is now live – ITJobwala`
    : `Action required on your job "${jobTitle}" – ITJobwala`;
  const btnLabel = isApproved ? 'View your job listing' : 'Edit and resubmit';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;margin:0">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:36px">
    <h2 style="color:#2563eb;margin-top:0;margin-bottom:24px">ITJobwala</h2>
    <p style="margin-top:0">Hi ${greeting},</p>
    <h3 style="color:${accentColor};margin-bottom:12px">${headline}</h3>
    <p style="line-height:1.6">${body}</p>
    <div style="text-align:center;padding:28px 0">
      <a href="${link}" style="background:${accentColor};color:#fff;padding:13px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px">${btnLabel}</a>
    </div>
    <p style="color:#64748b;font-size:13px">If you have questions, contact our support team.<br>— The ITJobwala Team</p>
  </div>
</body>
</html>`;

  const text = `Hi ${greeting},\n\n${isApproved ? `Your job listing "${jobTitle}" is now live.` : `Your job listing "${jobTitle}" needs changes. Reason: ${reason || 'See platform for details.'}`}\n\nVisit: ${link}\n\n— The ITJobwala Team`;

  try {
    await transporter.sendMail({ from: FROM, to, subject, text, html });
  } catch (err) {
    console.error('[mailer] sendJobModerationEmail failed:', err?.message ?? err);
  }
}

/** Optional boot check — call once at startup to surface SMTP misconfiguration early. */
export async function verifyMailer() {
  return transporter.verify();
}
