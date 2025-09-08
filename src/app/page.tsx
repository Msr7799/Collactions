'use client';

import Layout from '@/components/layout/Layout';
import ServiceGateway from '@/components/services/ServiceGateway';
import AppIcon from '@/app/app-icon';

export default function Home() {
  return (
    <Layout title="Collactions" showSearch={false}>
      <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] px-4 py-8 md:py-16">
        {/* App Icon - Responsive sizing */}
        <div className="flex items-center justify-center mb-8 md:mb-12">
          <div className="scale-75 md:scale-100 transition-transform duration-300">
            <AppIcon />
          </div>
        </div>
        
        {/* Service Gateway with responsive container */}
        <div className="w-full max-w-7xl">
          <ServiceGateway />
        </div>
      </div>
    </Layout>
  );
}
