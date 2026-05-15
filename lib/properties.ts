export type PropertyType = 'apartment' | 'house' | 'land' | 'commercial';
export type PropertyStatus = 'for_sale' | 'for_rent';
export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type Property = {
  id: string;
  slug: string;
  type: PropertyType;
  status: PropertyStatus;
  verification: VerificationStatus;
  title: {ar: string; de: string; en: string};
  description: {ar: string; de: string; en: string};
  city: string;
  neighborhood: string;
  priceUsd: number;
  areaSqm: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl: string;
  createdAt: string;
};

export const properties: Property[] = [
  {
    id: '1',
    slug: 'malki-3br-renovated',
    type: 'apartment',
    status: 'for_sale',
    verification: 'verified',
    title: {
      en: 'Renovated 3-bedroom apartment in Malki, Damascus',
      de: 'Renovierte 3-Zimmer-Wohnung in Malki, Damaskus',
      ar: 'شقة مجددة بثلاث غرف نوم في المالكي، دمشق'
    },
    description: {
      en: 'Fully renovated apartment in the upscale Malki district, close to embassies and international schools. Original parquet flooring restored, modern kitchen and bathrooms. Building has elevator and 24/7 generator. Title deed clean and verified.',
      de: 'Komplett renovierte Wohnung im gehobenen Stadtteil Malki, in der Nähe von Botschaften und internationalen Schulen. Original-Parkettboden restauriert, moderne Küche und Bäder. Gebäude hat Aufzug und 24/7-Generator. Eigentumsurkunde ist sauber und verifiziert.',
      ar: 'شقة مجددة بالكامل في حي المالكي الراقي، بالقرب من السفارات والمدارس الدولية. تم ترميم الباركيه الأصلي، مطبخ وحمامات حديثة. المبنى يحتوي على مصعد ومولد كهربائي يعمل ٢٤/٧. سند الملكية واضح وموثق.'
    },
    city: 'Damascus',
    neighborhood: 'Malki',
    priceUsd: 185000,
    areaSqm: 145,
    bedrooms: 3,
    bathrooms: 2,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    createdAt: '2026-03-10'
  },
  {
    id: '2',
    slug: 'aleppo-old-city-house',
    type: 'house',
    status: 'for_sale',
    verification: 'pending',
    title: {
      en: 'Traditional courtyard house in Old Aleppo (needs restoration)',
      de: 'Traditionelles Hofhaus in der Altstadt von Aleppo (renovierungsbedürftig)',
      ar: 'بيت عربي تقليدي بفناء في حلب القديمة (يحتاج للترميم)'
    },
    description: {
      en: 'Historic Arab-style courtyard house in the UNESCO-listed Old City. Partial war damage to upper floor; ground floor and courtyard intact. Ownership documents from pre-2011 available. Significant restoration project — for investors with patience and architectural vision.',
      de: 'Historisches arabisches Hofhaus in der UNESCO-Altstadt. Teilweise Kriegsschäden am Obergeschoss; Erdgeschoss und Hof intakt. Eigentumsdokumente aus der Zeit vor 2011 vorhanden. Bedeutendes Restaurierungsprojekt — für Investoren mit Geduld und architektonischer Vision.',
      ar: 'بيت عربي تاريخي بفناء في المدينة القديمة المدرجة في قائمة اليونسكو. أضرار جزئية من الحرب في الطابق العلوي؛ الطابق الأرضي والفناء سليمان. وثائق الملكية من قبل عام ٢٠١١ متوفرة. مشروع ترميم كبير — للمستثمرين الذين يتمتعون بالصبر والرؤية المعمارية.'
    },
    city: 'Aleppo',
    neighborhood: 'Old City',
    priceUsd: 65000,
    areaSqm: 220,
    bedrooms: 4,
    bathrooms: 1,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    createdAt: '2026-03-05'
  },
  {
    id: '3',
    slug: 'latakia-seaview-apartment',
    type: 'apartment',
    status: 'for_sale',
    verification: 'verified',
    title: {
      en: 'Sea-view 2-bedroom apartment, Latakia Corniche',
      de: '2-Zimmer-Wohnung mit Meerblick, Latakia Corniche',
      ar: 'شقة بإطلالة على البحر بغرفتي نوم، كورنيش اللاذقية'
    },
    description: {
      en: 'Bright apartment on the Latakia coastline with direct sea views. Modern building with parking. Walking distance to restaurants and the port. Excellent option for diaspora seasonal use or rental investment.',
      de: 'Helle Wohnung an der Küste von Latakia mit direktem Meerblick. Modernes Gebäude mit Parkplatz. Fußläufig zu Restaurants und zum Hafen. Ausgezeichnete Option für saisonale Nutzung durch die Diaspora oder als Mietinvestition.',
      ar: 'شقة مشرقة على ساحل اللاذقية بإطلالة مباشرة على البحر. مبنى حديث مع موقف سيارات. على بعد مسافة قصيرة سيراً إلى المطاعم والميناء. خيار ممتاز للاستخدام الموسمي للمغتربين أو الاستثمار التأجيري.'
    },
    city: 'Latakia',
    neighborhood: 'Corniche',
    priceUsd: 95000,
    areaSqm: 110,
    bedrooms: 2,
    bathrooms: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    createdAt: '2026-03-12'
  },
  {
    id: '4',
    slug: 'homs-commercial-plot',
    type: 'land',
    status: 'for_sale',
    verification: 'pending',
    title: {
      en: 'Commercial plot near Homs city center',
      de: 'Gewerbegrundstück nahe Stadtzentrum Homs',
      ar: 'قطعة أرض تجارية بالقرب من وسط مدينة حمص'
    },
    description: {
      en: '450 sqm zoned commercial plot suitable for retail or mixed-use development. Documentation is being reviewed by the verification team. Reconstruction activity in this area is increasing significantly.',
      de: '450 m² als Gewerbegebiet ausgewiesenes Grundstück, geeignet für Einzelhandel oder Mischnutzung. Dokumentation wird derzeit vom Verifizierungsteam geprüft. Wiederaufbauaktivität in diesem Gebiet nimmt deutlich zu.',
      ar: 'قطعة أرض تجارية مساحتها ٤٥٠ متر مربع مناسبة للتجارة أو التطوير متعدد الاستخدامات. الوثائق قيد المراجعة من قبل فريق التحقق. نشاط إعادة الإعمار في هذه المنطقة يتزايد بشكل ملحوظ.'
    },
    city: 'Homs',
    neighborhood: 'City Center',
    priceUsd: 48000,
    areaSqm: 450,
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    createdAt: '2026-02-28'
  }
];

export function getAllProperties(): Property[] {
  return properties;
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}
