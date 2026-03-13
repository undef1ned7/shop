import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderItemSchema = new Schema(
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
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) =>
          Array.isArray(value) && value.length > 0,
        message: "Order must contain at least one item",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["new", "paid", "shipped", "completed", "cancelled"],
      default: "new",
      required: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;
