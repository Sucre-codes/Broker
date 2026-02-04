import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaBolt,
  FaGlobe,
  FaLeaf,
  FaRocket,
  FaShieldAlt,
  FaUsers
} from 'react-icons/fa';
import logo from '../assets/brandmark.svg';
import heroBg from '../assets/hero.jpg';

const principles = [
  {
    title: 'Mission-Led Capital',
    description: 'We fund frontier breakthroughs that expand human potential and accelerate sustainable progress.',
    icon: FaRocket
  },
  {
    title: 'Radical Transparency',
    description: 'Every investment is paired with clear milestones, performance tracking, and real-time reporting.',
    icon: FaShieldAlt
  },
  {
    title: 'Global Impact',
    description: 'Our portfolio spans clean energy, aerospace, AI, and infrastructure built for the long horizon.',
    icon: FaGlobe
  },
  {
    title: 'Aligned Outcomes',
    description: 'We focus on compounding value for investors, founders, and the communities we serve.',
    icon: FaUsers
  }
];

const timeline = [
  {
    year: '2018',
    title: 'Foundation Launch',
    description: 'A mission-driven investment collective formed to back transformational technology.'
  },
  {
    year: '2020',
    title: 'Global Syndicates',
    description: 'Expanded into cross-border capital syndicates with secure, compliant rails.'
  },
  {
    year: '2022',
    title: 'Growth Engine',
    description: 'Launched real-time portfolio intelligence and automated compounding strategies.'
  },
  {
    year: '2024',
    title: 'Mission Control',
    description: 'Introduced the admin ops suite for instant payment orchestration and verification.'
  }
];

const About = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-space"></div>
        <div className="stars absolute inset-0"></div>
        <div className="cosmic-grid absolute inset-0 opacity-20"></div>
      </div>

      <section
        className="relative z-10"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative container-custom px-4 md:px-0 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <img src={logo} alt="The Musk Foundation" className="w-14 h-14" />
              <span className="text-2xl font-display font-bold">The Musk Foundation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Building the capital engine for humanity&apos;s next frontier.
            </h1>
            <p className="text-lg md:text-2xl text-white/80 leading-relaxed mb-10">
              We are a mission-first investment platform focused on the ideas that accelerate civilization. From
              energy resilience to interplanetary infrastructure, we help visionary founders scale while giving
              investors structured access to transformational growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary inline-flex items-center">
                Join the Mission
                <FaArrowRight className="ml-3" />
              </Link>
              <Link to="/dashboard" className="btn-neon inline-flex items-center">
                Explore the Platform
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 section-spacing">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                A disciplined approach to visionary capital
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                The Musk Foundation blends institutional-grade diligence with founder empathy. Our team sources
                opportunities across aerospace, AI, mobility, and deep-tech infrastructure. Every portfolio is curated
                to balance long-horizon impact with measurable growth milestones.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-3 text-neon-blue">
                    <FaBolt />
                    <span className="font-semibold">Rapid Execution</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Swift payment orchestration and admin workflows ensure your capital reaches mission-ready teams.
                  </p>
                </div>
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-3 text-neon-purple">
                    <FaLeaf />
                    <span className="font-semibold">Sustainable Impact</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Every deployment is aligned with measurable environmental and societal outcomes.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card"
            >
              <h3 className="text-2xl font-display font-semibold mb-6">What we believe</h3>
              <div className="space-y-4">
                {principles.map((principle) => (
                  <div key={principle.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-neon-blue">
                      <principle.icon />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">{principle.title}</p>
                      <p className="text-white/60 text-sm leading-relaxed">{principle.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 section-spacing bg-black/20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Mission timeline</h2>
            <p className="text-white/70">A decade-long path of disciplined execution and compounding impact.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {timeline.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card"
              >
                <p className="text-neon-blue text-sm font-semibold">{milestone.year}</p>
                <h3 className="text-xl font-display font-semibold mb-2">{milestone.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 section-spacing">
        <div className="container-custom">
          <div className="glass-card">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Ready to explore our investment frontier?
                </h2>
                <p className="text-white/70 text-lg">
                  Join the community funding the technologies that will define humanity&apos;s next chapter.
                </p>
              </div>
              <Link to="/register" className="btn-primary inline-flex items-center">
                Start with $100
                <FaArrowRight className="ml-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;