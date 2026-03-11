import Link from "next/link";
export const metadata = { title: "Refund Policy | TeesforTeens" };
export default function RefundPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-[70vh] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#29bc89] mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Refund & Return Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>
        <div className="space-y-8 text-gray-600 leading-relaxed text-sm sm:text-base">
          <section>
            <div className="p-4 bg-[#E8F5F2] rounded-xl border border-[#29bc89]/30 mb-6">
              <p className="text-[#29bc89] font-bold text-sm">✅ We want you to love your purchase. If something is wrong, we'll make it right.</p>
            </div>
          </section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Return Eligibility</h2><p className="mb-3">You can request a return within <strong>7 days of delivery</strong> if:</p><ul className="list-disc pl-5 space-y-2"><li>The item is unworn, unwashed, and in its original condition.</li><li>Original tags and packaging are intact.</li><li>The item is not a sale or clearance item.</li><li>The item received was defective, damaged, or incorrect.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Non-Returnable Items</h2><ul className="list-disc pl-5 space-y-2"><li>Items that have been worn, washed, or altered.</li><li>Items purchased during special sales or with discount codes above 30%.</li><li>Items returned after 7 days of delivery.</li><li>Items without original tags or packaging.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. How to Initiate a Return</h2><ol className="list-decimal pl-5 space-y-3"><li>Email us at <a href="mailto:teesforteens.support@gmail.com" className="text-[#29bc89] font-semibold">teesforteens.support@gmail.com</a> with your order number, reason for return, and photos of the item.</li><li>Our team will review your request within 1–2 business days.</li><li>If approved, we'll provide return shipping instructions.</li><li>Once we receive and inspect the returned item, we'll process your refund or exchange.</li></ol></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">4. Refund Process</h2><ul className="list-disc pl-5 space-y-2"><li>Approved refunds are processed within <strong>5–7 business days</strong> after we receive the returned item.</li><li>Refunds are credited to your original payment method (UPI, card, etc.).</li><li>Shipping charges are non-refundable unless the return is due to our error.</li><li>COD refunds will be processed via bank transfer — please provide your account details.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">5. Exchanges</h2><p>We offer free size exchanges (subject to availability). If you'd like a different size, mention it in your return request email. We'll ship the replacement once we receive the original item.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">6. Damaged or Wrong Items</h2><p>If you received a damaged, defective, or wrong item, please email us within <strong>48 hours of delivery</strong> with photos. We'll arrange a free return pickup and send a replacement or full refund immediately.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact Us</h2><div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm space-y-1"><p><strong>TeesforTeens Support</strong></p><p>Email: <a href="mailto:teesforteens.support@gmail.com" className="text-[#29bc89] font-semibold">teesforteens.support@gmail.com</a></p><p>Response time: Within 24 hours on business days.</p></div></section>
        </div>
      </div>
    </div>
  );
}
