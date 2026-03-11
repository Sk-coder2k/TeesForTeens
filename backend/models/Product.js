import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      default: 0.0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: [true, 'Please add at least one image URL'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['T-Shirts', 'Oversized', 'Couple', 'Streetwear', 'Other'],
    },
    sizes: {
      type: [String],
      required: [true, 'Please add sizes'],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    },
    colors: {
      type: [String],
      required: [true, 'Please add colors'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 0,
    },
    sizeStock: {
      type: Map,
      of: Number,
      default: {},
    },
    colorStock: {
      type: Map,
      of: Number,
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
