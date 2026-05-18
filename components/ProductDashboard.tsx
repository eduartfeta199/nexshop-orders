'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

type Product = {
  id: number;
  name: string;
  buy_price: number;
  price: number;
  stock: number;
  status: string;
};

const emptyProduct = {
  name: '',
  buy_price: 0,
  price: 0,
  stock: 0,
  status: 'active',
};

export default function ProductDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    setProducts((data as Product[]) || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.user) {
  toast.error('Duhet të jesh logged in');
  return;
}

if (editingId) {
  await supabase
    .from('products')
    .update(form)
    .eq('id', editingId);

  toast.success('Produkti u përditësua!');
} else {
  await supabase.from('products').insert({
    ...form,
    user_id: session.user.id,
  });

  toast.success('Produkti u shtua!');
}

    setForm(emptyProduct);
    setEditingId(null);
    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
    toast.success('Produkti u fshi!');
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalPotentialProfit = products.reduce((sum, p) => sum + (p.price - p.buy_price) * p.stock, 0);
  const lowStock = products.filter((p) => p.stock <= 3).length;

  const cardClass = 'rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl';
  const inputClass = 'rounded-xl border border-white/10 bg-slate-900/50 p-3 w-full text-white placeholder:text-slate-500';

  return (
    <div className="space-y-8 text-white">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={cardClass}>
          <p className="text-sm text-slate-400">Total Products</p>
          <h2 className="mt-3 text-3xl font-bold">{products.length}</h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-400">Total Stock</p>
          <h2 className="mt-3 text-3xl font-bold">{totalStock}</h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-slate-400">Potential Profit</p>
          <h2 className="mt-3 text-3xl font-bold text-emerald-400">
            {totalPotentialProfit.toFixed(2)}€
          </h2>
        </div>
      </div>

      {lowStock > 0 && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-200">
          Kujdes: {lowStock} produkt/e kanë stok të ulët.
        </div>
      )}

      <form onSubmit={saveProduct} className={cardClass + ' grid gap-4 md:grid-cols-2 lg:grid-cols-5'}>
        <div>
          <label className="text-sm text-slate-300">Emri i produktit</label>
          <input
            placeholder="p.sh AirPods"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass + ' mt-1'}
            required
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Çmimi i blerjes</label>
          <input
            type="number"
            placeholder="p.sh 5€"
            value={form.buy_price}
            onChange={(e) => setForm({ ...form, buy_price: Number(e.target.value) })}
            className={inputClass + ' mt-1'}
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Çmimi i shitjes</label>
          <input
            type="number"
            placeholder="p.sh 12€"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className={inputClass + ' mt-1'}
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Sasia në stok</label>
          <input
            type="number"
            placeholder="p.sh 20 copë"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className={inputClass + ' mt-1'}
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Statusi</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={inputClass + ' mt-1'}
          >
            <option value="active">Aktiv</option>
            <option value="inactive">Jo aktiv</option>
          </select>
        </div>

        <button className="rounded-xl bg-blue-600 p-3 font-semibold hover:bg-blue-500 lg:col-span-5">
          {editingId ? 'Përditëso produktin' : 'Shto produkt'}
        </button>
      </form>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          placeholder="Kerko produkt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-slate-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 p-3 text-white"
        >
          <option value="all">Të gjitha</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Jo aktiv</option>
        </select>
      </div>

      <div className={cardClass + ' overflow-auto'}>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400">
            <tr>
              {['Produkti','Blerje','Shitje','Fitimi/copë','Stoku','Statusi','Veprime'].map((h) => (
                <th key={h} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-slate-300">{p.buy_price}€</td>
                <td className="p-4 text-slate-300">{p.price}€</td>
                <td className="p-4 font-semibold text-emerald-400">
                  {(p.price - p.buy_price).toFixed(2)}€
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    p.stock <= 3
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs ${
                    p.status === 'active'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {p.status === 'active' ? 'Aktiv' : 'Jo aktiv'}
                  </span>
                </td>
                <td className="space-x-3 p-4">
                  <button className="text-blue-400 hover:text-blue-300" onClick={() => { setEditingId(p.id); setForm(p); }}>
                    Edit
                  </button>
                  <button className="text-red-400 hover:text-red-300" onClick={() => deleteProduct(p.id)}>
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
