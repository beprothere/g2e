import { transporter } from "./transporter";
import { MailCategory } from "./types";

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  category: MailCategory,
) {
  await transporter.sendMail({
    to,
    subject,
    html,
    from:
      category === "security"
        ? "Glow2Earn <support@glow2earn.com>"
        : category === "contact"
        ? "Glow2Earn <support@glow2earn.com>"
        : "Glow2Earn <support@glow2earn.com>",
 
    headers:
      category === "security"
        ? {
            Importance: "High",
            "X-Priority": "1",
          }
        : {
            Precedence: "bulk",
          },
  });
}
