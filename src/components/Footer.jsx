import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-teal-400 text-center">
      <p>
        Made with <FontAwesomeIcon icon={faHeart} className="text-red-700" /> by <a href="https://www.mhrsifat.xyz" className="text-red-700">MhrSifat</a>
      </p>
    </div>
  );
};

export default Footer;
