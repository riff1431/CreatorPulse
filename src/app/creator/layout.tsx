import { CreatorHeader } from '@/components/creator/CreatorHeader';
import { CreatorSidebar } from '@/components/creator/CreatorSidebar';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <CreatorHeader />
      <div className="flex flex-1 overflow-hidden">
        <CreatorSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <RoleGuard
            allowedRoles={['creator', 'admin']}
            fallbackTitle="Creator Studio Access Only"
            fallbackMessage="This studio is exclusively available to verified Creators and Admins. Switch to Creator role in the sandbox or sign in with your creator credentials."
          >
            {children}
          </RoleGuard>
        </main>
      </div>
    </div>
  );
}
