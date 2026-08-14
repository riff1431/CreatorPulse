'use client';

import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { MessageSquare, Send, Sparkles } from 'lucide-react';

export function MessagesPage() {
  return (
    <MainLayout>
      <div className="bg-white rounded-3xl border border-[#F3DCE8] shadow-sm h-[75vh] flex overflow-hidden">
        <div className="w-80 border-r border-[#F3DCE8] p-4 flex flex-col">
          <h2 className="font-bold text-base text-[#18181B] mb-4">Direct Messages</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            <div className="p-3 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#EC4899] font-bold flex items-center justify-center">
                EM
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#18181B]">Elena Moon</h4>
                <p className="text-[10px] text-[#71717A] truncate">Hey, loved your latest reel!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between p-6 bg-[#FFF9FC]">
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#F3DCE8] flex items-center justify-center mx-auto text-[#EC4899] shadow-sm">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#18181B]">Select a conversation</h3>
              <p className="text-xs text-[#71717A]">Chat directly with your subscribers and creators</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 py-3 px-4 bg-white border border-[#F3DCE8] rounded-2xl text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899]"
            />
            <button className="p-3 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MessagesPage;
