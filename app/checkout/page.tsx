'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Package, AlertCircle, Loader2, Upload, FileText, X } from 'lucide-react';
import { getCart, type CartItem } from '@/lib/api/cart';
import { placeOrder, checkPrescriptionStatus } from '@/lib/api/orders';
import { createOrderPayment, initiateRazorpayPayment } from '@/lib/api/payment';
import { profileApi } from '@/lib/api/profile';
import { getUser } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [customAddress, setCustomAddress] = useState({
    houseNumber: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [contact, setContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [prescriptionStatus, setPrescriptionStatus] = useState<any>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cartData, profileData] = await Promise.all([
        getCart(),
        profileApi.get(),
      ]);

      if (cartData.cart.items.length === 0) {
        toast({
          title: 'Cart is empty',
          description: 'Add items to cart before checkout',
          variant: 'destructive',
        });
        router.push('/cart');
        return;
      }

      setCartItems(cartData.cart.items);
      setCartId(cartData.cart._id);
      
      // Calculate total price from items if not provided
      const calculatedTotal = cartData.cart.items.reduce((sum: number, item: CartItem) => {
        return sum + (item.price * item.quantity) + (item.homeCollectionPrice || 0);
      }, 0);
      
      setTotalPrice(cartData.totalPrice || calculatedTotal || 0);
      
      // Handle addresses - can be array or single object
      let addressList: any[] = [];
      
      // Check if addresses array exists (either at root or under user)
      const addressesArray = profileData.addresses || profileData.user?.addresses;
      const singleAddress = profileData.address || profileData.user?.address;
      
      if (addressesArray && Array.isArray(addressesArray)) {
        addressList = addressesArray;
      } else if (singleAddress) {
        // Convert single address object to array format
        addressList = [{
          _id: 'default-address',
          label: 'Home',
          street: singleAddress.street || '',
          city: singleAddress.city || '',
          state: singleAddress.state || '',
          pincode: singleAddress.postalCode || singleAddress.pincode || '',
          isDefault: true,
        }];
      }
      
      setAddresses(addressList);
      setContact(profileData.contact || profileData.user?.contact || profileData.phone || profileData.user?.phone || '');

      if (addressList.length > 0) {
        const defaultAddr = addressList.find((a: any) => a.isDefault);
        setSelectedAddressId(defaultAddr?._id || addressList[0]._id);
      }

      // Check prescription status
      const prescStatus = await checkPrescriptionStatus(cartData.cart._id);
      setPrescriptionStatus(prescStatus.data);
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

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or PDF file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setPrescriptionFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPrescriptionPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPrescriptionPreview(null);
      }

      toast({
        title: 'Prescription Uploaded',
        description: 'Prescription uploaded successfully',
      });
    }
  };

  const handleRemovePrescription = () => {
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
  };

  const handlePlaceOrder = async () => {
    if (!useCustomAddress && !selectedAddressId) {
      toast({
        title: 'Address Required',
        description: 'Please select a delivery address',
        variant: 'destructive',
      });
      return;
    }

    if (useCustomAddress && (!customAddress.houseNumber || !customAddress.street || !customAddress.city || !customAddress.state || !customAddress.pincode)) {
      toast({
        title: 'Address Required',
        description: 'Please fill all address fields',
        variant: 'destructive',
      });
      return;
    }

    if (!contact.trim()) {
      toast({
        title: 'Contact Required',
        description: 'Please enter a contact number',
        variant: 'destructive',
      });
      return;
    }

    // Check if prescription is required but not uploaded
    if (prescriptionStatus?.prescriptionStatus?.hasPrescriptionRequired && !prescriptionFile) {
      toast({
        title: 'Prescription Required',
        description: 'Please upload a valid prescription before placing order',
        variant: 'destructive',
      });
      return;
    }

    setPlacing(true);
    try {
      let addressString = '';

      if (useCustomAddress) {
        // Combine all address fields into single string
        addressString = `${customAddress.houseNumber}, ${customAddress.street}, ${customAddress.city}, ${customAddress.state} - ${customAddress.pincode}`;
      } else if (selectedAddressId) {
        // Find the selected address and format it as a string
        const selectedAddr = addresses.find(addr => addr._id === selectedAddressId);
        if (selectedAddr) {
          addressString = `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.pincode}`;
        } else {
          toast({
            title: 'Address Error',
            description: 'Selected address not found',
            variant: 'destructive',
          });
          setPlacing(false);
          return;
        }
      } else {
        toast({
          title: 'Address Required',
          description: 'Please select or enter a delivery address',
          variant: 'destructive',
        });
        setPlacing(false);
        return;
      }

      // Handle payment based on method
      if (paymentMethod === 'Online') {
        // Create Razorpay payment order
        const paymentData = await createOrderPayment({
          cartId,
          address: addressString,
          contact,
        });

        const user = getUser();

        // Initiate Razorpay payment
        await initiateRazorpayPayment(
          paymentData,
          {
            name: user?.name || 'User',
            email: user?.email || '',
            contact: contact,
          },
          (verifyResult) => {
            // Payment success
            toast({
              title: 'Success',
              description: 'Payment successful! Order placed.',
            });
            // Use the order ID from verification result
            const orderId = verifyResult.order?.id || verifyResult.order?._id || paymentData.orderId;
            router.push(`/orders/${orderId}`);
          },
          (error) => {
            // Payment failure
            toast({
              title: 'Payment Failed',
              description: error,
              variant: 'destructive',
            });
            setPlacing(false);
          }
        );
      } else {
        // COD - Place order directly
        const orderData: any = {
          cartId,
          address: addressString,
          contact,
          paymentMethod: 'COD',
        };

        const result = await placeOrder(orderData);

        toast({
          title: 'Success',
          description: 'Order placed successfully!',
        });

        router.push(`/orders/${result.order._id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prescription Warning & Upload */}
          {prescriptionStatus?.prescriptionStatus?.hasPrescriptionRequired && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-900 dark:text-amber-100">
                      Prescription Required
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                      {prescriptionStatus.message}
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                      Please upload a valid prescription to proceed with the order.
                    </p>

                    {/* Prescription Upload Section */}
                    <div className="mt-4">
                      {!prescriptionFile ? (
                        <div>
                          <Label
                            htmlFor="prescription-upload"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            Upload Prescription
                          </Label>
                          <Input
                            id="prescription-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handlePrescriptionUpload}
                            className="hidden"
                          />
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                            Accepted formats: JPG, PNG, PDF (Max 5MB)
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-amber-900 rounded-md p-3 border border-amber-300">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1">
                              <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 truncate">
                                  {prescriptionFile.name}
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                  {(prescriptionFile.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemovePrescription}
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {prescriptionPreview && (
                            <div className="mt-3">
                              <img
                                src={prescriptionPreview}
                                alt="Prescription preview"
                                className="max-h-40 rounded border border-amber-300"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
            <CardContent className="space-y-4">
              {addresses.length > 0 && !useCustomAddress && (
                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                  {addresses.map((address) => (
                    <div key={address._id} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={address._id} id={address._id} />
                      <Label htmlFor={address._id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{address.label}</span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.city}, {address.state} {address.pincode}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useCustomAddress"
                  checked={useCustomAddress}
                  onChange={(e) => setUseCustomAddress(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useCustomAddress" className="cursor-pointer">
                  Use a different address
                </Label>
              </div>

              {useCustomAddress && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="houseNumber">House/Block Number</Label>
                    <Input
                      id="houseNumber"
                      placeholder="e.g., 210/80-C/3/A"
                      value={customAddress.houseNumber}
                      onChange={(e) => setCustomAddress({ ...customAddress, houseNumber: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="street">Street/Area</Label>
                    <Input
                      id="street"
                      placeholder="e.g., Shastri Nagar Meerapur"
                      value={customAddress.street}
                      onChange={(e) => setCustomAddress({ ...customAddress, street: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Prayagraj"
                        value={customAddress.city}
                        onChange={(e) => setCustomAddress({ ...customAddress, city: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="e.g., Uttar Pradesh"
                        value={customAddress.state}
                        onChange={(e) => setCustomAddress({ ...customAddress, state: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="e.g., 211003"
                      value={customAddress.pincode}
                      onChange={(e) => setCustomAddress({ ...customAddress, pincode: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="Enter contact number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div className="flex items-start space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="COD" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cash on Delivery</div>
                    <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                  </Label>
                </div>

                <div className="flex items-start space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="Online" id="online" />
                  <Label htmlFor="online" className="flex-1 cursor-pointer">
                    <div className="font-medium">Online Payment</div>
                    <p className="text-sm text-muted-foreground">Pay securely using UPI, Cards, or Net Banking</p>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cartItems.map((item, index) => {
                  // Extract product details based on type
                  let name = 'Unknown Item';
                  let brand = '';
                  let packSize = '';
                  
                  if (item.productType === 'medicine' && item.medicineId) {
                    name = item.medicineId.productName || 'Unknown Medicine';
                    brand = item.medicineId.brandName || '';
                    packSize = item.medicineId.packaging?.packSize || '';
                  } else if (item.productType === 'categoryProduct' && item.categoryProductId) {
                    name = item.categoryProductId.productDetails?.productName || 'Unknown Product';
                    brand = item.categoryProductId.productDetails?.brandName || '';
                  } else if (item.productType === 'labTest' && item.labTestId) {
                    name = item.labTestId.testName || 'Unknown Test';
                    brand = 'Lab Test';
                  }

                  const itemTotal = (item.price * item.quantity) + (item.homeCollectionPrice || 0);

                  return (
                    <div key={index} className="flex justify-between items-start text-sm border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="font-medium">{name}</p>
                        {brand && <p className="text-xs text-muted-foreground">{brand}</p>}
                        {packSize && <p className="text-xs text-muted-foreground">{packSize}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {item.quantity} × ₹{item.price}
                          {item.homeCollectionPrice ? ` + ₹${item.homeCollectionPrice} (Home Collection)` : ''}
                        </p>
                      </div>
                      <span className="font-semibold ml-2">₹{itemTotal}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">₹{totalPrice}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Charges</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{totalPrice}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={placing || (prescriptionStatus?.prescriptionStatus?.hasPrescriptionRequired && !prescriptionFile)}
              >
                {placing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : prescriptionStatus?.prescriptionStatus?.hasPrescriptionRequired && !prescriptionFile ? (
                  'Upload Prescription to Continue'
                ) : (
                  `Place Order - ₹${totalPrice}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
