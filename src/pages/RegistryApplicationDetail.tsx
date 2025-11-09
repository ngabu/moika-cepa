import { useParams } from 'react-router-dom';
import { SimpleHeader } from '@/components/SimpleHeader';
import { PermitApplicationReviewForm } from '@/components/registry/PermitApplicationReviewForm';

export default function RegistryApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <div className="container mx-auto p-6">
        <PermitApplicationReviewForm applicationId={id} />
      </div>
    </div>
  );
}