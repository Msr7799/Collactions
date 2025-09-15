// src/utils/saveImage.ts
// منطق حفظ الصورة وتحويل Blob إلى Base64 أو حفظها كملف

import { validateImage } from './validateImage';
import { generateResponsive, ResponsiveSrcSetResult } from './generateResponsive';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface SaveImageResult {
  base64Image: string;
  contentType: string;
  size: number;
}

export interface SaveImageFileResult {
  filePath: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface SaveImageResponsiveResult extends SaveImageFileResult {
  responsive: ResponsiveSrcSetResult;
}

/**
 * حفظ الصورة كملف مع توليد النسخ المتجاوبة
 * Save image as file with responsive versions generation
 */
export async function saveImageWithResponsive(
  buffer: Buffer, 
  extension: string = 'png'
): Promise<SaveImageResponsiveResult> {
  // تحديد نوع المحتوى بناءً على الامتداد
  const contentTypeMap: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp'
  };
  
  const contentType = contentTypeMap[extension.toLowerCase()] || 'image/png';
  
  // 🔒 التحقق من أمان وصحة الصورة قبل الحفظ
  const validation = validateImage(buffer, contentType);
  if (!validation.isValid) {
    throw new Error(`Image validation failed: ${validation.error}`);
  }
  
  // إنشاء اسم ملف فريد باستخدام UUID
  const fileName = `${randomUUID()}.${extension}`;
  
  // تحديد مسار المجلد والملف
  const generatedDir = join(process.cwd(), 'public', 'generated');
  const filePath = join(generatedDir, fileName);
  
  try {
    // إنشاء المجلد إذا لم يكن موجوداً
    await mkdir(generatedDir, { recursive: true });
    
    // حفظ الملف الأصلي
    await writeFile(filePath, buffer);
    
    // توليد النسخ المتجاوبة
    const responsive = await generateResponsive(fileName, buffer);
    
    console.log('✅ Image saved with responsive versions:', {
      fileName,
      size: buffer.length,
      contentType,
      validation: 'passed',
      filePath: `/generated/${fileName}`,
      responsive: responsive
    });
    
    return {
      filePath: `/generated/${fileName}`,
      fileName,
      contentType,
      size: buffer.length,
      responsive
    };
    
  } catch (error) {
    console.error('❌ Error saving image with responsive versions:', error);
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * حفظ الصورة كملف في مجلد public/generated وإرجاع رابط الملف
 * Save image as file in public/generated and return file URL
 */
export async function saveImage(buffer: Buffer, extension: string): Promise<string> {
  // تحديد نوع المحتوى بناءً على الامتداد
  const contentTypeMap: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp'
  };
  
  const contentType = contentTypeMap[extension.toLowerCase()] || 'image/png';
  
  // 🔒 التحقق من أمان وصحة الصورة قبل الحفظ
  const validation = validateImage(buffer, contentType);
  if (!validation.isValid) {
    throw new Error(`Image validation failed: ${validation.error}`);
  }
  
  // إنشاء اسم ملف فريد باستخدام UUID
  const fileName = `${randomUUID()}.${extension}`;
  
  // تحديد مسار المجلد والملف
  const generatedDir = join(process.cwd(), 'public', 'generated');
  const filePath = join(generatedDir, fileName);
  
  try {
    // إنشاء المجلد إذا لم يكن موجوداً
    await mkdir(generatedDir, { recursive: true });
    
    // حفظ الملف
    await writeFile(filePath, buffer);
    
    console.log('✅ Image saved successfully:', {
      fileName,
      size: buffer.length,
      contentType,
      validation: 'passed',
      filePath: `/generated/${fileName}`
    });
    
    // إرجاع الرابط النسبي للصورة
    return `/generated/${fileName}`;
    
  } catch (error) {
    console.error('❌ Error saving image file:', error);
    throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * حفظ الصورة كملف مع إرجاع معلومات شاملة
 * Save image as file with complete information
 */
export async function saveImageAsFile(imageBlob: Blob, extension: string = 'png'): Promise<SaveImageFileResult> {
  // تحويل Blob إلى Buffer للتحقق من صحة البيانات
  const arrayBuffer = await imageBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // حفظ الصورة والحصول على رابط الملف
  const filePath = await saveImage(buffer, extension);
  
  // استخراج اسم الملف من الرابط
  const fileName = filePath.split('/').pop() || '';
  
  // تحديد نوع المحتوى
  const contentTypeMap: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp'
  };
  
  const contentType = contentTypeMap[extension.toLowerCase()] || 'image/png';
  
  return {
    filePath,
    fileName,
    contentType,
    size: buffer.length
  };
}

/**
 * تحويل Blob إلى Base64 للعرض في Frontend (للتوافق مع النسخة القديمة)
 * Convert Blob to Base64 for frontend display (for backward compatibility)
 */
export async function saveImageAsBase64(imageBlob: Blob): Promise<SaveImageResult> {
  // تحويل Blob إلى Buffer للتحقق من صحة البيانات
  const arrayBuffer = await imageBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // تحديد نوع الصورة بناءً على المحتوى أو استخدام PNG كافتراضي
  const contentType = imageBlob.type || 'image/png';
  
  // 🔒 التحقق من أمان وصحة الصورة قبل الحفظ
  const validation = validateImage(buffer, contentType);
  if (!validation.isValid) {
    throw new Error(`Image validation failed: ${validation.error}`);
  }
  
  const base64Image = `data:${contentType};base64,${buffer.toString('base64')}`;

  console.log('✅ Image validated and saved successfully:', {
    size: buffer.length,
    contentType: contentType,
    validation: 'passed',
    base64Preview: base64Image.substring(0, 100) + '...'
  });

  return {
    base64Image,
    contentType,
    size: buffer.length
  };
}
