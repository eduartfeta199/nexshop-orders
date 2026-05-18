'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

type OrderStatus = 'pending' | 'shipped' | 'delivered';

type Product = {
  id: number;
  name: string;
  price: number;
  buy_price: number;
  stock: number;
};

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  product_name: string;
  quantity: number;
  price: number;
  buy_price: number;
  country: string;
  status: OrderStatus;
  created_at?: string;
};

type OrderForm = Omit<Order, 'id'>;

const emptyOrder: OrderForm = {
  customer_name: '',
  phone: '',
  city: '',
  address: '',
  product_name: '',
  quantity: 1,
  price: 0,
  buy_price: 0,
  country: '',
  status: 'pending',
};

export default function OrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<OrderForm>(emptyOrder);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    setOrders((data as Order[]) || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    setProducts((data as Product[]) || []);
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const saveOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProduct = products.find(
      (p) => p.name === form.product_name
    );

    if (!selectedProduct) {
      toast.error('Produkti nuk u gjet');
      return;
    }

    if (editingId) {
      const oldOrder = orders.find((o) => o.id === editingId);

      if (!oldOrder) return;

      const oldProduct = products.find(
        (p) => p.name === oldOrder.product_name
      );

      if (!oldProduct) return;

      if (oldOrder.product_name === form.product_name) {
        const availableStock =
          selectedProduct.stock + oldOrder.quantity;

        if (availableStock < form.quantity) {
          toast.error('Nuk ka stok të mjaftueshëm');
          return;
        }

        await supabase
          .from('products')
          .update({
            stock: availableStock - form.quantity,
          })
          .eq('id', selectedProduct.id);
      } else {
        await supabase
          .from('products')
          .update({
            stock: oldProduct.stock + oldOrder.quantity,
          })
          .eq('id', oldProduct.id);

        await supabase
          .from('products')
          .update({
            stock: selectedProduct.stock - form.quantity,
          })
          .eq('id', selectedProduct.id);
      }

      await supabase
        .from('orders')
        .update({
          ...form,
          buy_price: selectedProduct.buy_price,
        })
        .eq('id', editingId);
    } else {
      if (selectedProduct.stock < form.quantity) {
        alert('Nuk ka stok të mjaftueshëm');
        return;
      }

      const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.user) {
  toast.error('Duhet të jesh logged in');
  return;
}

await supabase.from('orders').insert({
  ...form,
  buy_price: selectedProduct.buy_price,
  user_id: session.user.id,
});

toast.success('Porosia u shtua!');

      await supabase
        .from('products')
        .update({
          stock: selectedProduct.stock - form.quantity,
        })
        .eq('id', selectedProduct.id);
    }

    setForm(emptyOrder);
    setEditingId(null);

    fetchOrders();
    fetchProducts();

    toast.success(
  editingId
    ? 'Porosia u përditësua!'
    : 'Porosia u shtua!'
);
  };

  const deleteOrder = async (order: Order) => {
    const product = products.find(
      (p) => p.name === order.product_name
    );

    if (product) {
      await supabase
        .from('products')
        .update({
          stock: product.stock + order.quantity,
        })
        .eq('id', product.id);
    }

    await supabase
      .from('orders')
      .delete()
      .eq('id', order.id);

    fetchOrders();
    fetchProducts();
    toast.success('Porosia u fshi!');
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

  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.price * o.quantity,
    0
  );

  const totalProfit = orders.reduce(
    (sum, o) =>
      sum +
      ((o.price - (o.buy_price || 0)) * o.quantity),
    0
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      o.phone
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      o.product_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      o.city
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      o.status === statusFilter;

    let matchesDate = true;

    if (dateFilter !== 'all' && o.created_at) {
      const orderDate = new Date(o.created_at);
      const now = new Date();

      if (dateFilter === 'today') {
        matchesDate =
          orderDate.toDateString() ===
          now.toDateString();
      }

      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      }

      if (dateFilter === 'month') {
        matchesDate =
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDate
    );
  });

  const cardClass =
    'rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl';

  return (
    <div className="space-y-8 text-white">

      {/* TOP CARDS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        <div className={cardClass}>
          <p className="text-sm text-slate-400">
            Total Revenue
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            {totalRevenue.toFixed(2)}€
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-400">
            Total Profit
          </p>
          <h2 className="mt-3 text-3xl font-bold text-emerald-400">
            {totalProfit.toFixed(2)}€
          </h2>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={saveOrder}
        className={cardClass + ' grid gap-4 md:grid-cols-2 lg:grid-cols-4'}
      >
        <input
          placeholder="Emri klientit"
          value={form.customer_name}
          onChange={(e) =>
            setForm({
              ...form,
              customer_name: e.target.value,
            })
          }
 className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white [&>option]:bg-slate-900 [&>option]:text-white"        />

        <input
          placeholder="Telefoni"
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white [&>option]:bg-slate-900 [&>option]:text-white"        />

<input
  placeholder="Qyteti"
  value={form.city}
  onChange={(e) =>
    setForm({
      ...form,
      city: e.target.value,
    })
  }
  className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white"
/>

<select
  value={form.country}
  onChange={(e) =>
    setForm({
      ...form,
      country: e.target.value,
    })
  }
  className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white [&>option]:bg-slate-900 [&>option]:text-white"
>
  <option value="">Zgjedh shtetin</option>
  <option value="Kosovë">Kosovë</option>
  <option value="Shqipëri">Shqipëri</option>
  <option value="Maqedoni">Maqedoni</option>
</select>

<input
  placeholder="Adresa"
  value={form.address}
  onChange={(e) =>
    setForm({
      ...form,
      address: e.target.value,
    })
  }
  className="rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white"
/>

        <select
          value={form.product_name}
          onChange={(e) => {
            const selected = products.find(
              (p) => p.name === e.target.value
            );

            setForm({
              ...form,
              product_name: e.target.value,
              price: selected ? selected.price : 0,
              buy_price: selected
                ? selected.buy_price
                : 0,
            });
          }}
          className="rounded-xl border border-white/10 bg-slate-900/50 p-3"
        >
          <option value="">
            Zgjedh produktin
          </option>

          {products.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name} ({p.stock})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Sasia"
          value={form.quantity}
          onChange={(e) =>
            setForm({
              ...form,
              quantity: Number(e.target.value),
            })
          }
          className="rounded-xl border border-white/10 bg-slate-900/50 p-3"
        />

        <input
          type="number"
          placeholder="Çmimi"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: Number(e.target.value),
            })
          }
          className="rounded-xl border border-white/10 bg-slate-900/50 p-3"
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value as OrderStatus,
            })
          }
          className="rounded-xl border border-white/10 bg-slate-900/50 p-3"
        >
          <option value="pending">Në pritje</option>
          <option value="shipped">Dërguar</option>
          <option value="delivered">Dorëzuar</option>
        </select>

        <button className="rounded-xl bg-blue-600 p-3 font-semibold hover:bg-blue-500 lg:col-span-4">
          {editingId
            ? 'Përditëso porosinë'
            : 'Shto porosi'}
        </button>
      </form>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          placeholder="Kerko klient / telefon / produkt..."
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
className="rounded-xl border border-white/10 bg-white/5 p-3 text-white [&>option]:bg-slate-900 [&>option]:text-white"        >
          <option value="all">Te gjitha</option>
          <option value="pending">Në pritje</option>
          <option value="shipped">Dërguar</option>
          <option value="delivered">Dorëzuar</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(e.target.value)
          }
className="rounded-xl border border-white/10 bg-white/5 p-3 text-white [&>option]:bg-slate-900 [&>option]:text-white"        >
          <option value="all">Gjitha datat</option>
          <option value="today">Sot</option>
          <option value="week">7 ditët</option>
          <option value="month">Ky muaj</option>
        </select>
      </div>

      {/* TABLE */}
      <div className={cardClass + ' overflow-auto'}>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              {[
  'Klienti',
  'Shteti',
  'Produkti',
  'Sasia',
  'Fitimi',
  'Statusi',
  'Veprime',
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
                <td className="p-4">
  {o.customer_name}
</td>

<td className="p-4 text-slate-300">
  {o.country}
</td>

<td className="p-4 text-slate-300">
  {o.product_name}
</td>

                <td className="p-4">
                  {o.quantity}
                </td>

                <td className="p-4 font-semibold text-emerald-400">
                  {(
                    (o.price -
                      (o.buy_price || 0)) *
                    o.quantity
                  ).toFixed(2)}
                  €
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      o.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : o.status === 'shipped'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>

                <td className="space-x-3 p-4">
                  <button
                    className="text-blue-400 hover:text-blue-300"
                    onClick={() => {
                      setEditingId(o.id);
                      setForm({ ...o });
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() =>
                      deleteOrder(o)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
