import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, isAuthenticated, isBootstrapping, isLoading, authChecked, logout } = useAuthStore();
  const router = useRouter();

  const requireAuth = (allowedRoles?: string[]) => {

    if (isBootstrapping || isLoading || !authChecked) {
      return null; // Return null to indicate "still checking"
    }

    if (!isAuthenticated) {
      router.push('/auth/login');
      return false;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
      return false;
    }

    return true;
  };

  const redirectBasedOnRole = useCallback(() => {
    if (!user) return;

    switch (user.role) {
      case 'ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'DOCTOR':
        router.push('/dashboard');
        break;
      case 'PATIENT':
        router.push('/dashboard');
        break;
      default:
        router.push('/auth/login');
    }
  }, [user, router]);

  return {
    user,
    isAuthenticated,
    isBootstrapping,
    isLoading,
    authChecked,
    requireAuth,
    redirectBasedOnRole,
    logout,
  };
};