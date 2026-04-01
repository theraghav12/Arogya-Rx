'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart, Calendar, Clock, User } from 'lucide-react';
import { getCart, updateCartQuantity, removeFromCart, clearCart, addToCart, CartItem } from '@/lib/api/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart, dispatchCartUpdate } from '@/lib/cart-context';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { updateCartCount } = useCart(); // Use cart context
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setItems(data.cart.items);
      setTotalPrice(data.totalPrice || 0);
      setTotalItems(data.totalItems || 0);
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

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    const itemId = item._id;
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const updateData: any = { quantity: newQuantity };

      if (item.productType === 'medicine' && item.medicineId) {
        updateData.medicineId = typeof item.medicineId === 'object' ? item.medicineId._id : item.medicineId;
      } else if (item.productType === 'categoryProduct' && item.categoryProductId) {
        updateData.categoryProductId = typeof item.categoryProductId === 'object' ? item.categoryProductId._id : item.categoryProductId;
      } else if (item.productType === 'labTest' && item.labTestId) {
        updateData.labTestId = typeof item.labTestId === 'object' ? item.labTestId._id : item.labTestId;
        updateData.isHomeCollection = item.isHomeCollection || false;
      }

      await updateCartQuantity(updateData);
      
      toast({
        title: 'Success',
        description: 'Quantity updated successfully',
      });
      
      // Update cart count in real-time
      updateCartCount();
      dispatchCartUpdate();
      fetchCart();
    } catch (error: any) {
      // If update fails, try fallback method
      try {
        console.log('Update failed, using fallback method');
        
        // Remove and re-add with new quantity
        const removeData: any = {};
        const addData: any = { quantity: newQuantity };

        if (item.productType === 'medicine' && item.medicineId) {
          const medicineId = typeof item.medicineId === 'object' ? item.medicineId._id : item.medicineId;
          removeData.medicineId = medicineId;
          addData.medicineId = medicineId;
        } else if (item.productType === 'categoryProduct' && item.categoryProductId) {
          const productId = typeof item.categoryProductId === 'object' ? item.categoryProductId._id : item.categoryProductId;
          removeData.categoryProductId = productId;
          addData.categoryProductId = productId;
        } else if (item.productType === 'labTest' && item.labTestId) {
          const labTestId = typeof item.labTestId === 'object' ? item.labTestId._id : item.labTestId;
          removeData.labTestId = labTestId;
          addData.labTestId = labTestId;
          removeData.isHomeCollection = item.isHomeCollection || false;
          addData.isHomeCollection = item.isHomeCollection || false;
        }

        await removeFromCart(removeData);
        await addToCart(addData);
        
        toast({
          title: 'Success',
          description: 'Quantity updated successfully',
        });
        
        // Update cart count in real-time
        updateCartCount();
        dispatchCartUpdate();
        fetchCart();
      } catch (fallbackError: any) {
        toast({
          title: 'Error',
          description: fallbackError.message || 'Failed to update quantity',
          variant: 'destructive',
        });
      }
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    const itemId = item._id;
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const removeData: any = {};

      if (item.productType === 'medicine' && item.medicineId) {
        removeData.medicineId = typeof item.medicineId === 'object' ? item.medicineId._id : item.medicineId;
      } else if (item.productType === 'categoryProduct' && item.categoryProductId) {
        removeData.categoryProductId = typeof item.categoryProductId === 'object' ? item.categoryProductId._id : item.categoryProductId;
      } else if (item.productType === 'labTest' && item.labTestId) {
        removeData.labTestId = typeof item.labTestId === 'object' ? item.labTestId._id : item.labTestId;
        removeData.isHomeCollection = item.isHomeCollection || false;
      }

      await removeFromCart(removeData);
      
      toast({
        title: 'Success',
        description: 'Item removed from cart',
      });
      
      // Update cart count in real-time
      updateCartCount();
      dispatchCartUpdate();
      fetchCart();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      await clearCart();
      
      toast({
        title: 'Success',
        description: 'Cart cleared successfully',
      });
      
      // Update cart count in real-time
      updateCartCount();
      dispatchCartUpdate();
      fetchCart();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getProductDetails = (item: CartItem) => {
    if (item.productType === 'medicine' && item.medicineId) {
      // Handle both nested inventory and direct stockQuantity
      const stock = item.medicineId.inventory?.stockQuantity || item.medicineId.stockQuantity || 0;
      
      return {
        name: item.medicineId.productName || 'Unknown Medicine',
        brand: item.medicineId.brandName || 'Unknown Brand',
        image: item.medicineId.images?.[0] || '/placeholder.svg',
        mrp: item.medicineId.pricing?.mrp || 0,
        price: item.medicineId.pricing?.sellingPrice || 0,
        stock: stock,
        prescriptionRequired: item.medicineId.prescriptionRequired || false,
      };
    } else if (item.productType === 'categoryProduct' && item.categoryProductId) {
      return {
        name: item.categoryProductId.productDetails?.productName || 'Unknown Product',
        brand: item.categoryProductId.productDetails?.brandName || 'Unknown Brand',
        image: item.categoryProductId.productDetails?.images?.[0] || '/placeholder.svg',
        mrp: item.categoryProductId.productDetails?.pricing?.mrp || 0,
        price: item.categoryProductId.productDetails?.pricing?.sellingPrice || 0,
        stock: item.categoryProductId.productDetails?.stock?.quantity || 0,
        prescriptionRequired: false,
      };
    } else if (item.productType === 'labTest' && item.labTestId) {
      return {
        name: item.labTestId.testName || 'Unknown Test',
        brand: 'Lab Test',
        image: '/placeholder-lab-test.jpg',
        mrp: item.labTestId.price || 0,
        price: item.labTestId.discountedPrice || 0,
        stock: 999,
        prescriptionRequired: false,
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to get started</p>
          <Button onClick={() => router.push('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground mt-1">{totalItems} items in your cart</p>
        </div>
        <Button variant="outline" onClick={handleClearCart}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = getProductDetails(item);
            if (!product) return null;

            const isUpdating = updatingItems.has(item._id);
            const itemTotal = item.price * item.quantity + (item.homeCollectionPrice || 0);

            return (
              <Card key={item._id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.productType === 'medicine' ? 'Medicine' : 
                               item.productType === 'categoryProduct' ? 'Product' : 'Lab Test'}
                            </Badge>
                            {product.prescriptionRequired && (
                              <Badge variant="destructive" className="text-xs">Rx Required</Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isUpdating}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= 10}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {product.mrp > product.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{(product.mrp * item.quantity).toFixed(2)}
                              </span>
                            )}
                            <span className="font-bold text-lg">₹{itemTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {item.productType === 'labTest' && item.isHomeCollection && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Home Collection</span>
                            <span className="text-muted-foreground">+₹{item.homeCollectionPrice?.toFixed(2)}</span>
                          </div>
                          {item.preferredDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(item.preferredDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {item.preferredSlot && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{item.preferredSlot.start} - {item.preferredSlot.end}</span>
                            </div>
                          )}
                          {item.labTestPatientDetails && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span>{item.labTestPatientDetails.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6" 
                size="lg"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => router.push('/')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
