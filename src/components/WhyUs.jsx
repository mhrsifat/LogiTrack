import React from "react";
import { CheckCircle } from "lucide-react"; // Optional icon library

const features = [
  {
    title: "Real-Time Tracking",
    description:
      "Track your vehicle and shipment status live through our advanced GPS technology.",
  },
  {
    title: "Verified Drivers",
    description:
      "All drivers go through background checks and regular performance reviews.",
  },
  {
    title: "Affordable Pricing",
    description:
      "Transparent, competitive pricing with no hidden charges.",
  },
  {
    title: "24/7 Customer Support",
    description:
      "Get help whenever you need with our dedicated support team.",
  },
];

const WhyUs = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 mb-10">
        Why Choose LogiTrack?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="text-blue-600 w-6 h-6 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mt-2">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyUs;
