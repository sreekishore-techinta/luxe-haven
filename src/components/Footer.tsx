import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="luxury-gradient text-champagne">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4">
              LUXE<span className="text-gold">DRAPE</span>
            </h3>
            <p className="font-body text-xs text-gold-light/70 leading-relaxed">
              Curating the finest handcrafted silk sarees and ethnic wear since 2020.
              Every piece celebrates India's rich textile heritage.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.3em] mb-5 text-gold-light">Quick Links</h4>
            <ul className="space-y-3">
              {["Collections", "New Arrivals", "Best Sellers", "About Us"].map((item) => (
                <li key={item}>
                  <Link to="/collections" className="font-body text-sm text-champagne/70 hover:text-gold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.3em] mb-5 text-gold-light">Customer Care</h4>
            <ul className="space-y-3">
              {["Shipping & Returns", "Size Guide", "Care Instructions", "Contact Us"].map((item) => (
                <li key={item}>
                  <Link to="/" className="font-body text-sm text-champagne/70 hover:text-gold transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-[0.3em] mb-5 text-gold-light">Stay Connected</h4>
            <p className="font-body text-xs text-champagne/70 mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-charcoal-light border border-gold/20 text-champagne font-body text-sm placeholder:text-champagne/40 focus:outline-none focus:border-gold/50"
              />
              <button className="px-4 py-2.5 gold-gradient text-accent-foreground font-body text-xs uppercase tracking-wider">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-[11px] text-champagne/50">
            © 2026 LuxeDrape. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link key={item} to="/" className="font-body text-[11px] text-champagne/50 hover:text-gold transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
