import mongoose from "mongoose";

const TrustedDeviceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip: String,
    device: String,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.TrustedDevice ||
  mongoose.model("TrustedDevice", TrustedDeviceSchema);
