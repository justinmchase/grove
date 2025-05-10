/**
 * This module provides a simple in-memory cache implementation.
 * @module
 */

/**
 * A simple in-memory cache implementation.
 */
export class MemoryCache {
  private cache: Map<string, { value: unknown; timeout: number }> = new Map();

  private set<T>(key: string, value: T, ttl: number = 60000): void {
    if (this.cache.has(key)) {
      clearTimeout(this.cache.get(key)!.timeout);
    }

    const timeout = setTimeout(() => {
      this.cache.delete(key);
    }, ttl);

    this.cache.set(key, { value, timeout });
  }

  /**
   * Retrieves a value from the cache. If the value is not present, it will
   * call the refresh function to get the value and store it in the cache.
   *
   * @param key The key to retrieve from the cache.
   * @param refresh A function that returns a promise that resolves to the value.
   * @param ttl The time-to-live for the cached value in milliseconds.
   * @returns The cached value or the result of the refresh function.
   */
  public async get<T>(
    key: string,
    refresh: () => Promise<T>,
    ttl: number = 60000,
  ): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!.value as T;
    } else {
      const value = await refresh();
      this.set(key, value, ttl);
      return value;
    }
  }

  /**
   * Deletes a value from the cache.
   * @param key The key to delete from the cache.
   */
  public delete(key: string): void {
    if (this.cache.has(key)) {
      clearTimeout(this.cache.get(key)!.timeout);
      this.cache.delete(key);
    }
  }
}
