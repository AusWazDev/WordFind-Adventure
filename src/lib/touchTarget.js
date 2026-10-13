// Touch targets of at least 44×44 px for small icon-only buttons (SF-61, U5).
// An absolutely positioned ::after extends the area that receives taps without
// changing the button's visible size or the layout around it. Each constant
// names the visible size it pads up from. The element must not clip overflow.
export const HIT_FROM_36 = 'relative after:absolute after:-inset-1';     // 36×36 → 44×44
export const HIT_FROM_32 = 'relative after:absolute after:-inset-1.5';   // 32×32 → 44×44
export const HIT_FROM_28 = 'relative after:absolute after:-inset-2';     // 28×28 → 44×44
// Wide, short controls: taller only (plus a little width for a one-digit count).
export const HIT_Y_FROM_36 = 'relative after:absolute after:inset-x-0 after:-inset-y-1';         // height 36 → 44
export const HIT_PILL_FROM_24 = 'relative after:absolute after:-inset-x-0.5 after:-inset-y-2.5'; // height 24 → 44; width +4
export const HIT_Y_FROM_24 = 'relative after:absolute after:inset-x-0 after:-inset-y-2.5';       // height 24 → 44
