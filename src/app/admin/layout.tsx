import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RoleGuard } from '@/components/auth/RoleGuard';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-portal-isolated min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <AdminHeader />
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <RoleGuard
            allowedRoles={['admin', 'super_admin']}
            fallbackTitle="Administrator Clearance Required"
            fallbackMessage="This administrative console is restricted to platform administrators. Please authenticate with an admin account or switch role in the sandbox."
          >
            {children}
          </RoleGuard>
        </main>
      </div>
    </div>
  );
}
