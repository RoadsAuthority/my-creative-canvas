import { motion } from "framer-motion";
import { Mail, ArrowUpRight } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-primary text-sm tracking-widest uppercase mb-3">Get In Touch</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Let's create something
            <br />
            <span className="text-gradient">extraordinary.</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Whether you need a website, a brand identity, a private dining experience,
            or all of the above — I'd love to hear from you.
          </p>

          <a
            href="mailto:hello@example.com"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-display font-semibold hover:opacity-90 transition-opacity group"
          >
            <Mail className="w-5 h-5" />
            Say Hello
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
