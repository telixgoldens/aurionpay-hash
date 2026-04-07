import { useLang } from './lib/LanguageContext.jsx';
import { LangToggle } from './lib/LanguageContext.jsx';
import { Header }      from './components/landingPage/Header';
import { Hero }        from './components/landingPage/Hero';
import { TrustBar }    from './components/landingPage/TrustBar';
import { HowItWorks }  from './components/landingPage/HowItWorks';
import { FeatureGrid } from './components/landingPage/FeatureGrid';
import { CodeSection } from './components/landingPage/CodeSection';
import { UseCases }    from './components/landingPage/UseCases';
import { Security }    from './components/landingPage/Security';
import { CTASection }  from './components/landingPage/CTASection';
import { Footer }      from './components/landingPage/Footer';
import { ScrollToTop } from './components/landingPage/ScrollToTop';

export default function LandingPage() {
  const { lang } = useLang();

  return (
    <div className="bg-[#0a0a0f] text-white" style={{ position: "relative" }}>
      {/* Language toggle -- floats top-right above Header */}
      <div style={{
        position: "fixed", top: "14px", right: "20px", zIndex: 9999,
      }}>
        <LangToggle />
      </div>

      <Header      lang={lang} />
      <Hero        lang={lang} />
      <TrustBar    lang={lang} />
      <HowItWorks  lang={lang} />
      <FeatureGrid lang={lang} />
      <CodeSection lang={lang} />
      <UseCases    lang={lang} />
      <Security    lang={lang} />
      <CTASection  lang={lang} />
      <Footer      lang={lang} />
      <ScrollToTop />
    </div>
  );
}