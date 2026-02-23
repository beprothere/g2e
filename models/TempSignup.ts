import mongoose, { Schema, models } from "mongoose";

const TempSignupSchema = new Schema(
  {
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    referBy: String,
    referralCode: String,

    emailOTP: String,
    emailOTPExpiry: Date,

    deviceFingerprint: String,
    ipHash: String,
    ipAddress: String,
  },
  { timestamps: true }
);

export default models.TempSignup ||
  mongoose.model("TempSignup", TempSignupSchema);
