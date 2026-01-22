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
} from 'lucide-react';
import { getOrderById, cancelOrder, reorderOrder, downloadInvoice, type Order } from '@/lib/api/orders';
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
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

          {canCancelOrder(order.status) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={cancelling}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder}>
                    Yes, Cancel Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                          {item.productType === 'labTest' && item.labTestPatientDetails && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Patient: {item.labTestPatientDetails.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{item.labTestPatientDetails.gender}, {item.labTestPatientDetails.age} years</span>
                              </div>
                              {item.labTestPatientDetails.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{item.labTestPatientDetails.phone}</span>
                                </div>
                              )}
                              {item.labTestSampleOTP && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <span>Sample OTP: <strong>{item.labTestSampleOTP}</strong></span>
                                </div>
                              )}
                              {item.labTestStatus && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Status: {item.labTestStatus}
                                  </Badge>
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
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">
                      Prescription Required
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                      Status: {order.prescriptionVerificationStatus}
                    </p>
                    {!order.prescriptionVerified && (
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Please upload a valid prescription to proceed with delivery.
                      </p>
                    )}
                  </div>
                </div>
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
            </CardContent>
          </Card>

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
    </div>
  );
}
