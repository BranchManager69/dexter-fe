import { ClosingCta } from './components/home/ClosingCta';
import { LandingHero } from './components/home/LandingHero';
import { ButlerSession } from './components/home/ButlerSession';
import { LiveConversation } from './components/home/LiveConversation';
import { TrustBand } from './components/home/TrustBand';

export default function Home() {
  return (
    <>
      <ClosingCta />
      <LandingHero />
      <ButlerSession />
      <LiveConversation />
      <TrustBand />
    </>
  );
}
