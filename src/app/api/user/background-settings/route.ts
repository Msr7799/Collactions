import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// In-memory storage for demo - في التطبيق الحقيقي يجب استخدام قاعدة بيانات
const userSettings = new Map<string, any>()

export async function GET() {
  try {
    const { userId } = await auth()
    
    // الإعدادات الافتراضية للمستخدمين الجدد أو غير المسجلين
    const defaultSettings = {
      from: '#6b8cff',
      mid: '#4ecdc4', 
      to: '#45b7d1',
      angle: 135,
      stops: 10,
      easing: 'ease-in-out',
      easeCustom: ''
    }
    
    if (!userId) {
      // إرجاع الإعدادات الافتراضية للمستخدمين غير المسجلين
      return NextResponse.json({ settings: defaultSettings })
    }
    
    const settings = userSettings.get(userId) || defaultSettings
    
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching background settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لحفظ الإعدادات' }, { status: 401 })
    }
    
    const newSettings = await request.json()
    
    // التحقق من صحة البيانات
    if (!newSettings || typeof newSettings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 })
    }
    
    // الحصول على الإعدادات الحالية أو الافتراضية
    const defaultSettings = {
      from: '#6b8cff',
      mid: '#4ecdc4', 
      to: '#45b7d1',
      angle: 135,
      stops: 10,
      easing: 'ease-in-out',
      easeCustom: ''
    }
    
    const currentSettings = userSettings.get(userId) || defaultSettings
    
    // دمج الإعدادات الجديدة مع الحالية (partial update)
    const mergedSettings = { ...currentSettings, ...newSettings }
    
    // حفظ الإعدادات المدموجة للمستخدم المسجل
    userSettings.set(userId, mergedSettings)
    
    console.log(`Background settings saved for user ${userId}:`, mergedSettings)
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم حفظ إعدادات الخلفية بنجاح',
      settings: mergedSettings
    })
  } catch (error) {
    console.error('Error saving background settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
