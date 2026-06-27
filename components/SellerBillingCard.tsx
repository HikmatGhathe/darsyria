'use client';

import {useEffect, useState} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {getMyInvoices, type Invoice} from '@/lib/billing';

// Shows the seller their invoices. Renders nothing if they have none (so the
// account page stays clean during the free period).
export default function SellerBillingCard() {
  const t = useTranslations('Billing');
  const locale = useLocale();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    getMyInvoices()
      .then(setInvoices)
      .catch(() => setInvoices([]));
  }, []);

  if (!invoices || invoices.length === 0) return null;

  const fmtDate = (s: string) => new Date(s).toLocaleDateString(locale);

  return (
    <section className="bg-surface-card border border-border-subtle rounded-xl p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-1">{t('title')}</h2>
      <p className="text-sm text-text-secondary mb-4">{t('howToPay')}</p>
      <ul className="divide-y divide-border-subtle">
        {invoices.map((inv) => (
          <li key={inv.id} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">
                {inv.amount} {inv.currency}
              </p>
              <p className="text-xs text-text-tertiary">
                {fmtDate(inv.created_at)}
                {inv.due_at && inv.status === 'unpaid' && ` · ${t('due', {date: fmtDate(inv.due_at)})}`}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                inv.status === 'paid'
                  ? 'bg-accent-verified/10 text-accent-verified'
                  : inv.status === 'void'
                    ? 'bg-surface-page text-text-tertiary'
                    : 'bg-accent-warning-bg text-accent-warning'
              }`}
            >
              {t(`status_${inv.status}`)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
