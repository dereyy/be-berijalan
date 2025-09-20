//cache.interface.ts
import { Request } from "express";

export interface CacheOptions {
  ttl: number; // time to live in seconds
  keyPrefix?: string; // optional key prefix
  skipCacheIf?: (req: Request) => boolean; // function to determine if caching should be skipped   
  invalidateOnMethods?: string[]; // HTTP methods that should invalidate the cache  
}