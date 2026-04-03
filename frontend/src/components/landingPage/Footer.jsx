import { useState } from 'react';
import { Github, Twitter, MessageCircle, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  const footerLinks = {
    product: {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'Roadmap', href: '#' },
        { label: 'Changelog', href: '#' },
      ],
    },
    developers: {
      title: 'Developers',
      links: [
        { label: 'Documentation', href: '#', external: true },
        { label: 'API Reference', href: '#', external: true },
        { label: 'SDK & Tools', href: '#' },
        { label: 'GitHub', href: 'https://github.com/aurionpay', external: true },
        { label: 'Status Page', href: '#', external: true },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Press Kit', href: '#' },
      ],
    },
    resources: {
      title: 'Resources',
      links: [
        { label: 'Community', href: '#' },
        { label: 'Discord', href: 'https://discord.gg/aurionpay', external: true },
        { label: 'Learn', href: '#' },
        { label: 'Support', href: '#' },
        { label: 'Terms', href: '#' },
      ],
    },
  };

  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-[#0a0a0f] to-[#060609]">
      <div className="max-w-[1440px] mx-auto px-16 py-20">
        {/* Top section */}
        <div className="grid grid-cols-6 gap-16 pb-16 border-b border-white/5">
          {/* Brand & Newsletter */}
          <div className="col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                  <div className="w-6 h-6 bg-white rounded-sm" />
                </div>
                <span className="text-2xl font-bold">AurionPay</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Private payment infrastructure built on Polkadot Hub. Accept DOT and stablecoins with zero-knowledge privacy.
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    required
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50"
                  disabled={subscribed}
                >
                  {subscribed ? 'Subscribed! ✓' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/telixgoldens/aurionpay"
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/aurionprotocol_"
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://discord.gg/aurionpay"
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
              aria-label="Discord"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <span>© 2026 AurionPay. All rights reserved.</span>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">All systems operational</span>
          </div>
          <span className="text-gray-600">•</span>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
            View Status →
          </a>
        </div>
      </div>
    </footer>
  );
}
