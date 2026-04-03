import { Header } from './components/landingPage/Header';
import { Hero } from './components/landingPage/Hero';
import { TrustBar } from './components/landingPage/TrustBar';
import { HowItWorks } from './components/landingPage/HowItWorks';
import { Architecture } from './components/landingPage/Architecture';
import { FeatureGrid } from './components/landingPage/FeatureGrid';
import { CodeSection } from './components/landingPage/CodeSection';
import { UseCases } from './components/landingPage/UseCases';
import { Security } from './components/landingPage/Security';
import { CTASection } from './components/landingPage/CTASection';
import { Footer } from './components/landingPage/Footer';
import { ScrollToTop } from './components/landingPage/ScrollToTop';

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0f] text-white">
      <Header />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Architecture />
      <FeatureGrid />
      <CodeSection />
      <UseCases />
      <Security />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
