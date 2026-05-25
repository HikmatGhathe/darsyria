'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  adminListProperties,
  adminListUsers,
  type AdminPropertyListItem,
  type AdminUserListItem,
} from '@/lib/admin';

type Stats = {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  rejectedListings: number;
  flaggedListings: number;
  totalUsers: number;
  bannedUsers: number;
  adminUsers: number;
};

export default function AdminLandingPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Auth guard: redirect non-admins to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login?next=/admin`);
    }
  }, [isLoading, user, locale, router]);

  // Load stats once we know the user is an admin
  useEffect(() => {
    if (!user?.is_admin) return;
    let cancelled = false;

    async function load() {
      try {
        const [props, users] = await Promise.all([
          adminListProperties({ limit: 200 }),
          adminListUsers({ limit: 200 }),
        ]);
        if (cancelled) return;
        setStats(computeStats(props, users));
      } catch (err) {
        if (!cancelled) {
          console.error('Admin stats load failed:', err);
          setLoadError('Could not load admin stats.');
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  // Still checking auth
  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">{t('loading')}</p>
      </main>
    );
  }

  // Not signed in (redirect effect will fire, render nothing meanwhile)
  if (!user) return null;

  // Signed in but not admin
  if (!user.is_admin) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{t('accessDenied')}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('pageTitle')}</h1>
      <p className="text-sm text-gray-600 mb-8">{t('subtitle')}</p>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label={t('stats.totalListings')} value={stats.totalListings} />
          <StatCard label={t('stats.activeListings')} value={stats.activeListings} color="green" />
          <StatCard label={t('stats.draftListings')} value={stats.draftListings} />
          <StatCard
            label={t('stats.flaggedListings')}
            value={stats.flaggedListings}
            color={stats.flaggedListings > 0 ? 'amber' : 'gray'}
          />
          <StatCard label={t('stats.totalUsers')} value={stats.totalUsers} />
          <StatCard label={t('stats.adminUsers')} value={stats.adminUsers} color="blue" />
          <StatCard
            label={t('stats.bannedUsers')}
            value={stats.bannedUsers}
            color={stats.bannedUsers > 0 ? 'red' : 'gray'}
          />
          <StatCard label={t('stats.rejectedListings')} value={stats.rejectedListings} />
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-700">{loadError}</p>
        </div>
      )}

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard
          title={t('sections.listings')}
          description={t('sections.listingsDesc')}
          buttonLabel={t('sections.openListings')}
          href="/admin/listings"
        />
        <SectionCard
          title={t('sections.users')}
          description={t('sections.usersDesc')}
          buttonLabel={t('sections.openUsers')}
          href="/admin/users"
        />
      </div>
    </main>
  );
}

// ---------- Helpers ----------

function computeStats(
  properties: AdminPropertyListItem[],
  users: AdminUserListItem[]
): Stats {
  return {
    totalListings: properties.length,
    activeListings: properties.filter((p) => p.status === 'active').length,
    draftListings: properties.filter((p) => p.status === 'draft').length,
    rejectedListings: properties.filter((p) => p.status === 'rejected').length,
    flaggedListings: properties.filter((p) => p.flagged_at !== null).length,
    totalUsers: users.length,
    bannedUsers: users.filter((u) => !u.is_active).length,
    adminUsers: users.filter((u) => u.is_admin).length,
  };
}

function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string;
  value: number;
  color?: 'gray' | 'blue' | 'green' | 'amber' | 'red';
}) {
  const colorClasses = {
    gray: 'bg-white border-gray-200 text-gray-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };
  return (
    <div className={`px-4 py-3 border rounded-lg ${colorClasses[color]}`}>
      <p className="text-xs uppercase tracking-wide font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  buttonLabel,
  href,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
}) {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Link
        href={href}
        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
