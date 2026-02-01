import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isBootstrapping, logout, checkAuth } = useAuthStore();
  const router = useRouter();

  // Removed automatic checkAuth call - now handled in ClientLayout

  const requireAuth = (allowedRoles?: string[]) => {
    if (isBootstrapping) {
      return false;
    }

    if (accessToken && !isAuthenticated) {
      return false;
    }

    if (!accessToken) {
      router.push('/auth/login');
      return false;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      toast.error('You do not have permission to access this page');
      router.push('/auth/login');
      return false;
    }

    return true;
  };

  const redirectBasedOnRole = () => {
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
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isBootstrapping,
    requireAuth,
    redirectBasedOnRole,
    logout,
  };
};