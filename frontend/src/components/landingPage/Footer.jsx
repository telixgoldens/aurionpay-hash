import { useState } from 'react';
import { Github, Twitter, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import Logoimg from "../../assets/logo.png"
import { tl } from '../../lib/landingTranslation';

export function Footer({ lang }) {
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
    resources: {
      title: tl('footerLinks', lang),
      links: [
        { label: tl('footerDocs', lang), href: '#', external: true },
        { label: tl('footerApiRef', lang), href: '#', external: true },
        { label: tl('footerSdkTools', lang), href: '#' },
        { label: tl('footerGithub', lang), href: 'https://github.com/aurionpay-hash', external: true },
        { label: tl('footerStatus', lang), href: '#', external: true },
      ],
    },
  };

  return (
    <footer className="relative border-t border-white/5 bg-gradient-to-b from-[#0a0a0f] to-[#060609]">
      <div className="max-w-[1440px] mx-auto px-16 py-20">
        <div className="grid grid-cols-4 gap-26 pb-16 border-b border-white/5">
          <div className="col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div>
                 <img src={Logoimg} alt="AurionPay Logo"  className="w-8 h-8 rounded-sm"/>
                </div>
                <span className="text-2xl font-bold">AurionPay</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {tl('footerDesc', lang)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tl('footerStayUpdated', lang)}</h4>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tl('footerEmailPlaceholder', lang)}
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
                  {subscribed ? tl('footerSubscribed', lang) : tl('footerSubscribe', lang)}
                </button>
              </form>
            </div>
          </div>
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
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/telixgoldens/aurionpay-hash"
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
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <span>{tl('footerRights', lang)}</span>
            <a href="#" className="hover:text-white transition-colors">
              {tl('footerPrivacyPolicy', lang)}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {tl('footerTermsOfService', lang)}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {tl('footerCookiePolicy', lang)}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
