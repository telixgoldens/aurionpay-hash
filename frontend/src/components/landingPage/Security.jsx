import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';
import Bgsafe from "../../assets/Saveback.png";

export function Security() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Groth16 Proofs',
      description: 'Industry-standard zero-knowledge proof system with formal verification and battle-tested security.',
    },
    {
      icon: Lock,
      title: 'Poseidon Merkle Trees',
      description: 'Optimized hash function designed for ZK circuits, ensuring efficient and secure privacy pools.',
    },
    {
      icon: Eye,
      title: 'Nullifier Protection',
      description: 'Prevents double-spending and replay attacks while maintaining complete transaction privacy.',
    },
    {
      icon: CheckCircle,
      title: 'No Linkability',
      description: 'Mathematical guarantee that payer and payee cannot be linked on-chain by any observer.',
    },
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#0f1729] to-[#0a0a0f] overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-green-900/20 via-blue-900/10 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-300 mb-6">
            <Shield className="w-4 h-4" />
            Enterprise Security
          </div>
          
          <h2 className="text-5xl font-bold mb-6">
            Zero-Knowledge
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Verified
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Military-grade privacy powered by cutting-edge cryptography and formal verification
          </p>
        </div>

        <div className="grid grid-cols-2 gap-20 items-center mb-20">
          {/* Left: Security features */}
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

          {/* Right: Visual representation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20 blur-3xl rounded-full" />
            
            <div className="relative">
              {/* Shield graphic */}
              <div className="p-12 rounded-2xl bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-white/10 backdrop-blur-sm">
                <img
                  src={Bgsafe}
                  alt="Security Shield"
                  className="w-full h-96 object-cover rounded-xl opacity-60"
                />
                
                {/* Overlay stats */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-8 rounded-2xl bg-black/60 backdrop-blur-md border border-green-500/30">
                      <Shield className="w-24 h-24 text-green-400" />
                    </div>
                    <div className="p-6 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                      <div className="text-4xl font-bold text-green-400">100%</div>
                      <div className="text-sm text-gray-300">Private Transactions</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-6 -left-6 p-4 rounded-xl bg-gradient-to-br from-green-600 to-green-700 border border-green-500/30 shadow-2xl">
                <div className="text-sm text-green-100 mb-1">Audited by</div>
                <div className="font-bold">Trail of Bits</div>
              </div>

              <div className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/30 shadow-2xl">
                <div className="text-sm text-blue-100 mb-1">Bug Bounty</div>
                <div className="font-bold">$500K Pool</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical details */}
        <div className="grid grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-green-900/20 to-green-900/10 border border-green-500/20">
            <div className="text-sm text-green-300 mb-2">Proof Generation</div>
            <div className="text-3xl font-bold mb-2">~2s</div>
            <div className="text-sm text-gray-400">Average time for Groth16 proof</div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-500/20">
            <div className="text-sm text-blue-300 mb-2">Verification</div>
            <div className="text-3xl font-bold mb-2">&lt;100ms</div>
            <div className="text-sm text-gray-400">On-chain proof verification time</div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-900/10 border border-purple-500/20">
            <div className="text-sm text-purple-300 mb-2">Privacy Set Size</div>
            <div className="text-3xl font-bold mb-2">Unlimited</div>
            <div className="text-sm text-gray-400">Anonymity set grows with usage</div>
          </div>
        </div>
      </div>
    </section>
  );
}
