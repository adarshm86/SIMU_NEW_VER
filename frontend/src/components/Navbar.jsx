import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/how-to-use" },
  { label: "Laboratory", to: "/dashboard" },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-0 right-0 z-50 flex justify-center px-6"
    >
      <nav
        /* 80% Transparent (bg-stone-900/20) with fully rounded capsule corners */
        className={`w-full max-w-6xl flex items-center justify-between p-2 pl-6 rounded-full backdrop-blur-md border border-white/10 bg-stone-900/20 transition-all duration-300 ${
          scrolled ? "shadow-2xl  border-emerald-500/20 bg-stone-900/30" : ""
        }`}
        style={{ fontFamily: "'Pally', sans-serif" }}
      >
        {/* Project Title */}
        <Link
          to="/"
          className="flex items-center gap-3 text-[#FFAb0F] hover:text-earth-300 transition-colors"
        >
         
          <span className="font-bold text-base sm:text-lg tracking-wide uppercase font-[stardom]">
            M E S
          </span>
        </Link>

        {/* Center Navigation Links - Fully rounded inner wrapper */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5 shadow-inner">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                /* Fully rounded inner pills */
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  active 
                    ? "text-emerald-100 bg-[#74421f'] border border[#FFAB0F] shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                    : "text-stone-300 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Corner: About Us Page - Fully rounded border pill */}
        <div className="flex items-center pr-1">
          <Link
            to="/about"
            className={`px-6 py-2.5 rounded-full border text-sm font-bold tracking-wide transition-all duration-300 ${
              location.pathname === "/about"
                ? "border-emerald-400 text-white font-semibold bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "border-emerald-700/50 text-white font-semibold hover:border-emerald-400 hover:text-[#e0be7e] hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            }`}
          >
            About Us
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}