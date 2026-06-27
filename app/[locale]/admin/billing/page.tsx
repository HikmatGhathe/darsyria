'use client';

import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useTranslations, useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {useAuth} from '@/components/AuthProvider';
import {
  getBillingSettings,
  updateBillingSettings,
  getAdminInvoices,
  markInvoicePaid,
  voidInvoice,
  type BillingConfig,
  type AdminInvoiceItem
} from '@/lib/billing';

type StatusFilter = 'all' | 'unpaid' | 'paid' | 'void';

export default function AdminBillingPage() {
  const t = useTranslations('Admin.billing');
  const tAdmin = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const {user, isLoading} = useAuth();

  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('unpaid');
  const [invoices, setInvoices] = useState<AdminInvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push(`/${locale}/login?next=/admin/billing`);
  }, [isLoading, user, locale, router]);

  const loadInvoices = useCallback(async () => {
    if (!user?.is_admin) return;
    setLoading(true);
    setError(false);
    try {
      setInvoices(await getAdminInvoices(filter === 'all' ? undefined : filter));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (!user?.is_admin) return;
    getBillingSettings()
      .then((c) => {
        setConfig(c);
        setPrice(c.price_amount);
        setCurrency(c.price_currency);
      })
      .catch(() => setError(true));
  }, [user]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  async function savePrice() {
    setSaving(true);
    try {
      const c = await updateBillingSettings({price_amount: price, price_currency: currency});
      setConfig(c);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function togglePayment(next: boolean) {
    setSaving(true);
    try {
      const c = await updateBillingSettings({payment_required: next});
      setConfig(c);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function onMarkPaid(id: string) {
    await markInvoicePaid(id);
    loadInvoices();
  }
  async function onVoid(id: string) {
    await voidInvoice(id);
    loadInvoices();
  }

  if (isLoading) {
    return <main className="max-w-5xl mx-auto px-4 py-8 text-sm text-text-secondary">{tAdmin('loading')}</main>;
  }
  if (!user) return null;
  if (!user.is_admin) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{tAdmin('accessDenied')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-brand-navy hover:underline mb-2 inline-block">
        ← {tAdmin('backToDashboard')}
      </Link>
      <h1 className="text-2xl font-semibold text-text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-text-secondary mb-6">{t('subtitle')}</p>

      {/* Settings */}
      <section className="bg-surface-card border border-border-subtle rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="font-medium text-text-primary">{t('paymentRequired')}</p>
            <p className="text-xs text-text-tertiary">{t('paymentRequiredHelp')}</p>
          </div>
          <button
            onClick={() => togglePayment(!config?.payment_required)}
            disabled={saving || !config}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
              config?.payment_required
                ? 'bg-accent-verified text-white'
                : 'bg-surface-page border border-border-subtle text-text-secondary'
            }`}
          >
            {config?.payment_required ? t('paymentOn') : t('paymentOffFree')}
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-border-subtle">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">{t('price')}</label>
            <input
              type="number"
              min={1}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-32 px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">{t('currency')}</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-2 border border-border-subtle rounded-lg bg-surface-card text-text-primary"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="SYP">SYP</option>
            </select>
          </div>
          <button
            onClick={savePrice}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-brand-navy-hover disabled:opacity-50"
          >
            {t('savePrice')}
          </button>
        </div>
      </section>

      {/* Invoices */}
      <div className="flex gap-2 mb-4 border-b border-border-subtle">
        {(['unpaid', 'paid', 'void', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              filter === f
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-text-tertiary hover:text-text-primary'
            }`}
          >
            {t(`filter_${f}`)}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-accent-danger-bg border border-accent-danger/30 rounded-lg mb-4">
          <p className="text-sm text-accent-danger">{t('loadError')}</p>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-secondary">{tAdmin('loading')}</p>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-text-secondary">{t('emptyInvoices')}</p>
      ) : (
        <ul className="space-y-3">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="bg-surface-card border border-border-subtle rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-text-primary truncate">{inv.property_title}</p>
                <p className="text-xs text-text-tertiary truncate">
                  {inv.owner_email} · {inv.amount} {inv.currency} ·{' '}
                  <span
                    className={
                      inv.status === 'paid'
                        ? 'text-accent-verified'
                        : inv.status === 'void'
                          ? 'text-text-tertiary'
                          : 'text-accent-warning'
                    }
                  >
                    {t(`status_${inv.status}`)}
                  </span>
                </p>
              </div>
              {inv.status === 'unpaid' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onMarkPaid(inv.id)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-accent-verified rounded-lg hover:opacity-90"
                  >
                    {t('markPaid')}
                  </button>
                  <button
                    onClick={() => onVoid(inv.id)}
                    className="px-3 py-1.5 text-sm font-medium text-accent-danger border border-accent-danger/30 rounded-lg hover:bg-accent-danger-bg"
                  >
                    {t('void')}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
