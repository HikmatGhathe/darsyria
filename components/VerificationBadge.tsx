import {useTranslations} from 'next-intl';
import type {VerificationStatus} from '@/lib/properties';

const styles: Record<VerificationStatus, string> = {
  verified: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  unverified: 'bg-gray-100 text-gray-700 border-gray-200'
};

const icons: Record<VerificationStatus, string> = {
  verified: '✓',
  pending: '⋯',
  unverified: '○'
};

export default function VerificationBadge({status}: {status: VerificationStatus}) {
  const t = useTranslations('Properties.verification');
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${styles[status]}`}
    >
      <span>{icons[status]}</span>
      <span>{t(status)}</span>
    </span>
  );
}
