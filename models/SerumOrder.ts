
import mongoose, { Schema, models } from "mongoose";

const SerumOrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    fullName: String,
    email: String,
    phone: String,

    address: String,
    city: String,
    zipcode: String,
    country: String,

    serumId: String,
    serumName: String,
    serumPic: String,

    status: {
      type: String,
      enum: ["processing", "dispatched", "received"],
      default: "processing",
    },

    trackingNumber: String,
  },
  { timestamps: true }
);

export default models.SerumOrder ||
  mongoose.model("SerumOrder", SerumOrderSchema);
