import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    NotificationType: String,
    message: String,
    amount: { type: Number, default: null },
    ip: String,
    isArchieved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["No Read", "Read", "Rejected"],
      default: "No Read",
    },
  },
  { timestamps: true },
);

export default models.Notification ||
  mongoose.model("Notification", NotificationSchema);
