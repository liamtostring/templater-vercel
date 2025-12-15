import { get, getAll } from '@vercel/edge-config';

/**
 * Vercel Edge Config storage adapter
 * Reads via Edge Config SDK, writes via Vercel REST API
 */

const STORAGE_PREFIX = 'templater_';

/**
 * Get full key with prefix
 */
function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Write to Edge Config via Vercel REST API
 */
async function writeToEdgeConfig(items: Record<string, unknown>): Promise<boolean> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelApiToken = process.env.VERCEL_API_TOKEN;

  if (!edgeConfigId || !vercelApiToken) {
    console.error('EDGE_CONFIG_ID or VERCEL_API_TOKEN not set');
    return false;
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const url = teamId
    ? `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?teamId=${teamId}`
    : `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${vercelApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: Object.entries(items).map(([key, value]) => ({
        operation: 'upsert',
        key,
        value,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Edge Config write failed:', error);
    return false;
  }

  return true;
}

/**
 * Delete from Edge Config via Vercel REST API
 */
async function deleteFromEdgeConfig(keys: string[]): Promise<boolean> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelApiToken = process.env.VERCEL_API_TOKEN;

  if (!edgeConfigId || !vercelApiToken) {
    console.error('EDGE_CONFIG_ID or VERCEL_API_TOKEN not set');
    return false;
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const url = teamId
    ? `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?teamId=${teamId}`
    : `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${vercelApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: keys.map((key) => ({
        operation: 'delete',
        key,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Edge Config delete failed:', error);
    return false;
  }

  return true;
}

class Storage {
  /**
   * Get a value
   */
  static async getAsync<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const fullKey = getKey(key);
      const value = await get<T>(fullKey);

      if (value === undefined) {
        return defaultValue;
      }

      return value;
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
      const fullKey = getKey(key);
      return await writeToEdgeConfig({ [fullKey]: value });
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
      const fullKey = getKey(key);
      return await deleteFromEdgeConfig([fullKey]);
    } catch (error) {
      console.error(`Failed to delete key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern prefix
   * Edge Config doesn't support pattern matching, so we fetch all and filter
   */
  static async getAllAsync<T>(pattern: string): Promise<Record<string, T>> {
    try {
      const allItems = await getAll<Record<string, T>>();
      const result: Record<string, T> = {};
      const prefix = getKey(pattern);

      if (allItems) {
        for (const [key, value] of Object.entries(allItems)) {
          if (key.startsWith(prefix)) {
            // Remove the storage prefix to get the original key
            const originalKey = key.replace(STORAGE_PREFIX, '');
            result[originalKey] = value as T;
          }
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
   * Not needed for Edge Config since we use getAll + filter
   */
  static async addToIndex(pattern: string, key: string): Promise<void> {
    // No-op for Edge Config - we use getAll + filter instead
  }

  /**
   * Remove a key from an index
   * Not needed for Edge Config since we use getAll + filter
   */
  static async removeFromIndex(pattern: string, key: string): Promise<void> {
    // No-op for Edge Config - we use getAll + filter instead
  }
}

export default Storage;
