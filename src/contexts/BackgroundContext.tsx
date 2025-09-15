'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface BackgroundContextType {
  showBackground: boolean
  setShowBackground: (show: boolean) => void
  backgroundSettings: {
    from: string
    mid: string
    to: string
    angle: number
    stops: number
    easing: string
    easeCustom: string
  }
  updateBackgroundSettings: (settings: Partial<BackgroundContextType['backgroundSettings']>) => void
  isLoaded: boolean
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined)

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [showBackground, setShowBackground] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // القيم الافتراضية
  const defaultSettings = {
    from: '#6b8cff',
    mid: '#4ecdc4', 
    to: '#45b7d1',
    angle: 135,
    stops: 10,
    easing: 'ease-in-out',
    easeCustom: ''
  }
  
  const [backgroundSettings, setBackgroundSettings] = useState(defaultSettings)

  // تحميل الإعدادات عند تحميل المكون
  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        // المستخدم مسجل دخول - تحميل من الخادم
        try {
          const response = await fetch('/api/user/background-settings')
          if (response.ok) {
            const data = await response.json()
            setBackgroundSettings({ ...defaultSettings, ...data.settings })
          } else {
            setBackgroundSettings(defaultSettings)
          }
        } catch (error) {
          console.error('Error loading settings from server:', error)
          // في حالة فشل الخادم، تحميل من localStorage
          loadFromLocalStorage()
        }
      } else {
        // المستخدم غير مسجل دخول - تحميل من localStorage
        loadFromLocalStorage()
      }
      setIsLoaded(true)
    }
    
    const loadFromLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('backgroundSettings')
        if (saved) {
          try {
            const parsedSettings = JSON.parse(saved)
            setBackgroundSettings({ ...defaultSettings, ...parsedSettings })
          } catch (error) {
            console.error('Error parsing saved settings:', error)
            setBackgroundSettings(defaultSettings)
          }
        }
      }
    }
    
    loadSettings()
  }, [user])

  const updateBackgroundSettings = async (newSettings: Partial<BackgroundContextType['backgroundSettings']>) => {
    console.log('📦 Context: Updating background settings:', newSettings)
    const updatedSettings = { ...backgroundSettings, ...newSettings }
    setBackgroundSettings(updatedSettings)
    
    // حفظ في localStorage دائماً
    if (typeof window !== 'undefined') {
      localStorage.setItem('backgroundSettings', JSON.stringify(updatedSettings))
      console.log('💾 Saved to localStorage:', updatedSettings)
    }
    
    // إذا كان المستخدم مسجل دخول، احفظ في الخادم أيضاً
    if (user && isLoaded) {
      try {
        const response = await fetch('/api/user/background-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedSettings),
        })
        
        const result = await response.json()
        
        if (response.ok) {
          console.log('🌐 Settings saved to server successfully:', result.message)
          // إرسال إشعار نجاح الحفظ
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('backgroundSettingsSaved', { 
              detail: { message: result.message } 
            }))
          }
        } else {
          console.error('❌ Server save failed:', result.error || response.status)
          // في حالة فشل حفظ الخادم، على الأقل الإعدادات محفوظة محلياً
        }
      } catch (error) {
        console.error('❌ Error saving settings to server:', error)
        // في حالة فشل الاتصال، الإعدادات محفوظة محلياً
      }
    } else if (!user && isLoaded) {
      console.log('👤 User not logged in - settings saved locally only')
    }
  }

  return (
    <BackgroundContext.Provider value={{
      showBackground,
      setShowBackground,
      backgroundSettings,
      updateBackgroundSettings,
      isLoaded
    }}>
      {children}
    </BackgroundContext.Provider>
  )
}

export function useBackground() {
  const context = useContext(BackgroundContext)
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider')
  }
  return context
}
