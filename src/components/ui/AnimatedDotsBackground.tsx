'use client';

import React, { useEffect, useRef } from 'react';

const AnimatedDotsBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Configuration
    const config = {
      dotRadius: 1,
      dotColor: 'rgba(255, 255, 255, 0.2)',
      lineColor: 'rgba(0, 212, 255, 0.15)',
      lineWidth: 0.8,
      dotCount: 100,
      maxDistance: 150,
      animationSpeed: 0.5,
    };

    // Create dots
    const dots: { x: number; y: number; vx: number; vy: number }[] = [];
    
    for (let i = 0; i < config.dotCount; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.animationSpeed,
        vy: (Math.random() - 0.5) * config.animationSpeed
      });
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw dots
      dots.forEach(dot => {
        // Move dots
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, config.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = config.dotColor;
        ctx.fill();
        
        // Draw lines to nearby dots
        dots.forEach(otherDot => {
          const dx = dot.x - otherDot.x;
          const dy = dot.y - otherDot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = config.lineColor;
            ctx.lineWidth = config.lineWidth * (1 - distance / config.maxDistance);
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(otherDot.x, otherDot.y);
            ctx.stroke();
          }
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default AnimatedDotsBackground;
