'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (pathname === '/admin/login') {
        setIsAuthorized(true);
        return;
      }

      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsAuthorized(true);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!isAuthorized) {
    return <div className="flex items-center justify-center min-h-screen">Завантаження...</div>;
  }

  return <>{children}</>;
}
