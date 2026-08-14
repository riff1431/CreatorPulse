import { CreatorHeader } from '@/components/creator/CreatorHeader';
import { CreatorSidebar } from '@/components/creator/CreatorSidebar';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <CreatorHeader />
      <div className="flex flex-1 overflow-hidden">
        <CreatorSidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
