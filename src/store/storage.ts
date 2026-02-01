/**
 * MMKV Storage Wrapper
 * 
 * Provides a simple async-like interface for MMKV storage.
 * MMKV is synchronous but we wrap it for consistency with
 * potential future async storage needs.
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';

// Create the MMKV instance
const mmkv: MMKV = createMMKV({
  id: 'sunoh-storage',
});

/**
 * Storage interface that wraps MMKV with a consistent API.
 * All methods are synchronous under the hood but return
 * values directly for simplicity.
 */
export const storage = {
  /**
   * Get a string value from storage
   */
  getItem: (key: string): string | null => {
    const value = mmkv.getString(key);
    return value ?? null;
  },

  /**
   * Set a string value in storage
   */
  setItem: (key: string, value: string): void => {
    mmkv.set(key, value);
  },

  /**
   * Remove a value from storage
   */
  removeItem: (key: string): void => {
    mmkv.remove(key);
  },

  /**
   * Check if a key exists in storage
   */
  hasItem: (key: string): boolean => {
    return mmkv.contains(key);
  },

  /**
   * Get all keys in storage
   */
  getAllKeys: (): string[] => {
    return mmkv.getAllKeys();
  },

  /**
   * Clear all storage
   */
  clearAll: (): void => {
    mmkv.clearAll();
  },

  // --- Typed helpers ---

  /**
   * Get a boolean value
   */
  getBoolean: (key: string): boolean | null => {
    const value = mmkv.getBoolean(key);
    return value ?? null;
  },

  /**
   * Set a boolean value
   */
  setBoolean: (key: string, value: boolean): void => {
    mmkv.set(key, value);
  },

  /**
   * Get a number value
   */
  getNumber: (key: string): number | null => {
    const value = mmkv.getNumber(key);
    return value ?? null;
  },

  /**
   * Set a number value
   */
  setNumber: (key: string, value: number): void => {
    mmkv.set(key, value);
  },

  /**
   * Get a JSON object
   */
  getObject: <T>(key: string): T | null => {
    const value = mmkv.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set a JSON object
   */
  setObject: <T>(key: string, value: T): void => {
    mmkv.set(key, JSON.stringify(value));
  },
};

// Export the raw MMKV instance for advanced use cases
export { mmkv };

// Type export
export type Storage = typeof storage;
