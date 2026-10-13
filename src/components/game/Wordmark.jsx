import React from 'react';
import { HEADING_TEXT } from '@/lib/brand';

// The SoundFind wordmark (G4, SF-66b): Home's, as it was inline in Home.jsx. Home and the
// welcome both render it; the welcome passes a larger size, and nothing else differs.
const SIZES = { md: 'text-2xl', lg: 'text-5xl' };

export default function Wordmark({ size = 'md' }) {
  return (
    <h1 className={`${SIZES[size] || SIZES.md} font-bold ${HEADING_TEXT}`}>
      Sound<span className="text-violet-600">Find</span>
    </h1>
  );
}
