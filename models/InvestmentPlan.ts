import mongoose, { Schema, models } from "mongoose";

const InvestmentPlanSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    commission: { type: Number, required: true },
    roi: { type: Number, required: true },
    duration: { type: Number },
    descriptions: {
      type: [String],
      validate: [
        (arr: any) => arr.length >= 2,
        "At least 2 description lines required",
      ],
    },
    refsRequired: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default models.InvestmentPlan ||
  mongoose.model("InvestmentPlan", InvestmentPlanSchema);
