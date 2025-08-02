import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
        About LogiTrack
      </h2>
      <p className="text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed text-center">
        LogiTrack is your trusted logistics partner, offering reliable and
        efficient transportation services for trucks and pickups. Our goal is to
        simplify your delivery process with modern technology, real-time tracking,
        and a dedicated support team.
      </p>
      <div className="mt-10 flex justify-center">
        <Link to='/about' className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300">
          Learn More
        </Link>
      </div>
    </section>
  );
};

export default AboutUs;
