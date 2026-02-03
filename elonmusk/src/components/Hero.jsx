import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroBg from "../assets/hero.jpg";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Hero() {
  const isMobile = useIsMobile();

  return (
    <section
      className="relative z-10"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div
        className="relative container-custom"
        style={{
          paddingTop: isMobile ? "9rem" : "11rem",
          paddingBottom: isMobile ? "6rem" : "8rem",
        }}
      >
        <motion.div
          className="text-center max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="hero-title mb-6"
            style={{
              fontSize: isMobile ? "2.4rem" : "3.6rem",
              lineHeight: "1.15",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            Invest in the
            <span className="gradient-text block">
              Future of Humanity
            </span>
          </motion.h1>

          <motion.p
            className="text-white/80 mb-12 mx-auto"
            style={{
              fontSize: isMobile ? "1rem" : "1.15rem",
              maxWidth: "48rem",
              paddingInline: isMobile ? "1rem" : "0",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Making life multiplanetary and accelerating the transition to
            sustainable energy. Join us in funding revolutionary technologies
            that will shape tomorrow.
          </motion.p>

          <motion.div
            className="flex justify-center gap-6"
            style={{
              flexDirection: isMobile ? "column" : "row",
              paddingInline: isMobile ? "1.5rem" : "0",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link to="/register" className="btn-primary">
              Start Investing Now
            </Link>
            <button className="btn-neon">Learn More</button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
