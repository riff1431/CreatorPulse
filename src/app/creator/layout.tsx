import { CreatorHeader } from '@/components/creator/CreatorHeader';
import { CreatorSidebar } from '@/components/creator/CreatorSidebar';
import { CreatorGuard } from '@/components/auth/RouteGuards';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorGuard>
      <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
        <CreatorHeader />
        <div className="flex flex-1 overflow-hidden">
          <CreatorSidebar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </CreatorGuard>
  );
}
