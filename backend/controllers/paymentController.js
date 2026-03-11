import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/stripe
// @access  Private
export const createStripePaymentIntent = async (req, res) => {
  try {
    const { itemsPrice } = req.body;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Stripe expects amount in smaller units (e.g. cents for USD, paise for INR)
    // Assuming `itemsPrice` is passed as a standard number, we multiply by 100 for proper processing.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(itemsPrice * 100), 
      currency: 'inr', // or 'usd' depending on store currency
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { itemsPrice } = req.body;
    
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(itemsPrice * 100), // amount in smallest currency unit
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
