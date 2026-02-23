import { BaseEmail } from "../layout/BaseEmail";
import { InfoList } from "../components/InfoList";

export const accountCreated = (name: string, info: Record<string, string>) =>
  BaseEmail(
    "Account Created Successfully",
    `
      <p>Welcome ${name}</p>
      ${InfoList(info)}
    `,
  );

export const accountDeleted = (name: string, info: Record<string, string>) =>
  BaseEmail(
    "Account Deleted",
    `
      <p>Hello ${name}</p>
      ${InfoList(info)}
      <p>If this wasn't you, contact support.</p>
    `,
  );

export const profileUpdated = (name: string) =>
  BaseEmail(
    "Profile Updated Successfully",
    `<p>Hello ${name}, your profile was updated.</p>`,
  );

export const paymentPending = () =>
  BaseEmail(
    "Payment Verification Pending",
    `
      <p>Your payment is under review.</p>
      <p>Please wait 1–24 hours.</p>
    `,
  );
