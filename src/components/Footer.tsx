const Footer = () => {
  return (
    <footer className="py-8 px-6 md:px-16 lg:px-24 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Portfolio. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {["GitHub", "LinkedIn", "Dribbble", "Twitter"].map((social) => (
            <a
              key={social}
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
