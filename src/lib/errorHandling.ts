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

    if (error.message.includes('401')) {
      return new APIError(
        'Unauthorized access | وصول غير مصرح به',
        'UNAUTHORIZED',
        401
      );
    }

    if (error.message.includes('403')) {
      return new APIError(
        'Access forbidden | الوصول محظور',
        'FORBIDDEN',
        403
      );
    }

    if (error.message.includes('404')) {
      return new APIError(
        'Resource not found | المورد غير موجود',
        'NOT_FOUND',
        404
      );
    }

    if (error.message.includes('429')) {
      return new APIError(
        'Too many requests | طلبات كثيرة جداً',
        'RATE_LIMITED',
        429
      );
    }

    if (error.message.includes('500')) {
      return new APIError(
        'Internal server error | خطأ داخلي في الخادم',
        'INTERNAL_ERROR',
        500
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
      if (error instanceof APIError) {
        if ([401, 403, 404].includes(error.status)) {
          throw error; // Don't retry authorization or not found errors
        }
      }

      if (attempt === maxRetries) {
        break; // Last attempt, don't delay
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(backoffFactor, attempt);
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
    
    default:
      return apiError.message || 'An unexpected error occurred. Please try again. | حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
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
    }
  };
};
