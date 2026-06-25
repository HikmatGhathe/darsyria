'use client';

import {createContext, useContext, useEffect, useState, useCallback} from 'react';
import type {ReactNode} from 'react';
import {useAuth} from './AuthProvider';
import {listFavoriteIds, addFavorite, removeFavorite} from '@/lib/favorites';

type FavoritesContextValue = {
  isFavorited: (propertyId: string) => boolean;
  toggle: (propertyId: string) => Promise<void>;
  // True while the signed-in user's favorite IDs are still loading.
  isLoading: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Loads the signed-in user's favorited property IDs once and exposes
// membership + an optimistic toggle, so every card/heart shares one source
// of truth instead of fetching per card.
export function FavoritesProvider({children}: {children: ReactNode}) {
  const {user} = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  // Which user the loaded ids belong to — guards against showing one user's
  // favorites to another (or to a logged-out viewer) without a reset-in-effect.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listFavoriteIds()
      .then((list) => {
        if (!cancelled) {
          setIds(new Set(list));
          setLoadedFor(user.id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIds(new Set());
          setLoadedFor(user.id);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Favorites are only valid for the currently signed-in user; otherwise the
  // effective set is empty (derived, so no stale data leaks on logout).
  const valid = user != null && loadedFor === user.id;
  const isLoading = user != null && !valid;

  const isFavorited = useCallback(
    (id: string) => valid && ids.has(id),
    [valid, ids]
  );

  const toggle = useCallback(
    async (id: string) => {
      if (!user) return;
      const wasFavorited = ids.has(id);
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
        setIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    },
    [ids, user]
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
