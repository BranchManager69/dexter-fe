'use client';

import { useState } from 'react';
import { PortraitDemo, type Demo } from './PortraitDemo';
import { PortraitHighlights } from './PortraitHighlights';

const DEMOS: Demo[] = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    mp4: '/assets/video/portrait-demo.mp4',
    webm: '/assets/video/portrait-demo.webm',
    poster: '/assets/video/portrait-demo-poster.jpg',
    placeholder: 'Add ChatGPT portrait demo assets',
    points: [
      {
        title: 'Stay inside ChatGPT',
        body: 'Type or paste the instruction; Dexter carries out the swap right inside the conversation.',
      },
      {
        title: 'Live trade updates',
        body: 'Route choice, fills, and timing show up as messages as the swap runs.',
      },
      {
        title: 'Proof on the spot',
        body: 'Dexter posts the transaction signature and recap the moment the trade clears.',
      },
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    mp4: '/assets/video/portrait-demo-alt.mp4',
    webm: '/assets/video/portrait-demo-alt.webm',
    poster: '/assets/video/portrait-demo-alt-poster.jpg',
    placeholder: 'Add Claude portrait demo assets',
    points: [
      {
        title: 'Claude drafts, Dexter verifies',
        body: 'Claude plans the move while Dexter confirms symbols, size, and guardrails before execution.',
      },
      {
        title: 'Updates stay in chat',
        body: 'Each step of the trade streams back into the Claude conversation as it happens.',
      },
      {
        title: 'Keep researching',
        body: 'Claude keeps working while Dexter files transcripts and receipts right in the thread.',
      },
    ],
  },
];

export function PortraitShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDemo = DEMOS[activeIndex] ?? DEMOS[0];

  return (
    <>
      <PortraitDemo demos={DEMOS} activeIndex={activeIndex} onSelect={setActiveIndex} />
      <PortraitHighlights points={activeDemo.points} />
    </>
  );
}
