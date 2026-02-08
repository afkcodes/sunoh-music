module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@features': './src/features',
          '@navigation': './src/navigation',
          '@services': './src/services',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@theme': './src/theme',
          '@types': './src/types',
          '@assets': './src/assets',
        },
      },
    ],
   'react-native-worklets/plugin',
  ],
};
// bjectdarkMuted: "#181010"darkVibrant: "#800808"dominantAndroid: "#181010"lightMuted: "#C0C0C0"lightVibrant: "#18181B"muted: "#787878"vibrant: "#08B0D0"[[Prototype]]: Object
