import { useState } from 'react';
import { Settings, Save, Store, Globe, Bell, Shield } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';
import Button from '../../components/ui/Button';

export default function AdminSettings() {
  const toast = useToastStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    store_name: 'Nova',
    store_email: 'admin@nova-store.com',
    store_currency: 'USD',
    store_phone: '',
    low_stock_threshold: '5',
    order_prefix: 'NV-',
    tax_rate: '8',
    free_shipping_threshold: '100',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Settings saved successfully.');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Settings</h2>
        <p className="mt-1 text-sm text-zinc-500">Configure your store settings and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="space-y-1">
          {[
            { icon: Store, label: 'General', id: 'general' },
            { icon: Globe, label: 'Shipping', id: 'shipping' },
            { icon: Bell, label: 'Notifications', id: 'notifications' },
            { icon: Shield, label: 'Security', id: 'security' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold bg-zinc-900 text-white shadow">
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <form onSubmit={save} className="card space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Store Name">
              <input className="input" value={form.store_name} onChange={set('store_name')} />
            </Field>
            <Field label="Store Email">
              <input type="email" className="input" value={form.store_email} onChange={set('store_email')} />
            </Field>
            <Field label="Currency">
              <select className="input" value={form.store_currency} onChange={set('store_currency')}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </Field>
            <Field label="Phone">
              <input className="input" value={form.store_phone} onChange={set('store_phone')} placeholder="+1 (555) 000-0000" />
            </Field>
            <Field label="Order Prefix">
              <input className="input" value={form.order_prefix} onChange={set('order_prefix')} />
            </Field>
            <Field label="Low Stock Threshold">
              <input type="number" min="0" className="input" value={form.low_stock_threshold} onChange={set('low_stock_threshold')} />
            </Field>
            <Field label="Tax Rate (%)">
              <input type="number" step="0.01" min="0" max="100" className="input" value={form.tax_rate} onChange={set('tax_rate')} />
            </Field>
            <Field label="Free Shipping Threshold ($)">
              <input type="number" step="0.01" min="0" className="input" value={form.free_shipping_threshold} onChange={set('free_shipping_threshold')} />
            </Field>
          </div>

          <div className="flex justify-end border-t border-zinc-100 pt-5">
            <Button type="submit" variant="primary" loading={saving} icon={Save}>Save Settings</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
