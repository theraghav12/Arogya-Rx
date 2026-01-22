'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, Calendar, CreditCard, Truck, FileText, RefreshCw, Filter, Download } from 'lucide-react';
import { getOrders, getOrderStatistics, getOrdersWithFilters, type Order, type OrderStatistics } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, [currentPage, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with optional status filter
      let ordersData;
      if (activeTab === 'all') {
        ordersData = await getOrders(currentPage, 10);
      } else {
        // Map tab to status
        const statusMap: Record<string, string> = {
          'processing': 'Processing',
          'shipped': 'Shipped',
          'delivered': 'Delivered',
        };
        const status = statusMap[activeTab];
        ordersData = await getOrdersWithFilters({
          page: currentPage,
          limit: 10,
          status: status,
        });
      }

      const statsData = await getOrderStatistics();

      setOrders(ordersData.data.orders);
      setTotalPages(ordersData.data.pagination.totalPages);
      setStatistics(statsData.statistics);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const getPaymentStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const filterOrdersByStatus = (status: string) => {
    // Filtering is now done server-side, so just return all orders
    return orders;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track and manage your orders</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{statistics.totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">₹{statistics.totalAmount}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{statistics.deliveredOrders}</p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{statistics.processingOrders}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders List with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filterOrdersByStatus(activeTab).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {activeTab === 'all' ? 'No orders found' : `No ${activeTab} orders`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet" 
                    : `You don't have any ${activeTab} orders at the moment`}
                </p>
                {activeTab === 'all' && (
                  <Button onClick={() => router.push('/')}>Start Shopping</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filterOrdersByStatus(activeTab).map((order) => (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.orderedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.items.length} items
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/orders/${order._id}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item, index) => {
                        let imageUrl = '';
                        let itemName = '';
                        
                        if (item.medicine) {
                          imageUrl = item.medicine.image;
                          itemName = item.medicine.productName;
                        } else if (item.categoryProduct) {
                          imageUrl = item.categoryProduct.image;
                          itemName = item.categoryProduct.productName;
                        } else if (item.labTest) {
                          itemName = item.labTest.testName;
                        }

                        return (
                          <div key={index} className="flex-shrink-0" title={itemName}>
                            {imageUrl ? (
                              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border">
                                <Image
                                  src={imageUrl}
                                  alt={itemName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center border">
                                <FileText className="h-8 w-8 text-blue-600" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {order.items.length > 4 && (
                        <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium border">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Payment</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{order.paymentMethod}</span>
                            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-bold text-lg">₹{order.totalAmount}</p>
                        </div>
                      </div>

                      {order.deliveryStatus && (
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{order.deliveryStatus}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
