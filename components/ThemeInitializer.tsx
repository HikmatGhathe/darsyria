'use client';

import { useLayoutEffect } from 'react';

const STORAGE_KEY = 'darsyria-theme';

export default function ThemeInitializer() {
  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', stored === 'dark' || (!stored && prefersDark));
    } catch {
      // localStorage/matchMedia unavailable — leave default (light)
    }
  });

  return null;
}
