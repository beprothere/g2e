import { BaseEmail } from "../layout/BaseEmail";

export const serumConfirmed = (tracking: string) =>
  BaseEmail(
    "Serum Order Confirmed",
    `<p>Tracking Number: <b>${tracking}</b></p>`,
  );

export const serumReceived = (name: string, p0: { Product: any; "Date & Time": string; IP: string; Device: string; }) =>
  BaseEmail(
    "Serum Received",
    `<p>Hi ${name}, we hope you enjoy your product 🌿</p>`,
  );
