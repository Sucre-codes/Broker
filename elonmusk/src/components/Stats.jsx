import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Animated counter hook
 */
function useCountUp(end, duration = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    function animate(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      setValue(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [end, duration]);

  return value;
}

function StatCard({ value, suffix, label, start }) {
  const count = useCountUp(start ? value : 0);

  return (
    <div className="glass-card text-center p-6">
      <div className="text-3xl font-bold gradient-text mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-white/70 text-sm">{label}</div>
    </div>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="section-spacing relative z-10">
      <div className="container-custom">
        <motion.div
          ref={ref}
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <StatCard
            value={10}
            suffix="M+"
            label="Total Invested"
            start={isInView}
          />
          <StatCard
            value={5000}
            suffix="+"
            label="Active Investors"
            start={isInView}
          />
          <StatCard
            value={28}
            suffix="%"
            label="Avg. Returns"
            start={isInView}
          />
          <StatCard
            value={95}
            suffix="%"
            label="Success Rate"
            start={isInView}
          />
        </motion.div>
      </div>
    </section>
  );
}
