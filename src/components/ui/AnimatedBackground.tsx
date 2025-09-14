'use client';
import React, { useRef } from 'react';
import { Parallax, ParallaxLayer, IParallax } from '@react-spring/parallax';

// الصور الأصلية من الـ sandbox
const url = (name: string, wrap = false) =>
  `${wrap ? 'url(' : ''}https://awv3node-homepage.surge.sh/build/assets/${name}.svg${wrap ? ')' : ''}`;

export default function AnimatedBackground() {
  const parallax = useRef<IParallax>(null!);
  
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      background: '#253237',
      position: 'fixed' as const,
      top: 0,
      left: 0,
      zIndex: -1
    }}>
      <Parallax ref={parallax} pages={3}>
        <ParallaxLayer offset={1} speed={1} style={{ backgroundColor: '#805E73' }} />
        <ParallaxLayer offset={2} speed={1} style={{ backgroundColor: '#87BCDE' }} />

        {/* خلفية النجوم */}
        <ParallaxLayer
          offset={0}
          speed={0}
          factor={3}
          style={{
            backgroundImage: url('stars', true),
            backgroundSize: 'cover',
          }}
        />

        {/* القمر الصناعي */}
        <ParallaxLayer offset={1.3} speed={-0.3} style={{ pointerEvents: 'none' }}>
          <img src={url('satellite4')} style={{ width: '8%', marginLeft: '70%' }} alt="satellite" />
        </ParallaxLayer>

        {/* السحب */}
        <ParallaxLayer offset={1} speed={0.8} style={{ opacity: 0.1 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '12%', marginLeft: '55%' }} alt="cloud" />
          <img src={url('cloud')} style={{ display: 'block', width: '6%', marginLeft: '15%' }} alt="cloud" />
        </ParallaxLayer>

        <ParallaxLayer offset={1.75} speed={0.5} style={{ opacity: 0.1 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '12%', marginLeft: '70%' }} alt="cloud" />
          <img src={url('cloud')} style={{ display: 'block', width: '12%', marginLeft: '40%' }} alt="cloud" />
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={0.2} style={{ opacity: 0.2 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '6%', marginLeft: '10%' }} alt="cloud" />
          <img src={url('cloud')} style={{ display: 'block', width: '12%', marginLeft: '75%' }} alt="cloud" />
        </ParallaxLayer>

        <ParallaxLayer offset={1.6} speed={-0.1} style={{ opacity: 0.4 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '12%', marginLeft: '60%' }} alt="cloud" />
          <img src={url('cloud')} style={{ display: 'block', width: '15%', marginLeft: '30%' }} alt="cloud" />
          <img src={url('cloud')} style={{ display: 'block', width: '6%', marginLeft: '80%' }} alt="cloud" />
        </ParallaxLayer>

        <ParallaxLayer offset={2.6} speed={0.4} style={{ opacity: 0.6 }}>
          <img src={url('cloud')} style={{ display: 'block', width: '12%', marginLeft: '5%' }} alt="cloud" />
          <img src={url('cloud')} style={{ display: 'block', width: '9%', marginLeft: '75%' }} alt="cloud" />
        </ParallaxLayer>

        {/* كوكب الأرض */}
        <ParallaxLayer
          offset={2.5}
          speed={-0.4}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
          <img src={url('earth')} style={{ width: '35%' }} alt="earth" />
        </ParallaxLayer>

        {/* خلفية العملاء */}
        <ParallaxLayer
          offset={2}
          speed={-0.3}
          style={{
            backgroundSize: '50%',
            backgroundPosition: 'center',
            backgroundImage: url('clients', true),
          }}
        />

        {/* الصفحة الأولى - Server */}
        <ParallaxLayer
          offset={0}
          speed={0.1}
          onClick={() => parallax.current.scrollTo(1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <img src={url('server')} style={{ width: '12%' }} alt="server" />
        </ParallaxLayer>

        {/* الصفحة الثانية - Terminal */}
        <ParallaxLayer
          offset={1}
          speed={0.1}
          onClick={() => parallax.current.scrollTo(2)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <img src={url('bash')} style={{ width: '25%' }} alt="terminal" />
        </ParallaxLayer>

        {/* الصفحة الثالثة - Clients */}
        <ParallaxLayer
          offset={2}
          speed={0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => parallax.current.scrollTo(0)}>
          <img src={url('clients-main')} style={{ width: '25%' }} alt="clients" />
        </ParallaxLayer>
      </Parallax>
    </div>
  );
}
