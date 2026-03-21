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
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Services = () => {
  return (
    <section id="services" className="py-24 md:py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-primary text-sm tracking-widest uppercase mb-3">What I Do</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Services & Skills
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={item}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
