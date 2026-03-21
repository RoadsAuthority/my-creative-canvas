import { motion } from "framer-motion";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 lg:px-24 py-5 flex items-center justify-between glass-subtle"
    >
      <a href="#" className="font-display font-bold text-xl tracking-tight">
        Portfolio<span className="text-primary">.</span>
      </a>

      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide"
          >
            {link.label}
          </a>
        ))}
      </div>

      <a
        href="mailto:hello@example.com"
        className="px-5 py-2 glass rounded-full text-sm font-semibold text-primary hover:glow-primary transition-all duration-300"
      >
        Hire Me
      </a>
    </motion.nav>
  );
};

export default Navbar;
