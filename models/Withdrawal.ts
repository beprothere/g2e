import mongoose, { Schema, models } from "mongoose";

const WithdrawalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accountId: { type: Schema.Types.ObjectId, ref: "WithdrawAccount" },

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    isWithdrawSuccess: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Withdrawal ||
  mongoose.model("Withdrawal", WithdrawalSchema);
