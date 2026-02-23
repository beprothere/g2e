import mongoose, { Schema, models } from "mongoose";

const DeletedUserSchema = new Schema(
  {
    originalUserId: { type: String },
    data: { type: Object },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.DeletedUser ||
  mongoose.model("DeletedUser", DeletedUserSchema);
