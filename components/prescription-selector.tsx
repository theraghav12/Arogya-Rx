'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getMyPrescriptions, uploadPrescription, type Prescription } from '@/lib/api/prescriptions';

interface PrescriptionSelectorProps {
  onPrescriptionSelect?: (prescriptions: Prescription[]) => void;
  onUploadSuccess?: (prescription: Prescription) => void;
  allowMultiple?: boolean;
  showUploadOption?: boolean;
  className?: string;
}

export function PrescriptionSelector({
  onPrescriptionSelect,
  onUploadSuccess,
  allowMultiple = true,
  showUploadOption = true,
  className = '',
}: PrescriptionSelectorProps) {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    if (onPrescriptionSelect) {
      onPrescriptionSelect(selectedPrescriptions);
    }
  }, [selectedPrescriptions, onPrescriptionSelect]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await getMyPrescriptions();
      // Filter only approved or pending prescriptions
      const validPrescriptions = data.data.filter(
        (p) => p.status === 'approved' || p.status === 'pending'
      );
      setPrescriptions(validPrescriptions);
    } catch (error: any) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionToggle = (prescription: Prescription) => {
    setSelectedPrescriptions((prev) => {
      const isSelected = prev.find((p) => p._id === prescription._id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter((p) => p._id !== prescription._id);
      } else {
        // Add to selection
        if (allowMultiple) {
          return [...prev, prescription];
        } else {
          return [prescription];
        }
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Only JPG, PNG, and PDF files are allowed',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'File size should not exceed 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadPrescription(file);
      toast({
        title: 'Success',
        description: 'Prescription uploaded successfully',
      });
      
      // Refresh prescriptions list
      await fetchPrescriptions();
      
      // Auto-select the newly uploaded prescription
      if (result.data) {
        setSelectedPrescriptions(allowMultiple ? [result.data] : [result.data]);
        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        }
      }
      
      setShowUploadForm(false);
      event.target.value = ''; // Reset input
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload prescription',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-800', label: '📋 Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: '🔍 Processing' },
      approved: { color: 'bg-green-100 text-green-800', label: '✅ Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: '❌ Rejected' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'bg-gray-100 text-gray-800',
      label: status,
    };
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span className="text-muted-foreground">Loading prescriptions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Select Prescription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {prescriptions.length === 0 && !showUploadOption ? (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              No prescriptions available. Please upload a prescription first from your profile.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Toggle between existing and upload */}
            {showUploadOption && (
              <div className="flex gap-2 mb-4">
                <Button
                  variant={!showUploadForm ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowUploadForm(false)}
                  disabled={prescriptions.length === 0}
                >
                  Use Existing ({prescriptions.length})
                </Button>
                <Button
                  variant={showUploadForm ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowUploadForm(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
              </div>
            )}

            {showUploadForm ? (
              /* Upload Form */
              <div className="space-y-4">
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    Upload a new prescription. Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </AlertDescription>
                </Alert>
                <div>
                  <input
                    type="file"
                    id="prescription-upload"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label htmlFor="prescription-upload">
                    <Button asChild disabled={uploading} className="w-full">
                      <span className="cursor-pointer">
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Prescription File
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            ) : (
              /* Existing Prescriptions */
              <>
                {prescriptions.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      No prescriptions found. Upload your first prescription to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {allowMultiple
                        ? 'Select one or more prescriptions:'
                        : 'Select a prescription:'}
                    </p>
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {prescriptions.map((prescription) => {
                        const isSelected = selectedPrescriptions.find(
                          (p) => p._id === prescription._id
                        );
                        return (
                          <div
                            key={prescription._id}
                            className={`relative border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handlePrescriptionToggle(prescription)}
                          >
                            {/* Selection indicator */}
                            <div className="absolute top-2 right-2">
                              {isSelected ? (
                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground"></div>
                              )}
                            </div>

                            <div className="flex gap-3 pr-8">
                              {/* Thumbnail */}
                              <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                {prescription.imageUrl.endsWith('.pdf') ? (
                                  <div className="h-full flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                ) : (
                                  <img
                                    src={prescription.imageUrl}
                                    alt="Prescription"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatusBadge(prescription.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Uploaded: {new Date(prescription.createdAt).toLocaleDateString('en-IN')}
                                </p>
                                {prescription.dateIssued && (
                                  <p className="text-xs text-muted-foreground">
                                    Issued: {new Date(prescription.dateIssued).toLocaleDateString('en-IN')}
                                  </p>
                                )}
                                
                                {/* View button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(prescription.imageUrl, '_blank');
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedPrescriptions.length > 0 && (
                      <Alert>
                        <Check className="h-4 w-4" />
                        <AlertDescription>
                          {selectedPrescriptions.length} prescription(s) selected
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}