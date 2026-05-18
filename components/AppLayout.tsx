'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push('/login');
        return;
      }

      setChecking(false);
    };

    checkSession();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Orders', href: '/orders' },
    { name: 'Products', href: '/products' },
    { name: 'Customers', href: '/customers' },
    { name: 'Finance', href: '/finance' },
    { name: 'Shipping', href: '/shipping' },
    { name: 'Meta', href: '/meta' },
    { name: 'Settings', href: '/settings' },
  ];

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <aside className="w-64 p-6 flex flex-col justify-between bg-slate-900/70 backdrop-blur-xl border-r border-slate-700">
        <div>
          <h1 className="text-2xl font-bold mb-8 tracking-wide">
            Nex<span className="text-blue-500">Shop</span>
          </h1>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 shadow-lg shadow-blue-500/30'
                      : 'opacity-70 hover:opacity-100 hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-10 w-full bg-red-500/80 hover:bg-red-500 transition p-2 rounded-lg"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 bg-slate-900/40 backdrop-blur-xl">
        {children}
      </main>
    </div>
  );
}