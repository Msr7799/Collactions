// Error handling utilities for the AI Gateway application
// أدوات معالجة الأخطاء لتطبيق بوابة الذكاء الاصطناعي

import { ApiError } from '@/types';

/**
 * Custom error class for API-related errors
 * فئة خطأ مخصصة للأخطاء المتعلقة بـ API
 */
export class APIError extends Error implements ApiError {
  public code: string;
  public status: number;
  public timestamp: Date;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      timestamp: this.timestamp
    };
  }
}

/**
 * Handle API errors and convert them to standard format
 * معالجة أخطاء API وتحويلها إلى تنسيق معياري
 */
export const handleAPIError = (error: unknown): ApiError => {
  // If it's already an APIError, return as is
  if (error instanceof APIError) {
    return error;
  }

  // Handle Response objects from fetch
  if (error && typeof error === 'object' && 'status' in error) {
    const response = error as Response;
    switch (response.status) {
      case 400:
        return new APIError(
          'Bad request | طلب غير صحيح',
          'BAD_REQUEST',
          400
        );
      case 401:
        return new APIError(
          'Unauthorized access | وصول غير مصرح به',
          'UNAUTHORIZED',
          401
        );
      case 403:
        return new APIError(
          'Access forbidden | الوصول محظور',
          'FORBIDDEN',
          403
        );
      case 404:
        return new APIError(
          'Resource not found | المورد غير موجود',
          'NOT_FOUND',
          404
        );
      case 409:
        return new APIError(
          'Conflict occurred | حدث تضارب',
          'CONFLICT',
          409
        );
      case 422:
        return new APIError(
          'Validation failed | فشل في التحقق',
          'VALIDATION_ERROR',
          422
        );
      case 429:
        return new APIError(
          'Too many requests | طلبات كثيرة جداً',
          'RATE_LIMITED',
          429
        );
      case 500:
        return new APIError(
          'Internal server error | خطأ داخلي في الخادم',
          'INTERNAL_ERROR',
          500
        );
      case 502:
        return new APIError(
          'Bad gateway | بوابة سيئة',
          'BAD_GATEWAY',
          502
        );
      case 503:
        return new APIError(
          'Service unavailable | الخدمة غير متاحة',
          'SERVICE_UNAVAILABLE',
          503
        );
      case 504:
        return new APIError(
          'Gateway timeout | انتهت مهلة البوابة',
          'GATEWAY_TIMEOUT',
          504
        );
    }
  }

  // If it's a fetch error
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return new APIError(
        'Network connection failed | فشل في الاتصال بالشبكة',
        'NETWORK_ERROR',
        0
      );
    }

    if (error.message.includes('timeout')) {
      return new APIError(
        'Request timeout | انتهت مهلة الطلب',
        'TIMEOUT_ERROR',
        408
      );
    }

    // Parse status codes from error messages
    const statusMatch = error.message.match(/\b(\d{3})\b/);
    if (statusMatch) {
      const status = parseInt(statusMatch[1]);
      return new APIError(
        error.message || `HTTP ${status} error | خطأ HTTP ${status}`,
        `HTTP_${status}`,
        status
      );
    }

    return new APIError(
      error.message || 'Unknown error occurred | حدث خطأ غير معروف',
      'GENERIC_ERROR',
      500
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new APIError(error, 'STRING_ERROR', 500);
  }

  // Handle unknown errors
  return new APIError(
    'Unknown error occurred | حدث خطأ غير معروف',
    'UNKNOWN_ERROR',
    500
  );
};

/**
 * Retry mechanism for API calls
 * آلية إعادة المحاولة لاستدعاءات API
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  backoffFactor: number = 2
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (!isRetryableError(error)) {
        throw handleAPIError(error);
      }

      if (attempt === maxRetries) {
        break; // Last attempt, don't delay
      }

      // Calculate delay with exponential backoff + jitter
      const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
      const delay = (baseDelay * Math.pow(backoffFactor, attempt)) + jitter;
      
      logError(error, `Retry attempt ${attempt + 1}/${maxRetries + 1}`, {
        delay,
        nextRetryIn: `${Math.round(delay)}ms`
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw handleAPIError(lastError);
};

/**
 * Log errors with context
 * تسجيل الأخطاء مع السياق
 */
export const logError = (
  error: unknown,
  context: string,
  additionalData?: Record<string, any>
): void => {
  const apiError = handleAPIError(error);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: apiError.name || 'Error',
      message: apiError.message,
      code: apiError.code,
      status: apiError.status
    },
    ...additionalData
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', logEntry);
  }

  // In production, you might want to send to a logging service
  // TODO: Implement production logging service integration
};

/**
 * Handle errors in React components
 * معالجة الأخطاء في مكونات React
 */
export const handleComponentError = (
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName: string
): void => {
  logError(error, `React Component: ${componentName}`, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  });

  // You might want to send this to an error reporting service
  // TODO: Implement error reporting service integration
};

/**
 * Format error messages for user display
 * تنسيق رسائل الخطأ للعرض للمستخدم
 */
export const formatErrorForUser = (error: unknown): string => {
  const apiError = handleAPIError(error);
  
  // Return user-friendly messages based on error type
  switch (apiError.code) {
    case 'NETWORK_ERROR':
      return 'Please check your internet connection and try again. | يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
    
    case 'TIMEOUT_ERROR':
      return 'The request is taking too long. Please try again. | الطلب يستغرق وقتاً طويلاً. يرجى المحاولة مرة أخرى.';
    
    case 'UNAUTHORIZED':
      return 'Please check your API credentials. | يرجى التحقق من بيانات اعتماد API.';
    
    case 'FORBIDDEN':
      return 'You do not have permission to access this resource. | ليس لديك صلاحية للوصول إلى هذا المورد.';
    
    case 'NOT_FOUND':
      return 'The requested resource was not found. | المورد المطلوب غير موجود.';
    
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment and try again. | طلبات كثيرة جداً. يرجى الانتظار قليلاً والمحاولة مرة أخرى.';
    
    case 'INTERNAL_ERROR':
      return 'A server error occurred. Please try again later. | حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
    
    case 'BAD_REQUEST':
      return 'Invalid request data. Please check your input. | بيانات الطلب غير صحيحة. يرجى التحقق من المدخلات.';
    
    case 'VALIDATION_ERROR':
      return 'Data validation failed. Please check your input. | فشل في التحقق من البيانات. يرجى التحقق من المدخلات.';
    
    case 'CONFLICT':
      return 'A conflict occurred. The resource may already exist. | حدث تضارب. قد يكون المورد موجوداً بالفعل.';
    
    case 'SERVICE_UNAVAILABLE':
      return 'Service is temporarily unavailable. Please try again later. | الخدمة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.';
    
    case 'BAD_GATEWAY':
      return 'Server connection issue. Please try again. | مشكلة في اتصال الخادم. يرجى المحاولة مرة أخرى.';
    
    case 'GATEWAY_TIMEOUT':
      return 'Server response timeout. Please try again. | انتهت مهلة استجابة الخادم. يرجى المحاولة مرة أخرى.';
    
    default:
      return apiError.message || 'An unexpected error occurred. Please try again. | حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
};

/**
 * Check if error is retryable
 * فحص إذا كان الخطأ قابل لإعادة المحاولة
 */
export const isRetryableError = (error: unknown): boolean => {
  const apiError = handleAPIError(error);
  
  // Don't retry these errors
  const nonRetryableCodes = [
    'UNAUTHORIZED',
    'FORBIDDEN', 
    'NOT_FOUND',
    'BAD_REQUEST',
    'VALIDATION_ERROR',
    'CONFLICT'
  ];
  
  return !nonRetryableCodes.includes(apiError.code);
};

/**
 * Error boundary hook for React components
 * خطاف حدود الخطأ لمكونات React
 */
export const useErrorHandler = () => {
  return {
    handleError: (error: unknown, context: string = 'Unknown') => {
      logError(error, context);
      return formatErrorForUser(error);
    },
    
    handleAsyncError: async <T>(
      asyncFn: () => Promise<T>,
      context: string = 'Async Operation'
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        logError(error, context);
        throw handleAPIError(error);
      }
    },

    retryAsync: async <T>(
      asyncFn: () => Promise<T>,
      options: {
        maxRetries?: number;
        baseDelay?: number;
        context?: string;
      } = {}
    ): Promise<T> => {
      const { maxRetries = 3, baseDelay = 1000, context = 'Retry Operation' } = options;
      
      try {
        return await retryWithBackoff(asyncFn, maxRetries, baseDelay);
      } catch (error) {
        logError(error, context, { maxRetries, baseDelay });
        throw error;
      }
    }
  };
};

/**
 * Create a safe async function that handles errors gracefully
 * إنشاء دالة async آمنة تتعامل مع الأخطاء بسلاسة
 */
export const createSafeAsync = <T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: {
    defaultValue?: R;
    context?: string;
    onError?: (error: ApiError) => void;
  } = {}
) => {
  return async (...args: T): Promise<R | typeof options.defaultValue> => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const apiError = handleAPIError(error);
      
      logError(apiError, options.context || 'Safe Async Function', {
        args: args.length > 0 ? args : undefined
      });

      if (options.onError) {
        options.onError(apiError);
      }

      if (options.defaultValue !== undefined) {
        return options.defaultValue;
      }

      throw apiError;
    }
  };
};
