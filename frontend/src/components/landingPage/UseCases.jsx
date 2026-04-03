import { ShoppingCart, Users, RefreshCw, Briefcase } from 'lucide-react';

export function UseCases() {
  const useCases = [
    {
      icon: ShoppingCart,
      title: 'E-commerce',
      description: 'Accept private payments for online stores while maintaining customer privacy and regulatory compliance.',
      stats: '2,400+ stores',
      color: 'purple',
    },
    {
      icon: Users,
      title: 'DAO Treasury Payments',
      description: 'Enable private contributor payments and grants while maintaining transparency where needed.',
      stats: '180+ DAOs',
      color: 'blue',
    },
    {
      icon: RefreshCw,
      title: 'Subscription Services',
      description: 'Recurring private payments for SaaS, memberships, and subscription-based business models.',
      stats: '850+ apps',
      color: 'green',
    },
    {
      icon: Briefcase,
      title: 'On-chain Payroll',
      description: 'Pay remote teams in crypto privately, with automatic currency conversion and compliance tools.',
      stats: '340+ companies',
      color: 'orange',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        bg: 'group-hover:from-purple-600/5',
        icon: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
        iconColor: 'text-purple-400',
        badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        link: 'text-purple-400 hover:text-purple-300',
      },
      blue: {
        bg: 'group-hover:from-blue-600/5',
        icon: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
        iconColor: 'text-blue-400',
        badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        link: 'text-blue-400 hover:text-blue-300',
      },
      green: {
        bg: 'group-hover:from-green-600/5',
        icon: 'from-green-500/10 to-green-600/5 border-green-500/20',
        iconColor: 'text-green-400',
        badge: 'bg-green-500/10 text-green-300 border-green-500/20',
        link: 'text-green-400 hover:text-green-300',
      },
      orange: {
        bg: 'group-hover:from-orange-600/5',
        icon: 'from-orange-500/10 to-orange-600/5 border-orange-500/20',
        iconColor: 'text-orange-400',
        badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
        link: 'text-orange-400 hover:text-orange-300',
      },
    };
    return colors[color];
  };

  return (
    <section className="relative py-32">
      <div className="max-w-[1440px] mx-auto px-16">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6">Built for Every Use Case</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From startups to enterprises, PrivacyPay powers private payments across industries
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const colorClasses = getColorClasses(useCase.color);
            return (
              <div
                key={index}
                className="group relative p-10 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-transparent ${colorClasses.bg} transition-all duration-300`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${colorClasses.icon} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <useCase.icon className={`w-10 h-10 ${colorClasses.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">{useCase.title}</h3>
                      <span className={`text-sm px-3 py-1 rounded-full border ${colorClasses.badge}`}>
                        {useCase.stats}
                      </span>
                    </div>

                    <p className="text-gray-400 leading-relaxed text-lg">
                      {useCase.description}
                    </p>

                    <a
                      href="#"
                      className={`inline-flex items-center gap-2 font-medium transition-colors pt-2 ${colorClasses.link}`}
                    >
                      Learn more
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner */}
        <div className="mt-16 p-12 rounded-2xl bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20 border border-white/10 text-center">
          <h3 className="text-3xl font-bold mb-4">Have a custom use case?</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Our team can help you design a privacy solution tailored to your specific needs.
          </p>
          <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all duration-300">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
