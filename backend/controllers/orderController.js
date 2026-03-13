import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const sendViaResend = async ({ to, subject, html }) => {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TeesforTeens <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
  } catch (err) {
    console.error("Resend error:", err.message);
  }
};

const STATUS_CONFIG = {
  Processing: {
    emoji: "📦",
    label: "Order Confirmed",
    color: "#f59e0b",
    message: "Your order has been confirmed and is being prepared.",
    subtext: "We'll notify you once it ships.",
  },
  Shipped: {
    emoji: "🚚",
    label: "Order Shipped",
    color: "#3b82f6",
    message: "Great news! Your order is on its way.",
    subtext: "Expected delivery in 3–5 business days.",
  },
  Delivered: {
    emoji: "✅",
    label: "Order Delivered",
    color: "#29bc89",
    message: "Your order has been delivered successfully!",
    subtext: "We hope you love your new TeesforTeens gear! 🎉",
  },
  Cancelled: {
    emoji: "❌",
    label: "Order Cancelled",
    color: "#ef4444",
    message: "Your order has been cancelled.",
    subtext:
      "If you paid online, a refund will be processed within 5–7 business days.",
  },
};

const sendOrderStatusEmail = async (
  order,
  customerEmail,
  customerName,
  newStatus,
) => {
  const config = STATUS_CONFIG[newStatus];
  if (!config) return;

  const itemsHtml = order.orderItems
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px 8px;">
        <div style="font-weight: 600; color: #111827;">${item.name}</div>
        <div style="font-size: 12px; color: #6b7280;">Size: ${item.size} | Color: ${item.color} | Qty: ${item.qty}</div>
      </td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: #111827;">₹${(item.price * item.qty).toLocaleString("en-IN")}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;">
      <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <div style="background:${config.color};padding:32px 32px 24px;">
          <div style="font-size:36px;margin-bottom:8px;">${config.emoji}</div>
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">${config.label}</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Order #${order.displayId || order._id.toString().slice(-8).toUpperCase()}</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#111827;">Hi ${customerName},</p>
          <p style="margin:0 0 4px;color:#4b5563;font-size:14px;">${config.message}</p>
          <p style="margin:0 0 24px;color:#6b7280;font-size:13px;">${config.subtext}</p>

          <!-- Order Items -->
          <div style="background:#f9fafb;border-radius:12px;padding:4px 16px;margin-bottom:20px;">
            <table style="width:100%;border-collapse:collapse;">
              ${itemsHtml}
            </table>
          </div>

          <!-- Total -->
          <div style="display:flex;justify-content:space-between;padding:12px 16px;background:#f3f4f6;border-radius:10px;margin-bottom:24px;">
            <span style="font-weight:700;color:#111827;">Total Paid</span>
            <span style="font-weight:800;color:#29bc89;font-size:16px;">₹${order.totalPrice?.toLocaleString("en-IN")}</span>
          </div>

          <!-- Shipping Address -->
          <div style="margin-bottom:24px;">
            <p style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Shipping To</p>
            <p style="margin:0;color:#374151;font-size:13px;line-height:1.6;">
              ${order.shippingAddress?.address}, ${order.shippingAddress?.city} – ${order.shippingAddress?.postalCode}
            </p>
          </div>

          <!-- CTA -->
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/profile" 
             style="display:block;text-align:center;background:#29bc89;color:#ffffff;font-weight:700;padding:14px 24px;border-radius:50px;text-decoration:none;font-size:14px;">
            View Your Orders →
          </a>
        </div>

        <!-- Footer -->
        <div style="border-top:1px solid #f3f4f6;padding:20px 32px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
            Questions? Reply to this email or contact us at 
            <a href="mailto:${process.env.EMAIL_USER}" style="color:#29bc89;">${process.env.EMAIL_USER}</a>
          </p>
          <p style="margin:8px 0 0;color:#d1d5db;font-size:11px;">© 2026 TeesforTeens. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Send to admin with customer details (Resend free plan restriction)
    await sendViaResend({
      to: process.env.EMAIL_USER,
      subject: `${config.emoji} Order ${newStatus} – #${order.displayId || order._id.toString().slice(-8).toUpperCase()} (${customerName})`,
      html: html.replace(
        `<a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/profile"`,
        `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Customer email: <a href="mailto:${customerEmail}" style="color:#29bc89;">${customerEmail}</a></p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/orders"`,
      ),
    });
    console.log(
      `✅ Status email sent to admin for order (${newStatus}) - customer: ${customerEmail}`,
    );
  } catch (err) {
    console.error(`❌ Failed to send status email:`, err.message);
  }
};

// @desc    Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const [orders, products, users] = await Promise.all([
      Order.find({}).select(
        "totalPrice createdAt orderStatus orderItems deletedByAdmin",
      ),
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
    ]);
    const activeOrders = orders.filter((o) => !o.deletedByAdmin);
    const totalRevenue = activeOrders.reduce(
      (sum, o) => sum + (o.totalPrice || 0),
      0,
    );
    const recentOrders = await Order.find({ deletedByAdmin: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name");
    const salesMap = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const id = item.product?.toString();
        if (!id) return;
        if (!salesMap[id]) salesMap[id] = { qty: 0 };
        salesMap[id].qty += item.qty || 1;
      });
    });
    const topProductIds = Object.entries(salesMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([id]) => id);
    const topProducts = await Product.find({
      _id: { $in: topProductIds },
    }).select("name price images");
    const topProductsWithSales = topProducts
      .map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        image: p.images?.[0] || "",
        sales: salesMap[p._id.toString()]?.qty || 0,
      }))
      .sort((a, b) => b.sales - a.sales);

    // Monthly data for charts (last 6 months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      monthlyData[key] = { revenue: 0, orders: 0, customers: 0 };
    }
    activeOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      if (monthlyData[key]) {
        monthlyData[key].revenue += o.totalPrice || 0;
        monthlyData[key].orders += 1;
      }
    });
    const allUsers = await User.find({ role: "customer" }).select("createdAt");
    allUsers.forEach((u) => {
      const d = new Date(u.createdAt);
      const key = d.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      if (monthlyData[key]) monthlyData[key].customers += 1;
    });
    const monthlyChartData = Object.entries(monthlyData).map(
      ([month, data]) => ({ month, ...data }),
    );

    res.json({
      totalRevenue,
      totalOrders: activeOrders.length,
      totalProducts: products,
      totalCustomers: users,
      monthlyChartData,
      recentOrders: recentOrders.map((o) => ({
        id: o._id,
        displayId: o.displayId,
        customer: o.user?.name || "Guest",
        date: o.createdAt,
        total: o.totalPrice,
        status: o.orderStatus,
      })),
      topProducts: topProductsWithSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: "No order items" });
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    const createdOrder = await order.save();

    // Reduce stock for each ordered item and update status
    for (const item of orderItems) {
      const qty = item.qty || item.quantity || 1;
      const product = await Product.findById(item.product);
      if (product) {
        const newStock = Math.max(0, product.stock - qty);
        const newStatus =
          newStock <= 0
            ? "Out of Stock"
            : newStock <= 10
              ? "Low Stock"
              : "Active";
        await Product.findByIdAndUpdate(item.product, {
          stock: newStock,
          status: newStatus,
        });
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (order) res.json(order);
    else res.status(404).json({ message: "Order not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deletedByAdmin: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate("user", "id name email phone");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status + send email
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    const newStatus = req.body.orderStatus || order.orderStatus;
    const prevStatus = order.orderStatus;

    // Customers can only cancel their own orders
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) {
      if (newStatus !== "Cancelled")
        return res
          .status(403)
          .json({ message: "Customers can only cancel orders" });
      if (order.user._id.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Not authorized" });
      if (["Shipped", "Delivered", "Cancelled"].includes(prevStatus))
        return res.status(400).json({ message: "Cannot cancel this order" });
    }

    order.orderStatus = newStatus;
    if (newStatus === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    // Restore stock if order is cancelled (and wasn't already cancelled)
    if (newStatus === "Cancelled" && prevStatus !== "Cancelled") {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          const newStock = product.stock + (item.qty || item.quantity || 1);
          const newStatus2 =
            newStock <= 0
              ? "Out of Stock"
              : newStock <= 10
                ? "Low Stock"
                : "Active";
          await Product.findByIdAndUpdate(item.product, {
            stock: newStock,
            status: newStatus2,
          });
        }
      }
    }

    const updatedOrder = await order.save();

    // Send email if status actually changed
    if (newStatus !== prevStatus) {
      const customerEmail = order.user?.email;
      const customerName = order.user?.name || "Valued Customer";
      if (customerEmail) {
        sendOrderStatusEmail(
          updatedOrder,
          customerEmail,
          customerName,
          newStatus,
        );
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.deletedByAdmin = true;
    await order.save();
    res.json({ message: "Order hidden from admin successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
