import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    displayId: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["UPI", "Card", "COD"],
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    deletedByAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Auto-generate a short unique display ID before saving
orderSchema.pre("validate", async function () {
  if (!this.displayId) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/1/O/0 to avoid confusion
    let id;
    let exists = true;
    while (exists) {
      id = "TFT-";
      for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const found = await mongoose.model("Order").findOne({ displayId: id });
      exists = !!found;
    }
    this.displayId = id;
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
