// src/utils/rateLimiter.ts
// Simple rate limiting utility for API routes

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed for given identifier (usually IP address)
   */
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now >= entry.resetTime) {
      // New window or expired entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment counter
    entry.count += 1;
    
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Create rate limiter instances for different endpoints
export const imageGenerationLimiter = new InMemoryRateLimiter(
  60 * 1000, // 1 minute window
  5 // 5 requests per minute
);

export const enhancePromptLimiter = new InMemoryRateLimiter(
  60 * 1000, // 1 minute window  
  20 // 20 requests per minute (more lenient for text enhancement)
);

/**
 * Get client identifier from request (IP address with fallbacks)
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers (for proxies/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback for unknown client (serverless environments may not provide IP)
  return 'unknown-client';
}

/**
 * Create rate limit response with appropriate headers
 */
export function createRateLimitResponse(remaining: number, resetTime: number, message?: string): NextResponse {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);
  
  return NextResponse.json(
    {
      error: message || 'Rate limit exceeded | تم تجاوز حد المعدل المسموح'
    },
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': resetInSeconds.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
}
