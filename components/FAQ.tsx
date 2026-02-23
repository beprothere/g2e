"use client";

import React, { useState } from "react";
import { Card } from "./ui/card";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "When will I receive my serum product?",
    a: "Your premium serum will be shipped within 2-3 business days of your deposit. You'll receive a tracking number via email.",
  },
  {
    q: "How do I get paid my earnings?",
    a: "Earnings are automatically transferred to your wallet. You can withdraw anytime once you reach the minimum threshold.",
  },
  {
    q: "Can I switch investor plans?",
    a: "Yes! You can upgrade to a higher tier at any time. Progress from your previous plan carries over.",
  },
  {
    q: "Is there a catch?",
    a: "No catch! Just share your unique referral link, help others join, and earn commissions on their deposits.",
  },
  {
    q: "What happens if my serum order is marked as received by mistake?",
    a: "If an order is marked as received accidentally, please contact our support team immediately. We'll verify the details and assist you accordingly.",
  },
  {
    q: "Will I get email updates about my serum order?",
    a: "Yes, you'll receive email notifications at each important stage, including order confirmation, dispatch, and when your order is marked as received.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index: any) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked
          </h2>
          <p className="text-lg text-foreground/70">
            Everything you need to know
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <Card
                key={i}
                className="glass border-primary/20 p-6 cursor-pointer transition-all"
                onClick={() => toggleFAQ(i)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{faq.q}</h3>

                  {isOpen ? (
                    <Minus className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-primary shrink-0" />
                  )}
                </div>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-4"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-foreground/70">{faq.a}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
