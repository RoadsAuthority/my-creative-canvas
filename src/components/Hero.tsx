import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-24 pt-32 md:px-16 md:pb-32 md:pt-36 lg:px-24"
    >
      {/* Local glass accents */}
      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none absolute -right-[12%] top-[18%] -z-10 h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-[3rem] bg-gradient-to-br from-primary/20 to-accent/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[12%] left-[-8%] -z-10 h-72 w-72 rounded-full bg-accent/15 blur-[80px] animate-float-slow motion-reduce:animate-none"
        aria-hidden
      />

      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="glass-frosted mb-8 inline-flex items-center rounded-full px-5 py-2.5"
        >
          <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Developer · Designer · Chef · Freelancer
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.08 }}
          className="mb-8 font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
        >
          I craft
          <br />
          <span className="text-gradient text-gradient-animated">digital &</span>
          <br />
          <span className="text-gradient">real-world</span>
          <br />
          experiences.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          A multidisciplinary creative blending code, pixels, and flavors into memorable
          experiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <motion.a
            href="#projects"
            className="glass-pill inline-flex items-center justify-center rounded-full px-8 py-3.5 font-display font-semibold text-primary-foreground"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            View work
          </motion.a>
          <motion.a
            href="#contact"
            className="glass-frosted inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-3.5 font-display font-semibold text-foreground transition-colors hover:border-white/25"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Let&apos;s talk
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <motion.a
          href="#services"
          className="glass-subtle flex flex-col items-center gap-2 rounded-full px-4 py-3 text-muted-foreground transition-colors hover:text-primary"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </motion.a>
      </motion.div>
    </section>
  );
};

export default Hero;
