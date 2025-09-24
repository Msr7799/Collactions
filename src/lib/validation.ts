// Validation utilities for the AI Gateway application
// أدوات التحقق لتطبيق بوابة الذكاء الاصطناعي

import { ValidationResult, ChatMessage, ChatRequest } from '@/types';

/**
 * Validate email format
 * التحقق من صيغة البريد الإلكتروني
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required | البريد الإلكتروني مطلوب');
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format | صيغة البريد الإلكتروني غير صحيحة');
  }

  if (email.length > 320) { // RFC 5321 limit
    errors.push('Email too long | البريد الإلكتروني طويل جداً');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate chat message format
 * التحقق من صيغة رسالة الدردشة
 */
export const validateChatMessage = (message: ChatMessage): ValidationResult => {
  const errors: string[] = [];
  
  if (!message || typeof message !== 'object') {
    errors.push('Message must be an object | الرسالة يجب أن تكون كائن');
    return { isValid: false, errors };
  }

  // Validate role
  const validRoles = ['user', 'assistant', 'system'];
  if (!message.role || !validRoles.includes(message.role)) {
    errors.push('Invalid message role | دور الرسالة غير صحيح');
  }

  // Validate content
  if (!message.content || typeof message.content !== 'string') {
    errors.push('Message content is required | محتوى الرسالة مطلوب');
  } else {
    if (message.content.length === 0) {
      errors.push('Message content cannot be empty | محتوى الرسالة لا يمكن أن يكون فارغاً');
    }
    if (message.content.length > 32000) {
      errors.push('Message content too long | محتوى الرسالة طويل جداً');
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate chat request format
 * التحقق من صيغة طلب الدردشة
 */
export const validateChatRequest = (request: ChatRequest): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!request || typeof request !== 'object') {
    errors.push('Request must be an object | الطلب يجب أن يكون كائن');
    return { isValid: false, errors };
  }

  // Validate model
  if (!request.model || typeof request.model !== 'string') {
    errors.push('Model is required | النموذج مطلوب');
  }

  // Validate messages array
  if (!request.messages || !Array.isArray(request.messages)) {
    errors.push('Messages array is required | مصفوفة الرسائل مطلوبة');
  } else {
    if (request.messages.length === 0) {
      errors.push('At least one message is required | رسالة واحدة على الأقل مطلوبة');
    }
    
    if (request.messages.length > 100) {
      warnings.push('Large number of messages may affect performance | عدد كبير من الرسائل قد يؤثر على الأداء');
    }

    // Validate each message
    request.messages.forEach((message, index) => {
      const messageValidation = validateChatMessage(message);
      if (!messageValidation.isValid) {
        errors.push(`Message ${index + 1}: ${messageValidation.errors.join(', ')}`);
      }
    });
  }

  // Validate optional parameters
  if (request.temperature !== undefined) {
    if (typeof request.temperature !== 'number' || request.temperature < 0 || request.temperature > 2) {
      errors.push('Temperature must be a number between 0 and 2 | درجة الحرارة يجب أن تكون رقماً بين 0 و 2');
    }
  }

  if (request.max_tokens !== undefined) {
    if (typeof request.max_tokens !== 'number' || request.max_tokens < 1 || request.max_tokens > 32000) {
      errors.push('Max tokens must be a number between 1 and 32000 | أقصى عدد رموز يجب أن يكون رقماً بين 1 و 32000');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate URL format
 * التحقق من صيغة الرابط
 */
export const validateURL = (url: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!url || typeof url !== 'string') {
    errors.push('URL is required | الرابط مطلوب');
    return { isValid: false, errors };
  }

  try {
    const urlObj = new URL(url);
    
    // Check for valid protocols
    const validProtocols = ['http:', 'https:'];
    if (!validProtocols.includes(urlObj.protocol)) {
      errors.push('Invalid URL protocol | بروتوكول الرابط غير صحيح');
    }

    // Check for localhost in production
    if (process.env.NODE_ENV === 'production' && urlObj.hostname === 'localhost') {
      errors.push('Localhost URLs not allowed in production | روابط localhost غير مسموحة في الإنتاج');
    }

  } catch (error) {
    errors.push('Invalid URL format | صيغة الرابط غير صحيحة');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate JSON string
 * التحقق من نص JSON
 */
export const validateJSON = (jsonString: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!jsonString || typeof jsonString !== 'string') {
    errors.push('JSON string is required | نص JSON مطلوب');
    return { isValid: false, errors };
  }

  try {
    JSON.parse(jsonString);
  } catch (error) {
    errors.push('Invalid JSON format | صيغة JSON غير صحيحة');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate file name
 * التحقق من اسم الملف
 */
export const validateFileName = (fileName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!fileName || typeof fileName !== 'string') {
    errors.push('File name is required | اسم الملف مطلوب');
    return { isValid: false, errors };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(fileName)) {
    errors.push('File name contains invalid characters | اسم الملف يحتوي على رموز غير صحيحة');
  }

  // Check for reserved names (Windows)
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  if (reservedNames.includes(fileName.toUpperCase())) {
    errors.push('File name is reserved | اسم الملف محجوز');
  }

  // Check length
  if (fileName.length > 255) {
    errors.push('File name too long | اسم الملف طويل جداً');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate API key format
 * التحقق من صيغة مفتاح API
 */
export const validateAPIKeyFormat = (apiKey: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!apiKey || typeof apiKey !== 'string') {
    errors.push('API key is required | مفتاح API مطلوب');
    return { isValid: false, errors };
  }

  // Basic format validation
  if (apiKey.length < 10) {
    errors.push('API key too short | مفتاح API قصير جداً');
  }

  if (apiKey.length > 200) {
    errors.push('API key too long | مفتاح API طويل جداً');
  }

  // Check for obvious test/demo keys
  const testPatterns = ['test', 'demo', 'example', 'sample', 'fake'];
  const lowerKey = apiKey.toLowerCase();
  for (const pattern of testPatterns) {
    if (lowerKey.includes(pattern)) {
      errors.push('Test API keys are not allowed | مفاتيح API التجريبية غير مسموحة');
      break;
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate form data generically
 * التحقق من بيانات النموذج بشكل عام
 */
export const validateFormData = (
  data: Record<string, any>,
  requiredFields: string[],
  validationRules?: Record<string, (value: any) => ValidationResult>
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  for (const field of requiredFields) {
    if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined || data[field] === '') {
      errors.push(`Field '${field}' is required | الحقل '${field}' مطلوب`);
    }
  }

  // Apply custom validation rules
  if (validationRules) {
    for (const [field, validator] of Object.entries(validationRules)) {
      if (data.hasOwnProperty(field) && data[field] !== null && data[field] !== undefined && data[field] !== '') {
        const result = validator(data[field]);
        if (!result.isValid) {
          errors.push(...result.errors.map(error => `Field '${field}': ${error}`));
        }
        if (result.warnings) {
          warnings.push(...result.warnings.map(warning => `Field '${field}': ${warning}`));
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Sanitize and validate search query
 * تنظيف والتحقق من استعلام البحث
 */
export const validateSearchQuery = (query: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!query || typeof query !== 'string') {
    errors.push('Search query is required | استعلام البحث مطلوب');
    return { isValid: false, errors };
  }

  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length === 0) {
    errors.push('Search query cannot be empty | استعلام البحث لا يمكن أن يكون فارغاً');
  }

  if (trimmedQuery.length < 2) {
    warnings.push('Search query is very short | استعلام البحث قصير جداً');
  }

  if (trimmedQuery.length > 500) {
    errors.push('Search query too long | استعلام البحث طويل جداً');
  }

  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(trimmedQuery)) {
      errors.push('Search query contains invalid characters | استعلام البحث يحتوي على رموز غير صحيحة');
      break;
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validate user ID for authorization
 * التحقق من معرف المستخدم للتفويض
 */
export const validateUserIdAuth = (
  providedUserId: string,
  authenticatedUserId: string
): ValidationResult => {
  const errors: string[] = [];
  
  // Check if provided user ID exists and is valid
  if (!providedUserId || typeof providedUserId !== 'string') {
    errors.push('User ID is required | معرف المستخدم مطلوب');
  }
  
  // Check if authenticated user ID exists and is valid  
  if (!authenticatedUserId || typeof authenticatedUserId !== 'string') {
    errors.push('Authentication required | مطلوب تسجيل الدخول');
  }
  
  // Check authorization - user can only access their own data
  if (providedUserId && authenticatedUserId && providedUserId !== authenticatedUserId) {
    errors.push('Unauthorized access to user data | وصول غير مصرح به لبيانات المستخدم');
  }
  
  return { isValid: errors.length === 0, errors };
};
