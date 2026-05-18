'use client';

import OrderDashboard from '@/components/OrderDashboard';
import AppLayout from '@/components/AppLayout';


export default function OrdersPage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <OrderDashboard />
    </AppLayout>
  );
}
