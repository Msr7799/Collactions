'use client';

import React from "react";
import Layout from '@/components/layout/Layout';
import ServiceGateway from '@/components/services/ServiceGateway';
import AppIcon from '@/app/app-icon';
import { useScroll, useTransform } from "motion/react";
import { GoogleGeminiEffect } from "../components/ui/google-gemini-effect";


export default function Home() {

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
 
  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);




  return (
    <Layout title="Collactions " >
  <div className="flex flex-col mt-10 !w-full items-center justify-center mb-20">
          <div
            className="h-[400vh] bg-very-dark-bg w-full  !border-white/[0.1] rounded-md relative pt-40 overflow-clip"
            ref={ref}
          >
            <div className=" flex items-center justify-center  !w-full">
      
            <AppIcon />
            </div>
              <GoogleGeminiEffect
              pathLengths={[
                pathLengthFirst,
                pathLengthSecond,
                pathLengthThird,
                pathLengthFourth,
                pathLengthFifth,
              ]}
              />
          </div>
</div>
      <ServiceGateway />
  
    </Layout>
  );
}
