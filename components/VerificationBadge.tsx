import {useTranslations} from 'next-intl';

type Props = {
  // The listing's own ownership-verification status (individual sellers).
  verificationStatus: string;
  // The owner's account type + their company verification (companies).
  sellerAccountType: string | null;
  sellerVerificationStatus: string | null;
  className?: string;
};

/**
 * The two badges assert different, non-interchangeable things:
 * - "Verified company"  — the business behind the listing was checked.
 * - "Ownership verified" — ownership documents for THIS listing were checked.
 * A company listing shows the company badge (it takes precedence); an
 * individual's listing shows the ownership badge only once approved. Anything
 * unverified shows nothing — we never imply verification we didn't do.
 */
export default function VerificationBadge({
  verificationStatus,
  sellerAccountType,
  sellerVerificationStatus,
  className
}: Props) {
  const t = useTranslations('Properties.verification');

  const isCompany =
    sellerAccountType === 'company' && sellerVerificationStatus === 'verified';
  const isOwnership = verificationStatus === 'verified';

  if (!isCompany && !isOwnership) return null;

  const label = isCompany ? t('verifiedCompany') : t('ownershipVerified');
  const tip = isCompany ? t('verifiedCompanyTooltip') : t('ownershipVerifiedTooltip');

  return (
    <span
      title={tip}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-white bg-accent-verified rounded-full ${className ?? ''}`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {label}
    </span>
  );
}
