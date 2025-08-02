import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Example partner logos (replace with your real logo URLs)
const partnerLogos = [
  "/brands/dhl.png",
  "/brands/fedex.png",
  "/brands/pathao.png",
  "/brands/uber.png",
  "/brands/tnt.png",
  "/brands/aramex.png",
  "/brands/ups.png",
];

const logoWidth = 100;

const Partners = () => {
  return (
    <section className="bg-white py-12 overflow-hidden">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
        Trusted by Leading Logistics Partners
      </h2>

      <div className="relative w-full overflow-hidden">
        {/* Double list for seamless loop */}
        <motion.div
          className="flex gap-12"
          style={{ width: "max-content" }}
          animate={{ x: [0, -logoWidth * partnerLogos.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {[...partnerLogos, ...partnerLogos].map((logo, idx) => (
            <img
              key={idx}
              src={logo}
              alt={`Partner ${idx}`}
              className="w-[100px] h-auto object-contain"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Partners;
