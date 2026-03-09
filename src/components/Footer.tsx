import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "Collections", path: "/collections" },
    { name: "New Arrivals", path: "/new-arrivals" },
    { name: "Best Sellers", path: "/best-sellers" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/about" },
  ],
  help: [
    { name: "Shipping & Returns", path: "/" },
    { name: "Size Guide", path: "/" },
    { name: "Care Instructions", path: "/" },
  ],
};

const Footer = () => {
  return (
    <footer className="luxury-gradient text-champagne">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-2xl font-semibold mb-4">
              LUXE<span className="text-gold">DRAPE</span>
            </h3>
            <p className="font-body text-xs text-gold-light/60 leading-relaxed mb-6 max-w-sm">
              Curating the finest handcrafted silk sarees and ethnic wear since 2020.
              Every piece celebrates India's rich textile heritage, woven with passion
              by master artisans.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 flex items-center justify-center border border-gold/20 hover:border-gold/50 hover:bg-gold/10 transition-all duration-300">
                  <Icon size={15} className="text-gold-light/60" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] mb-5 text-gold-light/80">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="font-body text-sm text-champagne/60 hover:text-gold transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] mb-5 text-gold-light/80">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="font-body text-sm text-champagne/60 hover:text-gold transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] mb-5 text-gold-light/80">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="font-body text-sm text-champagne/60 hover:text-gold transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-14 pt-10 border-t border-gold/10">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="font-display text-lg text-champagne mb-1">Join the LuxeDrape World</h4>
              <p className="font-body text-xs text-champagne/50">Subscribe for exclusive offers and new arrivals.</p>
            </div>
            <div className="flex max-w-md lg:ml-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 bg-charcoal-light border border-gold/15 text-champagne font-body text-sm placeholder:text-champagne/30 focus:outline-none focus:border-gold/40 transition-colors"
              />
              <button className="px-6 py-2.5 gold-gradient text-accent-foreground font-body text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-[11px] text-champagne/40">
            © 2026 LuxeDrape. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <Link key={item} to="/" className="font-body text-[11px] text-champagne/40 hover:text-gold transition-colors">
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
