import { getPalette } from '@somesoap/react-native-image-palette';
import { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { generateThemeColors, generateTonalPalette, MaterialThemeColors } from '../utils/tonalPalette.util';

/**
 * Custom hook to extract a Material Design theme and gradient colors 
 * from an artwork URL.
 * 
 * @param artworkUrl - The URL of the artwork to extract colors from
 * @returns { playerTheme, gradientColors }
 */
export function useArtworkTheme(artworkUrl?: string) {
  const { colors } = useTheme();
  const [playerTheme, setPlayerTheme] = useState<MaterialThemeColors | null>(null);
  const [gradientColors, setGradientColors] = useState<string[]>([colors.bgSurface, colors.bgPage]);

  useEffect(() => {
    if (artworkUrl) {
      getPalette(artworkUrl, {
        fallbackColor: colors.bgSurface,
      })
        .then((palette) => {
          // Use darkVibrant as the primary seed color for a more grounded/premium look
          const seedColor = palette.darkVibrant || palette.vibrant || colors.primaryBase;
          const tonal = generateTonalPalette(seedColor);
          
          // Generate a dark theme variant for the player sheet (premium look)
          const mTheme = generateThemeColors(tonal, true);

          setPlayerTheme(mTheme);
          // Use deep tonal variants for the background gradient
          setGradientColors([tonal[20], tonal[10]]);
        })
        .catch((e) => {
          console.warn('[useArtworkTheme] Failed to extract palette:', e);
          setGradientColors([colors.bgSurface, colors.bgPage]);
          setPlayerTheme(null);
        });
    } else {
      setGradientColors([colors.bgSurface, colors.bgPage]);
      setPlayerTheme(null);
    }
  }, [artworkUrl, colors.bgPage, colors.bgSurface, colors.primaryBase]);

  return { playerTheme, gradientColors };
}
