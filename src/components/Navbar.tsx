import { motion } from "framer-motion";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 md:px-8 md:pt-6">
      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
        className="glass-frosted flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-5 py-3 pl-6 shadow-2xl md:px-8"
      >
        <motion.a
          href="#"
          className="font-display text-xl font-bold tracking-tight"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Portfolio<span className="text-primary">.</span>
        </motion.a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i + 0.15, type: "spring", stiffness: 200, damping: 24 }}
              className="group relative text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </div>

        <motion.a
          href="mailto:hello@example.com"
          className="glass-pill rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Hire Me
        </motion.a>
      </motion.nav>
    </header>
  );
};

export default Navbar;
