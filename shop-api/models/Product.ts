import mongoose, { Types } from "mongoose";
import Category from "./Category";
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      validate: {
        validator: async (value: Types.ObjectId) => Category.findById(value),
        message: "Category does not exist",
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    description: String,
    image: String,
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
