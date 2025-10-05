import { ClosingCta } from './components/home/ClosingCta';
import { CommandScrollDemo } from './components/home/CommandScrollDemo';
import { PortraitDemo } from './components/home/PortraitDemo';

export default function Home() {
  return (
    <>
      <ClosingCta />
      <div className="dark-text">
        <CommandScrollDemo />
        <PortraitDemo />
      </div>
    </>
  );
}
