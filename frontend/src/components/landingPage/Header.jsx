import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logoimg from "../../assets/logo.png"
import { tl } from '../../lib/landingTranslation';

export function Header({ lang }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: tl("nav_features", lang), href: "#features" },
    { label: tl("nav_developers", lang), href: "#developers" },
    { label: tl("nav_security", lang), href: "#security" },
    { label: tl("nav_pricing", lang), href: "#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1440px] mx-auto px-16 py-6">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <div>
              <img src={Logoimg} alt="AurionPay Logo"  className="w-8 h-8 rounded-sm"/>
            </div>
            <span className="text-xl font-bold">AurionPay</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#"
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors font-medium"
            >
              {tl("nav_documentation", lang)}
            </a>
            <Link
              to="/app"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              {tl("launchApp", lang)}
            </Link>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 p-6 rounded-2xl bg-[#0f1729] border border-white/10">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <div className="pt-4 border-t border-white/10 space-y-3">
                <a
                  href="#"
                  className="block w-full px-6 py-3 text-center bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  {tl("nav_documentation", lang)}
                </a>
                <Link
                  to="/app"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-6 py-3 text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium"
                >
                  {tl("launchApp", lang)}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}