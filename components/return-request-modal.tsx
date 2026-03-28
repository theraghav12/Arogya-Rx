'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { returnsApi } from '@/lib/api/returns'
import { getOrderById, type Order } from '@/lib/api/orders'
import { Loader2, Package, AlertCircle } from 'lucide-react'

interface ReturnRequestModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  onReturnCreated: () => void
}

interface SelectedItem {
  itemId: string
  returnReason: string
  customReason?: string
}

export function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  onReturnCreated
}: ReturnRequestModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingOrder, setFetchingOrder] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({})
  const [customReasons, setCustomReasons] = useState<Record<string, string>>({})

  const returnReasons = [
    { value: 'Expired', label: 'Product Expired' },
    { value: 'Damaged', label: 'Product Damaged' },
    { value: 'Wrong Item', label: 'Wrong Item Delivered' },
    { value: 'Other', label: 'Other' }
  ]

  // Fetch order details when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    setFetchingOrder(true)
    try {
      const response = await getOrderById(orderId)
      if (response.success) {
        setOrder(response.order)
      } else {
        throw new Error(response.message || 'Failed to fetch order')
      }
    } catch (error: any) {
      console.error('Error fetching order:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order details",
        variant: "destructive"
      })
    } finally {
      setFetchingOrder(false)
    }
  }

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev }
      
      if (newSelected[itemId]) {
        // Remove item
        delete newSelected[itemId]
      } else {
        // Add item with default reason
        newSelected[itemId] = {
          itemId,
          returnReason: 'Expired'
        }
      }
      
      return newSelected
    })
  }

  const updateReturnReason = (itemId: string, reason: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        returnReason: reason
      }
    }))
  }

  const updateCustomReason = (itemId: string, customReason: string) => {
    setCustomReasons(prev => ({
      ...prev,
      [itemId]: customReason
    }))
  }

  const handleSubmit = async () => {
    if (!order) {
      toast({
        title: "Error",
        description: "Order data not available",
        variant: "destructive"
      })
      return
    }

    const selectedIds = Object.keys(selectedItems)
    
    if (selectedIds.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to return",
        variant: "destructive"
      })
      return
    }

    // Validate all selected items have reasons
    const invalidItems = selectedIds.filter(itemId => {
      const item = selectedItems[itemId]
      if (!item.returnReason) return true
      if (item.returnReason === 'Other' && (!customReasons[itemId] || customReasons[itemId].trim() === '')) {
        return true
      }
      return false
    })
    
    if (invalidItems.length > 0) {
      toast({
        title: "Missing information",
        description: "Please select return reason for all items and provide custom reason when 'Other' is selected",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Prepare API payload using order data
      const apiItems = selectedIds.map(itemId => {
        const orderItem = order.items.find(item => item._id === itemId)
        if (!orderItem) throw new Error(`Order item not found: ${itemId}`)

        const selectedItem = selectedItems[itemId]
        
        // Build API item based on order data
        const apiItem: any = {
          productType: orderItem.productType,
          batchNumber: `BATCH-${Date.now().toString().slice(-6)}`, // Auto-generate
          returnQuantity: orderItem.quantity, // Use full quantity from order
          unitBilled: "Primary",
          unitConversion: 1,
          returnReason: selectedItem.returnReason
        }

        // Add product ID based on type from order data
        if (orderItem.productType === 'medicine' && orderItem.medicine) {
          apiItem.medicineId = orderItem.medicine._id
        } else if (orderItem.productType === 'categoryProduct' && orderItem.categoryProduct) {
          apiItem.categoryProductId = orderItem.categoryProduct._id
        }

        return apiItem
      })

      const result = await returnsApi.createReturn({
        originalOrderId: orderId,
        items: apiItems
      })

      toast({
        title: "Return request created",
        description: `Return number: ${result.data?.returnNumber || 'Generated'}`,
      })

      onReturnCreated()
      handleClose()
    } catch (error: any) {
      console.error('Return API Error:', error)
      toast({
        title: "Failed to create return",
        description: error.message || "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedItems({})
    setOrder(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Return Request{order ? ` - ${order.orderNumber}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">Return Policy</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Returns are only accepted within 48 hours of order delivery.
                </p>
              </div>
            </div>
          </div>

          {fetchingOrder ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading order details...</span>
            </div>
          ) : order ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Items to Return</h3>
              
              {order.items
                .filter(item => item.productType === 'medicine' || item.productType === 'categoryProduct')
                .map((item, index) => {
                  const itemId = item._id
                  const isSelected = itemId in selectedItems
                  const productName = item.medicine?.productName || item.categoryProduct?.productName || 'Unknown Product'

                  return (
                    <div key={`${itemId}-${index}`} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleItemToggle(itemId)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div 
                            className="cursor-pointer" 
                            onClick={() => handleItemToggle(itemId)}
                          >
                            <h4 className="font-medium">{productName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} | Price: ₹{item.price?.toFixed(2) || '0.00'}
                            </p>
                          </div>

                          {isSelected && (
                            <div className="mt-4">
                              <Label>Return Reason *</Label>
                              <Select
                                value={selectedItems[itemId]?.returnReason || ''}
                                onValueChange={(value) => updateReturnReason(itemId, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  {returnReasons.map((reason) => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                      {reason.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load order details</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || fetchingOrder || !order}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Return Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}