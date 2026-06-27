import {apiRequest, API_BASE_URL} from './api';

// ── Static mock data types (used by the existing browse/detail pages) ──────────

export type PropertyType = 'apartment' | 'house' | 'land' | 'commercial';
export type PropertyStatus = 'for_sale' | 'for_rent';
export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type StaticProperty = {
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

const staticProperties: StaticProperty[] = [
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

export function getAllProperties(): StaticProperty[] {
  return staticProperties;
}

export function getPropertyBySlug(slug: string): StaticProperty | undefined {
  return staticProperties.find((p) => p.slug === slug);
}

// ── API types and helpers (used by the new create/list/detail flow) ───────────

export type PropertyCreateInput = {
  title: string;
  description: string;
  governorate: string;
  city: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  price_amount: number;
  price_currency: 'USD' | 'EUR' | 'SYP';
  property_type: 'apartment' | 'house' | 'land' | 'commercial';
  rooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  document_status: 'none' | 'claimed' | 'documents_provided';
};

export type PropertyImage = {
  id: string;
  property_id: string;
  public_url: string;
  original_filename: string | null;
  size_bytes: number;
  position: number;
  created_at: string;
};

// API single-property response
export type ApiProperty = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  country: string;
  governorate: string | null;
  city: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  price_amount: string;
  price_currency: string;
  property_type: string;
  rooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  status: string;
  document_status: string;
  verification_status: string;
  verification_rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  seller_display_name: string | null;
  seller_account_type: string | null;
  seller_verification_status: string | null;
};

// API list-view response (less data)
export type ApiPropertyListItem = {
  id: string;
  owner_id: string;
  title: string;
  governorate: string | null;
  city: string;
  neighborhood: string | null;
  price_amount: string;
  price_currency: string;
  property_type: string;
  rooms: number | null;
  area_sqm: number | null;
  document_status: string;
  verification_status: string;
  created_at: string;
  cover_image_url: string | null;
  seller_display_name: string | null;
  seller_account_type: string | null;
  seller_verification_status: string | null;
};

export type PropertySort = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export type PropertyFilters = {
  governorate?: string;
  city?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  rooms?: number;
  seller?: string;
  sort?: PropertySort;
  limit?: number;
  offset?: number;
};

export async function createProperty(input: PropertyCreateInput): Promise<ApiProperty> {
  return apiRequest<ApiProperty>('/properties', {
    method: 'POST',
    body: input,
    authenticated: true
  });
}

export async function listProperties(filters: PropertyFilters = {}): Promise<ApiPropertyListItem[]> {
  const params = new URLSearchParams();
  if (filters.governorate) params.set('governorate', filters.governorate);
  if (filters.city) params.set('city', filters.city);
  if (filters.property_type) params.set('property_type', filters.property_type);
  if (filters.min_price !== undefined) params.set('min_price', String(filters.min_price));
  if (filters.max_price !== undefined) params.set('max_price', String(filters.max_price));
  if (filters.rooms !== undefined) params.set('rooms', String(filters.rooms));
  if (filters.seller) params.set('seller', filters.seller);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));

  const query = params.toString();
  const path = query ? `/properties?${query}` : '/properties';

  return apiRequest<ApiPropertyListItem[]>(path, {
    method: 'GET',
    authenticated: false
  });
}

// Owner's management view of their own listing (all statuses + invoice summary)
export type MyListingItem = {
  id: string;
  title: string;
  status: string;
  verification_status: string;
  governorate: string | null;
  city: string;
  price_amount: string;
  price_currency: string;
  created_at: string;
  published_at: string | null;
  cover_image_url: string | null;
  invoice_status: string | null;
  invoice_amount: string | null;
  invoice_currency: string | null;
};

export async function listMyProperties(): Promise<MyListingItem[]> {
  return apiRequest<MyListingItem[]>('/properties/mine', {
    method: 'GET',
    authenticated: true
  });
}

export async function getApiProperty(id: string): Promise<ApiProperty> {
  return apiRequest<ApiProperty>(`/properties/${id}`, {
    method: 'GET',
    authenticated: true
  });
}

export async function publishProperty(id: string): Promise<ApiProperty> {
  return apiRequest<ApiProperty>(`/properties/${id}/publish`, {
    method: 'POST',
    authenticated: true
  });
}

export async function unpublishProperty(id: string): Promise<ApiProperty> {
  return apiRequest<ApiProperty>(`/properties/${id}/unpublish`, {
    method: 'POST',
    authenticated: true
  });
}

export type PropertyUpdateInput = {
  title?: string;
  description?: string;
  governorate?: string;
  city?: string;
  neighborhood?: string;
  latitude?: number | null;
  longitude?: number | null;
  price_amount?: number;
  price_currency?: 'USD' | 'EUR' | 'SYP';
  property_type?: 'apartment' | 'house' | 'land' | 'commercial';
  rooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  document_status?: 'none' | 'claimed' | 'documents_provided';
};

export async function updateProperty(id: string, input: PropertyUpdateInput): Promise<ApiProperty> {
  return apiRequest<ApiProperty>(`/properties/${id}`, {
    method: 'PATCH',
    body: input,
    authenticated: true
  });
}

export async function deleteProperty(id: string): Promise<void> {
  await apiRequest<void>(`/properties/${id}`, {
    method: 'DELETE',
    authenticated: true
  });
}

// Convenience aliases used by detail/browse pages
export {getApiProperty as getProperty};
export type {ApiProperty as Property};
export type {ApiPropertyListItem as PropertyListItem};

// ── Image helpers ─────────────────────────────────────────────────────────────

export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<PropertyImage> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/properties/${propertyId}/images`);
    xhr.withCredentials = true;
    xhr.timeout = 60000;

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status === 201) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        let detail = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.detail) detail = body.detail;
        } catch {
          // keep generic message
        }
        reject(new Error(detail));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

export async function listPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  return apiRequest<PropertyImage[]>(`/properties/${propertyId}/images`, {
    method: 'GET',
    authenticated: false
  });
}

export async function deletePropertyImage(
  propertyId: string,
  imageId: string
): Promise<void> {
  await apiRequest<void>(`/properties/${propertyId}/images/${imageId}`, {
    method: 'DELETE',
    authenticated: true
  });
}

export async function reorderPropertyImages(
  propertyId: string,
  imageIds: string[]
): Promise<PropertyImage[]> {
  return apiRequest<PropertyImage[]>(`/properties/${propertyId}/images/reorder`, {
    method: 'PATCH',
    body: imageIds,
    authenticated: true
  });
}
