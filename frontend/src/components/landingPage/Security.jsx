import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';
import Bgsafe from "../../assets/Saveback.png";
import { tl } from '../../lib/landingTranslation';

export function Security({ lang }) {
  const securityFeatures = [
    {
      icon: Shield,
      title: tl('sec1', lang),
      description: tl('sec1d', lang),
    },
    {
      icon: Lock,
      title: tl('sec2', lang),
      description: tl('sec2d', lang),
    },
    {
      icon: Eye,
      title: tl('sec3', lang),
      description: tl('sec3d', lang),
    },
    {
      icon: CheckCircle,
      title: tl('sec4', lang),
      description: tl('sec4d', lang),
    },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#0f1729] to-[#0a0a0f] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-green-900/20 via-blue-900/10 to-transparent rounded-full blur-3xl" />
      <div className="relative z-10 max-w-[1440px] mx-auto px-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-300 mb-6">
            <Shield className="w-4 h-4" />
            {tl('secBadgeLabel', lang)}
          </div> 
          <h2 className="text-5xl font-bold mb-6">
            {tl('secTitle', lang)}
          </h2> 
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {tl('secSub', lang)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-20 items-center mb-20">
          <div className="space-y-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-green-500/20 transition-all duration-300"
              >
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20 blur-3xl rounded-full" /> 
            <div className="relative">
              <div className="p-12 rounded-2xl bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-white/10 backdrop-blur-sm">
                <img
                  src={Bgsafe}
                  alt="Security Shield"
                  className="w-full h-96 object-cover rounded-xl opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-8 rounded-2xl bg-black/60 backdrop-blur-md border border-green-500/30">
                      <Shield className="w-24 h-24 text-green-400" />
                    </div>
                    <div className="p-6 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                      <div className="text-4xl font-bold text-green-400">100%</div>
                      <div className="text-sm text-gray-300">{tl('secPrivateTx', lang)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -left-6 p-4 rounded-xl bg-gradient-to-br from-green-600 to-green-700 border border-green-500/30 shadow-2xl">
                <div className="text-sm text-green-100 mb-1">{tl('secAuditLabel', lang)}</div>
                <div className="font-bold">{tl('secAuditValue', lang)}</div>
              </div>
              <div className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/30 shadow-2xl">
                <div className="text-sm text-blue-100 mb-1">{tl('secBountyLabel', lang)}</div>
                <div className="font-bold">{tl('secBountyValue', lang)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/20 to-green-900/10 border border-green-500/20">
            <div className="text-sm text-green-300 mb-2">{tl('secStat1Label', lang)}</div>
            <div className="text-3xl font-bold mb-2">~2s</div>
            <div className="text-sm text-gray-400">{tl('secStat1Desc', lang)}</div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-500/20">
            <div className="text-sm text-blue-300 mb-2">{tl('secStat2Label', lang)}</div>
            <div className="text-3xl font-bold mb-2">&lt;100ms</div>
            <div className="text-sm text-gray-400">{tl('secStat2Desc', lang)}</div>
          </div>
          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-900/10 border border-purple-500/20">
            <div className="text-sm text-purple-300 mb-2">{tl('secStat3Label', lang)}</div>
            <div className="text-3xl font-bold mb-2">Unlimited</div>
            <div className="text-sm text-gray-400">{tl('secStat3Desc', lang)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
