import mongoose from "mongoose";

const LoginAttemptSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    email: { type: String }, 
    attempts: { type: Number, default: 0 },
    lastEmailTried: { type: String },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", LoginAttemptSchema);