import { useParams } from 'react-router-dom';
import { SimpleHeader } from '@/components/SimpleHeader';
import { PermitApplicationReviewForm } from '@/components/registry/PermitApplicationReviewForm';

export default function RegistryApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  
  console.log('RegistryApplicationDetail - Assessment ID:', id);
  
  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No assessment ID provided</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader />
      <div className="container mx-auto p-6">
        <PermitApplicationReviewForm assessmentId={id} />
      </div>
    </div>
  );
}