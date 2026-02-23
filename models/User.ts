import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    country: { type: String, default: "Pakistan" },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "/img/avatar.png" },

    referBy: { type: String, default: null },
    referralCode: { type: String, unique: true },

    role: { type: String, default: "user" },

    depositBalance: { type: Number, default: -20 },
    depositSerum: { type: Number, default: 0 },
    investedBalance: { type: Number, default: 0 },
    pendingDeposit: { type: Number, default: 20 },
    withdrawBalance: { type: Number, default: 0 },
    availableWithdraw: { type: Number, default: 0 },
    pendingWithdraw: { type: Number, default: 0 },
    latestDepositAmount: { type: Number, default: 0 },
    latestDepositCommissionProcessed: { type: Boolean, default: false },
    planStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "In Progress",
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Blocked"],
      default: "Pending",
    },
    claimedRewards: [
      {
        tierId: String,
        name: String,
        reward: String,
        status: {
          type: String,
          enum: ["Processing", "Dispatched", "Received", "Cancelled"],
          default: "Processing",
        },
        claimedAt: { type: Date, default: Date.now },
      },
    ],
    planStartDate: { type: Date },
    planEndDate: { type: Date },
    planDurationDays: { type: Number, default: 0 },
    hasClaimed: { type: Boolean, default: false },
    plan: {
      type: String,
      enum: ["Free", "Basic", "Standard", "Premium"],
      default: "Free",
    },
    planPrice: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 30 },
    accountstatus: {
      type: String,
      enum: ["Activated", "Deactivated"],
      default: "Activated",
    },

    emailVerified: { type: Boolean, default: false },
    emailOTP: String,
    emailOTPExpiry: Date,

    paymentMethod: String,
    paymentTilId: String,
    phoneNumber: {type: String, default: ""},
    transactionId: {type: String, default: ""},
    paymentReceipt: String,

    deviceFingerprint: { type: String },
    ipHash: { type: String },
    ipAddress: { type: String },
    resetOTP: String,
    resetOTPExpiry: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    emailPreferences: {
      security: { type: Boolean, default: true },
      marketing: { type: Boolean, default: true },
    },
    profileStatus: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: false },
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
  },
  { timestamps: true },
);

UserSchema.index({ referBy: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ referBy: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ status: 1, plan: 1, createdAt: -1 });

export default models.User || mongoose.model("User", UserSchema);
