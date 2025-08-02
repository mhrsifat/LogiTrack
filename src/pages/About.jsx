import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const timelineData = [
  { year: "2023", title: "Founded", description: "LogiTrack was founded with the vision to simplify truck logistics in Bangladesh." },
  { year: "2024", title: "Beta Launch", description: "We released our first beta version with basic booking features." },
  { year: "2024", title: "App Release", description: "The official LogiTrack app was launched for both Android and web." },
  { year: "2025", title: "1000+ Users", description: "We reached 1,000 active users and onboarded hundreds of verified drivers." },
];

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">About LogiTrack</h1>
      <p className="text-lg text-gray-700 mb-10 text-center">
        LogiTrack is a platform built to revolutionize logistics by offering smooth booking, verified drivers, and real-time support.
      </p>

      <h2 className="text-2xl font-semibold mb-6 text-center">Our Journey</h2>
      
      <div className="relative border-l-4 border-blue-500 pl-6 ml-2">
        {timelineData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="text-sm text-blue-600 font-semibold">{item.year}</div>
            <div className="text-xl font-bold text-gray-900">{item.title}</div>
            <p className="text-gray-700">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default About;