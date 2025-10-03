import { ClosingCta } from './components/home/ClosingCta';
import { LandingHero } from './components/home/LandingHero';
import { LiveConversation } from './components/home/LiveConversation';
import { TrustBand } from './components/home/TrustBand';

export default function Home() {
  return (
    <>
      <LandingHero />
      <LiveConversation />
      <TrustBand />
      <ClosingCta />
    </>
  );
}
