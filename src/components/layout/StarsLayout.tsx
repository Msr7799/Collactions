"use client";
import React from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

interface StarsLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const StarsLayout: React.FC<StarsLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen bg-neutral-900 relative w-full overflow-hidden ${className}`}>
      {/* خلفية النجوم الثابتة - الطبقة السفلى */}
      <div className="absolute inset-0 z-0">
        <StarsBackground 
          starDensity={0.0004}
          allStarsTwinkle={true}
          twinkleProbability={0.9}
          minTwinkleSpeed={0.2}
          maxTwinkleSpeed={0.8}
          className="z-0"
        />
      </div>
      
      {/* خلفية النجوم المتحركة - الطبقة الوسطى */}
      <div className="absolute inset-0 z-1">
        <ShootingStars 
          minSpeed={25}
          maxSpeed={60}
          minDelay={300}
          maxDelay={1500}
          starColor="#9E00FF"
          trailColor="#2EB9DF"
          starWidth={18}
          starHeight={2.5}
          className="z-1 pointer-events-none"
        />
      </div>
      
      {/* محتوى الصفحة - الطبقة العليا */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};