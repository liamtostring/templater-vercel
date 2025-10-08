import { createClient } from 'redis';

/**
 * Redis Cloud storage adapter
 * Stores persistent data (API keys, prompts, settings) in Redis
 */

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));

    await redisClient.connect();
    console.log('✅ Redis connected');
  }

  return redisClient;
}

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
      const client = await getRedisClient();
      const fullKey = this.getKey(key);
      const value = await client.get(fullKey);

      if (value === null) {
        return defaultValue;
      }

      return JSON.parse(value) as T;
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
      const client = await getRedisClient();
      const fullKey = this.getKey(key);
      await client.set(fullKey, JSON.stringify(value));
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
      const client = await getRedisClient();
      const fullKey = this.getKey(key);
      await client.del(fullKey);
      return true;
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   * Uses index-based approach for efficiency
   */
  static async getAllAsync<T>(pattern: string): Promise<Record<string, T>> {
    try {
      const client = await getRedisClient();

      // Get the index of keys for this pattern
      const indexKey = this.getKey(`index:${pattern}`);
      const indexValue = await client.get(indexKey);
      const keys = indexValue ? JSON.parse(indexValue) : [];

      const result: Record<string, T> = {};

      // Fetch all values
      for (const key of keys) {
        const value = await client.get(this.getKey(key));
        if (value !== null) {
          result[key] = JSON.parse(value) as T;
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
      const client = await getRedisClient();
      const indexKey = this.getKey(`index:${pattern}`);
      const indexValue = await client.get(indexKey);
      const keys = indexValue ? JSON.parse(indexValue) : [];

      if (!keys.includes(key)) {
        keys.push(key);
        await client.set(indexKey, JSON.stringify(keys));
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
      const client = await getRedisClient();
      const indexKey = this.getKey(`index:${pattern}`);
      const indexValue = await client.get(indexKey);
      const keys = indexValue ? JSON.parse(indexValue) : [];

      const filtered = keys.filter((k: string) => k !== key);
      await client.set(indexKey, JSON.stringify(filtered));
    } catch (error) {
      console.error(`Failed to remove ${key} from index ${pattern}:`, error);
    }
  }
}

export default Storage;
