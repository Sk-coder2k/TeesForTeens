import Link from "next/link";

export default function ShippingPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-[70vh] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 mb-6 transition-colors group">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Shipping & Returns</h1>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Information</h2>
            <p className="mb-4">
              We process all orders within 1-2 business days. Delivery times depend on your location and the shipping method selected at checkout.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Standard Shipping:</strong> 3-5 business days. Free on orders over ₹2000.</li>
              <li><strong>Express Shipping:</strong> 1-2 business days. Flat rate of ₹150.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Policy</h2>
            <p className="mb-4">
              If you aren't completely satisfied with your purchase, you can return unworn, unwashed items with original tags attached within 7 days of delivery.
            </p>
            <p className="mb-4">
              Please note that original shipping charges are non-refundable. A return shipping fee of ₹100 will be deducted from your refund amount.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Initiate a Return</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Ensure your item is in original condition with tags attached.</li>
              <li>Visit our Contact Us page and enter your order number.</li>
              <li>Select "Return or Exchange" from the inquiry dropdown.</li>
              <li>Our support team will email you a prepaid return label within 24 hours.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
