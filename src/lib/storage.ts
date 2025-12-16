import prisma from './prisma';

/**
 * Prisma-based storage adapter
 * Uses the Setting model for key-value storage
 */

class Storage {
  /**
   * Get a value by key
   */
  static async getAsync<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key },
      });

      if (!setting) {
        return defaultValue;
      }

      return JSON.parse(setting.value) as T;
    } catch (error) {
      console.error(`Failed to get key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set a value by key
   */
  static async setAsync<T>(key: string, value: T): Promise<boolean> {
    try {
      await prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      });
      return true;
    } catch (error) {
      console.error(`Failed to set key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a value by key
   */
  static async deleteAsync(key: string): Promise<boolean> {
    try {
      await prisma.setting.delete({
        where: { key },
      });
      return true;
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern prefix
   */
  static async getAllAsync<T>(pattern: string): Promise<Record<string, T>> {
    try {
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            startsWith: pattern,
          },
        },
      });

      const result: Record<string, T> = {};
      for (const setting of settings) {
        result[setting.key] = JSON.parse(setting.value) as T;
      }

      return result;
    } catch (error) {
      console.error(`Failed to get all keys for pattern ${pattern}:`, error);
      return {};
    }
  }

  /**
   * Add a key to an index (no-op with Prisma - uses native querying)
   */
  static async addToIndex(pattern: string, key: string): Promise<void> {
    // No-op - Prisma supports native pattern matching
  }

  /**
   * Remove a key from an index (no-op with Prisma - uses native querying)
   */
  static async removeFromIndex(pattern: string, key: string): Promise<void> {
    // No-op - Prisma supports native pattern matching
  }
}

export default Storage;
