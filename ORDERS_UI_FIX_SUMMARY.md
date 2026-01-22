# Orders & Order Details UI - Fix Summary

## Issues Fixed

### 1. **Orders List API Endpoint** ✅
**Problem:** The orders list page was using `/api/orders` instead of `/api/orders/simple`

**Fixed in:** `lib/api/orders.ts`
- Changed `getOrders()` function to use `/api/orders/simple?page=${page}&limit=${limit}`
- This matches the documentation which specifies the simple endpoint for listing o