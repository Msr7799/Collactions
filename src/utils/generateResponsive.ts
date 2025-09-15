// src/utils/generateResponsive.ts
// منطق إنشاء نسخ متعددة من الصورة بأحجام مختلفة باستخدام Sharp

import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface ResponsiveImageSizes {
  thumbnail: string; // 150x150
  small: string;     // 300x300
  medium: string;    // 600x600
  large: string;     // 1024x1024
  original: string;  // الحجم الأصلي
}

export interface ResponsiveImageOptions {
  generateThumbnail?: boolean;
  generateSmall?: boolean;
  generateMedium?: boolean;
  generateLarge?: boolean;
  quality?: number; // 1-100
}

export interface ResponsiveSrcSetResult {
  srcSet: string;
  sizes: string;
  defaultSrc: string;
  webpSrcSet?: string;
}

/**
 * إنشاء نسخ متجاوبة من الصورة باستخدام Sharp
 * Generate responsive image versions using Sharp with specific widths
 */
export async function generateResponsive(
  filename: string, 
  buffer: Buffer
): Promise<ResponsiveSrcSetResult> {
  const generatedDir = join(process.cwd(), 'public', 'generated');
  
  // تحديد الأحجام المطلوبة
  const imageSizes = [
    { width: 320, suffix: '-320' },
    { width: 640, suffix: '-640' },
    { width: 1024, suffix: '-1024' }
  ];
  
  // استخراج اسم الملف والامتداد
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const extension = filename.split('.').pop() || 'png';
  
  try {
    // إنشاء المجلد إذا لم يكن موجوداً
    await mkdir(generatedDir, { recursive: true });
    
    const srcSetParts: string[] = [];
    const webpSrcSetParts: string[] = [];
    
    // إنشاء النسخ المختلفة
    for (const imageSize of imageSizes) {
      const outputFilename = `${nameWithoutExt}${imageSize.suffix}.${extension}`;
      const webpFilename = `${nameWithoutExt}${imageSize.suffix}.webp`;
      const outputPath = join(generatedDir, outputFilename);
      const webpPath = join(generatedDir, webpFilename);
      
      // تغيير حجم الصورة وحفظها بالتنسيق الأصلي
      await sharp(buffer)
        .resize(imageSize.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 85 })
        .png({ quality: 85 })
        .toFile(outputPath);
      
      // إنشاء نسخة WebP للأداء الأفضل
      await sharp(buffer)
        .resize(imageSize.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 85 })
        .toFile(webpPath);
      
      srcSetParts.push(`/generated/${outputFilename} ${imageSize.width}w`);
      webpSrcSetParts.push(`/generated/${webpFilename} ${imageSize.width}w`);
    }
    
    const srcSet = srcSetParts.join(', ');
    const webpSrcSet = webpSrcSetParts.join(', ');
    const responsiveSizes = '(max-width: 320px) 320px, (max-width: 640px) 640px, 1024px';
    const defaultSrc = `/generated/${nameWithoutExt}-640.${extension}`;
    
    console.log('✅ Responsive images generated:', {
      srcSet,
      webpSrcSet,
      defaultSrc,
      generatedCount: imageSizes.length * 2 // Original + WebP versions
    });
    
    return {
      srcSet,
      webpSrcSet,
      sizes: responsiveSizes,
      defaultSrc
    };
    
  } catch (error) {
    console.error('❌ Error generating responsive images:', error);
    throw new Error(`Failed to generate responsive images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * استخراج معلومات الصورة من Base64 (للتوافق مع النسخة القديمة)
 * Extract image metadata from Base64 string (for backward compatibility)
 */
export function extractImageMetadata(base64Image: string) {
  try {
    // استخراج نوع الملف من header
    const matches = base64Image.match(/^data:([^;]+);base64,/);
    const mimeType = matches ? matches[1] : 'image/png';
    
    // حساب حجم الملف التقريبي (Base64 أكبر بـ 33% من البيانات الأصلية)
    const base64Data = base64Image.split(',')[1];
    const approximateSize = Math.round((base64Data.length * 3) / 4);
    
    return {
      mimeType,
      approximateSize,
      base64Length: base64Data.length
    };
  } catch (error) {
    console.error('Error extracting image metadata:', error);
    return null;
  }
}
