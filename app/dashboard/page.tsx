'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AppLayout from '@/components/AppLayout';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

type OrderStatus = 'pending' | 'shipped' | 'delivered';

type Order = {
  id: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  price: number;
  buy_price: number;
  status: OrderStatus;
  created_at?: string;
};

type Product = {
  id: number;
  name: string;
  stock: number;
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('stock', { ascending: true });

      setOrders((ordersData as Order[]) || []);
      setProducts((productsData as Product[]) || []);
    };

    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.price * o.quantity, 0);

  const totalProfit = orders.reduce(
    (sum, o) => sum + (o.price - (o.buy_price || 0)) * o.quantity,
    0
  );

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const recentOrders = orders.slice(0, 6);

  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 7);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(now.getDate() - 14);

  const thisWeekRevenue = orders
    .filter((o) => o.created_at && new Date(o.created_at) >= weekAgo)
    .reduce((sum, o) => sum + o.price * o.quantity, 0);

  const lastWeekRevenue = orders
    .filter((o) => {
      if (!o.created_at) return false;
      const d = new Date(o.created_at);
      return d >= twoWeeksAgo && d < weekAgo;
    })
    .reduce((sum, o) => sum + o.price * o.quantity, 0);

  const revenueGrowth =
    lastWeekRevenue > 0
      ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
      : thisWeekRevenue > 0
      ? 100
      : 0;

  const monthlyProfit = orders
    .filter((o) => {
      if (!o.created_at) return false;
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + (o.price - (o.buy_price || 0)) * o.quantity, 0);

  const chartData = Object.values(
    orders.reduce((acc: Record<string, { name: string; revenue: number; profit: number; orders: number }>, order) => {
      const date = order.created_at
        ? new Date(order.created_at).toLocaleDateString('sq-AL', {
            day: '2-digit',
            month: 'short',
          })
        : 'Pa datë';

      const revenue = order.price * order.quantity;
      const profit = (order.price - (order.buy_price || 0)) * order.quantity;

      if (!acc[date]) {
        acc[date] = { name: date, revenue: 0, profit: 0, orders: 0 };
      }

      acc[date].revenue += revenue;
      acc[date].profit += profit;
      acc[date].orders += 1;

      return acc;
    }, {})
  ).reverse();

  const topProducts = Object.values(
    orders.reduce((acc: Record<string, { name: string; revenue: number; profit: number; quantity: number }>, order) => {
      const productName = order.product_name || 'Unknown';

      if (!acc[productName]) {
        acc[productName] = { name: productName, revenue: 0, profit: 0, quantity: 0 };
      }

      acc[productName].revenue += order.price * order.quantity;
      acc[productName].profit += (order.price - (order.buy_price || 0)) * order.quantity;
      acc[productName].quantity += order.quantity;

      return acc;
    }, {})
  )
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const bestCustomers = Object.values(
    orders.reduce((acc: Record<string, { name: string; revenue: number; profit: number; orders: number }>, order) => {
      const customerName = order.customer_name || 'Unknown';

      if (!acc[customerName]) {
        acc[customerName] = { name: customerName, revenue: 0, profit: 0, orders: 0 };
      }

      acc[customerName].revenue += order.price * order.quantity;
      acc[customerName].profit += (order.price - (order.buy_price || 0)) * order.quantity;
      acc[customerName].orders += 1;

      return acc;
    }, {})
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockProducts = products.filter((p) => p.stock <= 3).slice(0, 5);

  const cardClass =
    'rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur-xl';

  return (
    <AppLayout>
      <div className="space-y-8 text-white">
        <div>
          <p className="text-sm text-blue-300">NexShop Analytics</p>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-slate-400">
            Përmbledhje reale e shitjeve, porosive dhe fitimit.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className={cardClass}>
            <p className="text-sm text-slate-400">Total Revenue</p>
            <h2 className="mt-3 text-3xl font-bold">{totalRevenue.toFixed(2)}€</h2>
            <p className="mt-2 text-xs text-emerald-400">real revenue</p>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-slate-400">Total Profit</p>
            <h2 className="mt-3 text-3xl font-bold text-emerald-400">{totalProfit.toFixed(2)}€</h2>
            <p className="mt-2 text-xs text-emerald-400">real profit</p>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-slate-400">This Week Revenue</p>
            <h2 className="mt-3 text-3xl font-bold">{thisWeekRevenue.toFixed(2)}€</h2>
            <p className={revenueGrowth >= 0 ? 'mt-2 text-xs text-emerald-400' : 'mt-2 text-xs text-red-400'}>
              {revenueGrowth >= 0 ? '+' : ''}
              {revenueGrowth.toFixed(1)}% vs last week
            </p>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-slate-400">Profit This Month</p>
            <h2 className="mt-3 text-3xl font-bold text-emerald-400">{monthlyProfit.toFixed(2)}€</h2>
            <p className="mt-2 text-xs text-purple-400">monthly profit</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5">
            <p className="text-sm text-yellow-300">Në pritje</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-200">{pendingOrders}</h2>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-5">
            <p className="text-sm text-blue-300">Dërguar</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-200">{shippedOrders}</h2>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm text-emerald-300">Dorëzuar</p>
            <h2 className="mt-2 text-3xl font-bold text-emerald-200">{deliveredOrders}</h2>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className={cardClass}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-semibold">Revenue & Profit</h3>
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                Real data
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />

                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />

                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#colorRevenue)" strokeWidth={4} />
                  <Area type="monotone" dataKey="profit" stroke="#22c55e" fill="url(#colorProfit)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="mb-4 font-semibold">Orders Per Day</h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />

                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />

                  <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className={cardClass}>
            <h3 className="mb-4 font-semibold">Top Products</h3>

            <div className="space-y-4">
              {topProducts.map((p) => (
                <div key={p.name} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-slate-400">{p.quantity} copë</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{p.profit.toFixed(2)}€</p>
                      <p className="text-xs text-slate-400">profit</p>
                    </div>
                  </div>
                </div>
              ))}

              {topProducts.length === 0 && (
                <p className="text-sm text-slate-400">Ende nuk ka të dhëna.</p>
              )}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="mb-4 font-semibold">Best Customers</h3>

            <div className="space-y-4">
              {bestCustomers.map((c) => (
                <div key={c.name} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-slate-400">{c.orders} porosi</p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">{c.revenue.toFixed(2)}€</p>
                      <p className="text-xs text-emerald-400">{c.profit.toFixed(2)}€ profit</p>
                    </div>
                  </div>
                </div>
              ))}

              {bestCustomers.length === 0 && (
                <p className="text-sm text-slate-400">Ende nuk ka klientë.</p>
              )}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className="mb-4 font-semibold">Low Stock Warning</h3>

            <div className="space-y-4">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="rounded-xl border border-red-400/20 bg-red-500/10 p-4">
                  <div className="flex justify-between">
                    <p className="font-semibold">{p.name}</p>
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">
                      {p.stock} në stok
                    </span>
                  </div>
                </div>
              ))}

              {lowStockProducts.length === 0 && (
                <p className="text-sm text-emerald-400">Stoku është në rregull.</p>
              )}
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="mb-4 font-semibold">Recent Orders</h3>

          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="py-3">Klienti</th>
                <th className="py-3">Produkti</th>
                <th className="py-3">Fitimi</th>
                <th className="py-3">Statusi</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-white/10">
                  <td className="py-3">{o.customer_name}</td>
                  <td className="py-3 text-slate-300">{o.product_name}</td>
                  <td className="py-3 font-semibold text-emerald-400">
                    {((o.price - (o.buy_price || 0)) * o.quantity).toFixed(2)}€
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}