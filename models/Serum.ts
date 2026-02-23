import mongoose, { Schema, models } from "mongoose";

const SerumSchema = new Schema(
  {
    serumName: String,
    serumPic: String,
    description: String,
    serumaboutline: [String],
  },
  { timestamps: true }
);

export default models.Serum ||
  mongoose.model("Serum", SerumSchema);
