import { ClosingCta } from './components/home/ClosingCta';
import { CommandScrollDemo } from './components/home/CommandScrollDemo';
import { PortraitShowcase } from './components/home/PortraitShowcase';

export default function Home() {
  return (
    <>
      <ClosingCta />
      <div className="dark-text">
        <CommandScrollDemo />
        <PortraitShowcase />
      </div>
    </>
  );
}
