import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass-subtle border-t border-white/10 px-6 py-10 md:px-16 lg:px-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Portfolio. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {["GitHub", "LinkedIn", "Dribbble", "Twitter"].map((social) => (
            <motion.a
              key={social}
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              whileHover={{ y: -2 }}
            >
              {social}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
