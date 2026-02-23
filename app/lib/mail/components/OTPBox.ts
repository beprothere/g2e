export const OTPBox = (otp: string, time: string) => `
  <div style="background:#f3f4f6;padding:20px;border-radius:10px;text-align:center">
    <div style="font-size:32px;font-weight:bold;letter-spacing:6px">${otp}</div>
    <small>Valid for ${time}</small>
  </div>
`;
