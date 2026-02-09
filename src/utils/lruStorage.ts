import { mmkv } from '../store/storage';

/**
 * A simple LRU (Least Recently Used) cache implementation using MMKV for persistence.
 * 
 * It stores a list of keys to track usage order and the actual values associated with those keys.
 */
export class LRUStorage<T> {
  private readonly name: string;
  private readonly maxSize: number;
  private readonly keysKey: string;
  private inMemoryKeys: string[] | null = null;

  constructor(name: string, maxSize: number = 50) {
    this.name = name;
    this.maxSize = maxSize;
    this.keysKey = `lru_keys_${name}`;
  }

  /**
   * Get the list of keys, using in-memory cache if available
   */
  private getKeys(): string[] {
    if (this.inMemoryKeys) return this.inMemoryKeys;
    
    const keysJson = mmkv.getString(this.keysKey);
    if (!keysJson) {
      this.inMemoryKeys = [];
      return [];
    }
    try {
      this.inMemoryKeys = JSON.parse(keysJson);
      return this.inMemoryKeys || [];
    } catch {
      this.inMemoryKeys = [];
      return [];
    }
  }

  /**
   * Save the list of keys to MMKV after potential modifications
   */
  private saveKeys(keys: string[]): void {
    this.inMemoryKeys = keys;
    mmkv.set(this.keysKey, JSON.stringify(keys));
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | null {
    if (!key) return null;

    const valueJson = mmkv.getString(`${this.name}_${key}`);
    if (!valueJson) return null;

    try {
      const value = JSON.parse(valueJson) as T;
      
      // Update LRU order: move to front (efficiently)
      const keys = this.getKeys();
      if (keys[0] !== key) {
        const index = keys.indexOf(key);
        if (index !== -1) {
          keys.splice(index, 1);
        }
        keys.unshift(key);
        this.saveKeys(keys);
      }

      return value;
    } catch {
      return null;
    }
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T): void {
    if (!key) return;

    let keys = this.getKeys();
    const index = keys.indexOf(key);

    // If key exists, remove it from its current position
    if (index !== -1) {
      keys.splice(index, 1);
    }

    // Add key to the front
    keys.unshift(key);

    // Evict oldest if maxSize exceeded
    if (keys.length > this.maxSize) {
      const evictedKey = keys.pop();
      if (evictedKey) {
        mmkv.remove(`${this.name}_${evictedKey}`);
      }
    }

    // Save updated keys and the value
    this.saveKeys(keys);
    mmkv.set(`${this.name}_${key}`, JSON.stringify(value));
  }

  /**
   * Remove a value from the cache
   */
  remove(key: string): void {
    if (!key) return;

    const keys = this.getKeys();
    const index = keys.indexOf(key);
    if (index !== -1) {
      keys.splice(index, 1);
      this.saveKeys(keys);
    }
    mmkv.remove(`${this.name}_${key}`);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    const keys = this.getKeys();
    keys.forEach(key => {
      mmkv.remove(`${this.name}_${key}`);
    });
    mmkv.remove(this.keysKey);
  }
}

/**
 * Shared instance for caching artwork colors
 */
export const artworkColorCache = new LRUStorage<any>('artwork_colors', 100);
