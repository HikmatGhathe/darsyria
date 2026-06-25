'use client';

import {createContext, useContext, useEffect, useState, useCallback} from 'react';
import type {ReactNode} from 'react';
import {useAuth} from './AuthProvider';
import {listFavoriteIds, addFavorite, removeFavorite} from '@/lib/favorites';

type FavoritesContextValue = {
  isFavorited: (propertyId: string) => boolean;
  toggle: (propertyId: string) => Promise<void>;
  // True until the signed-in user's favorite IDs have loaded.
  isLoading: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Loads the signed-in user's favorited property IDs once and exposes
// membership + an optimistic toggle, so every card/heart shares one source
// of truth instead of fetching per card.
export function FavoritesProvider({children}: {children: ReactNode}) {
  const {user} = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIds(new Set());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    listFavoriteIds()
      .then((list) => {
        if (!cancelled) setIds(new Set(list));
      })
      .catch(() => {
        if (!cancelled) setIds(new Set());
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isFavorited = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    async (id: string) => {
      const wasFavorited = ids.has(id);
      // Optimistic update
      setIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.delete(id);
        else next.add(id);
        return next;
      });
      try {
        if (wasFavorited) await removeFavorite(id);
        else await addFavorite(id);
      } catch (e) {
        console.error('Favorite toggle failed:', e);
        // Revert
        setIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    },
    [ids]
  );

  return (
    <FavoritesContext.Provider value={{isFavorited, toggle, isLoading}}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
