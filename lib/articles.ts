export type Article = {
  slug: string;
  category: 'legal' | 'finance' | 'practical' | 'risks';
  title: {ar: string; de: string; en: string};
  excerpt: {ar: string; de: string; en: string};
  body: {ar: string; de: string; en: string};
  sources: {label: string; url?: string}[];
  publishedAt: string;
};

export const articles: Article[] = [
  {
    slug: 'foreign-ownership-syria',
    category: 'legal',
    title: {
      en: 'Can foreigners buy property in Syria?',
      de: 'Können Ausländer Immobilien in Syrien kaufen?',
      ar: 'هل يمكن للأجانب شراء عقارات في سوريا؟'
    },
    excerpt: {
      en: 'An overview of the legal framework for foreign ownership, Interior Ministry approval, and key restrictions.',
      de: 'Ein Überblick über den rechtlichen Rahmen für ausländisches Eigentum, die Genehmigung des Innenministeriums und wichtige Einschränkungen.',
      ar: 'نظرة عامة على الإطار القانوني لتملك الأجانب وموافقة وزارة الداخلية والقيود الرئيسية.'
    },
    body: {
      en: 'Foreign nationals wishing to purchase property in Syria must obtain prior approval from the Ministry of Interior. The process typically requires submitting personal documents, proof of legal source of funds, and a clear description of the intended property. Agricultural land is excluded from foreign ownership. Reciprocity requirements may apply depending on the buyer\'s country of citizenship. This is general information only and not legal advice — consult a qualified Syrian lawyer for your specific case.',
      de: 'Ausländische Staatsbürger, die Immobilien in Syrien kaufen möchten, benötigen die vorherige Genehmigung des Innenministeriums. Der Prozess erfordert in der Regel die Vorlage persönlicher Dokumente, einen Nachweis über die legale Herkunft der Mittel und eine klare Beschreibung der beabsichtigten Immobilie. Landwirtschaftliche Flächen sind vom ausländischen Eigentum ausgeschlossen. Je nach Staatsangehörigkeit des Käufers können Reziprozitätsanforderungen gelten. Dies sind allgemeine Informationen und keine Rechtsberatung — konsultieren Sie für Ihren konkreten Fall einen qualifizierten syrischen Anwalt.',
      ar: 'يجب على المواطنين الأجانب الراغبين في شراء عقارات في سوريا الحصول على موافقة مسبقة من وزارة الداخلية. تتطلب العملية عادةً تقديم وثائق شخصية وإثبات المصدر القانوني للأموال ووصف واضح للعقار المقصود. الأراضي الزراعية مستثناة من التملك الأجنبي. قد تنطبق متطلبات المعاملة بالمثل حسب جنسية المشتري. هذه معلومات عامة وليست استشارة قانونية — استشر محاميًا سوريًا مؤهلًا لحالتك المحددة.'
    },
    sources: [
      {label: 'Syrian Ministry of Interior — official guidance (placeholder)'},
      {label: 'Legislative Decree No. 11 of 2011 (placeholder)'}
    ],
    publishedAt: '2026-01-15'
  },
  {
    slug: 'property-fraud-risks',
    category: 'risks',
    title: {
      en: 'Property fraud risks in post-2024 Syria',
      de: 'Risiken durch Immobilienbetrug im Syrien nach 2024',
      ar: 'مخاطر الاحتيال العقاري في سوريا ما بعد 2024'
    },
    excerpt: {
      en: 'Thousands of property records were falsified during the previous regime. Here is what diaspora buyers should know.',
      de: 'Tausende von Grundstücksunterlagen wurden während des vorherigen Regimes gefälscht. Hier ist, was Käufer aus der Diaspora wissen sollten.',
      ar: 'تم تزوير آلاف السجلات العقارية خلال النظام السابق. إليك ما يجب أن يعرفه المشترون من المغتربين.'
    },
    body: {
      en: 'Between 2011 and 2024, a significant number of property records in Syria were altered, falsified, or transferred under coercion. A specialized property court is being established in 2026 to address these cases. Buyers should: verify ownership chain back at least 15 years, request original deeds and cross-check with the land registry, be cautious of properties belonging to displaced persons or families abroad, and use a lawyer not connected to the seller. Never transfer payment before independent verification.',
      de: 'Zwischen 2011 und 2024 wurde eine erhebliche Anzahl von Grundstücksunterlagen in Syrien geändert, gefälscht oder unter Zwang übertragen. Im Jahr 2026 wird ein spezialisiertes Immobiliengericht eingerichtet, um diese Fälle zu behandeln. Käufer sollten: die Eigentumskette mindestens 15 Jahre zurückverfolgen, Originalurkunden anfordern und mit dem Grundbuch abgleichen, vorsichtig sein bei Immobilien, die Vertriebenen oder im Ausland lebenden Familien gehören, und einen Anwalt einsetzen, der nicht mit dem Verkäufer verbunden ist. Niemals Zahlungen vor einer unabhängigen Überprüfung leisten.',
      ar: 'بين عامي 2011 و2024، تم تعديل أو تزوير أو نقل عدد كبير من السجلات العقارية في سوريا تحت الإكراه. يتم إنشاء محكمة عقارية متخصصة في عام 2026 لمعالجة هذه القضايا. يجب على المشترين: التحقق من سلسلة الملكية لمدة 15 عامًا على الأقل، طلب السندات الأصلية ومطابقتها مع السجل العقاري، الحذر من العقارات التي تخص النازحين أو العائلات في الخارج، واستخدام محامٍ غير مرتبط بالبائع. لا تحول الدفع أبدًا قبل التحقق المستقل.'
    },
    sources: [
      {label: 'Specialized Property Court announcement, 2026 (placeholder)'},
      {label: 'Independent legal research summary (placeholder)'}
    ],
    publishedAt: '2026-02-03'
  },
  {
    slug: 'banking-and-payments',
    category: 'finance',
    title: {
      en: 'Banking and payment options after sanctions lift',
      de: 'Bank- und Zahlungsoptionen nach Aufhebung der Sanktionen',
      ar: 'الخيارات المصرفية والدفع بعد رفع العقوبات'
    },
    excerpt: {
      en: 'With sanctions lifted in 2025, banking channels are reopening. Practical guidance for diaspora buyers.',
      de: 'Mit der Aufhebung der Sanktionen im Jahr 2025 öffnen sich die Bankkanäle wieder. Praktische Hinweise für Käufer aus der Diaspora.',
      ar: 'مع رفع العقوبات في عام 2025، تُعاد فتح القنوات المصرفية. إرشادات عملية للمشترين من المغتربين.'
    },
    body: {
      en: 'The 2025 lifting of international sanctions on Syria has gradually reopened banking channels, but the infrastructure is still being rebuilt. Currency volatility of the Syrian pound remains a significant factor — many transactions are conducted in USD or EUR. Diaspora buyers should: confirm with their European bank whether SWIFT transfers to Syria are processed, understand that local banks may have limited capacity for large transactions, document every payment for legal and tax purposes, and consider escrow services where available. This area is changing quickly; verify current status before transferring funds.',
      de: 'Die Aufhebung der internationalen Sanktionen gegen Syrien im Jahr 2025 hat die Bankkanäle schrittweise wieder geöffnet, aber die Infrastruktur wird noch aufgebaut. Die Volatilität der syrischen Pfund-Währung bleibt ein wichtiger Faktor — viele Transaktionen werden in USD oder EUR durchgeführt. Käufer aus der Diaspora sollten: bei ihrer europäischen Bank bestätigen, ob SWIFT-Überweisungen nach Syrien bearbeitet werden, verstehen, dass lokale Banken nur begrenzte Kapazitäten für große Transaktionen haben können, jede Zahlung für rechtliche und steuerliche Zwecke dokumentieren und Treuhanddienste in Anspruch nehmen, wo verfügbar. Dieser Bereich ändert sich schnell; überprüfen Sie den aktuellen Status, bevor Sie Geld überweisen.',
      ar: 'أدى رفع العقوبات الدولية على سوريا في عام 2025 إلى إعادة فتح القنوات المصرفية تدريجيًا، لكن البنية التحتية لا تزال قيد إعادة البناء. تظل تقلبات الليرة السورية عاملًا مهمًا — تتم العديد من المعاملات بالدولار الأمريكي أو اليورو. يجب على المشترين من المغتربين: التأكد من بنكهم الأوروبي ما إذا كانت تحويلات سويفت إلى سوريا تتم معالجتها، فهم أن البنوك المحلية قد يكون لديها قدرة محدودة على المعاملات الكبيرة، توثيق كل دفعة للأغراض القانونية والضريبية، والنظر في خدمات الضمان حيثما توفرت. هذا المجال يتغير بسرعة؛ تحقق من الوضع الحالي قبل تحويل الأموال.'
    },
    sources: [
      {label: 'EU sanctions update, 2025 (placeholder)'},
      {label: 'Central Bank of Syria — public statements (placeholder)'}
    ],
    publishedAt: '2026-02-20'
  }
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return articles;
}
