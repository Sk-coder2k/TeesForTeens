import Product from "../models/Product.js";

const SYSTEM_PROMPT = `You are TeesBot 👕, the official AI shopping assistant for TeesforTeens — a trendy Indian streetwear and t-shirt brand built for teenagers.

Your personality:
- Fun, cool, and casual — like a stylish friend helping them shop
- Light Gen-Z friendly tone but stay helpful
- Keep responses SHORT and punchy (2-4 sentences max unless listing products)
- Use emojis occasionally 🔥👕✨

About the store:
- Brand: TeesforTeens — "Style For The Generation"
- Categories: Oversized T-shirts, Streetwear, Couple Tees, T-Shirts
- Price range: ₹299 - ₹999 (super affordable)
- Delivery: 5-7 business days across India
- Returns: 7-day easy return policy
- Payment: UPI, Cards, Net Banking, COD available
- Free shipping on orders above ₹499
- Contact/support: teesforteens.support@gmail.com

How to help users:
- Product questions → suggest from the catalog provided below
- Order status → tell them to visit My Orders in their profile
- Sizing help → recommend checking the size guide on the product page
- Complaints → direct to teesforteens.support@gmail.com
- If unsure → be honest and direct to support

Always be warm, helpful, and on-brand. You represent TeesforTeens! 🛍️`;

export const chat = async (req, res) => {
  try {
    const { messages, includeProducts } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages are required" });
    }

    // Fetch live products for context
    let productContext = "";
    if (includeProducts) {
      const products = await Product.find({ status: "active" })
        .select("name category price discountPrice sizes colors")
        .limit(20);
      if (products.length > 0) {
        productContext =
          "\n\nCurrent products in store:\n" +
          products
            .map(
              (p) =>
                `- ${p.name} | ${p.category} | Rs.${p.discountPrice || p.price}${p.discountPrice ? ` (was Rs.${p.price})` : ""} | Sizes: ${p.sizes?.join(", ") || "S,M,L,XL"}`,
            )
            .join("\n");
      }
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: "Chat service not configured" });
    }

    // Build Gemini conversation format
    // Filter out the initial assistant greeting (Gemini requires conversation to start with user)
    const filteredMessages = messages.filter(
      (m) => m.role === "user" || messages.indexOf(m) > 0,
    );
    const geminiMessages = filteredMessages
      .filter(
        (m) => !(m.role === "assistant" && filteredMessages.indexOf(m) === 0),
      )
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Gemini needs at least one user message and must start with user
    const validMessages = [];
    let hasUser = false;
    for (const m of geminiMessages) {
      if (m.role === "user") hasUser = true;
      if (hasUser) validMessages.push(m);
    }
    if (validMessages.length === 0) {
      return res.status(400).json({ message: "No user message found" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT + productContext }],
          },
          contents: validMessages,
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.7,
          },
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      return res
        .status(500)
        .json({ message: data.error?.message || "AI service error" });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Hey! I'm having a little trouble right now. Try again in a sec 😅";

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
