import mongoose, { Schema, models } from "mongoose";

const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    topic: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Contact =
  models.Contact || mongoose.model("Contact", ContactSchema);
