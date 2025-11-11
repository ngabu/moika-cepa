import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, CheckCircle, AlertCircle, DollarSign, Building, Users, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ComprehensivePermitDetailsReadOnly } from '@/components/registry/read-only/ComprehensivePermitDetailsReadOnly';

interface Permit {
  id: string;
  permit_number?: string;
  permit_type: string;
  title: string;
  description?: string;
  status: string;
  application_date?: string;
  approval_date?: string;
  expiry_date?: string;
  entity_id: string;
  entity_name?: string;
  entity_type?: string;
  activity_classification?: string;
  activity_category?: string;
  activity_subcategory?: string;
  activity_level?: string;
  permit_period?: string;
  activity_location?: string;
  coordinates?: any;
  proposed_works_description?: string;
  operational_details?: string;
  operational_capacity?: string;
  operating_hours?: string;
  environmental_impact?: string;
  mitigation_measures?: string;
  fee_amount?: number;
  application_fee?: number;
  payment_status?: string;
  commencement_date?: string;
  completion_date?: string;
  estimated_cost_kina?: number;
  eia_required?: boolean;
  eis_required?: boolean;
  consultation_period_start?: string;
  consultation_period_end?: string;
  permit_type_specific?: string;
  permit_specific_fields?: any;
  legal_declaration_accepted?: boolean;
  compliance_commitment?: boolean;
}

interface PermitDetailsReadOnlyViewProps {
  permit: Permit;
}

export function PermitDetailsReadOnlyView({ permit }: PermitDetailsReadOnlyViewProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!permit.id) return;
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('permit_id', permit.id);
        
        if (!error && data) {
          setDocuments(data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    
    fetchDocuments();
  }, [permit.id]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_initial_review: 'bg-yellow-100 text-yellow-800',
      under_technical_review: 'bg-orange-100 text-orange-800',
      requires_clarification: 'bg-amber-100 text-amber-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not calculated';
    return `PGK ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{permit.title}</h3>
          {permit.permit_number && (
            <p className="text-sm text-muted-foreground">Permit #{permit.permit_number}</p>
          )}
        </div>
        <Badge className={getStatusColor(permit.status)}>
          {permit.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="project" className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-glass border-glass">
          <TabsTrigger value="project" className="text-xs flex flex-col items-center gap-1 py-2">
            <Building className="w-4 h-4" />
            <span>Project</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="text-xs flex flex-col items-center gap-1 py-2">
            <MapPin className="w-4 h-4" />
            <span>Location</span>
          </TabsTrigger>
          <TabsTrigger value="consultation" className="text-xs flex flex-col items-center gap-1 py-2">
            <Users className="w-4 h-4" />
            <span>Consultation</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs flex flex-col items-center gap-1 py-2">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="classification" className="text-xs flex flex-col items-center gap-1 py-2">
            <Activity className="w-4 h-4" />
            <span>Classification</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs flex flex-col items-center gap-1 py-2">
            <CheckCircle className="w-4 h-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="text-xs flex flex-col items-center gap-1 py-2">
            <DollarSign className="w-4 h-4" />
            <span>Fees</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs flex flex-col items-center gap-1 py-2">
            <CheckCircle className="w-4 h-4" />
            <span>Review</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* PROJECT TAB */}
          <TabsContent value="project" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Permit Type</label>
                    <p className="text-sm text-foreground">{permit.permit_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entity</label>
                    <p className="text-sm text-foreground">{permit.entity_name || 'No Entity'} ({permit.entity_type || 'Unknown'})</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                    <p className="text-sm text-foreground">{formatDate(permit.application_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Permit Period</label>
                    <p className="text-sm text-foreground">{permit.permit_period || 'Not specified'}</p>
                  </div>
                  {permit.approval_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approval Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.approval_date)}</p>
                    </div>
                  )}
                  {permit.expiry_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.expiry_date)}</p>
                    </div>
                  )}
                  {permit.commencement_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Commencement Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.commencement_date)}</p>
                    </div>
                  )}
                  {permit.completion_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Completion Date</label>
                      <p className="text-sm text-foreground">{formatDate(permit.completion_date)}</p>
                    </div>
                  )}
                  {permit.estimated_cost_kina && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estimated Project Cost</label>
                      <p className="text-sm text-foreground">{formatCurrency(permit.estimated_cost_kina)}</p>
                    </div>
                  )}
                </div>
                {permit.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1 text-foreground">{permit.description}</p>
                  </div>
                )}
                {permit.environmental_impact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Environmental Impact</label>
                    <p className="text-sm mt-1 text-foreground">{permit.environmental_impact}</p>
                  </div>
                )}
                {permit.mitigation_measures && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mitigation Measures</label>
                    <p className="text-sm mt-1 text-foreground">{permit.mitigation_measures}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <ComprehensivePermitDetailsReadOnly application={permit} />
          </TabsContent>

          {/* LOCATION TAB */}
          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {permit.activity_location && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity Location</label>
                    <p className="text-sm text-foreground">{permit.activity_location}</p>
                  </div>
                )}
                
                {permit.coordinates && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Coordinates</label>
                    <p className="text-sm text-foreground">
                      Latitude: {permit.coordinates.lat}, Longitude: {permit.coordinates.lng}
                    </p>
                  </div>
                )}

                {permit.proposed_works_description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Proposed Works Description</label>
                    <p className="text-sm mt-1 text-foreground">{permit.proposed_works_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONSULTATION TAB */}
          <TabsContent value="consultation" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Public Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(permit.consultation_period_start || permit.consultation_period_end) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Public Consultation Period</label>
                    <p className="text-sm text-foreground">
                      {formatDate(permit.consultation_period_start)} - {formatDate(permit.consultation_period_end)}
                    </p>
                  </div>
                )}
                {(!permit.consultation_period_start && !permit.consultation_period_end) && (
                  <p className="text-sm text-muted-foreground">No public consultation period recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type} • {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLASSIFICATION TAB */}
          <TabsContent value="classification" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Activity Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity Classification</label>
                    <p className="text-sm text-foreground">{permit.activity_classification || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity Category</label>
                    <p className="text-sm text-foreground">{permit.activity_category || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity Subcategory</label>
                    <p className="text-sm text-foreground">{permit.activity_subcategory || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity Level</label>
                    <p className="text-sm text-foreground">{permit.activity_level || 'Not specified'}</p>
                  </div>
                </div>
                
                {permit.eia_required !== undefined && (
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      {permit.eia_required ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-foreground">EIA Required: {permit.eia_required ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {permit.eis_required ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-foreground">EIS Required: {permit.eis_required ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPLIANCE TAB */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Compliance Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {permit.eia_required !== undefined && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {permit.eia_required ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-foreground">EIA Required: {permit.eia_required ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {permit.eis_required ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-foreground">EIS Required: {permit.eis_required ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                )}
                {permit.compliance_commitment !== undefined && (
                  <div className="flex items-center space-x-2">
                    <Badge variant={permit.compliance_commitment ? 'default' : 'secondary'}>
                      {permit.compliance_commitment ? 'Compliance Committed' : 'Pending'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FEES TAB */}
          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Application Fee</label>
                    <p className="text-sm text-foreground">{formatCurrency(permit.application_fee)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Fee Amount</label>
                    <p className="text-sm text-foreground">{formatCurrency(permit.fee_amount)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                    <Badge variant={permit.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {permit.payment_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVIEW TAB */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Application Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Legal Declaration</h4>
                  <Badge variant={permit.legal_declaration_accepted ? 'default' : 'secondary'}>
                    {permit.legal_declaration_accepted ? 'Accepted' : 'Pending'}
                  </Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Compliance Commitment</h4>
                  <Badge variant={permit.compliance_commitment ? 'default' : 'secondary'}>
                    {permit.compliance_commitment ? 'Committed' : 'Pending'}
                  </Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Status</h4>
                  <Badge variant={permit.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {permit.payment_status?.toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
