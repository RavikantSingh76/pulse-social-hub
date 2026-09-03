import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { Header } from './Header';
import MobileBottomNav from './MobileBottomNav';
import OfflineBanner from '../common/OfflineBanner';
import { CreatePostModal } from '../post/CreatePostModal';

export const AppLayout = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex justify-center text-slate-900 dark:text-slate-100">
      <OfflineBanner />

      <div className="w-full max-w-[1440px] flex">
        {/* Left Navigation Sidebar */}
        <Sidebar onOpenCreatePost={() => setIsCreatePostOpen(true)} />

        {/* Center Main Content Feed */}
        <main className="flex-1 min-w-0 flex flex-col min-h-screen pb-20 md:pb-8">
          <Header />
          <div className="flex-1 px-3 sm:px-6 py-4 md:py-8 max-w-3xl mx-auto w-full">
            <Outlet context={{ onOpenCreatePost: () => setIsCreatePostOpen(true) }} />
          </div>
        </main>

        {/* Right Suggestions & Trending Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      {/* Global Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSuccess={() => {
          setIsCreatePostOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};
