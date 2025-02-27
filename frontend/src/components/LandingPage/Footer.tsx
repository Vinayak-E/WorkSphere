import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    "New to WorkShpere?": [
      "Product overview",
      "All features",
      "Latest feature release",
      "Pricing",
      "Starter plan",
      "Advanced plan",
      "Enterprise",
      "App integrations",
      "Project management",
      "Resource management",
    ],
    "Use cases": [
      "Task  Management",
      "Project  Management",
      "Project Planning",
      "Video Conference Meetings",
      "Payrol",
      "Real-Time Messaging",
      "All use cases",
    ],

    Resources: [
      "Help Center",
      "Get support",
      "Customer Success",
      "Developers and API",
      "Partners",
      "Sitemap",
    ],
    Company: [
      "About us",
      "Leadership",
      "Customers",
      "Careers",
      "Trust and security",
      "Privacy",
    ],
  };

  return (
    <footer className="bg-background relative w-full overflow-hidden pt-4 mb-10 r">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12 ">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left Side */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <span className="text-sm text-muted-foreground">
                © 2024 WorkSphere, Inc.
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">English</span>
              </div>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Terms & Privacy
              </a>
            </div>

            {/* Right Side */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
