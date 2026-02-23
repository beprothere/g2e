import mongoose, { Schema, models } from "mongoose";

const PlanTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    fromPlan: String,
    toPlan: String,
    paidAmount: Number,

    method: String,
    tid: String,                 
    receiptImage: String,        
    durationDays: Number,        

    planUniqueParse: String,
    planCommission: Number,

    planStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "In Progress",
    },
  },
  { timestamps: true },
);

PlanTransactionSchema.index({ createdAt: -1 });
PlanTransactionSchema.index({ planStatus: 1, createdAt: -1 });
PlanTransactionSchema.index({ userId: 1, createdAt: -1 });

export default models.PlanTransaction ||
  mongoose.model("PlanTransaction", PlanTransactionSchema);
