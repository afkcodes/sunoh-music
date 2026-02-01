/**
 * Sunoh Animation System
 * 
 * Consistent animation presets for smooth, delightful interactions.
 * All animations should run on the UI thread using Reanimated.
 */

import { Easing } from 'react-native-reanimated';

// Spring configurations for natural motion
export const springs = {
  // Gentle - Slow, smooth transitions
  gentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
  
  // Default - Balanced, everyday animations
  default: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  // Bouncy - Playful, energetic feel
  bouncy: {
    damping: 10,
    stiffness: 150,
    mass: 1,
  },
  
  // Stiff - Quick, responsive feedback
  stiff: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },
  
  // Slow - Dramatic, deliberate motion
  slow: {
    damping: 20,
    stiffness: 60,
    mass: 1,
  },
  
  // Snappy - Quick with slight overshoot
  snappy: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  },
} as const;

// Timing durations in milliseconds
export const durations = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
  slowest: 1000,
} as const;

// Easing presets
export const easings = {
  // Standard easings
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  
  // Cubic easings
  easeInCubic: Easing.in(Easing.cubic),
  easeOutCubic: Easing.out(Easing.cubic),
  easeInOutCubic: Easing.inOut(Easing.cubic),
  
  // Expo easings - Dramatic
  easeInExpo: Easing.in(Easing.exp),
  easeOutExpo: Easing.out(Easing.exp),
  easeInOutExpo: Easing.inOut(Easing.exp),
  
  // Back easings - Overshoot
  easeInBack: Easing.in(Easing.back(1.7)),
  easeOutBack: Easing.out(Easing.back(1.7)),
  easeInOutBack: Easing.inOut(Easing.back(1.7)),
  
  // Elastic - Bouncy
  easeOutElastic: Easing.out(Easing.elastic(1)),
} as const;

// Common animation patterns
export const patterns = {
  // Fade in/out
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: durations.normal,
    easing: easings.easeOut,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: durations.fast,
    easing: easings.easeIn,
  },
  
  // Scale animations
  scaleIn: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    spring: springs.default,
  },
  scaleOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.9, opacity: 0 },
    duration: durations.fast,
    easing: easings.easeIn,
  },
  
  // Slide animations
  slideInUp: {
    from: { translateY: 50, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    spring: springs.default,
  },
  slideInDown: {
    from: { translateY: -50, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    spring: springs.default,
  },
  slideInLeft: {
    from: { translateX: -50, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    spring: springs.default,
  },
  slideInRight: {
    from: { translateX: 50, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    spring: springs.default,
  },
  
  // Press feedback
  pressIn: {
    to: { scale: 0.97 },
    spring: springs.stiff,
  },
  pressOut: {
    to: { scale: 1 },
    spring: springs.bouncy,
  },
  
  // Pulse (for playing indicator)
  pulse: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 1.1, opacity: 0.8 },
    duration: durations.slow,
    loop: true,
  },
} as const;

// Stagger delays for list animations
export const stagger = {
  fast: 30,
  normal: 50,
  slow: 80,
} as const;

// Type exports
export type Springs = typeof springs;
export type SpringKey = keyof typeof springs;
export type Durations = typeof durations;
export type DurationKey = keyof typeof durations;
export type Easings = typeof easings;
export type EasingKey = keyof typeof easings;
