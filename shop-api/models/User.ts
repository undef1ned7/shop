import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "seller", "user"],
    default: "user",
    required: true,
  },
  sellerStatus: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none",
    required: true,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  cart: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      qty: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
    },
  ],
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

const User = mongoose.model("User", UserSchema);

export default User;
