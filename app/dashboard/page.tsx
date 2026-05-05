'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import OrderDashboard from '@/components/OrderDashboard';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login');
    });
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order Dashboard</h1>
          <button onClick={logout} className="bg-slate-900 text-white px-4 py-2 rounded-lg">Logout</button>
        </div>
        <OrderDashboard />
      </div>
    </main>
  );
}
