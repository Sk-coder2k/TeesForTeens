"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is your return policy?",
      answer: "We offer a hassle-free 7-day return policy for all unworn items with tags attached. Please visit our Returns page to initiate a return."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days within the country. Express shipping is available at checkout for 1-2 business day delivery."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship domestically. We are working hard to bring TeesforTeens to the rest of the world soon!"
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you will receive an email with a tracking number. You can also use the 'Track Order' link in the footer of our website."
    },
    {
      question: "What size should I order?",
      answer: "Our oversized tees are designed to fit loose. If you prefer a more tailored fit, we recommend sizing down. Please refer to the Size Guide on each product page for detailed measurements."
    }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-[70vh] py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-mint-600 transition-colors group">
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-center mb-12">Find answers to common questions about our products, shipping, and more.</p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group bg-white rounded-2xl border border-gray-200 p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold text-gray-900 cursor-pointer list-none">
                <span>{faq.question}</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="w-5 h-5 text-mint-600" />
                </span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-line">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Still have questions?</p>
          <a href="/contact" className="inline-block px-8 py-3 bg-mint-600 text-white font-bold rounded-xl hover:bg-mint-500 transition-colors shadow-sm">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
