// Syria's 14 governorates. Keys match the backend's GOVERNORATE_KEYS; labels
// live in i18n (Governorates.<key>). Centroids are approximate, used as the
// "general area" map center for listings without a dropped pin.

export const GOVERNORATE_KEYS = [
  'damascus',
  'rif-dimashq',
  'aleppo',
  'homs',
  'hama',
  'latakia',
  'tartus',
  'idlib',
  'daraa',
  'as-suwayda',
  'quneitra',
  'deir-ez-zor',
  'raqqa',
  'al-hasakah'
] as const;

export type GovernorateKey = (typeof GOVERNORATE_KEYS)[number];

export const GOVERNORATE_CENTROIDS: Record<GovernorateKey, {lat: number; lng: number}> = {
  damascus: {lat: 33.51, lng: 36.29},
  'rif-dimashq': {lat: 33.52, lng: 36.45},
  aleppo: {lat: 36.2, lng: 37.16},
  homs: {lat: 34.73, lng: 36.72},
  hama: {lat: 35.13, lng: 36.75},
  latakia: {lat: 35.53, lng: 35.79},
  tartus: {lat: 34.89, lng: 35.89},
  idlib: {lat: 35.93, lng: 36.63},
  daraa: {lat: 32.62, lng: 36.1},
  'as-suwayda': {lat: 32.71, lng: 36.57},
  quneitra: {lat: 33.13, lng: 35.82},
  'deir-ez-zor': {lat: 35.34, lng: 40.14},
  raqqa: {lat: 35.95, lng: 39.01},
  'al-hasakah': {lat: 36.5, lng: 40.75}
};

// Whole-country fallback when there's no governorate either.
export const SYRIA_CENTER = {lat: 34.8, lng: 38.0};

export function governorateCenter(key: string | null | undefined): {lat: number; lng: number} {
  if (key && key in GOVERNORATE_CENTROIDS) {
    return GOVERNORATE_CENTROIDS[key as GovernorateKey];
  }
  return SYRIA_CENTER;
}
