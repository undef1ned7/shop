import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;
