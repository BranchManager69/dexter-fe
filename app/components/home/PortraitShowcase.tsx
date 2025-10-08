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
  },
  {
    id: 'claude',
    label: 'Claude',
    mp4: '/assets/video/portrait-demo-alt.mp4',
    webm: '/assets/video/portrait-demo-alt.webm',
    poster: '/assets/video/portrait-demo-alt-poster.jpg',
    placeholder: 'Add Claude portrait demo assets',
  },
];

export function PortraitShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <PortraitDemo demos={DEMOS} activeIndex={activeIndex} onSelect={setActiveIndex} />
      <PortraitHighlights />
    </>
  );
}
