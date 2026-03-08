'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, Calendar, CreditCard, Truck, FileText, RefreshCw, Filter, Download } from 'lucide-react';
import { getOrders, getOrderStatistics, getOrdersWithFilters, reorderOrder, type Order, type OrderStatistics } from '@/lib/api/orders';
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
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    paymentStatus: '',
    startDate: '',
    endDate: '',
    sortBy: 'orderedAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, activeTab, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Check if we need to use filters or can use simple endpoint
      const hasFilters = activeTab !== 'all' || 
                        filters.paymentStatus || 
                        filters.startDate || 
                        filters.endDate;

      let ordersData;

      if (hasFilters) {
        // Build filter params - always include page, limit, sortBy, sortOrder
        const filterParams: any = {
          page: currentPage,
          limit: 10,
          sortBy: filters.sortBy || 'orderedAt',
          sortOrder: filters.sortOrder || 'desc',
        };

        // Add status filter from tab
        if (activeTab !== 'all') {
          const statusMap: Record<string, string> = {
            'processing': 'Processing',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
          };
          filterParams.status = statusMap[activeTab];
        }

        // Add additional filters only if they have values
        if (filters.paymentStatus && filters.paymentStatus !== '') {
          filterParams.paymentStatus = filters.paymentStatus;
        }
        if (filters.startDate && filters.startDate !== '') {
          filterParams.startDate = filters.startDate;
        }
        if (filters.endDate && filters.endDate !== '') {
          filterParams.endDate = filters.endDate;
        }

        console.log('Fetching orders with filters:', filterParams);

        // Try filter endpoint, fallback to regular endpoint if it fails
        try {
          ordersData = await getOrdersWithFilters(filterParams);
        } catch (filterError: any) {
          console.warn('Filter endpoint failed, falling back to regular endpoint:', filterError.message);
          console.warn('Note: Backend /orders/filter route may need to be fixed');
          // Fallback to regular orders endpoint
          ordersData = await getOrders(currentPage, 10);
          // Client-side filtering if needed
          if (ordersData.success && ordersData.data) {
            let filteredOrders = ordersData.data.orders;
            
            // Apply status filter
            if (activeTab !== 'all') {
              const statusMap: Record<string, string> = {
                'processing': 'Processing',
                'shipped': 'Shipped',
                'delivered': 'Delivered',
              };
              const targetStatus = statusMap[activeTab];
              filteredOrders = filteredOrders.filter((order: Order) => 
                order.status === targetStatus || order.deliveryStatus === targetStatus
              );
            }
            
            // Apply payment status filter
            if (filters.paymentStatus) {
              filteredOrders = filteredOrders.filter((order: Order) => 
                order.paymentStatus === filters.paymentStatus
              );
            }
            
            ordersData.data.orders = filteredOrders;
          }
        }
      } else {
        // Use simple endpoint when no filters
        console.log('Fetching orders without filters');
        ordersData = await getOrders(currentPage, 10);
      }
      
      console.log('Orders response:', ordersData);

      console.log('Orders response:', ordersData);

      if (ordersData.success && ordersData.data) {
        setOrders(ordersData.data.orders || []);
        setTotalPages(ordersData.data.pagination?.totalPages || 1);
      } else {
        console.error('Invalid response structure:', ordersData);
        setOrders([]);
        setTotalPages(1);
      }
      
      // Try to fetch statistics, but don't fail if it doesn't work
      try {
        const statsData = await getOrderStatistics();
        setStatistics(statsData.statistics);
      } catch (statsError) {
        console.log('Statistics not available:', statsError);
        // Calculate basic statistics from orders data
        const allOrders = ordersData.data.orders;
        setStatistics({
          totalOrders: ordersData.data.pagination.totalOrders || allOrders.length,
          totalAmount: allOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0),
          pendingOrders: allOrders.filter((o: Order) => o.status === 'Order Placed').length,
          processingOrders: allOrders.filter((o: Order) => o.status === 'Processing').length,
          shippedOrders: allOrders.filter((o: Order) => o.status === 'Shipped').length,
          deliveredOrders: allOrders.filter((o: Order) => o.status === 'Delivered').length,
          cancelledOrders: allOrders.filter((o: Order) => o.status === 'Cancelled').length,
        });
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch orders',
        variant: 'destructive',
      });
      setOrders([]);
      setTotalPages(1);
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

  const handleReorder = async (orderId: string) => {
    setReorderingOrderId(orderId);
    try {
      const result = await reorderOrder(orderId);
      toast({
        title: 'Success',
        description: 'Items added to cart successfully',
      });
      router.push('/cart');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setReorderingOrderId(null);
    }
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
      <div className="flex items-center justify-between mb-4">
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setCurrentPage(1);
        }} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="ml-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Status</label>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={filters.paymentStatus}
                  onChange={(e) => {
                    setFilters({ ...filters, paymentStatus: e.target.value });
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilters({ ...filters, startDate: e.target.value });
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilters({ ...filters, endDate: e.target.value });
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                    setCurrentPage(1);
                  }}
                >
                  <option value="orderedAt-desc">Newest First</option>
                  <option value="orderedAt-asc">Oldest First</option>
                  <option value="totalAmount-desc">Highest Amount</option>
                  <option value="totalAmount-asc">Lowest Amount</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    paymentStatus: '',
                    startDate: '',
                    endDate: '',
                    sortBy: 'orderedAt',
                    sortOrder: 'desc',
                  });
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
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
                        
                        {order.deliveryStatus === 'Delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorder(order._id)}
                            disabled={reorderingOrderId === order._id}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${reorderingOrderId === order._id ? 'animate-spin' : ''}`} />
                            {reorderingOrderId === order._id ? 'Adding...' : 'Reorder'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item, index) => {
                        let imageUrl = '';
                        let itemName = '';
                        let itemType = '';
                        
                        if (item.medicine) {
                          imageUrl = item.medicine.image;
                          itemName = item.medicine.productName;
                          itemType = 'Medicine';
                        } else if (item.categoryProduct) {
                          imageUrl = item.categoryProduct.image;
                          itemName = item.categoryProduct.productName;
                          itemType = 'Product';
                        } else if (item.labTest) {
                          itemName = item.labTest.testName;
                          itemType = 'Lab Test';
                        } else {
                          // Fallback when details aren't populated
                          if (item.productType === 'medicine') {
                            itemType = 'Medicine';
                            itemName = 'Medicine Item';
                          } else if (item.productType === 'labTest') {
                            itemType = 'Lab Test';
                            itemName = 'Lab Test';
                          } else {
                            itemType = 'Product';
                            itemName = 'Product Item';
                          }
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
                                {item.productType === 'labTest' || item.labTest ? (
                                  <FileText className="h-8 w-8 text-blue-600" />
                                ) : (
                                  <Package className="h-8 w-8 text-blue-600" />
                                )}
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
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Status</p>
                          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-bold text-lg">₹{order.totalAmount}</p>
                        </div>
                        {order.hasLabTests && (
                          <div>
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Lab Tests Included
                            </Badge>
                          </div>
                        )}
                        {order.deliveryOTP && order.deliveryStatus !== 'Delivered' && (
                          <div>
                            <p className="text-sm text-muted-foreground">Delivery OTP</p>
                            <p className="font-bold text-primary">{order.deliveryOTP}</p>
                          </div>
                        )}
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
