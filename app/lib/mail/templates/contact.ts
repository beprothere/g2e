import { BaseEmail } from "../layout/BaseEmail";
import { InfoList } from "../components/InfoList";

export const contactToAdmin = (data: Record<string, string>) =>
  BaseEmail(
    "New Contact Message",
    InfoList(data),
  );

export const contactToUser = (
  name: string,
  topic: string,
  message: string,
) =>
  BaseEmail(
    "We Received Your Message",
    `
      <p>Hi ${name},</p>
      <p>Topic: <b>${topic}</b></p>
      <p>${message}</p>
      <p>Our support team will contact you soon.</p>
    `,
  );
