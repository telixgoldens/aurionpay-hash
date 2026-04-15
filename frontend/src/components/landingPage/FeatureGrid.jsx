import { Eye, Coins, Webhook, Network, ShieldCheck, Sparkles } from 'lucide-react';
import { tl } from '../../lib/landingTranslation';

export function FeatureGrid({ lang }) {
  const features = [
    {
      icon: Eye,
      title: tl('feat1', lang),
      description: tl('feat1d', lang),
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: ShieldCheck,
      title: tl('feat2', lang),
      description: tl('feat2d', lang),
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Coins,
      title: tl('feat3', lang),
      description: tl('feat3d', lang),
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Webhook,
      title: tl('feat4', lang),
      description: tl('feat4d', lang),
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: Network,
      title: tl('feat5', lang),
      description: tl('feat5d', lang),
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      icon: Sparkles,
      title: tl('feat6', lang),
      description: tl('feat6d', lang),
      gradient: 'from-cyan-500 to-sky-600',
    },
  ];

  return (
    <section className="relative py-20 md:py-32">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">{tl('featTitle', lang)}</h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            {tl('featSub', lang)}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-8 mt-16">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-900/10 border border-purple-500/20">
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-sm text-purple-300">{tl('uptimeSla', lang)}</div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-500/20">
            <div className="text-4xl font-bold mb-2">&lt;100ms</div>
            <div className="text-sm text-blue-300">{tl('apiResponseTime', lang)}</div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/20 to-green-900/10 border border-green-500/20">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-sm text-green-300">{tl('developerSupport', lang)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
