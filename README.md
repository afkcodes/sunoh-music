<div align="center">
  <h1>🎧 Sunoh</h1>
  <p><strong>A beautifully crafted, blazing-fast cross-platform music streaming app.</strong></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.83-blue.svg?style=flat-square&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue.svg?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-Android-green.svg?style=flat-square&logo=android" alt="Android" />
</p>

## ✨ What is Sunoh?

**Sunoh** is a modern music player and streaming application built to deliver a premium listening experience. Designed with a focus on cutting-edge aesthetics, smooth animations, and high performance, it aims to be your default daily driver for music.

Whether you're exploring new trending music, managing your personal library, or fine-tuning audio with the built-in equalizer, Sunoh handles it all without breaking a sweat.

## 🚀 Features

- 🎵 **Unified Streaming**: Enjoy music from multiple providers including Saavn and Gaana, smoothly unified under one gorgeous interface.
- 🎨 **Premium UI/UX**: Dynamic theming based on album artwork, smooth hero transitions, and sleek modern components. 
- 🎛️ **Built-in Equalizer**: Fine-tune your audio experience with built-in presets and manual adjustments.
- 📜 **Interactive Queue**: Drag-and-drop song reordering, swipe to remove, and an intelligent auto-queue system.
- ⚡ **Blazing Fast**: Engineered using `react-native-nitro-modules`, `react-native-mmkv` for instant storage, and hyper-optimized lists (`@legendapp/list` & `recyclerlistview`).
- 📊 **Firebase Analytics**: Built-in lightweight tracking for screen views and song plays to monitor app usage patterns.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) (v0.83) + TypeScript
- **Navigation**: [`navigation-react-native`](https://grahammendick.github.io/navigation/native/) for high-performance true native routing
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [React Query](https://tanstack.com/query/latest)
- **Local Storage**: [`react-native-mmkv`](https://github.com/mrousavy/react-native-mmkv)
- **Audio & Media**: Custom `react-native-audio-pro` integration

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (>= 20.x)
- Yarn (`yarn@4.6.0` recommended)
- Ruby & CocoaPods (for iOS)
- Android Studio / Xcode

### Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:afkcodes/sunoh-music.git
   cd sunoh-music
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the App

Start the Metro bundler:
```bash
yarn dev
```

Run on Android:
```bash
yarn android
```

Run on iOS:
```bash
yarn ios
```

## 📦 Building for Production (Android)

Sunoh uses APK splitting to generate optimized, lightweight APKs per architecture.

```bash
yarn android --mode=release
```

Release APKs will be generated in `android/app/build/outputs/apk/release/`.

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! If you're adding a major feature or heavily modifying the UI, please open an issue first to discuss the changes.

---
<p align="center">Made with ❤️ for music lovers.</p>
