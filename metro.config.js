const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Path to the linked react-native-audio-pro
const audioProPath = path.resolve(__dirname, '../../oss/react-native-audio-pro');
const projectRoot = __dirname;
const projectNodeModules = path.resolve(projectRoot, 'node_modules');

const config = {
  watchFolders: [
    projectRoot,
    audioProPath,
  ],
  resolver: {
    // Resolve symlinked modules but prioritize project's node_modules
    nodeModulesPaths: [
      projectNodeModules,
    ],
    // Deduplicate packages - ensure audio-pro uses host project's dependencies
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          // Redirect all module requests to the project's node_modules
          if (name === 'react-native-audio-pro') {
            return audioProPath;
          }
          // Force all other dependencies to use project's node_modules
          return path.join(projectNodeModules, name);
        },
      }
    ),
    // Block audio-pro's node_modules to prevent duplicate dependencies
    blockList: [
      new RegExp(`${audioProPath}/node_modules/react-native/.*`),
      new RegExp(`${audioProPath}/node_modules/react/.*`),
      new RegExp(`${audioProPath}/node_modules/@react-native/.*`),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
