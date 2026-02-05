import { useCallback, useEffect, useState } from "react";

/**
 * Hook to manage cleared appointments in local storage
 * Allows users to permanently dismiss rejected/cancelled appointments
 */
export function useClearedAppointments() {
  const [clearedIds, setClearedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('clearedAppointments');
      if (stored) {
        setClearedIds(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load cleared appointments from localStorage:', error);
    }
  }, []);

  const clearAppointment = useCallback((id: string) => {
    setClearedIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      try {
        localStorage.setItem('clearedAppointments', JSON.stringify(Array.from(updated)));
      } catch (error) {
        console.error('Failed to save cleared appointment to localStorage:', error);
      }
      return updated;
    });
  }, []);

  const filterCleared = useCallback(<T extends { id: string }>(items: T[]): T[] => {
    return items.filter(item => !clearedIds.has(item.id));
  }, [clearedIds]);

  return { clearAppointment, filterCleared };
}
