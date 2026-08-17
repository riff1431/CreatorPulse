'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, MessageSquare, Share2, Play, Sparkles, 
  ChevronUp, ChevronDown, CheckCircle2, UserPlus, X, Check, Bookmark, FolderOutput 
} from 'lucide-react';
import gsap from 'gsap';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { MOCK_SHORTS, ShortVideo } from '@/lib/supabase/store';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { DynamicVideoPlayer } from '@/components/media/DynamicVideoPlayer';
import { useSaved } from '@/lib/saved/saved-context';
import { useHistory } from '@/lib/history/history-context';
import { SaveToCollectionModal } from '@/components/saved/SaveToCollectionModal';

const mockReelComments = [
  { userName: 'Alex Vance', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', content: 'Wow, this transition is clean!', time: '2m ago' },
  { userName: 'Jordan Lee', userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', content: 'What software did you use to build this? Figma?', time: '1h ago' },
  { userName: 'Mia Wong', userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', content: 'Incredible work, Sarah!', time: '1d ago' },
];

export default function ShortsPage() {
  const { isSaved, toggleQuickSave } = useSaved();
  const { logActivity } = useHistory();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shortsList, setShortsList] = useState<ShortVideo[]>(MOCK_SHORTS);
  
  const [showComments, setShowComments] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  const [activeComments, setActiveComments] = useState(mockReelComments);
  const reelCardRef = useRef<HTMLDivElement>(null);
  const activeShort = shortsList[currentIndex];

  // Sync active comments & log reel view on reel change
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveComments(mockReelComments);
      setShowComments(false);

      if (activeShort) {
        logActivity({
          category: 'reel',
          title: `Watched Reel: ${activeShort.title}`,
          subtitle: `By @${activeShort.authorUsername} • ${activeShort.category}`,
          targetUrl: `/shorts?id=${activeShort.id}`,
          targetId: activeShort.id,
          avatarUrl: activeShort.authorAvatar,
          thumbnailUrl: activeShort.videoUrl,
          actionType: 'view',
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentIndex, activeShort, logActivity]);

  const animateTransition = (nextIndex: number, direction: 'up' | 'down') => {
    if (!reelCardRef.current) {
      setCurrentIndex(nextIndex);
      return;
    }

    const slideOutY = direction === 'up' ? -80 : 80;
    const slideInY = direction === 'up' ? 80 : -80;

    // Slide out current reel card
    gsap.to(reelCardRef.current, {
      y: slideOutY,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentIndex(nextIndex);
        // Slide in new reel card
        gsap.fromTo(
          reelCardRef.current,
          { y: slideInY, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
      }
    });
  };

  const handleNext = () => {
    const nextIdx = currentIndex < shortsList.length - 1 ? currentIndex + 1 : 0;
    animateTransition(nextIdx, 'up');
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      animateTransition(currentIndex - 1, 'down');
    } else {
      // Loop back to end
      animateTransition(shortsList.length - 1, 'down');
    }
  };

  const handleToggleLike = () => {
    const updated = [...shortsList];
    const item = updated[currentIndex];
    if (item.isLiked) {
      item.likesCount -= 1;
      item.isLiked = false;
    } else {
      item.likesCount += 1;
      item.isLiked = true;
    }
    setShortsList(updated);
  };

  const handleShareReel = () => {
    navigator.clipboard.writeText(window.location.origin + `/shorts?id=${activeShort.id}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setActiveComments([
      ...activeComments,
      {
        userName: 'Alex Vance',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        content: newComment.trim(),
        time: 'Just now'
      }
    ]);
    setNewComment('');
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 flex flex-col items-center justify-center pb-20 lg:pb-8">
          <div className="relative max-w-sm w-full h-[620px] bg-[#18181B] rounded-[32px] overflow-hidden shadow-2xl border border-[#F3DCE8] flex flex-col justify-between">
            {/* Sliding Reel card container */}
            <div ref={reelCardRef} className="absolute inset-0 flex flex-col justify-between">
              {/* Background Video Media Mock */}
              <div className="absolute inset-0 z-0 bg-black">
                <DynamicVideoPlayer
                  src={activeShort.videoUrl}
                  poster={activeShort.videoUrl}
                  aspectRatio="vertical"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none"></div>
              </div>

              {/* Top Navigation Overlay */}
              <div className="relative z-10 p-4 flex items-center justify-between w-full">
                <span className="text-xs font-bold bg-[#FCE7F3] text-[#BE185D] px-3 py-1 rounded-full border border-[#FBCFE8] backdrop-blur-md shadow-sm">
                  {activeShort.category}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md cursor-pointer transition-colors"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md cursor-pointer transition-colors"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              {/* Floating Right Interaction Bar */}
              <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-4 text-white">
                <button
                  onClick={handleToggleLike}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div className={`p-3.5 rounded-full backdrop-blur-md transition-all ${
                    activeShort.isLiked ? 'bg-[#EC4899] text-white shadow-lg shadow-[#EC4899]/40 scale-110' : 'bg-black/40 hover:bg-[#EC4899]/40 text-white'
                  }`}>
                    <Heart size={20} className={activeShort.isLiked ? 'fill-white' : ''} />
                  </div>
                  <span className="text-xs font-bold">{activeShort.likesCount}</span>
                </button>

                <button 
                  onClick={() => setShowComments(true)}
                  className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#EC4899] transition-colors"
                >
                  <div className="p-3.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
                    <MessageSquare size={20} />
                  </div>
                  <span className="text-xs font-bold">{activeShort.commentsCount}</span>
                </button>

                <button
                  onClick={() => toggleQuickSave({ id: activeShort.id, type: 'reel', short: activeShort })}
                  className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#EC4899] transition-colors"
                  title={isSaved(activeShort.id) ? "Unsave Reel" : "Save Reel"}
                >
                  <div className={`p-3.5 rounded-full backdrop-blur-md transition-all ${
                    isSaved(activeShort.id) ? 'bg-[#EC4899] text-white shadow-lg shadow-[#EC4899]/40 scale-110' : 'bg-black/40 hover:bg-black/60 text-white'
                  }`}>
                    <Bookmark size={20} className={isSaved(activeShort.id) ? 'fill-white' : ''} />
                  </div>
                  <span className="text-[10px] font-bold">Saved</span>
                </button>

                <button 
                  onClick={() => setIsSaveModalOpen(true)}
                  className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#EC4899] transition-colors"
                  title="Save to folder / collection"
                >
                  <div className="p-3.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
                    <FolderOutput size={20} />
                  </div>
                  <span className="text-[10px] font-bold">Folder</span>
                </button>

                <button 
                  onClick={handleShareReel}
                  className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#EC4899] transition-colors"
                >
                  <div className="p-3.5 bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md transition-colors">
                    <Share2 size={20} />
                  </div>
                  <span className="text-xs font-bold">{activeShort.sharesCount}</span>
                </button>
              </div>

              {/* Bottom Info Overlay */}
              <div className="relative z-10 p-5 space-y-3 pr-16 mt-auto">
                <div className="flex items-center gap-2.5">
                  <Link href={`/c/${activeShort.authorUsername}`}>
                    <Avatar alt={activeShort.authorName} src={activeShort.authorAvatar} size="md" isVerified />
                  </Link>
                  <div>
                    <Link href={`/c/${activeShort.authorUsername}`} className="font-bold text-sm text-white hover:underline block">
                      {activeShort.authorName}
                    </Link>
                    <span className="text-[11px] text-pink-200">@{activeShort.authorUsername}</span>
                  </div>
                  <Button variant="primary" size="sm" className="ml-2">
                    Follow
                  </Button>
                </div>

                <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                  {activeShort.title}
                </p>
              </div>
            </div>

            {/* Copy Share Toast Notification */}
            {copiedShare && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 text-white text-[10px] font-bold py-2 px-4 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10 animate-toast-in">
                <Check size={12} className="text-emerald-400" />
                <span>Link Copied to Clipboard!</span>
              </div>
            )}

            {/* Slide-Up Comments Drawer Overlay */}
            {showComments && (
              <div className="absolute inset-x-0 bottom-0 z-30 bg-white rounded-t-[28px] border-t border-[#F3DCE8] p-4 flex flex-col max-h-[380px] shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-2 mb-2">
                  <h4 className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-[#EC4899]" />
                    Comments ({activeComments.length})
                  </h4>
                  <button onClick={() => setShowComments(false)} className="text-[#71717A] hover:text-[#18181B] cursor-pointer">
                    <X size={15} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 text-[11px] scrollbar-none">
                  {activeComments.map((c, i) => (
                    <div key={i} className="flex gap-2 bg-[#FFF9FC] border border-[#F3DCE8] p-2 rounded-xl">
                      <Avatar src={c.userAvatar} alt={c.userName} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#18181B]">{c.userName}</span>
                          <span className="text-[9px] text-[#A1A1AA]">{c.time}</span>
                        </div>
                        <p className="text-[#52525B] mt-0.5 font-normal">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-1.5 mt-3 border-t border-[#F3DCE8] pt-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type comments..."
                    className="flex-1 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#EC4899] text-[#18181B] font-semibold"
                  />
                  <Button type="submit" variant="primary" size="sm">Send</Button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {activeShort && (
        <SaveToCollectionModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          item={{ id: activeShort.id, type: 'reel', short: activeShort }}
        />
      )}

      <MobileNav />
    </div>
  );
}
