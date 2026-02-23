import mongoose from "mongoose";

const AdminRoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pages: [String],
  },
  { timestamps: true }
);

export default mongoose.models.AdminRole ||
  mongoose.model("AdminRole", AdminRoleSchema);
