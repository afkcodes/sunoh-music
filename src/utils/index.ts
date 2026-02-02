/**
 * Utility exports
 * 
 * Central export for all utility functions and hooks.
 */

export { dataExtractor } from './dataExtractor';

// Scaling system
export {
    makeScalingStyles,
    makeScalingStylesOnly,
    staticScaling, useDynamicStyles,
    useInlineStyles,
    useInlineThemedStyles, useScaling,
    useScalingStyles,
    useScalingStylesOnly
} from './style.util';

export type {
    ScalingFunctions, ScalingOnlyStyleFactory, ScalingStyleFactory
} from './style.util';

export * from './common';
