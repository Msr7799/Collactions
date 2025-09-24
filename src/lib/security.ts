// Security utilities for the AI Gateway application
// دوال الأمان لتطبيق بوابة الذكاء الاصطناعي

import { ApiError } from '@/types';

/**
 * Sanitize user input to prevent XSS and injection attacks
 * تنظيف مدخلات المستخدم لمنع هجمات XSS والحقن
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential HTML/script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length to prevent abuse
};

/**
 * Validate API key format and strength
 * التحقق من صيغة وقوة مفتاح API
 */
export const validateAPIKey = (key: string): { isValid: boolean; message: string } => {
  if (!key || typeof key !== 'string') {
    return { isValid: false, message: 'API key is required | مفتاح API مطلوب' };
  }

  // Check minimum length
  if (key.length < 20) {
    return { isValid: false, message: 'API key too short | مفتاح API قصير جداً' };
  }

  // Check for common patterns
  if (key.includes('test') || key.includes('demo') || key.includes('example')) {
    return { isValid: false, message: 'Invalid API key format | صيغة مفتاح API غير صحيحة' };
  }

  // Check for proper format (letters, numbers, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(key)) {
    return { isValid: false, message: 'API key contains invalid characters | مفتاح API يحتوي على رموز غير صحيحة' };
  }

  return { isValid: true, message: 'Valid API key | مفتاح API صحيح' };
};

/**
 * Simple rate limiting implementation
 * تطبيق بسيط لتحديد المعدل
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const rateLimit = (
  userId: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const key = `${userId}`;
  
  // Clean up expired entries
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  const entry = rateLimitStore.get(key);
  const resetTime = now + windowMs;

  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
};

/**
 * Hash sensitive data for logging
 * تشفير البيانات الحساسة للتسجيل
 */
export const hashSensitiveData = (data: string): string => {
  if (!data) return '';
  
  // Simple hash for logging purposes (not cryptographically secure)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `***${Math.abs(hash).toString(16)}`;
};

/**
 * Validate request origin
 * التحقق من مصدر الطلب
 */
export const validateOrigin = (origin: string | null, allowedOrigins: string[]): boolean => {
  if (!origin) return false;
  
  try {
    const url = new URL(origin);
    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2);
        return url.hostname === domain || url.hostname.endsWith('.' + domain);
      }
      return url.origin === allowed;
    });
  } catch {
    return false;
  }
};

/**
 * Create secure headers for API responses
 * إنشاء رؤوس آمنة لاستجابات API
 */
export const createSecureHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  };
};

/**
 * Generate a secure session token
 * إنشاء رمز جلسة آمن
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available (browser)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for Node.js environment
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
};

/**
 * Validate user authentication and authorization
 * التحقق من مصادقة المستخدم والتفويض
 */
interface AuthValidationResult {
  isValid: boolean;
  userId?: string;
  error?: {
    message: string;
    status: number;
  };
}

export const validateUserAuth = (
  req: any,
  requiredUserId?: string
): AuthValidationResult => {
  // 1. Check if user object exists
  if (!req.user) {
    return {
      isValid: false,
      error: {
        message: 'Authentication required | مطلوب تسجيل الدخول',
        status: 401
      }
    };
  }

  // 2. Check if user ID exists
  if (!req.user.id || typeof req.user.id !== 'string') {
    return {
      isValid: false,
      error: {
        message: 'Invalid user session | جلسة مستخدم غير صحيحة',
        status: 401
      }
    };
  }

  // 3. If specific user ID is required, validate it
  if (requiredUserId !== undefined) {
    // Validate required user ID format
    if (!requiredUserId || typeof requiredUserId !== 'string') {
      return {
        isValid: false,
        error: {
          message: 'Invalid user ID format | صيغة معرف المستخدم غير صحيحة',
          status: 400
        }
      };
    }

    // Check authorization - user can only access their own data
    if (requiredUserId !== req.user.id) {
      return {
        isValid: false,
        error: {
          message: 'Unauthorized access | وصول غير مصرح به',
          status: 403
        }
      };
    }
  }

  return {
    isValid: true,
    userId: req.user.id
  };
};

/**
 * Example usage in API routes
 * مثال على الاستخدام في مسارات API
 * 
 * // Before (VULNERABLE):
 * if (userId !== req.user.id) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 * 
 * // After (SECURE):
 * const authResult = validateUserAuth(req, userId);
 * if (!authResult.isValid) {
 *   return NextResponse.json(
 *     { error: authResult.error.message }, 
 *     { status: authResult.error.status }
 *   );
 * }
 * 
 * // Use authResult.userId for verified user ID
 */
