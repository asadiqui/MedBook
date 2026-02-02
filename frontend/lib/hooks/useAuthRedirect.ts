import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export const useAuthRedirect = (redirectWhenAuthenticated: boolean = true) => {
  const { isAuthenticated, redirectPath } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!redirectWhenAuthenticated) return;
    
    if (isAuthenticated && redirectPath) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router, redirectWhenAuthenticated]);

  return { isAuthenticated };
};
