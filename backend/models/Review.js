import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "Please add a review title"],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
    },
    adminReply: {
      type: String,
      default: "",
    },
    adminRepliedAt: {
      type: Date,
    },
    deletedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// One review per product per order per user
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
