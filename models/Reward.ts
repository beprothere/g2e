import mongoose, { Schema, model, models } from "mongoose";

const RewardSchema = new Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true, unique: true, min: 1, max: 7 },
  recruits: { type: Number, required: true },
  reward: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  accentColor: { type: String, required: true },
}, { timestamps: true });

export const Reward = models.Reward || model("Reward", RewardSchema);