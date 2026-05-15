export type StaticPageContent = {
  title: {ar: string; de: string; en: string};
  body: {ar: string; de: string; en: string};
};

export const staticPages: Record<string, StaticPageContent> = {
  about: {
    title: {
      en: 'About DarSyria',
      de: 'Über DarSyria',
      ar: 'عن دار سوريا'
    },
    body: {
      en: `DarSyria is a focused, trustworthy platform built to help the Syrian diaspora navigate real estate in post-2024 Syria.

Our mission is simple: make property in Syria findable, understandable, and approachable for the millions of Syrians living abroad — especially in Germany and across Europe.

We focus on real estate only. We are not an investment firm, a reconstruction agency, or a general news site. We do one thing: connect diaspora buyers with verified property opportunities, backed by clear information about the legal, financial, and practical realities of buying in Syria today.

What makes us different:
- Focused — only real estate, not general investment
- Trustworthy — manual verification of listings, sourced legal content, AI that admits its limits
- Diaspora-first — built for users abroad, in their languages
- Bilingual native — proper Arabic and German, not translation tool quality

The platform is in active development. Phase 1 launches the AI assistant and knowledge base; listings follow in Phase 2.`,
      de: `DarSyria ist eine fokussierte, vertrauenswürdige Plattform, die der syrischen Diaspora dabei helfen soll, sich auf dem Immobilienmarkt im Syrien nach 2024 zurechtzufinden.

Unser Ziel ist klar: Immobilien in Syrien für die Millionen von Syrern im Ausland — insbesondere in Deutschland und Europa — auffindbar, verständlich und zugänglich zu machen.

Wir konzentrieren uns ausschließlich auf Immobilien. Wir sind keine Investmentfirma, keine Wiederaufbauagentur und keine allgemeine Nachrichtenseite. Wir machen eine Sache: Wir verbinden Käufer aus der Diaspora mit geprüften Immobilienangeboten und liefern klare Informationen zu den rechtlichen, finanziellen und praktischen Realitäten beim Immobilienkauf in Syrien.

Was uns unterscheidet:
- Fokussiert — ausschließlich Immobilien, keine allgemeinen Investitionen
- Vertrauenswürdig — manuelle Verifizierung der Angebote, fundierte rechtliche Inhalte, KI, die ihre Grenzen offen kommuniziert
- Diaspora-orientiert — entwickelt für Nutzer im Ausland, in ihren Sprachen
- Echte Mehrsprachigkeit — natives Arabisch und Deutsch, keine Maschinenübersetzung

Die Plattform befindet sich in aktiver Entwicklung. Phase 1 startet mit dem KI-Assistenten und der Wissensdatenbank; die Immobilien folgen in Phase 2.`,
      ar: `دار سوريا منصة متخصصة وموثوقة مصممة لمساعدة المغتربين السوريين في التعامل مع العقارات في سوريا ما بعد 2024.

مهمتنا واضحة: جعل العقارات في سوريا قابلة للاكتشاف والفهم والوصول لملايين السوريين الذين يعيشون في الخارج — وخاصة في ألمانيا وأوروبا.

نحن نركز على العقارات فقط. لسنا شركة استثمار ولا وكالة إعادة إعمار ولا موقع أخبار عام. نقوم بشيء واحد: ربط المشترين من المغتربين بفرص عقارية موثقة، مدعومة بمعلومات واضحة حول الواقع القانوني والمالي والعملي للشراء في سوريا اليوم.

ما يميزنا:
- التخصص — العقارات فقط، لا استثمارات عامة
- الثقة — تحقق يدوي من العقارات المعروضة، محتوى قانوني من مصادر موثوقة، ذكاء اصطناعي يعترف بحدوده
- توجه نحو المغتربين — مبنية للمستخدمين في الخارج، بلغاتهم
- تعدد لغات أصيل — عربية وألمانية حقيقية، ليست ترجمة آلية

المنصة في طور التطوير النشط. تطلق المرحلة الأولى المساعد الذكي وقاعدة المعرفة؛ تليها العقارات في المرحلة الثانية.`
    }
  },
  contact: {
    title: {
      en: 'Contact',
      de: 'Kontakt',
      ar: 'تواصل معنا'
    },
    body: {
      en: `For questions, feedback, or partnership inquiries, please reach out.

Email: contact@darsyria.com

We aim to respond within 2 working days. For urgent listing-related issues, please mention "URGENT" in the subject line.

DarSyria is an independent platform and is not affiliated with any government body, real estate agency, or political organization.`,
      de: `Für Fragen, Feedback oder Partnerschaftsanfragen kontaktieren Sie uns bitte.

E-Mail: contact@darsyria.com

Wir bemühen uns, innerhalb von 2 Werktagen zu antworten. Bei dringenden Fragen zu Immobilienangeboten verwenden Sie bitte "DRINGEND" im Betreff.

DarSyria ist eine unabhängige Plattform und steht in keiner Verbindung zu Regierungsstellen, Immobilienagenturen oder politischen Organisationen.`,
      ar: `للأسئلة أو الملاحظات أو استفسارات الشراكة، يرجى التواصل معنا.

البريد الإلكتروني: contact@darsyria.com

نحن نسعى للرد خلال يومي عمل. للقضايا العاجلة المتعلقة بالعقارات، يرجى ذكر "عاجل" في عنوان الرسالة.

دار سوريا منصة مستقلة وغير منتسبة لأي جهة حكومية أو وكالة عقارية أو منظمة سياسية.`
    }
  },
  terms: {
    title: {
      en: 'Terms of Service',
      de: 'Nutzungsbedingungen',
      ar: 'شروط الاستخدام'
    },
    body: {
      en: `Last updated: 2026

By using DarSyria, you agree to these terms.

1. Platform purpose
DarSyria connects users with information and property listings related to real estate in Syria. We do not buy, sell, or broker property ourselves.

2. No legal or financial advice
Content on this platform is informational only. It does not constitute legal, financial, tax, or investment advice. Always consult qualified professionals before any transaction.

3. Listings
Property listings are submitted by third parties. While we operate a verification process, we cannot guarantee the accuracy of any listing or the legal status of any property. Independent verification by a qualified Syrian lawyer is required before any transaction.

4. User responsibilities
Users must provide accurate information. Fraudulent listings or misrepresentation will result in account termination.

5. Limitation of liability
DarSyria is not liable for losses arising from transactions between users, errors in third-party content, or reliance on AI-generated responses.

6. Changes
We may update these terms. Continued use of the platform constitutes acceptance of any changes.

Note: This is a placeholder. A qualified lawyer must review and finalize these terms before public launch.`,
      de: `Zuletzt aktualisiert: 2026

Mit der Nutzung von DarSyria erklären Sie sich mit diesen Bedingungen einverstanden.

1. Zweck der Plattform
DarSyria verbindet Nutzer mit Informationen und Immobilienangeboten in Syrien. Wir kaufen, verkaufen oder vermitteln selbst keine Immobilien.

2. Keine Rechts- oder Finanzberatung
Inhalte auf dieser Plattform dienen ausschließlich der Information. Sie stellen keine rechtliche, finanzielle, steuerliche oder Anlageberatung dar. Konsultieren Sie immer qualifizierte Fachleute vor jeder Transaktion.

3. Anzeigen
Immobilienangebote werden von Dritten eingereicht. Obwohl wir einen Verifizierungsprozess durchführen, können wir die Richtigkeit von Angeboten oder den rechtlichen Status einer Immobilie nicht garantieren. Eine unabhängige Prüfung durch einen qualifizierten syrischen Anwalt ist vor jeder Transaktion erforderlich.

4. Pflichten der Nutzer
Nutzer müssen genaue Informationen bereitstellen. Betrügerische Angebote oder Falschdarstellungen führen zur Kontosperrung.

5. Haftungsbeschränkung
DarSyria haftet nicht für Verluste aus Transaktionen zwischen Nutzern, Fehler in Inhalten Dritter oder das Vertrauen auf KI-generierte Antworten.

6. Änderungen
Wir können diese Bedingungen aktualisieren. Die fortgesetzte Nutzung der Plattform gilt als Annahme von Änderungen.

Hinweis: Dies ist ein Platzhalter. Ein qualifizierter Anwalt muss diese Bedingungen vor dem öffentlichen Start prüfen und finalisieren.`,
      ar: `آخر تحديث: 2026

باستخدامك لدار سوريا، فإنك توافق على هذه الشروط.

١. غرض المنصة
تربط دار سوريا المستخدمين بالمعلومات والعقارات المعروضة في سوريا. نحن لا نشتري أو نبيع أو نتوسط في العقارات بأنفسنا.

٢. لا استشارات قانونية أو مالية
المحتوى على هذه المنصة لأغراض إعلامية فقط. لا يشكل استشارة قانونية أو مالية أو ضريبية أو استثمارية. استشر دائمًا متخصصين مؤهلين قبل أي معاملة.

٣. العقارات المعروضة
تُقدم العقارات المعروضة من قبل أطراف ثالثة. على الرغم من تشغيلنا لعملية التحقق، لا يمكننا ضمان دقة أي عقار معروض أو الوضع القانوني لأي عقار. التحقق المستقل من قبل محامٍ سوري مؤهل مطلوب قبل أي معاملة.

٤. مسؤوليات المستخدم
يجب على المستخدمين تقديم معلومات دقيقة. ستؤدي العقارات الاحتيالية أو التحريف إلى إنهاء الحساب.

٥. حدود المسؤولية
دار سوريا غير مسؤولة عن الخسائر الناجمة عن المعاملات بين المستخدمين أو الأخطاء في محتوى الأطراف الثالثة أو الاعتماد على الردود التي يولدها الذكاء الاصطناعي.

٦. التغييرات
قد نقوم بتحديث هذه الشروط. الاستخدام المستمر للمنصة يشكل قبولًا لأي تغييرات.

ملاحظة: هذا نص مؤقت. يجب على محامٍ مؤهل مراجعة هذه الشروط ووضع صيغتها النهائية قبل الإطلاق العام.`
    }
  },
  privacy: {
    title: {
      en: 'Privacy Policy',
      de: 'Datenschutzerklärung',
      ar: 'سياسة الخصوصية'
    },
    body: {
      en: `Last updated: 2026

DarSyria respects your privacy. This policy explains what data we collect and how we use it.

1. Data we collect
- Account data: email, name, language preference
- Listings data: property details and images you submit
- Usage data: pages visited, AI chat history (to improve the service)
- Technical data: IP address, browser type (for security and analytics)

2. How we use it
- To operate and improve the platform
- To verify listings and prevent fraud
- To communicate with you about your account or listings
- To improve the AI assistant (chat logs are anonymized)

3. Sharing
We do not sell your data. We share it only with service providers necessary to operate the platform (hosting, email delivery) and only when legally required.

4. Your rights (under GDPR)
You can request access, correction, or deletion of your data at any time. Email: privacy@darsyria.com

5. Cookies
We use essential cookies for authentication and basic functionality. Analytics cookies are optional and require your consent.

Note: This is a placeholder. Final privacy policy must comply with GDPR and be reviewed by a qualified lawyer before public launch.`,
      de: `Zuletzt aktualisiert: 2026

DarSyria respektiert Ihre Privatsphäre. Diese Richtlinie erläutert, welche Daten wir erfassen und wie wir sie verwenden.

1. Erfasste Daten
- Kontodaten: E-Mail, Name, Spracheinstellung
- Anzeigedaten: Immobilienangaben und Bilder, die Sie einreichen
- Nutzungsdaten: besuchte Seiten, KI-Chatverlauf (zur Verbesserung des Dienstes)
- Technische Daten: IP-Adresse, Browsertyp (für Sicherheit und Analyse)

2. Verwendung
- Zum Betrieb und zur Verbesserung der Plattform
- Zur Verifizierung von Anzeigen und Betrugsprävention
- Zur Kommunikation mit Ihnen über Ihr Konto oder Ihre Anzeigen
- Zur Verbesserung des KI-Assistenten (Chatprotokolle werden anonymisiert)

3. Weitergabe
Wir verkaufen Ihre Daten nicht. Wir geben sie nur an Dienstleister weiter, die zum Betrieb der Plattform erforderlich sind (Hosting, E-Mail-Zustellung), und nur, wenn dies gesetzlich vorgeschrieben ist.

4. Ihre Rechte (gemäß DSGVO)
Sie können jederzeit Zugang, Korrektur oder Löschung Ihrer Daten verlangen. E-Mail: privacy@darsyria.com

5. Cookies
Wir verwenden essenzielle Cookies für Authentifizierung und Grundfunktionen. Analyse-Cookies sind optional und erfordern Ihre Zustimmung.

Hinweis: Dies ist ein Platzhalter. Die endgültige Datenschutzerklärung muss DSGVO-konform sein und vor dem öffentlichen Start von einem qualifizierten Anwalt geprüft werden.`,
      ar: `آخر تحديث: 2026

تحترم دار سوريا خصوصيتك. توضح هذه السياسة البيانات التي نجمعها وكيفية استخدامها.

١. البيانات التي نجمعها
- بيانات الحساب: البريد الإلكتروني، الاسم، تفضيل اللغة
- بيانات العقارات: تفاصيل وصور العقارات التي تقدمها
- بيانات الاستخدام: الصفحات التي تتم زيارتها، سجل محادثات الذكاء الاصطناعي (لتحسين الخدمة)
- بيانات تقنية: عنوان IP، نوع المتصفح (للأمان والتحليلات)

٢. كيفية الاستخدام
- لتشغيل وتحسين المنصة
- للتحقق من العقارات ومنع الاحتيال
- للتواصل معك بشأن حسابك أو عقاراتك
- لتحسين المساعد الذكي (سجلات الدردشة مجهولة الهوية)

٣. المشاركة
نحن لا نبيع بياناتك. نشاركها فقط مع مزودي الخدمات الضروريين لتشغيل المنصة (الاستضافة، توصيل البريد الإلكتروني) وفقط عند الاقتضاء القانوني.

٤. حقوقك (بموجب اللائحة العامة لحماية البيانات)
يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها في أي وقت. البريد الإلكتروني: privacy@darsyria.com

٥. ملفات تعريف الارتباط
نستخدم ملفات تعريف الارتباط الأساسية للمصادقة والوظائف الأساسية. ملفات تعريف ارتباط التحليلات اختيارية وتتطلب موافقتك.

ملاحظة: هذا نص مؤقت. يجب أن تتوافق سياسة الخصوصية النهائية مع اللائحة العامة لحماية البيانات وأن يراجعها محامٍ مؤهل قبل الإطلاق العام.`
    }
  },
  disclaimer: {
    title: {
      en: 'Disclaimer',
      de: 'Haftungsausschluss',
      ar: 'إخلاء المسؤولية'
    },
    body: {
      en: `Important: read carefully before using this platform.

1. No legal advice
Content on DarSyria — articles, AI assistant responses, listing descriptions — is for general information only. It is not legal advice and does not create a lawyer-client relationship. Always consult a qualified Syrian lawyer for any real legal question.

2. AI assistant limitations
Our AI assistant can make mistakes. It may produce inaccurate, outdated, or incomplete information. Treat AI responses as a starting point for further research, never as a final authority.

3. Listing accuracy
Property listings are user-submitted. Our verification process is a good-faith effort, not a guarantee. Ownership documents, property condition, and legal status must be independently verified by a qualified lawyer and surveyor before any transaction.

4. Property fraud risk
Syria's property records were systematically falsified during the previous regime. Thousands of property disputes are pending. A specialized property court is being established in 2026. Buying property in Syria today carries real fraud risk. Take it seriously.

5. Currency and banking risk
The Syrian pound is volatile. Banking infrastructure is still being rebuilt. Sanctions policies may change. Conditions described in articles or listings may no longer be current.

6. No transaction handling
DarSyria does not process payments, hold funds in escrow, or transfer ownership. We are a discovery and information platform only.

By using DarSyria, you acknowledge these limitations and accept full responsibility for your own due diligence.`,
      de: `Wichtig: vor der Nutzung dieser Plattform sorgfältig lesen.

1. Keine Rechtsberatung
Inhalte auf DarSyria — Artikel, Antworten des KI-Assistenten, Anzeigenbeschreibungen — dienen nur der allgemeinen Information. Sie stellen keine Rechtsberatung dar und begründen kein Mandatsverhältnis. Konsultieren Sie für jede konkrete rechtliche Frage immer einen qualifizierten syrischen Anwalt.

2. Grenzen des KI-Assistenten
Unser KI-Assistent kann Fehler machen. Er kann ungenaue, veraltete oder unvollständige Informationen liefern. Behandeln Sie KI-Antworten als Ausgangspunkt für weitere Recherche, niemals als letzte Instanz.

3. Genauigkeit der Anzeigen
Immobilienangebote werden von Nutzern eingereicht. Unser Verifizierungsprozess ist ein bemühen nach bestem Wissen, keine Garantie. Eigentumsdokumente, Zustand der Immobilie und rechtlicher Status müssen vor jeder Transaktion unabhängig durch einen qualifizierten Anwalt und Gutachter überprüft werden.

4. Risiko von Immobilienbetrug
Syriens Grundstücksregister wurden während des vorherigen Regimes systematisch gefälscht. Tausende Immobilienstreitigkeiten sind anhängig. Ein spezialisiertes Immobiliengericht wird 2026 eingerichtet. Der Kauf einer Immobilie in Syrien birgt heute ein reales Betrugsrisiko. Nehmen Sie es ernst.

5. Währungs- und Bankenrisiken
Das syrische Pfund ist volatil. Die Bankinfrastruktur wird noch aufgebaut. Sanktionsrichtlinien können sich ändern. In Artikeln oder Anzeigen beschriebene Bedingungen sind möglicherweise nicht mehr aktuell.

6. Keine Transaktionsabwicklung
DarSyria wickelt keine Zahlungen ab, hält keine Treuhandgelder und überträgt kein Eigentum. Wir sind ausschließlich eine Entdeckungs- und Informationsplattform.

Mit der Nutzung von DarSyria erkennen Sie diese Einschränkungen an und übernehmen die volle Verantwortung für Ihre eigene Sorgfaltsprüfung.`,
      ar: `هام: اقرأ بعناية قبل استخدام هذه المنصة.

١. لا استشارات قانونية
المحتوى على دار سوريا — المقالات، ردود المساعد الذكي، أوصاف العقارات — للمعلومات العامة فقط. لا يشكل استشارة قانونية ولا ينشئ علاقة محامٍ-موكل. استشر دائمًا محاميًا سوريًا مؤهلًا لأي سؤال قانوني حقيقي.

٢. حدود المساعد الذكي
يمكن لمساعدنا الذكي أن يرتكب أخطاء. قد ينتج معلومات غير دقيقة أو قديمة أو غير كاملة. تعامل مع ردود الذكاء الاصطناعي كنقطة انطلاق لمزيد من البحث، وليس كمرجع نهائي.

٣. دقة العقارات المعروضة
يقدم المستخدمون العقارات المعروضة. عملية التحقق لدينا جهد بحسن نية، وليست ضمانًا. يجب التحقق من وثائق الملكية وحالة العقار والوضع القانوني بشكل مستقل من قبل محامٍ ومساح مؤهلين قبل أي معاملة.

٤. مخاطر الاحتيال العقاري
تم تزوير سجلات الملكية في سوريا بشكل ممنهج خلال النظام السابق. هناك آلاف النزاعات العقارية المعلقة. يتم إنشاء محكمة عقارية متخصصة في عام ٢٠٢٦. شراء عقار في سوريا اليوم يحمل مخاطر احتيال حقيقية. خذها على محمل الجد.

٥. مخاطر العملة والمصارف
الليرة السورية متقلبة. البنية التحتية المصرفية لا تزال قيد إعادة البناء. قد تتغير سياسات العقوبات. الظروف الموصوفة في المقالات أو العقارات قد لا تكون حالية بعد الآن.

٦. لا معالجة للمعاملات
دار سوريا لا تعالج المدفوعات ولا تحتفظ بأموال في الضمان ولا تنقل الملكية. نحن منصة اكتشاف ومعلومات فقط.

باستخدامك لدار سوريا، فإنك تقر بهذه القيود وتتحمل المسؤولية الكاملة عن العناية الواجبة الخاصة بك.`
    }
  }
};

export function getStaticPage(slug: string): StaticPageContent | undefined {
  return staticPages[slug];
}

export function getAllStaticPageSlugs(): string[] {
  return Object.keys(staticPages);
}
