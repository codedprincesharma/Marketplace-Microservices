const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {

    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    fullName: {

      firstName: { type: String, required: true },
      lastName: { type: String, required: true }

    },
    role: {
      type: String,
      enum: ["user", "seller"],
      default: "user",
    },
    address: [addressSchema],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema)
module.exports = User