import React, { useState } from "react";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-teal-600 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        <Link to='/' className="text-2xl font-bold">LogiTrack</Link>

        <button
          className="sm:hidden text-xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </button>

        <nav className="hidden sm:block">
          <Navbar />
        </nav>
      </div>

      <div className={`${isOpen ? "block" : "hidden"} sm:hidden mt-3`}>
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
