import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: String,

    // Phase 2: User platform features
    savedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Account status
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 });

const User = mongoose.model("User", userSchema);
export default User;