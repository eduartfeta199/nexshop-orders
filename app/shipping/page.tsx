'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabaseClient';

type OrderStatus =
  | 'pending'
  | 'shipped'
  | 'delivered';

type ShippingOrder = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  country: string;
  address: string;
  product_name: string;
  quantity: number;
  status: OrderStatus;
  tracking_code?: string;
};

export default function ShippingPage() {
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    setOrders((data as ShippingOrder[]) || []);
  };

  const updateStatus = async (
    id: string,
    status: OrderStatus
  ) => {
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    fetchOrders();
  };

  const updateTracking = async (
    id: string,
    tracking_code: string
  ) => {
    await supabase
      .from('orders')
      .update({ tracking_code })
      .eq('id', id);

    fetchOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      o.phone
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      o.city
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      o.product_name
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter(
    (o) => o.status === 'pending'
  ).length;

  const shippedCount = orders.filter(
    (o) => o.status === 'shipped'
  ).length;

  const deliveredCount = orders.filter(
    (o) => o.status === 'delivered'
  ).length;

  const cardClass =
    'rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl';

  return (
    <AppLayout>
      <div className="space-y-8 text-white">

        <div>
          <p className="text-sm text-blue-300">
            NexShop Shipping
          </p>

          <h1 className="text-3xl font-bold">
            Shipping
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Menaxho dërgesat dhe tracking.
          </p>
        </div>

        {/* TOP CARDS */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className={cardClass}>
            <p className="text-sm text-slate-400">
              Në pritje
            </p>

            <h2 className="mt-3 text-3xl font-bold text-yellow-300">
              {pendingCount}
            </h2>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-slate-400">
              Dërguar
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-300">
              {shippedCount}
            </h2>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-slate-400">
              Dorëzuar
            </p>

            <h2 className="mt-3 text-3xl font-bold text-emerald-400">
              {deliveredCount}
            </h2>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            placeholder="Kerko klient / telefon / qytet..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-white [&>option]:bg-slate-900 [&>option]:text-white"
          >
            <option value="all">
              Të gjitha
            </option>

            <option value="pending">
              Në pritje
            </option>

            <option value="shipped">
              Dërguar
            </option>

            <option value="delivered">
              Dorëzuar
            </option>
          </select>
        </div>

        {/* TABLE */}
        <div className={cardClass + ' overflow-auto'}>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                {[
                  'Klienti',
                  'Telefoni',
                  'Shteti',
                  'Qyteti',
                  'Produkti',
                  'Tracking',
                  'Statusi',
                ].map((h) => (
                  <th key={h} className="p-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-white/10"
                >
                  <td className="p-4 font-semibold">
                    {o.customer_name}
                  </td>

                  <td className="p-4 text-slate-300">
                    {o.phone}
                  </td>

                  <td className="p-4 text-slate-300">
                    {o.country}
                  </td>

                  <td className="p-4 text-slate-300">
                    {o.city}
                  </td>

                  <td className="p-4 text-slate-300">
                    {o.product_name} x{o.quantity}
                  </td>

                  <td className="p-4">
                    <input
                      defaultValue={
                        o.tracking_code || ''
                      }
                      placeholder="Tracking code"
                      onBlur={(e) =>
                        updateTracking(
                          o.id,
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-white/10 bg-slate-900/50 p-2 text-white"
                    />
                  </td>

                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        updateStatus(
                          o.id,
                          e.target
                            .value as OrderStatus
                        )
                      }
                      className={`rounded-xl border border-white/10 p-2 text-sm [&>option]:bg-slate-900 [&>option]:text-white ${
  o.status === 'pending'
    ? 'bg-yellow-500/20 text-yellow-300'
    : o.status === 'shipped'
    ? 'bg-blue-500/20 text-blue-300'
    : 'bg-emerald-500/20 text-emerald-300'
}`}
                    >
                      <option value="pending">
                        Në pritje
                      </option>

                      <option value="shipped">
                        Dërguar
                      </option>

                      <option value="delivered">
                        Dorëzuar
                      </option>
                    </select>
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