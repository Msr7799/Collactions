'use client';
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { cubicCoordinates, stepsCoordinates } from 'easing-coordinates';
import { useSpring, animated, to as interpolate, createInterpolator } from '@react-spring/web';
import { useControls, Leva, folder } from 'leva';
import { Palette, ChevronUp, ChevronDown } from 'lucide-react';
import { useBackground } from '@/contexts/BackgroundContext';
import SaveNotification from './SaveNotification';

const easeMap = {
  'ease-in-out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  'ease-out': { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  'ease-in': { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  linear: { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 },
} as const

export default function AnimatedColorBackground() {
  const { backgroundSettings, updateBackgroundSettings, isLoaded } = useBackground()
  const [showControls, setShowControls] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  
  // إضافة مستمع للإشعارات
  useEffect(() => {
    const handleSaveEvent = (event: CustomEvent) => {
      setNotificationMessage(event.detail.message)
      setShowNotification(true)
    }

    window.addEventListener('backgroundSettingsSaved', handleSaveEvent as EventListener)
    
    return () => {
      window.removeEventListener('backgroundSettingsSaved', handleSaveEvent as EventListener)
    }
  }, [])

  // استخدام leva للكنترول مع القيم من Context
  const controls = useControls('Background Controls', {
    Colors: folder({
      from: { value: backgroundSettings.from, label: 'Start Color' },
      mid: { value: backgroundSettings.mid, label: 'Middle Color' },
      to: { value: backgroundSettings.to, label: 'End Color' },
    }),
    Animation: folder({
      angle: {
        value: backgroundSettings.angle,
        min: 0,
        max: 360,
        step: 1,
        label: 'Gradient Angle'
      },
      stops: {
        value: backgroundSettings.stops,
        min: 2,
        max: 100,
        step: 1,
        label: 'Color Stops'
      },
      easing: {
        value: backgroundSettings.easing,
        options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'steps'],
        label: 'Easing Type'
      },
      easeCustom: {
        value: backgroundSettings.easeCustom,
        label: 'Custom Easing (x1,y1,x2,y2)'
      },
    }),
  })

  const { from, mid, to, angle, stops, easing, easeCustom } = controls

  // حفظ التغييرات في Context مع debouncing
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    if (!isLoaded) return

    const newSettings = { from, mid, to, angle, stops, easing, easeCustom }
    const currentSettings = JSON.stringify(backgroundSettings)
    const newSettingsStr = JSON.stringify(newSettings)
    
    if (currentSettings !== newSettingsStr) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        updateBackgroundSettings(newSettings)
      }, 300)
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [from, mid, to, angle, stops, easing, easeCustom, isLoaded, backgroundSettings, updateBackgroundSettings])

  const { colorFrom, colorMid, colorTo } = useSpring({
    colorFrom: from,
    colorMid: mid,
    colorTo: to,
  })

  const coordinates = useMemo(() => {
    try {
      const customBezier = easeCustom ? easeCustom.split(',').map(Number).filter((n: number) => !isNaN(n)) : []
      
      if (customBezier.length === 4) {
        return cubicCoordinates(customBezier[0], customBezier[1], customBezier[2], customBezier[3], stops)
      } else if (easing === 'steps') {
        return stepsCoordinates(stops, 'skip-none')
      } else {
        const easingConfig = easeMap[easing as keyof typeof easeMap]
        if (easingConfig) {
          const { x1, y1, x2, y2 } = easingConfig
          return cubicCoordinates(x1, y1, x2, y2, stops)
        }
      }
      
      return cubicCoordinates(0.25, 0.25, 0.75, 0.75, stops)
    } catch (error) {
      console.warn('Error calculating coordinates, using linear fallback:', error)
      return cubicCoordinates(0.25, 0.25, 0.75, 0.75, stops)
    }
  }, [easing, easeCustom, stops])

  const allStops = interpolate([colorFrom, colorMid, colorTo], (from, mid, to) => {
    const blend = createInterpolator({ range: [0, 0.5, 1], output: [from, mid, to] })
    return coordinates.map(({ x, y }) => {
      const color = blend(y)
      return `${color} ${x * 100}%`
    })
  })

  return (
    <>
      <animated.div
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
        style={{ 
          backgroundImage: allStops.to((...args) => `linear-gradient(${angle}deg, ${args.join(', ')})`)
        }}
      />
      
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-5 right-5 z-[1000] bg-black/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all duration-200 flex items-center gap-2 shadow-lg"
        aria-label="إعدادات الخلفية"
      >
        <Palette size={20} />
        {showControls ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      
      {showControls && (
        <div className="fixed bottom-20 right-5 z-[1000] animate-[slideUp_0.3s_ease-out]">
          <Leva />
        </div>
      )}
      
      <SaveNotification 
        show={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
      />
    </>
  );
}
