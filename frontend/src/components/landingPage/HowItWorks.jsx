import { FileText, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';
import { tl } from '../../lib/landingTranslation';

export function HowItWorks({ lang }) {
  const zkSteps = [
    {
      title: tl('zkStep1', lang),
      description: tl('zkStep1d', lang),
    },
    {
      title: tl('zkStep2', lang),
      description: tl('zkStep2d', lang),
    },
    {
      title: tl('zkStep3', lang),
      description: tl('zkStep3d', lang),
    },
    {
      title: tl('zkStep4', lang),
      description: tl('zkStep4d', lang),
    },
  ];

  const hspSteps = [
    {
      title: tl('hspStep1', lang),
      description: tl('hspStep1d', lang),
    },
    {
      title: tl('hspStep2', lang),
      description: tl('hspStep2d', lang),
    },
    {
      title: tl('hspStep3', lang),
      description: tl('hspStep3d', lang),
    },
    {
      title: tl('hspStep4', lang),
      description: tl('hspStep4d', lang),
    },
  ];

  return (
    <section className="relative py-20 md:py-32">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">{tl('howTitle', lang)}</h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            {tl('howSub', lang)}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              {tl('howMode1', lang)}
            </div>
            <div className="grid gap-6">
              {zkSteps.map((step, index) => (
                <div key={index} className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                  <div className="text-xl font-semibold mb-3">{step.title}</div>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {tl('howMode2', lang)}
            </div>
            <div className="grid gap-6">
              {hspSteps.map((step, index) => (
                <div key={index} className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                  <div className="text-xl font-semibold mb-3">{step.title}</div>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
