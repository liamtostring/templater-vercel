import { kv } from '@vercel/kv';

/**
 * Vercel KV storage adapter
 * Stores persistent data (API keys, prompts, settings) in Vercel KV
 */
class Storage {
  private static STORAGE_PREFIX = 'templater:';

  /**
   * Get full key with prefix
   */
  private static getKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  /**
   * Get a value
   */
  static async getAsync<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const value = await kv.get<T>(fullKey);
      return value ?? defaultValue;
    } catch (error) {
      console.error(`Failed to get key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set a value
   */
  static async setAsync<T>(key: string, value: T): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      await kv.set(fullKey, value);
      return true;
    } catch (error) {
      console.error(`Failed to set key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a value
   */
  static async deleteAsync(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      await kv.del(fullKey);
      return true;
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   * Note: Vercel KV doesn't support pattern matching like Redis KEYS
   * We'll need to maintain an index for this functionality
   */
  static async getAllAsync<T>(pattern: string): Promise<Record<string, T>> {
    try {
      // Get the index of keys for this pattern
      const indexKey = this.getKey(`index:${pattern}`);
      const keys = await kv.get<string[]>(indexKey) ?? [];

      const result: Record<string, T> = {};

      // Fetch all values
      for (const key of keys) {
        const value = await kv.get<T>(this.getKey(key));
        if (value !== null) {
          result[key] = value;
        }
      }

      return result;
    } catch (error) {
      console.error(`Failed to get all keys for pattern ${pattern}:`, error);
      return {};
    }
  }

  /**
   * Add a key to an index (for pattern matching)
   * Call this when setting values that need to be retrieved by pattern
   */
  static async addToIndex(pattern: string, key: string): Promise<void> {
    try {
      const indexKey = this.getKey(`index:${pattern}`);
      const keys = await kv.get<string[]>(indexKey) ?? [];

      if (!keys.includes(key)) {
        keys.push(key);
        await kv.set(indexKey, keys);
      }
    } catch (error) {
      console.error(`Failed to add ${key} to index ${pattern}:`, error);
    }
  }

  /**
   * Remove a key from an index
   */
  static async removeFromIndex(pattern: string, key: string): Promise<void> {
    try {
      const indexKey = this.getKey(`index:${pattern}`);
      const keys = await kv.get<string[]>(indexKey) ?? [];

      const filtered = keys.filter(k => k !== key);
      await kv.set(indexKey, filtered);
    } catch (error) {
      console.error(`Failed to remove ${key} from index ${pattern}:`, error);
    }
  }
}

export default Storage;
