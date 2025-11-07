import { LRUCache } from 'lru-cache';

type CacheItem<T> = {
  data: T;
  expiry: number;
};

interface MemoryCacheOptions {
  maxItems?: number;
  maxSize?: number;
  ttlSeconds?: number;
  allowStale?: boolean;
}

class MemoryCache {
  private cache: LRUCache<string, CacheItem<any>>;

  constructor(options: MemoryCacheOptions = {}) {
    const {
      maxItems = 100000,
      maxSize = 500 * 1024 * 1024,
      ttlSeconds = 3600,
      allowStale = true
    } = options;

    // Configure LRU cache with provided options
    this.cache = new LRUCache({
      max: maxItems,
      maxSize: maxSize,
      sizeCalculation: (value, key) => {
        // Rough estimation of item size in bytes
        return JSON.stringify(value).length + key.length;
      },
      ttl: ttlSeconds * 1000,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      allowStale: allowStale,
    });
  }

  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    });
  }
}

// Create a singleton instance with default options
const memoryCache = new MemoryCache({
  maxItems: 100000, // 100k items
  maxSize: 500 * 1024 * 1024, // 500MB
  ttlSeconds: 3600, // 1 hour
  allowStale: true,
});

export { MemoryCache };
export default memoryCache;
