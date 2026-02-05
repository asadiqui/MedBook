import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export const useAuthRedirect = (redirectWhenAuthenticated: boolean = true) => {
  const { isAuthenticated, user, redirectPath, isBootstrapping } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!redirectWhenAuthenticated || isBootstrapping) return;
    
    if (isAuthenticated && redirectPath) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router, redirectWhenAuthenticated, isBootstrapping]);

  return { isAuthenticated, user, isBootstrapping };
};
