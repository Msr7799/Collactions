'use client';

import Layout from '@/components/layout/Layout';
import ServiceDetail from '@/components/services/ServiceDetail';
import { useParams } from 'next/navigation';

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceName = typeof params.id === 'string' ? params.id : 'Context7';

  return (
    <Layout title="Collactions" showSearch={true}>
      <ServiceDetail serviceName={serviceName} />
    </Layout>
  );
}
