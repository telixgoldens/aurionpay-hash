import { Shield, Hash, Boxes, Network } from 'lucide-react';
import { tl } from '../../lib/landingTranslation';

export function TrustBar({ lang }) {
  const badges = [
    { icon: Network, label: tl('trust1', lang) },
    { icon: Shield, label: tl('trust2', lang) },
    { icon: Hash, label: tl('trust3', lang) },
    { icon: Boxes, label: tl('trust4', lang) },
    { icon: Network, label: tl('trust5', lang) },
  ];

  return (
    <section className="relative py-24 border-y border-white/5">
      <div className="max-w-[1440px] mx-auto px-16">
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 uppercase tracking-wider">
            {tl("trustTitle", lang)}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <badge.icon className="w-8 h-8 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-300 text-center">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
