import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: String,
    ip: { type: String },
    amount: Number,
    planUniqueParse: String,

    method: { type: String },          
    tid: { type: String },             
    receiptImage: { type: String },
    comisionrate: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Rejected", "In Progress"],
      default: "In Progress",
    },

    commissionKey: {
      type: String,
      unique: true,
      partialFilterExpression: { commissionKey: { $exists: true } },
      sparse: true,
    },

    from: String,
  },
  { timestamps: true },
);

TransactionSchema.index({ type: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
