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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              variants={item}
              className="group glass-card rounded-2xl overflow-hidden hover:glow-primary transition-all duration-500"
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-primary text-xs tracking-widest uppercase mb-2">{project.category}</p>
                <h3 className="text-lg font-display font-semibold mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{project.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
