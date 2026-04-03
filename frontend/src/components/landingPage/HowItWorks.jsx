import { FileText, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Create Payment Intent',
      description: 'Merchant creates a payment intent with amount and recipient details',
    },
    {
      number: '02',
      icon: ShieldCheck,
      title: 'Pay via Privacy Pool',
      description: 'Customer deposits funds through zero-knowledge privacy pool with Groth16 proof',
    },
    {
      number: '03',
      icon: Wallet,
      title: 'Merchant Receives Funds',
      description: 'Merchant withdraws funds with complete privacy - no link between payer and payee',
    },
  ];

  return (
    <section className="relative py-20 md:py-32">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">How It Works</h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Three simple steps to enable private payments on Polkadot
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600/50 via-blue-600/50 to-purple-600/50 hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="relative z-10 bg-[#0a0a0f] p-8">
                  {/* Step number */}
                  <div className="text-6xl font-bold text-purple-600/20 mb-6">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-8">
                    <step.icon className="w-10 h-10 text-purple-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/3 -right-6 z-20 hidden lg:block">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visual flow diagram placeholder */}
        <div className="mt-20 p-12 rounded-2xl bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-white/5">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 p-6 rounded-xl bg-purple-600/10 border border-purple-600/20 text-center">
              <div className="text-sm text-purple-300 mb-2">Privacy Pool</div>
              <div className="text-2xl font-bold">Deposit</div>
            </div>
            
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-12 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500" />
              ))}
            </div>

            <div className="flex-1 p-6 rounded-xl bg-blue-600/10 border border-blue-600/20 text-center">
              <div className="text-sm text-blue-300 mb-2">ZK Circuit</div>
              <div className="text-2xl font-bold">Verify</div>
            </div>

            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-12 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500" />
              ))}
            </div>

            <div className="flex-1 p-6 rounded-xl bg-green-600/10 border border-green-600/20 text-center">
              <div className="text-sm text-green-300 mb-2">Merchant</div>
              <div className="text-2xl font-bold">Receive</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
