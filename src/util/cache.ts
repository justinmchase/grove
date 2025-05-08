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

  public delete(key: string): void {
    if (this.cache.has(key)) {
      clearTimeout(this.cache.get(key)!.timeout);
      this.cache.delete(key);
    }
  }
}
