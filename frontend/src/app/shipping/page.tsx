import Link from "next/link";
export const metadata = { title: "Shipping Policy | TeesforTeens" };
export default function ShippingPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-[70vh] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#29bc89] mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Shipping Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>
        <div className="space-y-8 text-gray-600 leading-relaxed text-sm sm:text-base">
          <section>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-[#E8F5F2] rounded-xl"><div className="text-2xl mb-1">📦</div><p className="text-xs font-bold text-gray-900">1–2 Days</p><p className="text-xs text-gray-500">Processing</p></div>
              <div className="text-center p-4 bg-[#E8F5F2] rounded-xl"><div className="text-2xl mb-1">🚚</div><p className="text-xs font-bold text-gray-900">3–7 Days</p><p className="text-xs text-gray-500">Delivery</p></div>
              <div className="text-center p-4 bg-[#E8F5F2] rounded-xl"><div className="text-2xl mb-1">🎁</div><p className="text-xs font-bold text-gray-900">Free</p><p className="text-xs text-gray-500">Above ₹999</p></div>
            </div>
          </section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Order Processing</h2><ul className="list-disc pl-5 space-y-2"><li>All orders are processed within <strong>1–2 business days</strong> after payment confirmation.</li><li>Orders placed on weekends or public holidays are processed the next business day.</li><li>You will receive an order confirmation email immediately after placing your order.</li><li>Once shipped, you'll receive a tracking number via email.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Shipping Rates</h2>
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left font-bold text-gray-700">Order Value</th><th className="px-4 py-3 text-left font-bold text-gray-700">Shipping Fee</th><th className="px-4 py-3 text-left font-bold text-gray-700">Delivery Time</th></tr></thead><tbody><tr className="border-t border-gray-100"><td className="px-4 py-3">Below ₹499</td><td className="px-4 py-3 font-semibold">₹79</td><td className="px-4 py-3">5–7 business days</td></tr><tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-3">₹499 – ₹998</td><td className="px-4 py-3 font-semibold">₹49</td><td className="px-4 py-3">3–5 business days</td></tr><tr className="border-t border-gray-100"><td className="px-4 py-3">₹999 and above</td><td className="px-4 py-3 font-semibold text-[#29bc89]">FREE</td><td className="px-4 py-3">3–5 business days</td></tr></tbody></table>
          </section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. Delivery Locations</h2><ul className="list-disc pl-5 space-y-2"><li>We currently ship to all states and union territories across <strong>India</strong>.</li><li>We do not offer international shipping at this time.</li><li>Remote areas (as defined by our courier partners) may require an additional 2–3 business days.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">4. Order Tracking</h2><ul className="list-disc pl-5 space-y-2"><li>Once your order is shipped, you will receive an email with a tracking link.</li><li>You can also track your order from the <Link href="/profile" className="text-[#29bc89] font-semibold underline">My Orders</Link> section in your account.</li><li>It may take up to 24 hours for tracking details to appear after shipment.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">5. Failed Delivery</h2><ul className="list-disc pl-5 space-y-2"><li>If delivery fails due to incorrect address or unavailability, the courier will attempt delivery up to 2 times.</li><li>After failed attempts, the package may be returned to us. Re-delivery charges will apply.</li><li>Ensure your phone number is correct as the courier may call before delivery.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">6. Damaged in Transit</h2><p>If your order arrives damaged, please take photos immediately and email us at <a href="mailto:teesforteens.support@gmail.com" className="text-[#29bc89] font-semibold">teesforteens.support@gmail.com</a> within 48 hours of delivery. We'll arrange a replacement or refund promptly.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact Us</h2><div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm space-y-1"><p><strong>TeesforTeens Support</strong></p><p>Email: <a href="mailto:teesforteens.support@gmail.com" className="text-[#29bc89] font-semibold">teesforteens.support@gmail.com</a></p><p>Response time: Within 24 hours on business days.</p></div></section>
        </div>
      </div>
    </div>
  );
}
