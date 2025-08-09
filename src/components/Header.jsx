import React, { useState } from "react";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/30 text-black px-10 py-3 border-b border-blue-400">
  <div className="flex items-center justify-between">
    <Link to="/" className="text-2xl font-bold">
      <img src="/logitrack.png" alt="LogiTrack" className="h-10" />
    </Link>

    <button className="sm:hidden text-xl" onClick={() => setIsOpen(!isOpen)}>
      <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
    </button>

    <nav className="hidden sm:block">
      <Navbar />
    </nav>
  </div>

  {isOpen && (
    <div className="sm:hidden mt-3">
      <Navbar />
    </div>
  )}
</header>

  );
};

export default Header;

