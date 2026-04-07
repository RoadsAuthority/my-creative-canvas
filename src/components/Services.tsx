import { motion } from "framer-motion";
import { Code, Palette, ChefHat, PenTool, Briefcase } from "lucide-react";

const services = [
  {
    icon: Code,
    title: "Software Development",
    description: "Full-stack applications built with modern technologies, clean architecture, and scalable solutions.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "User-centered interfaces that balance aesthetics with functionality for delightful digital experiences.",
  },
  {
    icon: PenTool,
    title: "Graphic Design",
    description: "Brand identities, illustrations, and visual systems that communicate with clarity and impact.",
  },
  {
    icon: ChefHat,
    title: "Culinary Arts",
    description: "Creative cuisine blending tradition with innovation — from private dining to menu consulting.",
  },
  {
    icon: Briefcase,
    title: "Freelance Consulting",
    description: "Strategic guidance for startups and businesses looking to elevate their digital and creative presence.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const Services = () => {
  return (
    <section id="services" className="py-24 md:py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="mb-3 text-sm uppercase tracking-widest text-primary">What I Do</p>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Services & <span className="text-gradient">Skills</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={item}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group glass-card rounded-[1.35rem] p-8 transition-shadow duration-500 hover:glow-primary"
            >
              <motion.div
                className="glass-frosted mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
                whileHover={{ rotate: [0, -6, 6, 0], scale: 1.08 }}
                transition={{ duration: 0.45 }}
              >
                <service.icon className="h-7 w-7 text-primary" />
              </motion.div>
              <h3 className="mb-3 font-display text-xl font-semibold">{service.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
