import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminGuard } from '@/components/auth/RouteGuards';
import { AdminProgressProvider } from '@/components/admin/AdminProgressProvider';
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminThemeProvider>
        <AdminProgressProvider>
          <div className="admin-portal-isolated min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
            <AdminHeader />
            <div className="flex flex-1 min-h-[calc(100vh-64px)]">
              <AdminSidebar />
              <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                {children}
              </main>
            </div>
          </div>
        </AdminProgressProvider>
      </AdminThemeProvider>
    </AdminGuard>
  );
}


