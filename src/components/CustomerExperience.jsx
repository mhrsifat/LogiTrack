import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Rahim Hossain",
    role: "Business Owner",
    photo: "/users/rahim.jpg",
    feedback:
      "LogiTrack made our deliveries so much easier and on-time. The drivers are professional and the tracking system is reliable.",
    rating: 5,
  },
  {
    name: "Sumaiya Akter",
    role: "Logistics Manager",
    photo: "/users/sumaiya.jpg",
    feedback:
      "Customer support is always responsive and helpful. The booking process is smooth and transparent.",
    rating: 4,
  },
  {
    name: "Kamal Ahmed",
    role: "Freelance Transporter",
    photo: "/users/kamal.jpg",
    feedback:
      "I love how easy it is to get bookings via LogiTrack. The app is intuitive and drivers get good support.",
    rating: 5,
  },
  {
    name: "Farhana Islam",
    role: "Supply Chain Specialist",
    photo: "/users/farhana.jpg",
    feedback:
      "The transparency and real-time updates have made managing shipments stress-free.",
    rating: 5,
  },
  {
    name: "Tariq Rahman",
    role: "Warehouse Manager",
    photo: "/users/tariq.jpg",
    feedback:
      "Efficient, affordable, and reliable. I recommend LogiTrack to everyone in logistics.",
    rating: 5,
  },
];

const cardWidth = 320; // width of each testimonial card (adjust if needed)

const CustomerExperience = () => {
  return (
    <section className="max-w-full overflow-hidden bg-gray-50 py-12">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
        What Our Customers Say
      </h2>

      {/* Motion container: animate x to scroll left infinitely */}
      <motion.div
        className="flex gap-6 px-8"
        style={{ width: "max-content" }}
        animate={{ x: [0, -cardWidth * testimonials.length] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30, // adjust speed here (seconds)
            ease: "linear",
          },
        }}
      >
        {/* Render testimonials twice for seamless looping */}
        {[...testimonials, ...testimonials].map(
          ({ name, role, photo, feedback, rating }, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 shadow-md flex-shrink-0"
              style={{ width: cardWidth }}
            >
              <div className="flex items-center mb-4 gap-4">
                <img
                  src={photo}
                  alt={name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
                  <p className="text-sm text-gray-500">{role}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 text-sm">"{feedback}"</p>

              <div className="flex">
                {[...Array(5)].map((_, idx) => (
                  <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
                      idx < rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.286 3.97c.3.92-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.176 0l-3.388 2.46c-.785.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.045 9.397c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
                  </svg>
                ))}
              </div>
            </div>
          )
        )}
      </motion.div>
    </section>
  );
};

export default CustomerExperience;
