import mongoose from "mongoose";

const LoginRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip: String,
    device: String,
    approved: { type: Boolean, default: false },
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.LoginRequest ||
  mongoose.model("LoginRequest", LoginRequestSchema);
