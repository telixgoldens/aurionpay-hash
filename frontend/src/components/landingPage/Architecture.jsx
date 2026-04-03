import { Layers, Shield, Zap, Webhook, LayoutDashboard } from 'lucide-react';
import Archimg from "../../assets/Architecture.png";

export function Architecture() {
  const components = [
    { icon: Layers, label: 'EVM Router', color: 'purple' },
    { icon: Shield, label: 'PVM Privacy Pool', color: 'blue' },
    { icon: Zap, label: 'ZK Circuit', color: 'green' },
    { icon: Webhook, label: 'Relayer + Webhooks', color: 'orange' },
    { icon: LayoutDashboard, label: 'Merchant Dashboard', color: 'pink' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-400' },
      blue: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' },
      green: { bg: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30', text: 'text-green-400' },
      orange: { bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30', text: 'text-orange-400' },
      pink: { bg: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/30', text: 'text-pink-400' },
    };
    return colors[color] || colors.purple;
  };

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-[#0a0a0f] to-[#0f1729]">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left: Architecture diagram */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl rounded-full" />
            
            <div className="relative p-12 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm">
              {/* Architecture blocks */}
              <div className="space-y-6">
                {components.map((component, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(component.color).bg} ${getColorClasses(component.color).border}`}>
                      <component.icon className={`w-6 h-6 ${getColorClasses(component.color).text}`} />
                    </div>
                    <span className="font-medium text-lg">{component.label}</span>
                    
                    {/* Connection indicator */}
                    {index < components.length - 1 && (
                      <div className="ml-auto">
                        <div className="w-[2px] h-6 bg-gradient-to-b from-purple-500 to-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Network visual */}
              <div className="mt-12 p-8 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/5">
                <img
                  src={Archimg}
                  alt="Network Architecture"
                  className="w-full h-48 object-cover rounded-lg opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Right: Text explanation */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
              Technical Overview
            </div>

            <h2 className="text-5xl font-bold leading-tight">
              Hybrid Smart Contract
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Architecture
              </span>
            </h2>

            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>
                PrivacyPay combines the best of both worlds: EVM compatibility for seamless merchant integration and PVM for advanced zero-knowledge privacy verification.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1.5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">EVM Layer</h4>
                    <p className="text-gray-400">
                      Handles merchant-facing smart contracts, payment intents, and webhook integrations for familiar Web3 tooling.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-1.5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">PVM Layer</h4>
                    <p className="text-gray-400">
                      Manages privacy pools, Groth16 proof verification, and nullifier tracking to ensure complete transaction privacy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 p-6 rounded-xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Cross-Chain Ready</div>
                    <div className="font-semibold text-white">Polkadot Hub Integration</div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                    Live
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
