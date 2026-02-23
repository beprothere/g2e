import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminRole",
    },

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    rolePages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.models.AdminUser ||
  mongoose.model("AdminUser", AdminUserSchema);
