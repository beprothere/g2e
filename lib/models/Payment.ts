import mongoose, { Schema } from "mongoose"

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    provider: String,
    phone: String,
    status: String,
  },
  { timestamps: true }
)

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema)
