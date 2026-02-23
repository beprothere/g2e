import mongoose, { Schema, models, model } from "mongoose";

export type MerchantWalletStatus = "active" | "inactive" | "suspended";
export type MerchantWalletProvider = "easypaisa" | "jazzcash";

const MerchantWalletSchema = new Schema(
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

    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    credentials: {
      merchantId: { type: String },
      storeId: { type: String },
      apiKey: { type: String },
      apiSecret: { type: String },
      sandbox: { type: Boolean, default: true },
    },

    lastTransactionAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MerchantWallet =
  models.MerchantWallet ||
  model("MerchantWallet", MerchantWalletSchema);

export default MerchantWallet;
