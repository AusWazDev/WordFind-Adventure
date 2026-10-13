// Whether the device asks for reduced motion. Read at the moment it is needed, so a
// change in the system setting applies at once (SF-62 miss shake, SF-63 welcome demo).
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
