# Sunoh - Premium Music Streaming App

## Project Overview

Sunoh is a premium, personal-use music streaming application built with React Native targeting peak performance, stunning UI/UX, and professional-grade audio features. This is not a beginner project—we demand excellence in every line of code.

**Package Name:** `codes.afk.sunoh`

---

## Tech Stack & Architecture

### Core Framework
- **React Native 0.83.x** - New Architecture enabled (Fabric + TurboModules)
- **React 19.x** - Concurrent features, automatic batching, transitions
- **TypeScript** - Strict mode, no `any` types, comprehensive type coverage

### State Management
- **Zustand** - Client state (UI state, player state, preferences)
- **TanStack Query** - Server state (API data, caching, background sync)
- **MMKV** - Persistent storage (preferences, tokens, small data)

### Navigation (Top-Level Tabs)

We use `TabBar` with nested internal stacks.

```tsx
// 1. Create Navigators
const rootNavigator = new StateNavigator([{ key: 'tabs' }]);
const homeNavigator = new StateNavigator([{ key: 'home' }, { key: 'details', trackCrumbTrail: true }]);
const libraryNavigator = new StateNavigator([{ key: 'library' }]);

// 2. Root Component (App.tsx) renders Root Stack (Tabs only)
<NavigationHandler stateNavigator={rootNavigator}>
  <NavigationStack>
    <Scene stateKey="tabs"><TabScreen /></Scene>
  </NavigationStack>
</NavigationHandler>

// 3. Tab Screen
const TabScreen = () => (
  <TabBar primary={true}>
    <TabBarItem title="Home" image={require('home.png')}>
      <NavigationHandler stateNavigator={homeNavigator}>
        <NavigationStack>
          <Scene stateKey="home"><HomeScreen /></Scene>
          <Scene stateKey="details"><DetailScreen /></Scene>
        </NavigationStack>
      </NavigationHandler>
    </TabBarItem>
    // ... other tabs
  </TabBar>
);
```

### Navigation
- **Navigation Router** (`navigation-react-native`) - Native navigation with 100% native UI elements.
- **Architecture**: Use `TabBar` (primary=true) for top-level tabs. Each `TabBarItem` must have its own `NavigationHandler` -> `NavigationStack` -> `Scene`.
- **NO React Navigation** - We have migrated away from it.

### UI & Animations
- **React Native Reanimated 4.x** - All animations MUST run on UI thread
- **React Native Gesture Handler** - Native gesture recognition
- **React Native Skia** - Hardware-accelerated graphics, visualizers
- **FlashList** - Virtualized lists (NEVER use FlatList for large lists)
- **Turbo Image** - Fast, cached image loading with blur placeholders

### Audio
- **React Native Audio API** - Primary audio engine for playback, DSP, and visualizers.
- **[REMOVED] React Native Track Player** - Do not use.
- **React Native Worklets** - Required by Reanimated 4.

### Networking
- **TanStack Query** - Data fetching, caching, background updates
- **Axios** - HTTP client with interceptors

---

## Project Structure

```
src/
├── app/                    # App entry, providers, global config
├── assets/                 # Static assets (fonts, images, animations)
│   ├── fonts/
│   ├── images/
│   ├── animations/         # Lottie files
│   └── icons/
├── components/             # Reusable UI components
│   ├── common/             # Buttons, inputs, cards, etc.
│   ├── player/             # Player-related components
│   ├── lists/              # List items, sections
│   ├── modals/             # Bottom sheets, dialogs
│   └── visualizers/        # Audio visualizers
├── features/               # Feature-based modules
│   ├── home/
│   ├── search/
│   ├── library/
│   ├── player/
│   ├── radio/
│   ├── podcast/
│   ├── equalizer/
│   └── profile/
├── hooks/                  # Custom React hooks
├── navigation/             # Navigation configuration
├── services/               # Business logic & API services
│   ├── api/                # API clients
│   ├── audio/              # Audio service layer
│   ├── ai/                 # AI playlist generation
│   └── sync/               # Offline sync
├── store/                  # Zustand stores
├── theme/                  # Design system
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── animations.ts
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

---

## Coding Standards

### TypeScript Rules
```typescript
// ✅ CORRECT - Explicit types, no any
interface Track {
  id: string;
  title: string;
  artist: Artist;
  duration: number;
  artworkUrl: string;
}

const useTrack = (trackId: string): Track | null => {
  // Implementation
};

// ❌ WRONG - Never do this
const useTrack = (trackId: any): any => {};
```

### Component Patterns
```typescript
// ✅ CORRECT - Functional component with proper typing
import { memo } from 'react';
import type { FC } from 'react';

interface TrackCardProps {
  track: Track;
  onPress: (track: Track) => void;
  isPlaying?: boolean;
}

export const TrackCard: FC<TrackCardProps> = memo(({ track, onPress, isPlaying = false }) => {
  // Use useCallback for handlers passed to children
  const handlePress = useCallback(() => {
    onPress(track);
  }, [track, onPress]);

  return (
    // JSX
  );
});

TrackCard.displayName = 'TrackCard';
```

### Animation Rules
```typescript
// ✅ CORRECT - Reanimated worklet, runs on UI thread
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolation 
} from 'react-native-reanimated';

const AnimatedCard: FC<Props> = ({ isActive }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) }],
  }));

  useEffect(() => {
    scale.value = isActive ? 1.05 : 1;
  }, [isActive]);

  return <Animated.View style={animatedStyle} />;
};

// ❌ WRONG - Never use Animated from react-native for complex animations
import { Animated } from 'react-native'; // NO!
```

### State Management
```typescript
// ✅ CORRECT - Zustand store with proper typing and selectors
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  // Actions
  play: (track: Track) => void;
  pause: () => void;
  addToQueue: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    queue: [],
    
    play: (track) => set({ currentTrack: track, isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  }))
);

// Use selectors to prevent unnecessary re-renders
const currentTrack = usePlayerStore((state) => state.currentTrack);
const isPlaying = usePlayerStore((state) => state.isPlaying);
```

### API & Data Fetching
```typescript
// ✅ CORRECT - TanStack Query with proper typing
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useTrackQuery = (trackId: string) => {
  return useQuery({
    queryKey: ['track', trackId],
    queryFn: () => api.tracks.getById(trackId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
};

const useLikeTrackMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackId: string) => api.tracks.like(trackId),
    onMutate: async (trackId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['track', trackId] });
      const previous = queryClient.getQueryData(['track', trackId]);
      queryClient.setQueryData(['track', trackId], (old: Track) => ({
        ...old,
        isLiked: true,
      }));
      return { previous };
    },
    onError: (err, trackId, context) => {
      queryClient.setQueryData(['track', trackId], context?.previous);
    },
  });
};
```

---

## Performance Requirements

### Rendering
- **60 FPS minimum** for all animations and scrolling
- Use `memo()` for all list items and frequently re-rendered components
- Use `useCallback()` for all handlers passed to children
- Use `useMemo()` for expensive computations
- FlashList for ALL scrollable lists with `estimatedItemSize`

### Images
- Always use `TurboImage` with blur placeholder
- Implement progressive loading for artwork
- Cache aggressively with proper cache policies

### Memory
- Implement proper cleanup in `useEffect` return functions
- Use weak references where appropriate
- Monitor and prevent memory leaks in audio processing

### Startup
- Lazy load non-critical screens
- Preload critical assets
- Implement splash screen with actual loading progress

---

## UI/UX Guidelines

### Design Language
- **Dark mode first** - Rich blacks (#0A0A0A), not pure black
- **Glassmorphism** - Subtle blur effects for overlays
- **Depth** - Use shadows and elevation meaningfully
- **Motion** - Every interaction should have feedback

### Color Palette
```typescript
export const colors = {
  // Backgrounds
  background: {
    primary: '#0A0A0A',
    secondary: '#141414',
    tertiary: '#1E1E1E',
    elevated: '#252525',
  },
  // Accent
  accent: {
    primary: '#6366F1',    // Indigo
    secondary: '#8B5CF6',  // Purple
    gradient: ['#6366F1', '#8B5CF6', '#EC4899'],
  },
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    inverse: '#0A0A0A',
  },
  // Semantic
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;
```

### Typography (Gilroy)

**IMPORTANT:** We use **Gilroy** for everything.
**ANDROID NOTE:** Do NOT use raw `fontWeight` with `RNText`. Use our custom `<Text>` component which handles mapping weights to the correct font files (`Gilroy-Bold`, etc.).

```typescript
// Correct usage
<Text variant="h1">Hello</Text>
<Text variant="body" style={{ fontWeight: '700' }}>bolds correctly</Text> // Handled by component

// Typography Tokens
export const typography = {
  // Display
  display: { fontSize: 32, lineHeight: 40, fontFamily: 'Gilroy-Bold' },
  // Headlines
  h1: { fontSize: 24, lineHeight: 32, fontFamily: 'Gilroy-Semibold' },
  h2: { fontSize: 20, lineHeight: 28, fontFamily: 'Gilroy-Semibold' },
  h3: { fontSize: 18, lineHeight: 24, fontFamily: 'Gilroy-Medium' },
  // Body
  bodyLarge: { fontSize: 17, lineHeight: 24, fontFamily: 'Gilroy-Regular' },
  body: { fontSize: 15, lineHeight: 22, fontFamily: 'Gilroy-Regular' },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: 'Gilroy-Regular' },
  tiny: { fontSize: 11, lineHeight: 14, fontFamily: 'Gilroy-Medium' },
} as const;
```

### Spacing System
```typescript
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;
```

### Animation Presets
```typescript
export const animations = {
  spring: {
    gentle: { damping: 20, stiffness: 100 },
    bouncy: { damping: 10, stiffness: 150 },
    stiff: { damping: 25, stiffness: 300 },
    slow: { damping: 20, stiffness: 60 },
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    // Use Reanimated's built-in easings
  },
} as const;
```

---

## Feature Specifications

### 1. Now Playing Screen
- Full-screen artwork with blur background
- Gesture-based controls (swipe up for queue, swipe down to minimize)
- Real-time audio visualizer (Skia-based)
- Lyrics display with sync
- Sleep timer
- Playback speed control
- Cast to devices

### 2. Mini Player
- Persistent across all screens
- Swipe up gesture to expand
- Progress indicator
- Play/pause with haptic feedback
- Artwork with subtle animation

### 3. Home/Discovery
- Personalized recommendations
- Recently played
- Quick picks based on time of day
- New releases
- Curated playlists
- Mood-based sections

### 4. Search
- Real-time search with debouncing
- Voice search
- Search history
- Trending searches
- Category browsing
- Filter by type (tracks, albums, artists, playlists, podcasts, radios)

### 5. Library
- Liked songs
- Playlists (user-created + AI-generated)
- Albums
- Artists
- Downloaded content
- Listening history

### 6. Internet Radio
- Genre-based stations
- Country-based stations
- Favorites
- Recently played stations
- Station info display
- Recording capability (if legal)

### 7. Podcasts
- Subscriptions
- Episodes queue
- Playback position sync
- Variable speed playback
- Skip silence
- Chapter support
- Show notes

### 8. AI Playlist Generation
- Mood-based generation
- Activity-based (workout, study, sleep)
- Similar to artist/track
- Time-based (decade, era)
- Custom prompts

### 9. Equalizer
- Preset EQ profiles
- Custom 10-band EQ
- Bass boost
- Virtualizer
- Reverb
- Save custom presets

### 10. Profile & Settings
- Listening statistics
- Audio quality settings
- Download settings
- Theme customization
- Playback settings
- Connected devices
- Data usage

---

### Audio Service (using react-native-audio-api)
```typescript
// services/audio/AudioService.ts
import { AudioPlayer } from 'react-native-audio-api';

class AudioService {
  private player: AudioPlayer;

  async initialize() {
    this.player = new AudioPlayer();
    // Use Audio API methods
  }
}
```

---

## API Integration Patterns

### Base API Client
```typescript
// services/api/client.ts
import axios from 'axios';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getString('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
    }
    return Promise.reject(error);
  }
);
```

---

## Testing Strategy

### Unit Tests
- All utility functions
- Store actions and selectors
- Custom hooks
- Service methods

### Component Tests
- Critical UI components
- User interactions
- Accessibility

### Integration Tests
- Navigation flows
- API integration
- Audio playback

### E2E Tests (Detox)
- Critical user journeys
- Playback scenarios
- Offline functionality

---

## Build & Release

### Debug
```bash
# Android
yarn android

# iOS
yarn ios
```

### Release
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
# Use Xcode or fastlane
```

### Performance Profiling
- React DevTools for component profiling
- Systrace for native performance
- Memory profiler for leak detection

---

## Dependencies to Add

```json
{
  "dependencies": {
    "react-native-audio-api": "^0.x",
    "navigation-react-native": "^9.x",
    "@lodev09/react-native-true-sheet": "^0.x",
    "react-native-fast-squircle": "^0.x",
     "react-native-worklets": "^0.7.x",
    "@shopify/react-native-skia": "^1.x",
    "lottie-react-native": "^7.x",
    "react-native-haptic-feedback": "^2.x",
    "react-native-linear-gradient": "^2.x",
    "react-native-nitro-modules": "^0.x"
  }
}
```

---

## Git Workflow

### Branch Naming
- `feature/feature-name`
- `fix/bug-description`
- `refactor/what-refactored`
- `chore/task-description`

### Commit Messages
Follow Conventional Commits:
- `feat: add equalizer presets`
- `fix: resolve audio glitch on seek`
- `perf: optimize list rendering`
- `refactor: extract player controls`
- `chore: update dependencies`

---

## Important Reminders

1. **NEVER use inline styles** - Always use StyleSheet.create or styled components
2. **NEVER use `any` type** - Always define proper interfaces
3. **NEVER use FlatList for large lists** - Always use FlashList
4. **NEVER animate on JS thread** - Always use Reanimated worklets
5. **NEVER block the main thread** - Use InteractionManager for heavy operations
6. **ALWAYS memoize** - Components, callbacks, and expensive computations
7. **ALWAYS handle errors** - Graceful degradation, user feedback
8. **ALWAYS consider offline** - Cache data, queue actions
9. **ALWAYS test on real devices** - Simulators lie about performance
10. **ALWAYS profile before optimizing** - Measure, don't guess

---

## Quick Reference

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `camelCase.types.ts`
- Stores: `camelCaseStore.ts`
- Services: `CamelCaseService.ts`

### Import Order
1. React/React Native
2. Third-party libraries
3. Navigation
4. Components
5. Hooks
6. Services/Utils
7. Types
8. Assets

---

*This is a living document. Update as the project evolves.*
