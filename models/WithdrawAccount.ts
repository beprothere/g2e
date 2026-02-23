import mongoose from "mongoose";

const WithdrawAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    method: String,
    number: String,
    holderName: {
      type: String,
      required: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.WithdrawAccount ||
  mongoose.model("WithdrawAccount", WithdrawAccountSchema);
