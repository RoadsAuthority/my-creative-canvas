import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";

const projects = [
  {
    image: project1,
    title: "E-Commerce Dashboard",
    category: "Software Development",
    description: "Full-stack product management platform with real-time analytics and inventory tracking.",
  },
  {
    image: project2,
    title: "Savory — Food Delivery App",
    category: "UI/UX Design · Chef",
    description: "Mobile-first food delivery experience featuring curated chef menus and live order tracking.",
  },
  {
    image: project3,
    title: "Gilt Melt Brand Identity",
    category: "Graphic Design",
    description: "Complete brand system including logo, typography, stationery, and brand guidelines.",
  },
  {
    image: project4,
    title: "Private Dining Experience",
    category: "Culinary Arts",
    description: "Intimate 8-course tasting menu blending molecular gastronomy with classic French technique.",
  },
  {
    image: project5,
    title: "SaaS Analytics Platform",
    category: "Software Development",
    description: "Data visualization dashboard processing millions of events with real-time charting.",
  },
  {
    image: project6,
    title: "CANRS Portfolio Redesign",
    category: "Freelance · Design",
    description: "Complete website overhaul for a fashion brand — strategy, design, and development.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Projects = () => {
  return (
    <section id="projects" className="py-24 md:py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="text-primary text-sm tracking-widest uppercase mb-3">Selected Work</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Featured <span className="text-gradient">Projects</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              variants={item}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="group glass-card overflow-hidden rounded-[1.35rem] transition-shadow duration-500 hover:glow-primary"
            >
              <div className="relative overflow-hidden">
                <motion.img
                  src={project.image}
                  alt={project.title}
                  className="h-48 w-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-background/90 via-background/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <motion.div
                    className="glass-frosted flex h-11 w-11 items-center justify-center rounded-full"
                    whileHover={{ scale: 1.12, rotate: 12 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </motion.div>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-2 text-xs uppercase tracking-widest text-primary">{project.category}</p>
                <h3 className="mb-2 font-display text-lg font-semibold">{project.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
