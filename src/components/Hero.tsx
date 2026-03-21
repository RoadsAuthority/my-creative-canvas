import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/50 -z-10 hidden lg:block" />
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-accent/15 blur-2xl -z-10" />

      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-muted-foreground text-sm md:text-base tracking-widest uppercase mb-6"
        >
          Developer · Designer · Chef · Freelancer
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.95] tracking-tight mb-8"
        >
          I craft
          <br />
          <span className="text-gradient">digital &</span>
          <br />
          <span className="text-gradient">real-world</span>
          <br />
          experiences.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed"
        >
          A multidisciplinary creative blending code, pixels, and flavors
          into memorable experiences.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <a href="#services" className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;
