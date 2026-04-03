import { Eye, Coins, Webhook, Network } from 'lucide-react';

export function FeatureGrid() {
  const features = [
    {
      icon: Eye,
      title: 'Private by Default',
      description: 'Zero-knowledge proofs ensure complete transaction privacy without compromising security.',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Coins,
      title: 'DOT + Stablecoin Support',
      description: 'Accept DOT, USDC, USDT and other assets with seamless multi-currency support.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Webhook,
      title: 'Merchant Webhooks',
      description: 'Real-time notifications and callbacks for instant payment confirmation and settlement.',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Network,
      title: 'Cross-Chain Ready',
      description: 'Built on Polkadot Hub for native interoperability with the entire Polkadot ecosystem.',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <section className="relative py-20 md:py-32">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Built for Builders</h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to integrate private payments into your application
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional info cards */}
        <div className="grid grid-cols-3 gap-8 mt-16">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-900/10 border border-purple-500/20">
            <div className="text-4xl font-bold mb-2">99.9%</div>
            <div className="text-sm text-purple-300">Uptime SLA</div>
          </div>
          
          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-500/20">
            <div className="text-4xl font-bold mb-2">&lt;100ms</div>
            <div className="text-sm text-blue-300">API Response Time</div>
          </div>
          
          <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/20 to-green-900/10 border border-green-500/20">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-sm text-green-300">Developer Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
