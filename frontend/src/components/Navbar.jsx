import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from '../assets/logoofcompany.png'

const Navbar = () => {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuOpen(false); // close menu when switching to desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

    return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src={Logo} alt="Logo" />
            </div>
            <span className="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              The Musk Foundation
            </span>
          </div>

          {/* Desktop Buttons */}
          {!mobile && (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:border-primary-600 hover:text-primary-600 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          {mobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-gray-800"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobile && menuOpen && (
        <div className="bg-white border-t border-gray-200">
          <div className="px-6 py-6 flex flex-col gap-4">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar