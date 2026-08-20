import { CreatorHeader } from '@/components/creator/CreatorHeader';
import { CreatorSidebar } from '@/components/creator/CreatorSidebar';
import { CreatorGuard } from '@/components/auth/RouteGuards';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorGuard>
      <div className="h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777] overflow-hidden">
        <CreatorHeader />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <CreatorSidebar />
          <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
    </CreatorGuard>
  );
}
