import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-portal-isolated min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FFE4E6] selection:text-[#BE123C]">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <RoleGuard
            allowedRoles={['admin']}
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
