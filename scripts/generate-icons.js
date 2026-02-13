/**
 * Script to generate Solar icon components from Iconify API
 * Run: node scripts/generate-icons.js
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

// Icons from Solar icon set (default)
const SOLAR_ICONS = [
  // General UI & Navigation
  'danger-circle',
  'archive',
  'alt-arrow-down',
  'alt-arrow-up',
  'alt-arrow-left',
  'alt-arrow-right',
  'transfer-horizontal',
  'arrow-right',
  'arrow-left',
  'arrow-right-up',
  'arrow-left-down',
  'check-circle',
  'clock-circle',
  'layers',
  'minus-circle',
  'add-circle',
  'add-square',
  'close-circle',
  'close-square',
  'danger-triangle',
  'info-circle',
  'menu-dots',
  'hamburger-menu',
  'sort-vertical',
  'sort-horizontal',
  'filter',
  'sort',
  'list',
  'refresh',
  
  // Music & Playback
  'repeat',
  'shuffle',
  'music-note',
  'music-library',
  'music-notes',
  'microphone',
  'headphones',
  'speaker',
  'radio',
  'podcast',
  'soundwave', // Equalizer/waveform
  'tuning', // Equalizer sliders
  'slider-vertical',
  'slider-horizontal',
  'forward',
  'volume',
  'volume-loud',
  'volume-small',
  'volume-cross',
  'playlist',
  'album',
  
  // Content & Actions
  'pen',
  'restart',
  'magnifer',
  'calendar',
  'calendar-mark',
  'check-read',
  'card',
  'download',
  'upload',
  'share',
  'copy',
  'eye',
  'eye-closed',
  'shield',
  'shield-check',
  'tag',
  'target',
  'trash-bin-2',
  'heart',
  'star',
  'bookmark',
  'book-bookmark',
  'book',
  
  // Settings & Controls
  'settings',
  'moon',
  'sun',
  'bell',
  'bell-bing', // Notification
  'bolt',
  
  // Stats & Info
  'graph-down',
  'graph-up',
  'chart',
  
  // User & Social
  'user',
  'users-group-rounded',
  'mention-circle',
  
  // Categories & Content
  'flag',
  'fire',
  'confetti',
  'medal-ribbon',
  'tag-price',
  'wallet',
  'money-bag',
  'sale',
  'hand-money',
  'hand-heart',
  'health',
  
  // Organization
  'folder',
  'bill-list',
  
  // Devices & Platform
  'home',
  'home-2',
  'laptop',
  'smartphone',
  'tv',
  
  // Misc
  'map',
  'palette',
  'rocket',
  'gift',
  'square-academic-cap',
  'hashtag',
  'gamepad',
  'emoji-funny-circle',
  'stars',
  'stop-circle',
  'shop',
  'ticket',
  'undo-left',
  'lightbulb-bolt',
];

// Icons from other icon sets (fallbacks for missing Solar icons)
// Format: { name: 'ComponentName', set: 'icon-set', icon: 'icon-name' }
const OTHER_ICONS = [
  // Playback controls from Remix (better quality)
  { name: 'Play', set: 'ri', icon: 'play-fill' },
  { name: 'Pause', set: 'ri', icon: 'pause-fill' },
  { name: 'SkipNext', set: 'ri', icon: 'skip-forward-fill' },
  { name: 'SkipPrevious', set: 'ri', icon: 'skip-back-fill' },
  // Music icons not in Solar
  { name: 'Headphones', set: 'lucide', icon: 'headphones' },
  { name: 'Rewind', set: 'lucide', icon: 'rewind' },
  { name: 'FastForward', set: 'lucide', icon: 'fast-forward' },
  { name: 'ListMusic', set: 'lucide', icon: 'list-music' },
  { name: 'GripVertical', set: 'lucide', icon: 'grip-vertical' },
  // Filled heart variant (Solar bold)
  { name: 'HeartFill', set: 'solar', icon: 'heart-bold' },
];

// Fetch SVG from Iconify API (Solar icons)
function fetchSolarIcon(iconName, variant = 'linear') {
  return new Promise((resolve, reject) => {
    const url = `https://api.iconify.design/solar/${iconName}-${variant}.svg`;

    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 && data.includes('<svg')) {
            resolve(data);
          } else {
            // Try bold variant
            const boldUrl = `https://api.iconify.design/solar/${iconName}-bold.svg`;
            https
              .get(boldUrl, (res2) => {
                let data2 = '';
                res2.on('data', (chunk) => {
                  data2 += chunk;
                });
                res2.on('end', () => {
                  if (res2.statusCode === 200 && data2.includes('<svg')) {
                    resolve(data2);
                  } else {
                    // Try without variant
                    const plainUrl = `https://api.iconify.design/solar/${iconName}.svg`;
                    https
                      .get(plainUrl, (res3) => {
                        let data3 = '';
                        res3.on('data', (chunk) => {
                          data3 += chunk;
                        });
                        res3.on('end', () => {
                          if (res3.statusCode === 200 && data3.includes('<svg')) {
                            resolve(data3);
                          } else {
                            reject(new Error(`Icon not found: ${iconName}`));
                          }
                        });
                      })
                      .on('error', reject);
                  }
                });
              })
              .on('error', reject);
          }
        });
      })
      .on('error', reject);
  });
}

// Fetch SVG from any Iconify icon set
function fetchOtherIcon(iconSet, iconName) {
  return new Promise((resolve, reject) => {
    const url = `https://api.iconify.design/${iconSet}/${iconName}.svg`;

    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 && data.includes('<svg')) {
            resolve(data);
          } else {
            reject(new Error(`Icon not found: ${iconSet}:${iconName}`));
          }
        });
      })
      .on('error', reject);
  });
}

// Convert SVG to React Native component
function svgToComponent(name, svg) {
  // Extract viewBox
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // Extract inner content (everything inside <svg>...</svg>)
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  let inner = innerMatch ? innerMatch[1].trim() : '';

  // Convert SVG attributes to React Native format
  inner = inner
    .replace(/class="[^"]*"/g, '')
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
    .replace(/stroke-miterlimit/g, 'strokeMiterlimit')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule')
    .replace(/clip-path/g, 'clipPath')
    .replace(/stroke-dasharray/g, 'strokeDasharray')
    .replace(/stroke-dashoffset/g, 'strokeDashoffset')
    .replace(/<path/g, '<Path')
    .replace(/<\/path>/g, '</Path>')
    .replace(/<circle/g, '<Circle')
    .replace(/<\/circle>/g, '</Circle>')
    .replace(/<rect/g, '<Rect')
    .replace(/<\/rect>/g, '</Rect>')
    .replace(/<line/g, '<Line')
    .replace(/<\/line>/g, '</Line>')
    .replace(/<polyline/g, '<Polyline')
    .replace(/<\/polyline>/g, '</Polyline>')
    .replace(/<polygon/g, '<Polygon')
    .replace(/<\/polygon>/g, '</Polygon>')
    .replace(/<ellipse/g, '<Ellipse')
    .replace(/<\/ellipse>/g, '</Ellipse>')
    .replace(/<g/g, '<G')
    .replace(/<\/g>/g, '</G>')
    .replace(/<defs/g, '<Defs')
    .replace(/<\/defs>/g, '</Defs>')
    .replace(/<clipPath/g, '<ClipPath')
    .replace(/<\/clipPath>/g, '</ClipPath>')
    .replace(/<mask/g, '<Mask')
    .replace(/<\/mask>/g, '</Mask>')
    .replace(/<use/g, '<Use')
    .replace(/<\/use>/g, '</Use>')
    .replace(/<linearGradient/g, '<LinearGradient')
    .replace(/<\/linearGradient>/g, '</LinearGradient>')
    .replace(/<radialGradient/g, '<RadialGradient')
    .replace(/<\/radialGradient>/g, '</RadialGradient>')
    .replace(/<stop/g, '<Stop')
    .replace(/<\/stop>/g, '</Stop>');

  // Convert kebab-case name to PascalCase
  const componentName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return { componentName, viewBox, inner };
}

async function main() {
  console.log('Fetching icons from Iconify API...\n');

  const components = [];
  const failed = [];

  // Fetch Solar icons
  console.log('--- Solar Icons ---');
  for (const icon of SOLAR_ICONS) {
    process.stdout.write(`Fetching solar:${icon}... `);
    try {
      const svg = await fetchSolarIcon(icon);
      const { componentName, viewBox, inner } = svgToComponent(icon, svg);
      components.push({ name: icon, componentName, viewBox, inner });
      console.log('✓');
    } catch (_err) {
      console.log('✗');
      failed.push(`solar:${icon}`);
    }
    // Rate limit
    await new Promise((r) => setTimeout(r, 100));
  }

  // Fetch icons from other sets
  if (OTHER_ICONS.length > 0) {
    console.log('\n--- Other Icon Sets ---');
    for (const { name, set, icon } of OTHER_ICONS) {
      process.stdout.write(`Fetching ${set}:${icon}... `);
      try {
        const svg = await fetchOtherIcon(set, icon);
        const { viewBox, inner } = svgToComponent(icon, svg);
        components.push({ name: icon, componentName: name, viewBox, inner });
        console.log('✓');
      } catch (_err) {
        console.log('✗');
        failed.push(`${set}:${icon}`);
      }
      // Rate limit
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  if (failed.length > 0) {
    console.log('\nFailed icons:', failed.join(', '));
  }

  // Generate the file
  const imports = `import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Mask, Path, Polygon, Polyline, RadialGradient, Rect, Stop, type SvgProps, Use } from 'react-native-svg';`;

  const iconComponents = components
    .map(
      ({ componentName, viewBox, inner }) => `
export function ${componentName}({ color = 'currentColor', size = 24, ...props }: SvgProps & { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="${viewBox}" {...props}>
      ${inner.replace(/="currentColor"/g, '={color}')}
    </Svg>
  );
}`
    )
    .join('\n');

  const output = `/**
 * @fileoverview Solar Icons - Auto-generated from Iconify API
 * @module @Vento/native/components/common
 * 
 * Generated on: ${new Date().toISOString()}
 * Total icons: ${components.length}
 */

${imports}

${iconComponents}
`;

  const outputPath = path.join(
    __dirname,
    '..',
    'src',
    'components',
    'common',
    'SolarIcons.generated.tsx'
  );
  fs.writeFileSync(outputPath, output);

  console.log(`\n✓ Generated ${components.length} icons to ${outputPath}`);
}

main().catch(console.error);
