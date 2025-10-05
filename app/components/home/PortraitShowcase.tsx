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
        title: 'Route orders right inside ChatGPT',
        body: 'Voice relay hands Dexter the instructions without leaving the GPT thread.',
      },
      {
        title: 'Stay focused while Dexter talks fills',
        body: 'You stay in the conversation while Dexter narrates every execution in real time.',
      },
      {
        title: 'Compliance packet shows up instantly',
        body: 'Transcript, receipts, and approvals file themselves the moment the trade lands.',
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
        title: 'Claude drafts, Dexter confirms',
        body: 'Claude tees up the execution plan while Dexter reads back size, venue, and guardrails aloud.',
      },
      {
        title: 'Updates hit every channel',
        body: 'Slack, email, and the blotter light up the moment the swap completes.',
      },
      {
        title: 'Return to research with proof attached',
        body: 'Claude stays in flow while Dexter drops the transcript, fills, and receipts back into the chat.',
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
