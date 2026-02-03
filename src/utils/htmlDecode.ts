/**
 * Decodes HTML entities in a string
 * Handles:
 * - Named entities (&quot;, &amp;, etc.)
 * - Numeric entities (&#39;, &#34;, etc.)
 * - Hex entities (&#x27;, &#x22;, etc.)
 */
export const decodeHtmlEntities = (text: string): string => {
  // Named entities map
  const namedEntities: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&ndash;': '\u2013', // –
    '&mdash;': '\u2014', // —
    '&lsquo;': '\u2018', // '
    '&rsquo;': '\u2019', // '
    '&ldquo;': '\u201C', // "
    '&rdquo;': '\u201D', // "
    '&hellip;': '\u2026', // …
    '&copy;': '\u00A9', // ©
    '&reg;': '\u00AE', // ®
    '&trade;': '\u2122', // ™
    '&deg;': '\u00B0', // °
    '&times;': '\u00D7', // ×
    '&divide;': '\u00F7', // ÷
    '&hearts;': '\u2665', // ♥
    '&clubs;': '\u2663', // ♣
    '&diams;': '\u2666', // ♦
    '&spades;': '\u2660', // ♠
  };

  return text
    // Decode numeric entities (&#39; -> ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    // Decode hex entities (&#x27; -> ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Decode named entities (&quot; -> ")
    .replace(/&[a-z]+;/gi, (match) => namedEntities[match.toLowerCase()] || match);
};
