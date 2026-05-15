import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">DarSyria</h3>
            <p className="text-sm text-gray-600">{t('tagline')}</p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {t('sections.platform')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/properties" className="hover:text-gray-900">{t('links.properties')}</Link></li>
              <li><Link href="/assistant" className="hover:text-gray-900">{t('links.aiAssistant')}</Link></li>
              <li><Link href="/knowledge" className="hover:text-gray-900">{t('links.knowledgeBase')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {t('sections.resources')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-gray-900">{t('links.about')}</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900">{t('links.contact')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {t('sections.legal')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/terms" className="hover:text-gray-900">{t('links.terms')}</Link></li>
              <li><Link href="/privacy" className="hover:text-gray-900">{t('links.privacy')}</Link></li>
              <li><Link href="/disclaimer" className="hover:text-gray-900">{t('links.disclaimer')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {t('disclaimer')}
          </p>
          <p className="text-xs text-gray-500">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
