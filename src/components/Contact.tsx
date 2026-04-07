import { motion } from "framer-motion";
import { Mail, ArrowUpRight } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="px-6 py-24 md:px-16 md:py-32 lg:px-24">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="glass-frosted rounded-[2rem] px-8 py-14 md:px-14 md:py-16"
        >
          <p className="mb-3 text-sm uppercase tracking-widest text-primary">Get In Touch</p>
          <h2 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Let&apos;s create something
            <br />
            <span className="text-gradient">extraordinary.</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Whether you need a website, a brand identity, a private dining experience, or all of the
            above — I&apos;d love to hear from you.
          </p>

          <motion.a
            href="mailto:hello@example.com"
            className="glass-pill group inline-flex items-center gap-3 rounded-full px-10 py-4 font-display text-lg font-semibold text-primary-foreground"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Mail className="h-5 w-5" />
            Say Hello
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
