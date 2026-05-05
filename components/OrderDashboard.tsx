'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Order = {
  id: number;
  name: string;
  phone: string;
  city: string;
  address: string;
  product: string;
  quantity: number;
  price: number;
  country: string;
  status: 'pending' | 'shipped' | 'delivered';
};

const emptyOrder = { name: '', phone: '', city: '', address: '', product: '', quantity: 1, price: 0, country: '', status: 'pending' as const };

export default function OrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState(emptyOrder);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('id', { ascending: false });
    setOrders((data as Order[]) || []);
  };

  useEffect(() => { fetchOrders(); }, []);

  const saveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('orders').update(form).eq('id', editingId);
    } else {
      await supabase.from('orders').insert(form);
    }
    setForm(emptyOrder);
    setEditingId(null);
    fetchOrders();
  };

  const deleteOrder = async (id: number) => {
    await supabase.from('orders').delete().eq('id', id);
    fetchOrders();
  };

  const updateStatus = async (id: number, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={saveOrder} className="bg-white rounded-2xl shadow p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(form).map(([key, val]) => (
          key !== 'status' && <input key={key} type={typeof val === 'number' ? 'number' : 'text'} value={val} onChange={(e) => setForm((f) => ({ ...f, [key]: typeof val === 'number' ? Number(e.target.value) : e.target.value }))} placeholder={key} className="border rounded-lg p-2" required />
        ))}
        <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Order['status'] }))} className="border rounded-lg p-2">
          <option value="pending">pending</option><option value="shipped">shipped</option><option value="delivered">delivered</option>
        </select>
        <button className="bg-blue-600 text-white rounded-lg p-2 lg:col-span-4">{editingId ? 'Update Order' : 'Add Order'}</button>
      </form>

      <div className="bg-white rounded-2xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left"><tr>{['name','phone','city','address','product','quantity','price','country','status','actions'].map(h => <th key={h} className="p-3 capitalize">{h}</th>)}</tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.name}</td><td className="p-3">{o.phone}</td><td className="p-3">{o.city}</td><td className="p-3">{o.address}</td><td className="p-3">{o.product}</td><td className="p-3">{o.quantity}</td><td className="p-3">{o.price}</td><td className="p-3">{o.country}</td>
                <td className="p-3"><select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value as Order['status'])} className="border rounded p-1"><option value="pending">pending</option><option value="shipped">shipped</option><option value="delivered">delivered</option></select></td>
                <td className="p-3 space-x-2"><button className="text-blue-600" onClick={() => { setEditingId(o.id); setForm({ ...o }); }}>Edit</button><button className="text-red-600" onClick={() => deleteOrder(o.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
