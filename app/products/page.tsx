import AppLayout from '@/components/AppLayout';
import ProductDashboard from '@/components/ProductDashboard';

export default function ProductsPage() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <ProductDashboard />
    </AppLayout>
  );
}
