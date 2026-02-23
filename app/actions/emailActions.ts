"use server";
import nodemailer from "nodemailer";
import { revalidatePath } from "next/cache";

export type FormState = {
  message: string;
  status: "success" | "error" | "idle";
};

export async function handleEmailAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const category = formData.get("category") as string;

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, 
    auth: {
      user: "support@glow2earn.com",
      pass: process.env.SMTP_PASS,
    },
  });

  // Unique IDs for every email to avoid threading in Primary
  const msgId = `<${Math.random().toString(36).substring(2)}@glow2earn.com>`;

  let headers: any = {
    "Message-ID": msgId,
    "X-Mailer": "Glow2Earn-System-Mailer",
    "List-ID": "Glow2Earn Notifications <notifications.glow2earn.com>",
  };

  let finalSubject = subject;
  let finalHTML = "";

  if (category === "updates") {
    // Gmail ko "Updates" tab mein bhejane wale sabse strong signals
    headers["Precedence"] = "bulk";
    headers["Auto-Submitted"] = "auto-generated";
    headers["X-Auto-Response-Suppress"] = "All";
    
    finalSubject = `[Update] ${subject}`;

    finalHTML = `
      <div style="display:none; max-height:0px; overflow:hidden;">
        Your account activity update from Glow2Earn. Transaction ID: ${Math.random().toString(36).toUpperCase()}
      </div>
      <script type="application/ld+json">
      {
        "@context": "http://schema.org",
        "@type": "EmailMessage",
        "action": {
          "@type": "ViewAction",
          "url": "https://glow2earn.com/dashboard",
          "name": "View Update"
        },
        "description": "System Notification"
      }
      </script>
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
              <strong style="color: #555; font-size: 12px; text-transform: uppercase;">System Alert</strong>
              <div style="margin-top: 10px; font-size: 15px; line-height: 1.6;">
                ${message}
              </div>
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 11px; color: #888;">
                Ref ID: GLW-${Date.now()} | This is an automated system update.
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  } else {
    // Default Primary Layout
    finalHTML = `<div style="font-family: sans-serif;">${message}</div>`;
  }

  try {
    await transporter.sendMail({
      from: '"Glow2Earn Notifications" <support@glow2earn.com>',
      to,
      subject: finalSubject,
      html: finalHTML,
      headers: headers,
    });

    revalidatePath("/admin/emails");
    return { message: "Email Sent Successfully!", status: "success" };
  } catch (error) {
    return { message: "SMTP Connection Failed", status: "error" };
  }
}