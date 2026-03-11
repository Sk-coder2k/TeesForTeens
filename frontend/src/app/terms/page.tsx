import Link from "next/link";
export const metadata = { title: "Terms & Conditions | TeesforTeens" };
export default function TermsPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-[70vh] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#29bc89] mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>
        <div className="space-y-8 text-gray-600 leading-relaxed text-sm sm:text-base">
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2><p>By accessing or using the TeesforTeens website and placing orders, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Products & Pricing</h2><ul className="list-disc pl-5 space-y-2"><li>All prices are listed in Indian Rupees (₹) and include applicable taxes.</li><li>We reserve the right to modify prices at any time without prior notice.</li><li>Product images are for representation purposes only; actual colours may slightly vary.</li><li>We reserve the right to cancel orders if a product is found to be incorrectly priced.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. Orders & Payment</h2><ul className="list-disc pl-5 space-y-2"><li>Orders are confirmed only after successful payment.</li><li>We accept UPI, Debit/Credit Cards, and Net Banking via Razorpay.</li><li>Cash on Delivery (COD) may be available at checkout for eligible orders.</li><li>We reserve the right to refuse or cancel any order at our sole discretion.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">4. Shipping & Delivery</h2><ul className="list-disc pl-5 space-y-2"><li>Orders are processed within 1–2 business days.</li><li>Estimated delivery is 3–7 business days depending on your location.</li><li>We are not responsible for delays caused by courier partners or circumstances beyond our control.</li><li>Risk of loss and title for items pass to you upon delivery.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">5. Returns & Refunds</h2><p>Please refer to our <Link href="/refund" className="text-[#29bc89] font-semibold underline">Refund Policy</Link> for full details on returns, exchanges, and refunds.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">6. Account Responsibility</h2><ul className="list-disc pl-5 space-y-2"><li>You are responsible for maintaining the confidentiality of your account credentials.</li><li>You agree to provide accurate and complete information when registering.</li><li>We reserve the right to terminate accounts that violate these terms.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">7. Intellectual Property</h2><p>All content on this website, including logos, designs, text, and images, is the property of TeesforTeens and may not be reproduced or used without written permission.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2><p>TeesforTeens shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific order in question.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">9. Governing Law</h2><p>These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact Us</h2><div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm space-y-1"><p><strong>TeesforTeens</strong></p><p>Email: <a href="mailto:teesforteens.support@gmail.com" className="text-[#29bc89] font-semibold">teesforteens.support@gmail.com</a></p></div></section>
        </div>
      </div>
    </div>
  );
}
