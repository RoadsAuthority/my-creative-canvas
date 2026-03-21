import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-16 lg:px-24 relative">
      <div className="absolute inset-0 bg-secondary/30 -z-10" />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
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
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { number: "8+", label: "Years Experience" },
              { number: "120+", label: "Projects Delivered" },
              { number: "50+", label: "Happy Clients" },
              { number: "5", label: "Creative Disciplines" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card p-6 rounded-2xl text-center"
              >
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient mb-1">
                  {stat.number}
                </p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
