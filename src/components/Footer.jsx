import React from "react";
import { Link } from "react-router-dom";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Logo & Brand Info */}
        <div>
          <Link to="/" className="text-white text-2xl font-bold">
            LogiTrack
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Trusted logistics platform for truck and pickup delivery across the
            country. Fast. Reliable. Real-time.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Navigation</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="hover:text-white transition-colors"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/support"
                className="hover:text-white transition-colors"
              >
                Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-1" />{" "}
              <span>123/A Gulshan, Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> <span>+880 1234 567 890</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> <span>support@logitrack.mhrsifat.xyz</span>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Follow Us</h4>
          <div className="flex gap-4 items-center">
            <a
              href="https://facebook.com/mhrsifat"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href="https://instagram.com/mhrsifat"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://twitter.com/mhrsifat"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 text-center text-sm text-gray-400 py-4 px-6 flex flex-col md:flex-row justify-between items-center px-10">
        <p>&copy; {new Date().getFullYear()} LogiTrack. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with{" "}
          <FontAwesomeIcon icon={faHeart} className="text-red-600" /> by{" "}
          <a
            href="https://www.mhrsifat.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline"
          >
            MhrSifat
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
