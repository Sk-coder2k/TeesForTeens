import Link from "next/link";
export const metadata = { title: "Privacy Policy | TeesforTeens" };
export default function PrivacyPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-[70vh] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#29bc89] mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 2026</p>
        <div className="space-y-8 text-gray-600 leading-relaxed text-sm sm:text-base">
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2><p>Welcome to <strong>TeesforTeens</strong> ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website and make purchases from us.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2><ul className="list-disc pl-5 space-y-2"><li><strong>Account Information:</strong> Name, email address, password (encrypted), and phone number when you register.</li><li><strong>Order Information:</strong> Shipping address, billing details, and purchase history when you place an order.</li><li><strong>Payment Information:</strong> We do not store your card details. All payments are processed securely via Razorpay.</li><li><strong>Usage Data:</strong> Pages visited, time spent, and browsing behaviour to improve your experience.</li><li><strong>Device Data:</strong> Browser type, IP address, and device information for security and analytics.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2><ul className="list-disc pl-5 space-y-2"><li>To process and fulfil your orders and send order confirmations.</li><li>To manage your account and provide customer support.</li><li>To send promotional emails and offers (only if you opt in).</li><li>To improve our website, products, and services.</li><li>To detect and prevent fraud and unauthorised access.</li><li>To comply with applicable Indian laws and regulations.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing Your Information</h2><p className="mb-3">We do not sell your personal data. We may share your information with:</p><ul className="list-disc pl-5 space-y-2"><li><strong>Shipping Partners:</strong> To deliver your orders (name, address, phone).</li><li><strong>Payment Processors:</strong> Razorpay for secure payment handling.</li><li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies</h2><p>We use cookies to keep you logged in, remember your cart, and analyse site traffic. You can disable cookies in your browser settings, but some features may not work correctly.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Security</h2><p>We implement industry-standard security measures including encrypted connections (HTTPS), password hashing, and secure cloud storage to protect your data. However, no method of transmission over the internet is 100% secure.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2><ul className="list-disc pl-5 space-y-2"><li>Access, correct, or delete your personal data.</li><li>Opt out of marketing emails at any time via the unsubscribe link.</li><li>Request a copy of the data we hold about you.</li></ul><p className="mt-3">To exercise these rights, email us at <a href="mailto:teesforteens.support@gmail.com" className="text-[#29bc89] font-semibold">teesforteens.support@gmail.com</a>.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">8. Children's Privacy</h2><p>Our services are intended for users aged 13 and above. We do not knowingly collect personal information from children under 13.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact Us</h2><div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm space-y-1"><p><strong>TeesforTeens</strong></p><p>Email: <a href="mailto:teesforteens.support@gmail.com" className="text-[#29bc89] font-semibold">teesforteens.support@gmail.com</a></p></div></section>
        </div>
      </div>
    </div>
  );
}
