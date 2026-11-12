import { notFound } from 'next/navigation';
import { getResource } from '@/lib/panel';
import ResourceManager from '@/components/admin/ResourceManager';

export default function ResourcePage({ params }: { params: { resource: string } }) {
  const resource = getResource(params.resource);
  if (!resource) notFound();
  return <ResourceManager resource={resource} />;
}
