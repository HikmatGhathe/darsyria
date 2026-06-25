'use client';

import {useEffect, useRef} from 'react';
import 'leaflet/dist/leaflet.css';
import type {Map as LeafletMap, Marker} from 'leaflet';

// Leaflet's default marker icon paths break under bundlers — point them at the
// CDN once the module loads.
const ICON_URLS = {
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
};

type Props = {
  lat?: number | null;
  lng?: number | null;
  centroid: {lat: number; lng: number};
  interactive?: boolean;
  onPick?: (lat: number, lng: number) => void;
  className?: string;
};

// Vanilla Leaflet map. Leaflet is imported dynamically inside the effect so it
// never touches `window` on the server — the component renders an empty sized
// div server-side and wires the map up on hydration. Used read-only on the
// listing detail and interactively (click to drop/move a pin) on the form.
export default function PropertyMap({lat, lng, centroid, interactive = false, onPick, className}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const LRef = useRef<typeof import('leaflet') | null>(null);

  // Keep the latest onPick without re-initializing the map.
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  // Init once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      L.Icon.Default.mergeOptions(ICON_URLS);

      const hasPin = typeof lat === 'number' && typeof lng === 'number';
      const center: [number, number] = hasPin ? [lat as number, lng as number] : [centroid.lat, centroid.lng];
      const map = L.map(containerRef.current).setView(center, hasPin ? 14 : 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      mapRef.current = map;

      if (interactive) {
        map.on('click', (e) => onPickRef.current?.(e.latlng.lat, e.latlng.lng));
      }
      // The marker is managed by the sync effect below.
      setTimeout(() => map.invalidateSize(), 0);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync the marker to the current lat/lng (place / move / clear).
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    const hasPin = typeof lat === 'number' && typeof lng === 'number';

    if (hasPin) {
      const pos: [number, number] = [lat as number, lng as number];
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        const marker = L.marker(pos, {draggable: interactive}).addTo(map);
        if (interactive) {
          marker.on('dragend', () => {
            const p = marker.getLatLng();
            onPickRef.current?.(p.lat, p.lng);
          });
        }
        markerRef.current = marker;
      }
    } else if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [lat, lng, interactive]);

  // Recenter on the governorate area when there's no pin (e.g. the form's
  // governorate select changed).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const hasPin = typeof lat === 'number' && typeof lng === 'number';
    if (!hasPin) map.setView([centroid.lat, centroid.lng], 9);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centroid.lat, centroid.lng]);

  return (
    <div
      ref={containerRef}
      className={className ?? 'w-full h-64 rounded-xl overflow-hidden border border-border-subtle z-0'}
    />
  );
}
