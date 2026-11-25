import { useEffect, useState } from 'react';

// Elegant Arabic court typography shared by canvas-drawn desk papers & bubbles.
export const FONT_COURT_TITLE = '"Amiri", "Cairo", serif';
export const FONT_COURT_BODY = '"Cairo", "Amiri", sans-serif';

let fontsAlreadyLoaded = false;

/**
 * Returns true once the Arabic webfonts are actually usable by canvas 2D.
 * Include the flag in a texture useMemo dependency so the texture redraws
 * with the real typeface instead of the fallback system font.
 */
export function useCourtFonts(): boolean {
  const [ready, setReady] = useState(fontsAlreadyLoaded);

  useEffect(() => {
    if (ready || typeof document === 'undefined' || !('fonts' in document)) return;
    let alive = true;
    const faces = [
      '700 96px Amiri',
      '700 60px Amiri',
      '400 48px Amiri',
      '700 56px Cairo',
      '600 46px Cairo',
      '400 42px Cairo',
    ];
    Promise.all(faces.map((f) => document.fonts.load(f).catch(() => undefined)))
      .then(() => {
        fontsAlreadyLoaded = true;
        if (alive) setReady(true);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [ready]);

  return ready;
}
