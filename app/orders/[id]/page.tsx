'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  FileText,
  Download,
  X,
  RefreshCw,
  ChevronLeft,
  User,
  Clock,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { getOrderById, cancelOrder, reorderOrder, downloadInvoice, uploadPrescription, getPrescriptionImages, deletePrescriptionImage, type Order } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PrescriptionViewerModal } from '@/components/prescription-viewer-modal';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [prescriptionImages, setPrescriptionImages] = useState<string[]>([]);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
      fetchPrescriptionImages(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data.order);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionImages = async (orderId: string) => {
    try {
      const data = await getPrescriptionImages(orderId);
      if (data.success && data.data.prescriptionImages) {
        setPrescriptionImages(data.data.prescriptionImages);
      }
    } catch (error: any) {
      // Silently fail - prescription might not be uploaded yet
      console.log('No prescription images yet');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} is not a valid file type. Only JPG, PNG, and PDF are allowed.`,
          variant: 'destructive',
        });
        return false;
      }

      if (file.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds 5MB limit.`,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUploadPrescription = async () => {
    if (!order || selectedFiles.length === 0) return;

    setUploadingPrescription(true);
    try {
      await uploadPrescription(order._id, selectedFiles);
      toast({
        title: 'Success',
        description: 'Prescription uploaded successfully',
      });
      setSelectedFiles([]);
      fetchPrescriptionImages(order._id);
      fetchOrder(order._id); // Refresh order to get updated status
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload prescription',
        variant: 'destructive',
      });
    } finally {
      setUploadingPrescription(false);
    }
  };

  const handleDeletePrescriptionImage = async (imageUrl: string) => {
    if (!order) return;

    try {
      await deletePrescriptionImage(order._id, imageUrl);
      toast({
        title: 'Success',
        description: 'Prescription image deleted',
      });
      fetchPrescriptionImages(order._id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const handleViewPrescription = (imageUrl: string, title: string = "Prescription") => {
    setViewPrescriptionModal({
      isOpen: true,
      imageUrl,
      title
    });
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setCancelling(true);
    try {
      await cancelOrder(order._id);
      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      });
      fetchOrder(order._id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;

    setReordering(true);
    try {
      const result = await reorderOrder(order._id);
      toast({
        title: 'Success',
        description: 'Items added to cart',
      });
      router.push('/cart');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setReordering(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    setDownloading(true);
    try {
      await downloadInvoice(order._id);
      toast({
        title: 'Success',
        description: 'Invoice downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Order Placed': 'bg-blue-100 text-blue-800',
      'Processing': 'bg-yellow-100 text-yellow-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancelOrder = (status: string) => {
    return !['Shipped', 'Delivered', 'Cancelled'].includes(status);
  };

  const canReorder = (status: string) => {
    return status === 'Delivered';
  };

  const getPrescriptionStatusMessage = (status: string) => {
    const messages: Record<string, { icon: string; text: string; color: string }> = {
      'pending': { icon: '📋', text: 'Please upload your prescription', color: 'text-amber-600' },
      'assigned_to_pharmacist': { icon: '👨‍⚕️', text: 'Prescription assigned to pharmacist for review', color: 'text-blue-600' },
      'under_verification': { icon: '🔍', text: 'Prescription is being verified', color: 'text-blue-600' },
      'verified_by_pharmacist': { icon: '✅', text: 'Prescription verified by pharmacist', color: 'text-green-600' },
      'sent_to_doctor': { icon: '👩‍⚕️', text: 'Prescription sent to doctor for approval', color: 'text-purple-600' },
      'verified_by_doctor': { icon: '✅', text: 'Prescription approved by doctor', color: 'text-green-600' },
      'approved': { icon: '✅', text: 'Prescription approved - Order processing', color: 'text-green-600' },
      'rejected': { icon: '❌', text: 'Prescription rejected - Please contact support', color: 'text-red-600' },
    };
    return messages[status] || { icon: '📋', text: status, color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground mt-2">The order you're looking for doesn't exist</p>
          <Button className="mt-4" onClick={() => router.push('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.back()}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {new Date(order.orderedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Downloading...' : 'Invoice'}
          </Button>

          {canReorder(order.status) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReorder}
              disabled={reordering}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {reordering ? 'Adding...' : 'Reorder'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={getStatusColor(order.status)} className="text-base px-4 py-2">
                    {order.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Delivery Status: {order.deliveryStatus}
                  </p>
                </div>
                {order.deliveryOTP && order.status !== 'Delivered' && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Delivery OTP</p>
                    <p className="text-2xl font-bold">{order.deliveryOTP}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  // Extract product details
                  let productName = 'Unknown Item';
                  let productImage = '';
                  let productCategory = '';
                  
                  if (item.productType === 'medicine' && item.medicine) {
                    productName = item.medicine.productName;
                    productImage = item.medicine.image;
                    productCategory = item.medicine.category;
                  } else if (item.productType === 'categoryProduct' && item.categoryProduct) {
                    productName = item.categoryProduct.productName;
                    productImage = item.categoryProduct.image;
                  } else if (item.productType === 'labTest' && item.labTest) {
                    productName = item.labTest.testName;
                    productCategory = item.labTest.description;
                  }

                  return (
                    <div key={index}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {productImage ? (
                            <Image
                              src={productImage}
                              alt={productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-blue-100">
                              <FileText className="h-10 w-10 text-blue-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold line-clamp-1">
                                {productName}
                              </h4>
                              {productCategory && (
                                <p className="text-sm text-muted-foreground">
                                  {productCategory}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {item.productType === 'medicine' ? 'Medicine' : 
                                   item.productType === 'categoryProduct' ? 'Product' : 'Lab Test'}
                                </Badge>
                                {item.isHomeCollection && (
                                  <Badge variant="outline" className="text-xs">
                                    Home Collection
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold">₹{item.price * item.quantity}</p>
                              <p className="text-sm text-muted-foreground">
                                ₹{item.price} × {item.quantity}
                              </p>
                              {item.homeCollectionPrice && (
                                <p className="text-xs text-muted-foreground">
                                  + ₹{item.homeCollectionPrice} (Collection)
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Lab Test Details */}
                          {item.productType === 'labTest' && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                              {item.labTestPatientDetails ? (
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                                    <User className="h-4 w-4" />
                                    <span>Patient Details</span>
                                  </div>
                                  <div className="pl-6 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Name:</span>
                                      <span className="font-medium">{item.labTestPatientDetails.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Age & Gender:</span>
                                      <span className="font-medium">
                                        {item.labTestPatientDetails.age} years, {item.labTestPatientDetails.gender}
                                      </span>
                                    </div>
                                    {item.labTestPatientDetails.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium">{item.labTestPatientDetails.phone}</span>
                                      </div>
                                    )}
                                    {item.labTestPatientDetails.disease && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Condition:</span>
                                        <span className="font-medium">{item.labTestPatientDetails.disease}</span>
                                      </div>
                                    )}
                                  </div>
                                  {item.labTestSampleOTP && (
                                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Sample OTP:</span>
                                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                          {item.labTestSampleOTP}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {item.labTestStatus && (
                                    <div className="mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        Status: {item.labTestStatus}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  No patient details available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Prescription Status */}
          {order.hasPrescriptionRequired && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Prescription Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Message */}
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    {order.prescriptionVerificationStatus && (
                      <p className={`font-medium ${getPrescriptionStatusMessage(order.prescriptionVerificationStatus).color}`}>
                        {getPrescriptionStatusMessage(order.prescriptionVerificationStatus).icon}{' '}
                        {getPrescriptionStatusMessage(order.prescriptionVerificationStatus).text}
                      </p>
                    )}
                    {!order.prescriptionVerified && order.prescriptionVerificationStatus === 'pending' && (
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                        Please upload a valid prescription to proceed with delivery.
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload Section - Show if pending or rejected */}
                {(order.prescriptionVerificationStatus === 'pending' || order.prescriptionVerificationStatus === 'rejected') && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="prescription-upload"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploadingPrescription}
                      />
                      <label
                        htmlFor="prescription-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Select Prescription Files
                      </label>
                      <span className="text-xs text-muted-foreground">
                        JPG, PNG, PDF (Max 5MB each)
                      </span>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Selected Files:</p>
                        <div className="space-y-1">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-white dark:bg-amber-900 p-2 rounded">
                              <FileText className="h-4 w-4 text-amber-600" />
                              <span className="flex-1">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={handleUploadPrescription}
                          disabled={uploadingPrescription}
                          className="w-full"
                        >
                          {uploadingPrescription ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload {selectedFiles.length} File(s)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded Prescriptions Display */}
                {prescriptionImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Uploaded Prescriptions ({prescriptionImages.length}):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {prescriptionImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-amber-900 border-2 border-amber-300">
                            {imageUrl.endsWith('.pdf') ? (
                              <div className="h-full flex flex-col items-center justify-center p-4">
                                <FileText className="h-12 w-12 text-amber-600 mb-2" />
                                <p className="text-xs text-center text-amber-800 dark:text-amber-200">
                                  PDF Document
                                </p>
                              </div>
                            ) : (
                              <img
                                src={imageUrl}
                                alt={`Prescription ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handleViewPrescription(imageUrl, `Prescription ${index + 1} - Order ${order.orderNumber}`)}
                              />
                            )}
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleViewPrescription(imageUrl, `Prescription ${index + 1} - Order ${order.orderNumber}`)}
                            >
                              <ImageIcon className="h-3 w-3" />
                            </Button>
                            {order.prescriptionVerificationStatus === 'pending' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handleDeletePrescriptionImage(imageUrl)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medicine Substitutions */}
                {order.medicineSubstitutions && order.medicineSubstitutions.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Medicine Substitutions
                    </h4>
                    <div className="space-y-2">
                      {order.medicineSubstitutions.map((sub, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            {sub.originalMedicine} → {sub.substituteMedicine}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Reason: {sub.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{order.totalAmount}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  className={
                    order.paymentStatus === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="text-xs font-mono">{order.razorpayPaymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Partner */}
          {order.deliveryPartner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Partner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.deliveryPartner.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{order.deliveryPartner.phone}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{order.address}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{order.contact}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {order.deliveredAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Delivered on{' '}
                    {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Prescription View Modal */}
      <PrescriptionViewerModal
        isOpen={viewPrescriptionModal.isOpen}
        onClose={() => setViewPrescriptionModal(prev => ({ ...prev, isOpen: false }))}
        imageUrl={viewPrescriptionModal.imageUrl}
        title={viewPrescriptionModal.title}
      />
    </div>
  );
}
