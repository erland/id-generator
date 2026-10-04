# Accessibility review – DEV-022

## Scope

Accessibility pass for the current id-generator UI shell and UUID v4 batch flow.

## Changes

- Added a keyboard-visible skip link to the main content.
- Ensured the main work area is a named `<main>` landmark and can receive programmatic focus from the skip link.
- Kept explicit labels for theme, category, generator, and batch count controls.
- Added visible `:focus-visible` treatment for buttons, selects, and links.
- Kept touch targets at least 44 px, with 48 px targets in the mobile layout.
- Changed the generated result collection to an ordered semantic list.
- Added accessible names to individual generated values and copy buttons.
- Kept copy feedback in an atomic polite live region.
- Added a separate polite generation status instead of making the complete result list a live region. This avoids reading up to 100 generated values automatically.
- Disabled categories and generator choices that are present visually but are not wired to functionality yet, preventing misleading keyboard/screen-reader interactions.
- Adjusted the dark-theme primary color from `#4f8fe8` to `#2f6fc8` so white button text meets WCAG AA normal-text contrast.

## Contrast checks

Representative calculated contrast ratios:

- Light primary button `#245dab` on white text: ~6.50:1.
- Dark primary button `#2f6fc8` on white text: ~4.97:1.
- Light muted text `#526174` on white: ~6.32:1.
- Light subtle text `#667488` on white: ~4.75:1.
- Dark muted/subtle text on dark surfaces: >7:1 in representative checks.

These source-level checks meet WCAG AA thresholds for the checked normal-text combinations.

## Deferred browser verification

The following require the user's final browser test environment:

- Full keyboard-only traversal and visible-focus inspection.
- VoiceOver on iOS/iPadOS and macOS.
- Browser zoom/reflow inspection at 200% and narrow viewports.
- Automated browser accessibility tooling if desired (for example axe/Lighthouse).
- Full Vitest and Vite production build.
