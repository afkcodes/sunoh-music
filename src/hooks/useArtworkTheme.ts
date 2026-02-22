import { getPalette } from '@somesoap/react-native-image-palette';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { artworkColorCache } from '../utils/lruStorage';
import { generateThemeColors, generateTonalPalette, MaterialThemeColors } from '../utils/tonalPalette.util';

interface CachedTheme {
  playerTheme: MaterialThemeColors;
  gradientColors: string[];
}

/**
 * Extracts a Material Design tonal theme from artwork.
 *
 * Cancellation-safe: if the artwork URL changes before getPalette resolves,
 * the stale result is discarded so the UI never flashes the wrong colours.
 */
export function useArtworkTheme(artworkUrl?: string) {
  const { colors } = useTheme();

  // Memoize cache lookup so it doesn't run on every render/re-render of the component
  const cached = useMemo(() => {
    if (!artworkUrl) return null;
    return artworkColorCache.get(artworkUrl) as CachedTheme | null;
  }, [artworkUrl]);

  // Use functional initialization so these are only set once from the (memoized) cached value
  const [playerTheme, setPlayerTheme] = useState<MaterialThemeColors | null>(() => cached?.playerTheme ?? null);
  const [gradientColors, setGradientColors] = useState<string[]>(() => cached?.gradientColors ?? [colors.bgSurface, colors.bgPage]);
  const requestIdRef = useRef(0);

  // Instant state sync when artworkUrl changes (before useEffect runs)
  const prevUrlRef = useRef(artworkUrl);
  if (prevUrlRef.current !== artworkUrl) {
    prevUrlRef.current = artworkUrl;
    if (cached) {
      console.log(cached);

      setPlayerTheme(cached.playerTheme);
      setGradientColors(cached.gradientColors);
    } else {
      setPlayerTheme(null);
      setGradientColors([colors.bgSurface, colors.bgPage]);
    }
  }

  useEffect(() => {
    // Increment the id so any in-flight promise from a previous url is ignored.
    const id = ++requestIdRef.current;

    if (artworkUrl) {
      // If we don't have a cache for this URL, or even if we do, update from source
      // to ensure consistency (though palette extraction is deterministic).
      getPalette(artworkUrl, { fallbackColor: colors.bgSurface })
        .then((palette) => {
          // Stale guard – another artworkUrl was set while we were extracting.
          if (id !== requestIdRef.current) return;

          console.log(palette);


          const seedColor = palette.dominantAndroid || palette.darkVibrant || colors.primaryBase;
          const tonal = generateTonalPalette(seedColor);
          const mTheme = generateThemeColors(tonal, true);
          const gColors = [tonal[20], tonal[10]];

          setPlayerTheme(mTheme);
          setGradientColors(gColors);

          // Persist to LRU cache
          artworkColorCache.set(artworkUrl, {
            playerTheme: mTheme,
            gradientColors: gColors,
          });
        })
        .catch((e) => {
          if (id !== requestIdRef.current) return;
          console.warn('[useArtworkTheme] Failed to extract palette:', e);

          if (!cached) {
            setGradientColors([colors.bgSurface, colors.bgPage]);
            setPlayerTheme(null);
          }
        });
    } else {
      setGradientColors([colors.bgSurface, colors.bgPage]);
      setPlayerTheme(null);
    }
  }, [artworkUrl, colors.bgPage, colors.bgSurface, colors.primaryBase, cached]);

  return { playerTheme, gradientColors };
}


