import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    referBy: { type: String, default: null },

    referralCode: { type: String, unique: true },

    role: { type: String, default: "user" },

    depositBalance: { type: Number, default: 0 },
    withdrawBalance: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Pending", "Verified", "Blocked"],
      default: "Pending",
    },

    deviceFingerprint: { type: String },
    ipHash: { type: String },
    ipAddress: { type: String },

    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
