'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

type Settings = {
  id: number;
  shop_name: string;
  currency: string;
  kosovo_shipping: number;
  albania_macedonia_shipping: number;
  user_id?: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      toast.error('Duhet të jesh logged in');
      return;
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', session.user.id)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      toast.error('Gabim gjatë leximit të settings');
      return;
    }

    if (data && data.length > 0) {
      setSettings(data[0] as Settings);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('settings')
      .insert({
        shop_name: 'NexShop',
        currency: 'EUR',
        kosovo_shipping: 0,
        albania_macedonia_shipping: 3,
        user_id: session.user.id,
      })
      .select();

    if (insertError) {
      toast.error('Settings nuk u krijuan');
      return;
    }

    if (inserted && inserted.length > 0) {
      setSettings(inserted[0] as Settings);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      toast.error('Duhet të jesh logged in');
      return;
    }

    const { error } = await supabase
      .from('settings')
      .update({
        shop_name: settings.shop_name,
        currency: settings.currency,
        kosovo_shipping: settings.kosovo_shipping,
        albania_macedonia_shipping: settings.albania_macedonia_shipping,
      })
      .eq('id', settings.id)
      .eq('user_id', session.user.id);

    if (error) {
      toast.error('Settings nuk u ruajtën');
      return;
    }

    toast.success('Settings u ruajtën!');
    fetchSettings();
  };

  if (!settings) {
    return (
      <AppLayout>
        <p className="text-white">Loading settings...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 text-white">
        <div>
          <p className="text-sm text-blue-300">NexShop Settings</p>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-slate-400">
            Menaxho konfigurimet kryesore të shop-it.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="mb-6 text-xl font-semibold">Store Settings</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Shop Name</label>
              <input
                value={settings.shop_name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shop_name: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    currency: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white [&>option]:bg-slate-900"
              >
                <option value="EUR">EUR (€)</option>
                <option value="MKD">MKD</option>
                <option value="ALL">ALL</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Kosovo Shipping</label>
              <input
                type="number"
                value={settings.kosovo_shipping}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    kosovo_shipping: Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Albania / Macedonia Shipping
              </label>
              <input
                type="number"
                value={settings.albania_macedonia_shipping}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    albania_macedonia_shipping: Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/50 p-3 text-white"
              />
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            Save Settings
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="mb-2 text-xl font-semibold">Integrations</h2>
          <p className="text-sm text-slate-400">
            Meta, Speedposta dhe automatizimet do lidhen këtu më vonë.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}