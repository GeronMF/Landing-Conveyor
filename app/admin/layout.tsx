'use client';

import { AuthCheck } from '@/components/admin/auth-check';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Users, LogOut, Video } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Выход выполнен');
      router.push('/admin/login');
    } catch {
      toast.error('Ошибка выхода');
    }
  };

  if (pathname === '/admin/login') {
    return <AuthCheck>{children}</AuthCheck>;
  }

  return (
    <AuthCheck>
      <div className="min-h-screen flex">
        <aside className="w-64 bg-muted/30 border-r">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">Landing Conveyor</h1>

            <nav className="space-y-2">
              <Link href="/admin/landings">
                <Button
                  variant={pathname.startsWith('/admin/landings') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Лендинги
                </Button>
              </Link>

              <Link href="/admin/leads">
                <Button
                  variant={pathname.startsWith('/admin/leads') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Заявки
                </Button>
              </Link>

              <Link href="/admin/videos">
                <Button
                  variant={pathname.startsWith('/admin/videos') ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Відео
                </Button>
              </Link>
            </nav>

            <div className="mt-8 space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Выход
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthCheck>
  );
}
