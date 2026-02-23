import mongoose, { Schema } from "mongoose"

const PaymentSessionSchema = new Schema(
  {
    fullName: String,
    email: String,
    password: String,
    referral: String,

    provider: String,
    phone: String,

    ipAddress: String,
    deviceFingerprint: String,

    status: { type: String, default: "pending" },
  },
  { timestamps: true }
)

export default mongoose.models.PaymentSession ||
  mongoose.model("PaymentSession", PaymentSessionSchema)
