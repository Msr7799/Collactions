// src/utils/validateImage.ts
// منطق التحقق من نوع وحجم الصورة

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  contentType?: string;
  size?: number;
}

/**
 * التحقق من صحة الصورة المولدة
 * Validate generated image blob
 */
export function validateImageBlob(imageBlob: Blob): ValidationResult {
  // التحقق من وجود الصورة
  if (!imageBlob) {
    return {
      isValid: false,
      error: 'No image blob provided | لم يتم توفير blob للصورة'
    };
  }

  // التحقق من حجم الصورة (حد أقصى 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (imageBlob.size > maxSize) {
    return {
      isValid: false,
      error: `Image size too large: ${(imageBlob.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB | حجم الصورة كبير جداً: ${(imageBlob.size / 1024 / 1024).toFixed(2)}ميجابايت. الحد الأقصى: 10 ميجابايت`
    };
  }

  // التحقق من الحد الأدنى للحجم (1KB)
  const minSize = 1024; // 1KB
  if (imageBlob.size < minSize) {
    return {
      isValid: false,
      error: `Image size too small: ${imageBlob.size} bytes. Minimum required: 1KB | حجم الصورة صغير جداً: ${imageBlob.size} بايت. الحد الأدنى: 1 كيلوبايت`
    };
  }

  // التحقق من نوع الملف
  const contentType = imageBlob.type;
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  
  if (contentType && !validTypes.includes(contentType)) {
    return {
      isValid: false,
      error: `Unsupported image type: ${contentType}. Supported types: ${validTypes.join(', ')} | نوع صورة غير مدعوم: ${contentType}. الأنواع المدعومة: ${validTypes.join(', ')}`
    };
  }

  return {
    isValid: true,
    contentType,
    size: imageBlob.size
  };
}

/**
 * التحقق من صحة البيانات الثنائية للصورة ونوع MIME
 * Validate image buffer and MIME type for security and resource management
 */
export function validateImage(buffer: Buffer, mimeType: string): ValidationResult {
  // التحقق من وجود البيانات
  if (!buffer || buffer.length === 0) {
    return {
      isValid: false,
      error: 'No image buffer provided | لم يتم توفير بيانات الصورة'
    };
  }

  // التحقق من وجود نوع MIME
  if (!mimeType || mimeType.trim().length === 0) {
    return {
      isValid: false,
      error: 'MIME type is required | نوع MIME مطلوب'
    };
  }

  // التحقق من أن نوع MIME مدعوم (أمان)
  const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validMimeTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `Unsupported MIME type: ${mimeType}. Supported types: ${validMimeTypes.join(', ')} | نوع MIME غير مدعوم: ${mimeType}. الأنواع المدعومة: ${validMimeTypes.join(', ')}`
    };
  }

  // التحقق من حجم الصورة (حد أقصى 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (buffer.length > maxSize) {
    return {
      isValid: false,
      error: `Image size too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 5MB | حجم الصورة كبير جداً: ${(buffer.length / 1024 / 1024).toFixed(2)}ميجابايت. الحد الأقصى: 5 ميجابايت`
    };
  }

  // التحقق من الحد الأدنى للحجم (1KB)
  const minSize = 1024; // 1KB
  if (buffer.length < minSize) {
    return {
      isValid: false,
      error: `Image size too small: ${buffer.length} bytes. Minimum required: 1KB | حجم الصورة صغير جداً: ${buffer.length} بايت. الحد الأدنى: 1 كيلوبايت`
    };
  }

  // التحقق من البداية السحرية للملف (Magic bytes) لضمان نوع الملف
  const magicBytes = buffer.slice(0, 8);
  const isPNG = magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47;
  const isJPEG = magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF;
  const isWebP = magicBytes[0] === 0x52 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x46 && 
                 magicBytes[8] === 0x57 && magicBytes[9] === 0x45 && magicBytes[10] === 0x42 && magicBytes[11] === 0x50;

  // التحقق من تطابق نوع MIME مع البايتات السحرية
  if (mimeType === 'image/png' && !isPNG) {
    return {
      isValid: false,
      error: 'MIME type mismatch: file is not a valid PNG | عدم تطابق نوع MIME: الملف ليس PNG صالح'
    };
  }

  if (mimeType === 'image/jpeg' && !isJPEG) {
    return {
      isValid: false,
      error: 'MIME type mismatch: file is not a valid JPEG | عدم تطابق نوع MIME: الملف ليس JPEG صالح'
    };
  }

  if (mimeType === 'image/webp' && !isWebP) {
    return {
      isValid: false,
      error: 'MIME type mismatch: file is not a valid WebP | عدم تطابق نوع MIME: الملف ليس WebP صالح'
    };
  }

  return {
    isValid: true,
    contentType: mimeType,
    size: buffer.length
  };
}

/**
 * التحقق من معاملات طلب توليد الصورة
 * Validate image generation request parameters
 */
export function validateImageRequest(prompt: string, model: string): ValidationResult {
  // التحقق من وجود النص
  if (!prompt || prompt.trim().length === 0) {
    return {
      isValid: false,
      error: 'Prompt is required | النص المطلوب مطلوب'
    };
  }

  // التحقق من طول النص (حد أقصى 2000 حرف)
  if (prompt.length > 2000) {
    return {
      isValid: false,
      error: `Prompt too long: ${prompt.length} characters. Maximum allowed: 2000 | النص طويل جداً: ${prompt.length} حرف. الحد الأقصى: 2000`
    };
  }

  // التحقق من الحد الأدنى لطول النص (3 أحرف)
  if (prompt.trim().length < 3) {
    return {
      isValid: false,
      error: 'Prompt too short. Minimum 3 characters required | النص قصير جداً. الحد الأدنى 3 أحرف'
    };
  }

  // التحقق من وجود النموذج
  if (!model || model.trim().length === 0) {
    return {
      isValid: false,
      error: 'Model is required | النموذج مطلوب'
    };
  }

  return {
    isValid: true
  };
}
