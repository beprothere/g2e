import { BaseEmail } from "../layout/BaseEmail";
import { OTPBox } from "../components/OTPBox";
import { InfoList } from "../components/InfoList";
import { Button } from "../components/Button";

export const forgotPasswordOTP = (name: string, otp: string) =>
  BaseEmail(
    "Password Reset OTP",
    `
      <p>Hello ${name},</p>
      ${OTPBox(otp, "5 minutes")}
    `,
  );

export const verifyEmailOTP = (name: string, otp: string) =>
  BaseEmail(
    "Verify Your Email",
    `
      <p>Hello ${name},</p>
      ${OTPBox(otp, "12 hours")}
    `,
  );

export const loginBlocked = (ip: string, device: string) =>
  BaseEmail(
    "Security Alert: Login Blocked",
    InfoList({ IP: ip, Device: device }),
  );

export const confirmLoginAttempt = (
  ip: string,
  device: string,
  yesUrl: string,
  noUrl: string,
) =>
  BaseEmail(
    "Confirm Login Attempt",
    `
      ${InfoList({ IP: ip, Device: device })}
      <br/>
      ${Button("Yes, it's me", yesUrl)}
      <br/><br/>
      ${Button("No, it's not me", noUrl)}
    `,
  );

export const loginSuccessful = (ip: string, time: string) =>
  BaseEmail(
    "Login Successful",
    InfoList({
      IP: ip,
      Time: time,
    }),
  );

type AdminLoginAlertProps = {
  device: string;
  os: string;
  browser: string;
  ip: string;
  time: string;
};

export const sendAdminLoginAlert = ({
  device,
  os,
  browser,
  ip,
  time,
}: AdminLoginAlertProps) =>
  BaseEmail(
    "Admin Login Successful",
    InfoList({
      Device: device,
      OS: os,
      Browser: browser,
      IP: ip,
      Time: time,
    }),
  );
export const sendAccountVerifyAlert = ({
  device,
  os,
  browser,
  ip,
  time,
}: AdminLoginAlertProps) =>
  BaseEmail(
    "Account Verification Successful",
    InfoList({
      Device: device,
      OS: os,
      Browser: browser,
      IP: ip,
      Time: time,
    }),
  );

export const firstWrongAttemptAlert = (ip: string, contactUrl: string) =>
  BaseEmail(
    "Confirm Login Attempt",
    `
    <p>Someone just tried to log into your account with an incorrect password.</p>
    ${InfoList({ IP: ip })}
    <p>If this wasn't you, please protect your account immediately by changing your password or contacting our team.</p>
    <br/>
    ${Button("Get In Touch", contactUrl)}
    `,
  );
