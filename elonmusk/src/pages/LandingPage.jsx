import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaRocket, 
  FaBolt, 
  FaBrain, 
  FaCar,
  FaNetworkWired,
  FaArrowRight,
  FaChartLine,
  FaShieldAlt,
  FaGlobe,
  FaClock
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import teslaBg from "../assets/tesla.jpg";
import spacexBg from "../assets/spacex.jpg";
import deepmindBg from "../assets/deepmind.jpg";
import boringBg from "../assets/boring.jpg";
import neuralinkBg from "../assets/neuralink.jpg";
 import ctaBg from "../assets/cta.jpg";
 import logo from '../assets/brandmark.svg'

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  //companies
const companies = [
  {
    name: "Tesla",
    description: "Accelerating sustainable energy",
    bg: teslaBg,
  },
  {
    name: "SpaceX",
    description: "Making life multiplanetary",
    bg: spacexBg,
  },
  {
    name: "DeepMind Technology",
    description: "Advancing artificial intelligence",
    bg: deepmindBg,
  },
  {
    name: "The Boring Company",
    description: "Revolutionizing transportation",
    bg: boringBg,
  },
  {
    name: "Neuralink",
    description: "Connecting minds to machines",
    bg: neuralinkBg,
  },
];


 const plans = [
  { 
    name: "Starter",
    rate: "8-12%",
    color: "bg-gray-100 border border-gray-300 text-gray-900",
    features: ["Perfect for beginners", "Low risk", "Stable returns"]
  },
  { 
    name: "Silver",
    rate: "15-20%",
    color: "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900",
    features: ["Growing portfolio", "Medium risk", "Balanced growth"]
  },
  { 
    name: "Gold",
    rate: "25-35%",
    color: "bg-gradient-to-br from-yellow-300 to-yellow-500 text-gray-900",
    features: ["High performance", "Higher returns", "Premium access"]
  },
  { 
    name: "Platinum",
    rate: "40-50%",
    color: "bg-gradient-to-br from-purple-400 to-pink-500 text-white",
    features: ["Maximum returns", "Exclusive benefits", "VIP treatment"]
  }
];


  const features = [
    {
      icon: FaChartLine,
      title: 'Real-Time Growth',
      description: 'Track your investments growing in real-time with advanced analytics'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Trusted',
      description: 'Bank-level security with verified assets backing every investment'
    },
    {
      icon: FaClock,
      title: 'Flexible Terms',
      description: 'Invest from 1 week onwards with amounts starting at just $100'
    },
    {
      icon: FaGlobe,
      title: 'Global Access',
      description: 'Multiple payment methods accepted worldwide, 24/7 access'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-space"></div>
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-20"></div>
        
        {/* Animated Orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Navigation */}
          <Navbar scrolled={scrolled} />

      {/* Hero Section */}
     
          <Hero/>
          <Stats/>
      {/* Companies Section */}
      <section className="relative z-10 py-20 md:py-28">
  <div className="container-custom px-4 md:px-0">
    
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="text-center mb-14 md:mb-20"
    >
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
        <span className="gradient-text">Revolutionary Companies</span>
      </h2>
      <p className="text-base md:text-xl text-white/70 max-w-2xl mx-auto">
        Invest in groundbreaking technologies shaping the future
      </p>
    </motion.div>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {companies.map((company, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden group cursor-pointer min-h-[260px]"
          style={{
            backgroundImage: `url(${company.bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-colors" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              {company.name}
            </h3>
            <p className="text-white/75 leading-relaxed text-sm md:text-base">
              {company.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>

  </div>
</section>


      {/* Features Section */}
      <section className="section-spacing relative z-10 bg-black/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-bold mb-4">
              <span className="gradient-text">Why Choose Us</span>
            </h2>
            <p className="text-xl text-white/70">
              The future of investing is here
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="section-spacing relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-display font-bold mb-4">
              <span className="gradient-text">Investment Plans</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Choose the plan that matches your ambitions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`text-center relative overflow-hidden group rounded-2xl p-6 md:p-8 ${plan.color} ${
                plan.name === "Platinum" ? "ring-2 ring-neon-purple" : ""
                }`}

                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                {plan.name === 'Platinum' && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-neon-purple to-neon-pink px-3 py-1 rounded-full text-xs font-bold">
                    BEST VALUE
                  </div>
                )}
                <div className="text-3xl font-bold mb-2">{plan.name}</div>
                <div className="text-5xl font-display font-black mb-6">
                  <span className="gradient-text">{plan.rate}</span>
                </div>
                <div className="text-sm text-white/70 mb-6">Annual Returns</div>
                <ul className="space-y-3 text-left mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-neon-blue mr-2">✓</span>
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold hover:scale-105 transition-transform">
                  Select Plan
                </button>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-white/70 mb-6">
              Minimum investment: $100 USD • Minimum duration: 1 week
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center group">
              Start Your Journey
              <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}

<section
  className="relative z-10 py-24 md:py-32"
  style={{
    backgroundImage: `url(${ctaBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/70" />

  <div className="relative container-custom px-4 md:px-0">
    <motion.div
      className="text-center max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
        Ready to Shape the Future?
      </h2>

      <p className="text-base md:text-2xl text-white/80 mb-10 leading-relaxed">
        Join thousands of investors who are funding the technologies that will
        define our civilization's next chapter. Start with as little as $100.
      </p>

      <Link
        to="/register"
        className="btn-primary inline-flex items-center text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 group"
      >
        Create Free Account
      </Link>
    </motion.div>
  </div>
</section>

      {/* Footer */}
    

<footer className="relative z-10 bg-black/50 border-t border-white/10 pt-16 pb-10">
  <div className="container-custom px-4 md:px-0">

    {/* Top Grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

      {/* Brand */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={logo}
            alt="The Musk Foundation"
            className="w-10 h-10 object-contain"
          />
          <span className="text-2xl font-display font-bold">
            The Musk Foundation
          </span>
        </div>
        <p className="text-white/60 leading-relaxed text-sm">
          Making life multiplanetary and accelerating the transition to
          sustainable energy through strategic investments in future-defining
          technologies.
        </p>
      </div>

      {/* Company */}
      <div>
        <h4 className="font-semibold text-white mb-4">Company</h4>
        <ul className="space-y-3 text-sm text-white/60">
          <li>
            <Link to="/about" className="hover:text-white transition">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/careers" className="hover:text-white transition">
              Careers
            </Link>
          </li>
          <li>
            <Link to="/blog" className="hover:text-white transition">
              Blog
            </Link>
          </li>
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h4 className="font-semibold text-white mb-4">Legal</h4>
        <ul className="space-y-3 text-sm text-white/60">
          <li>
            <Link to="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link to="/risk-disclosure" className="hover:text-white transition">
              Risk Disclosure
            </Link>
          </li>
        </ul>
      </div>

      {/* Support */}
      <div>
        <h4 className="font-semibold text-white mb-4">Support</h4>
        <ul className="space-y-3 text-sm text-white/60">
          <li>
            <Link to="/help" className="hover:text-white transition">
              Help Center
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-white transition">
              Contact Us
            </Link>
          </li>
          <li>
            <Link to="/faq" className="hover:text-white transition">
              FAQs
            </Link>
          </li>
        </ul>
      </div>

    </div>

    {/* Bottom Bar */}
    <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-white/40 gap-4">
      <p>
        © {new Date().getFullYear()} The Musk Foundation. All rights reserved.
      </p>
      <p>
        Investing involves risk. Capital is at risk.
      </p>
    </div>

  </div>
</footer>

    </div>
  );
};

export default LandingPage;
