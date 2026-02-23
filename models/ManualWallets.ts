import mongoose, { Schema, models, model } from "mongoose";

export type ManualWalletStatus = "active" | "inactive" | "suspended";
export type ManualWalletProvider = "easypaisa" | "jazzcash";

const ManualWalletSchema = new Schema(
  {
    walletName: {
      type: String,
      required: true,
      trim: true,
    },

    provider: {
      type: String,
      enum: ["easypaisa", "jazzcash"],
      required: true,
    },

    walletNumber: {
      type: Number,
      required: true,
      trim: true,
    },

    signupBalance: {
      type: Number,
      required: true,
      trim: true,
    },

    holderName: {
      type: String,
      required: true,
    },

    qrPic: {
      type: String,
      required: true,
    },

    walletTilId: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    lastTransactionAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ManualWallets =
  models.ManualWallets ||
  model("ManualWallets", ManualWalletSchema);

export default ManualWallets;
