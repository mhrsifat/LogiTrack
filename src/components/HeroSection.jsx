import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className="relative w-full h-full">
      <img className="w-full h-full object-cover" src="/hero.png" alt="Hero" />

      <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-full text-center px-4">
        <motion.h1
          className="text-black text-4xl sm:text-5xl font-bold drop-shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to LogiTrack
        </motion.h1>
      </div>
    </div>
  );
};

export default HeroSection;
