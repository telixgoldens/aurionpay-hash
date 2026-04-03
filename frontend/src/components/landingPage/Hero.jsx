import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Groth16img from "../../assets/groth16.png";
import { FloatingNodes } from "./FloatingNodes";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1729] via-[#0a0a0f] to-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-900/30 via-blue-900/20 to-transparent rounded-full blur-3xl" />
      </div>

      <FloatingNodes />

      <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-16 py-20 md:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm text-purple-300">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Now live on Polkadot Hub
            </div>

            <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight">
              Private Payments.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Built for Polkadot.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-[540px]">
              Accept DOT and stablecoins privately using zero-knowledge infrastructure on Polkadot Hub.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/app"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Building
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#"
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                View Documentation
              </a>
            </div>

            <div className="flex flex-wrap gap-8 md:gap-12 pt-6 md:pt-8">
              <div>
                <div className="text-2xl md:text-3xl font-bold">$2.4M+</div>
                <div className="text-sm text-gray-500">Volume Processed</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">100%</div>
                <div className="text-sm text-gray-500">Private</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold">&lt;2s</div>
                <div className="text-sm text-gray-500">Avg Confirmation</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-1">
            
              <img
                src={Groth16img}
                alt="AurionPay Dashboard"
                className="w-full h-auto rounded-xl"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent rounded-xl" />

              <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">ZK Proof Verified</span>
                  </div>
                  <div className="text-sm text-gray-400">Groth16 • Poseidon</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-8 -right-8 p-6 bg-gradient-to-br from-purple-600/90 to-blue-600/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl">
              <div className="text-sm text-purple-200 mb-2">Network Activity</div>
              <div className="text-3xl font-bold">1,247</div>
              <div className="text-sm text-purple-200">Active Intents</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}