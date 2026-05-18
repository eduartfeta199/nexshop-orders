'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabaseClient';

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  country: string;
  quantity: number;
  price: number;
  buy_price: number;
};

type Customer = {
  name: string;
  phone: string;
  city: string;
  country: string;
  orders: number;
  revenue: number;
  profit: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('orders').select('*');

    const orders = (data as Order[]) || [];

    const grouped = Object.values(
      orders.reduce((acc: Record<string, Customer>, order) => {
        const key = order.customer_name;

        if (!acc[key]) {
          acc[key] = {
            name: order.customer_name,
            phone: order.phone,
            city: order.city,
            country: order.country,
            orders: 0,
            revenue: 0,
            profit: 0,
          };
        }

        acc[key].orders += 1;
        acc[key].revenue += order.price * order.quantity;
        acc[key].profit +=
          (order.price - (order.buy_price || 0)) *
          order.quantity;

        return acc;
      }, {})
    ).sort((a, b) => b.revenue - a.revenue);

    setCustomers(grouped);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce(
    (sum, c) => sum + c.revenue,
    0
  );

  const totalProfit = customers.reduce(
    (sum, c) => sum + c.profit,
    0
  );

  const cardClass =
    'rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl';

  return (
    <AppLayout>
      <div className="space-y-8 text-white">

        <div>
          <p className="text-sm text-blue-300">
            NexShop CRM
          </p>

          <h1 className="text-3xl font-bold">
            Customers
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Lista automatike e klientëve nga porositë.
          </p>
        </div>

        {/* TOP CARDS */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className={cardClass}>
            <p className="text-sm text-slate-400">
              Total Customers
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {customers.length}
            </h2>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-slate-400">
              Revenue
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {totalRevenue.toFixed(2)}€
            </h2>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-slate-400">
              Profit
            </p>

            <h2 className="mt-3 text-3xl font-bold text-emerald-400">
              {totalProfit.toFixed(2)}€
            </h2>
          </div>
        </div>

        {/* SEARCH */}
        <div className={cardClass}>
          <input
            placeholder="Kerko klient..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white"
          />
        </div>

        {/* TABLE */}
        <div className={cardClass + ' overflow-auto'}>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                {[
                  'Klienti',
                  'Telefoni',
                  'Qyteti',
                  'Shteti',
                  'Porositë',
                  'Revenue',
                  'Profit',
                ].map((h) => (
                  <th key={h} className="p-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((c) => (
                <tr
                  key={c.name}
                  className="border-t border-white/10"
                >
                  <td className="p-4 font-semibold">
                    {c.name}
                  </td>

                  <td className="p-4 text-slate-300">
                    {c.phone}
                  </td>

                  <td className="p-4 text-slate-300">
                    {c.city}
                  </td>

                  <td className="p-4 text-slate-300">
                    {c.country}
                  </td>

                  <td className="p-4">
                    {c.orders}
                  </td>

                  <td className="p-4">
                    {c.revenue.toFixed(2)}€
                  </td>

                  <td className="p-4 font-semibold text-emerald-400">
                    {c.profit.toFixed(2)}€
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