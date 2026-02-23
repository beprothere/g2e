import mongoose, { Schema, model, models } from "mongoose";

const ClaimedRewardSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tierId: { type: String, required: true },
  rewardName: { type: String, required: true },
  rewardValue: { type: String },
  level: { type: Number },
  trackingNumber: { type: String, default: "REW-TRC-" },
  status: {
    type: String,
    enum: ["Processing", "Dispatched", "Received", "Cancelled"],
    default: "Processing",
  },
  claimedAt: { type: Date, default: Date.now },
});

ClaimedRewardSchema.index({ claimedAt: -1 });
ClaimedRewardSchema.index({ status: 1 });

export default models.ClaimedReward ||
  model("ClaimedReward", ClaimedRewardSchema);
