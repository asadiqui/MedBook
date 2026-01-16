'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/auth';

export default function AuthBootstrap() {
  const { fetchUser, hasHydrated } = useAuthStore();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (didRunRef.current) return;

    // Ensures auth state is validated on every refresh/navigation.
    didRunRef.current = true;
    fetchUser();
  }, [fetchUser, hasHydrated]);

  return null;
}
