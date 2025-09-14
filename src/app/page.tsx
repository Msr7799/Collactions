'use client';

import Layout from '@/components/layout/Layout';
import ServiceGateway from '@/components/services/ServiceGateway';
import AppIcon from '@/app/app-icon';

export default function Home() {
  return (
    <Layout title="Collactions" showSearch={false}>
  <div className="flex flex-col z-50 mt-10 ">
      <div className=" flex items-center z-50 justify-center space-x-2">
      <AppIcon />
      </div>
      <ServiceGateway />
      </div>
    
    </Layout>
  );
}
