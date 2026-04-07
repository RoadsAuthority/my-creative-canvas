import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="relative px-6 py-24 md:px-16 md:py-32 lg:px-24">
      <div className="absolute inset-0 -z-10 bg-secondary/25 backdrop-blur-[2px]" />
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="glass-frosted rounded-[1.75rem] p-8 md:p-10"
          >
            <p className="text-primary text-sm tracking-widest uppercase mb-3">About Me</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
              Where code meets
              <br />
              <span className="text-gradient">creativity.</span>
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
              <p>
                I'm a multidisciplinary creative who thrives at the intersection of technology, design, and culinary arts. With years of experience spanning software development and visual design, I bring a unique perspective to every project.
              </p>
              <p>
                When I'm not writing code or pushing pixels, you'll find me in the kitchen experimenting with new recipes — because great design and great food share the same foundation: attention to detail, balance, and a dash of boldness.
              </p>
              <p>
                As a freelancer, I partner with startups, agencies, and individuals to bring ambitious ideas to life — from full-stack applications to brand identities to private dining experiences.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { number: "8+", label: "Years Experience" },
              { number: "120+", label: "Projects Delivered" },
              { number: "50+", label: "Happy Clients" },
              { number: "5", label: "Creative Disciplines" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i, duration: 0.45 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card rounded-2xl p-6 text-center transition-shadow duration-300 hover:glow-primary"
              >
                <p className="mb-1 font-display text-3xl font-bold text-gradient md:text-4xl">
                  {stat.number}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
