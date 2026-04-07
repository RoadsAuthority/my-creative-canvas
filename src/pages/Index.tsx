import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Ambient mesh + animated blobs (glassmorphism backdrop) */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,hsl(var(--accent)/0.12),transparent_50%),radial-gradient(ellipse_60%_40%_at_0%_80%,hsl(var(--primary)/0.08),transparent_45%)]" />
        <div className="absolute -left-[20%] top-[10%] h-[min(90vw,520px)] w-[min(90vw,520px)] rounded-full bg-primary/25 blur-[100px] animate-blob motion-reduce:animate-none" />
        <div className="absolute -right-[15%] top-[35%] h-[min(70vw,420px)] w-[min(70vw,420px)] rounded-full bg-accent/20 blur-[90px] animate-blob-alt [animation-delay:-6s] motion-reduce:animate-none" />
        <div className="absolute bottom-[5%] left-[20%] h-[min(60vw,380px)] w-[min(60vw,380px)] rounded-full bg-primary/15 blur-[110px] animate-blob [animation-delay:-11s] motion-reduce:animate-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)/0.15),hsl(var(--background)/0.85)_45%,hsl(var(--background)))]" />
      </div>

      <Navbar />
      <Hero />
      <Services />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
