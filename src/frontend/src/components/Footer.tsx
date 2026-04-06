import { ExternalLink, MapPin, Phone, Sun } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-card border-t border-border mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Sun
                  className="w-5 h-5 text-primary-foreground"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-foreground">
                  MADHAV SOLAR ENERGY
                </div>
                <div className="text-xs text-muted-foreground">
                  AMRELI, GUJARAT
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Field operations management for solar energy projects across
              Gujarat. Real-time tracking and geo-mapping for field teams.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                AMRELI, Gujarat, India
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a
                  href="tel:+919428787879"
                  className="hover:text-primary transition-colors"
                >
                  +91 94287 87879
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm text-foreground mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {["Dashboard", "Field Photos", "GPS Reports", "Fleet Status"].map(
                (link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors inline-flex items-center gap-0.5"
            >
              caffeine.ai <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="font-medium text-foreground">
            Developed by <span className="text-primary">MAULIK SOLANKI</span> |{" "}
            <a
              href="tel:+919428787879"
              className="hover:text-primary transition-colors"
            >
              9428787879
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
