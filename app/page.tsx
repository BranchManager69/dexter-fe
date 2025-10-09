import { ClosingCta } from './components/home/ClosingCta';
import { CommandScrollDemo } from './components/home/CommandScrollDemo';
import { DexterWordmark } from './components/home/DexterWordmark';
import { DexterMintBadge } from './components/home/DexterMintBadge';
import { DexterIntro } from './components/home/DexterIntro';
import { PortraitShowcase } from './components/home/PortraitShowcase';

export default function Home() {
  return (
    <>
      <ClosingCta />
      <div className="dark-text">
        <DexterWordmark />
        <DexterMintBadge />
        <DexterIntro />
        <CommandScrollDemo />
        <PortraitShowcase />
      </div>
    </>
  );
}
