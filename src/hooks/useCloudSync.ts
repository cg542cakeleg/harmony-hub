import { useCallback, useRef } from 'react';
import type { Bill, Chore, FamilyEvent, ListItem, FamilyMember } from '../types';

export interface AppData {
  bills:   Bill[];
  chores:  Chore[];
  events:  FamilyEvent[];
  lists:   ListItem[];
  members: FamilyMember[];
}

const SYNC_URL    = '/api/sync';
const DEBOUNCE_MS = 2000;   // wait 2s after last change before pushing

export function useCloudSync() {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncing   = useRef(false);

  // Pull latest data from the cloud and return it (or null on failure)
  const pull = useCallback(async (): Promise<AppData | null> => {
    try {
      const res = await fetch(SYNC_URL, { cache: 'no-store' });
      if (!res.ok) return null;
      const data: AppData = await res.json();
      // Only return if it has actual content
      if (!data.bills && !data.events && !data.chores) return null;
      return data;
    } catch {
      return null;
    }
  }, []);

  // Push local data to the cloud (debounced so rapid edits don't spam)
  const push = useCallback((data: AppData) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      try {
        await fetch(SYNC_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
        });
      } catch { /* silently ignore push failures */ }
      finally { isSyncing.current = false; }
    }, DEBOUNCE_MS);
  }, []);

  return { pull, push };
}
