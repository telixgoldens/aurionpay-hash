import { ArrowRight, Book, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Backimg from "../../assets/Background.jpg";
import { tl } from '../../lib/landingTranslation';

export function CTASection({ lang }) {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f1729] to-[#0a0a0f]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-gradient-radial from-purple-900/30 via-blue-900/20 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-5">
        <img
          src={Backimg}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 max-w-[1440px] mx-auto px-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              {tl('ctaReadyLabel', lang)}
            </div>
            <h2 className="text-6xl font-bold leading-tight">
              {tl('ctaTitle', lang)}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {tl('ctaSub', lang)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              to="/app"
              className="group px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-3"
            >
              {tl('ctaBtn', lang)}
            </Link>
            <button className="px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-3">
              <Book className="w-5 h-5" />
              {tl('ctaReadDocs', lang)}
            </button>
          </div>
          <div className="flex flex-wrap gap-8 justify-center pt-8 text-sm">
            <a
              href="#"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {tl('ctaTalkSales', lang)}
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {tl('ctaViewPricing', lang)}
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {tl('ctaApiRef', lang)}
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {tl('ctaJoinDiscord', lang)}
            </a>
          </div>
        </div>
        <div className="mt-24 grid grid-cols-4 gap-8">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              24h
            </div>
            <div className="text-sm text-gray-400">{tl('ctaStat1', lang)}</div>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
              3
            </div>
            <div className="text-sm text-gray-400">{tl('ctaStat2', lang)}</div>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent mb-2">
              99.9%
            </div>
            <div className="text-sm text-gray-400">{tl('ctaStat3', lang)}</div>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              $0
            </div>
            <div className="text-sm text-gray-400">{tl('ctaStat4', lang)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
