import { Terminal, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function CodeSection() {
  const [copied, setCopied] = useState(false);

  const codeExample = `// Install the SDK
npm install @aurionpay/sdk

// Initialize PrivacyPay
import { PrivacyPay } from '@aurionpay/sdk';

const aurionPay = new AurionPay({
  network: 'polkadot-hub',
  apiKey: process.env.AURIONPAY_API_KEY
});

// Create a payment intent
const intent = await aurionPay.createIntent({
  amount: '100.00',
  currency: 'USDC',
  description: 'Product purchase',
  webhookUrl: 'https://your-app.com/webhook'
});

// Customer deposits via privacy pool
await aurionPay.deposit({
  intentId: intent.id,
  amount: intent.amount,
  zkProof: generateProof() // Groth16 proof
});

// Merchant withdraws privately
await aurionPay.withdraw({
  intentId: intent.id,
  recipient: merchantAddress
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-32 bg-gradient-to-b from-[#0a0a0f] to-[#0f1729]">
      <div className="max-w-[1440px] mx-auto px-16">
        <div className="grid grid-cols-2 gap-20 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-300">
              <Terminal className="w-4 h-4" />
              Developer Experience
            </div>

            <h2 className="text-5xl font-bold leading-tight">
              Deploy in
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Minutes
              </span>
            </h2>

            <p className="text-xl text-gray-400 leading-relaxed">
              Simple, intuitive SDK that abstracts away the complexity of zero-knowledge cryptography. Focus on building your product, not crypto infrastructure.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-gray-300">TypeScript support with full type safety</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-gray-300">Automatic ZK proof generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-gray-300">React hooks and UI components included</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                View Full Documentation
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Code block */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20 blur-3xl rounded-full" />
            
            <div className="relative rounded-2xl bg-[#0d1117] border border-white/10 overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#161b22] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-sm text-gray-500">quickstart.js</span>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Code content */}
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm leading-relaxed">
                  <code className="text-gray-300">
                    <span className="text-gray-500">// Install the SDK</span>{'\n'}
                    <span className="text-pink-400">npm install</span> <span className="text-blue-400">@aurionpay/sdk</span>{'\n\n'}
                    
                    <span className="text-gray-500">// Initialize AurionPay</span>{'\n'}
                    <span className="text-purple-400">import</span> {'{ '}
                    <span className="text-blue-300">AurionPay</span>
                    {' }'} <span className="text-purple-400">from</span> <span className="text-green-400">'@aurionpay/sdk'</span>;{'\n\n'}
                    
                    <span className="text-purple-400">const</span> <span className="text-blue-300">aurionPay</span> = <span className="text-purple-400">new</span> <span className="text-yellow-400">AurionPay</span>({'{'}
                    {'\n  '}network: <span className="text-green-400">'polkadot-hub'</span>,
                    {'\n  '}apiKey: <span className="text-blue-300">process</span>.env.<span className="text-blue-300">AURIONPAY_API_KEY</span>
                    {'\n}'});{'\n\n'}
                    
                    <span className="text-gray-500">// Create a payment intent</span>{'\n'}
                    <span className="text-purple-400">const</span> <span className="text-blue-300">intent</span> = <span className="text-purple-400">await</span> aurionPay.<span className="text-yellow-400">createIntent</span>({'{'}
                    {'\n  '}amount: <span className="text-green-400">'100.00'</span>,
                    {'\n  '}currency: <span className="text-green-400">'USDC'</span>,
                    {'\n  '}description: <span className="text-green-400">'Product purchase'</span>,
                    {'\n  '}webhookUrl: <span className="text-green-400">'https://your-app.com/webhook'</span>
                    {'\n}'});{'\n\n'}
                    
                    <span className="text-gray-500">// Customer deposits via privacy pool</span>{'\n'}
                    <span className="text-purple-400">await</span> aurionPay.<span className="text-yellow-400">deposit</span>({'{'}
                    {'\n  '}intentId: intent.id,
                    {'\n  '}amount: intent.amount,
                    {'\n  '}zkProof: <span className="text-yellow-400">generateProof</span>() <span className="text-gray-500">// Groth16 proof</span>
                    {'\n}'});{'\n\n'}
                    
                    <span className="text-gray-500">// Merchant withdraws privately</span>{'\n'}
                    <span className="text-purple-400">await</span> aurionPay.<span className="text-yellow-400">withdraw</span>({'{'}
                    {'\n  '}intentId: intent.id,
                    {'\n  '}recipient: merchantAddress
                    {'\n}'});
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
