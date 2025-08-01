import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"; // Assuming you're using shadcn/ui

const HeroSection = () => {
    return (
        <div className="relative w-full h-[90vh] overflow-hidden">
            {/* Background image */}
            <img
                className="w-full h-full object-cover"
                src="/hero.png"
                alt="Hero background"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 text-white">
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Reliable Logistics, Anytime, Anywhere
                </motion.h1>

                <motion.p
                    className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                >
                    Simplify your transport with LogiTrack’s seamless booking
                    and trusted drivers.
                </motion.p>

                <motion.div
                    className="mt-8 flex gap-4"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, delay: 0.4 }}
                >
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-lg rounded-2xl shadow-lg">
                        Book a Vehicle
                    </Button>
                    <Button
                        variant="outline"
                        className="text-white border-white hover:bg-white hover:text-black px-6 py-2 text-lg rounded-2xl"
                    >
                        Learn More
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;
