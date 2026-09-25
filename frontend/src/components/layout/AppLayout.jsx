import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { Header } from './Header';
import MobileBottomNav from './MobileBottomNav';
import OfflineBanner from '../common/OfflineBanner';
import { CreatePostModal } from '../post/CreatePostModal';
import CreateReelModal from '../reels/CreateReelModal';
import { CreateStoryModal } from '../story/CreateStoryModal';
import FloatingSpeedDial from '../common/FloatingSpeedDial';

export const AppLayout = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateReelOpen, setIsCreateReelOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

  const location = useLocation();
  const isStudio = location.pathname.startsWith('/studio');
  const isMessages = location.pathname.startsWith('/messages');
  const isAdmin = location.pathname.startsWith('/admin');
  const isFullWidthPage = isStudio || isMessages || isAdmin;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex justify-center text-slate-900 dark:text-slate-100">
      <OfflineBanner />

      <div className={`w-full ${isFullWidthPage ? 'max-w-[1680px]' : 'max-w-[1440px]'} flex`}>
        {/* Left Navigation Sidebar */}
        <Sidebar
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          onOpenCreateReel={() => setIsCreateReelOpen(true)}
          onOpenCreateStory={() => setIsCreateStoryOpen(true)}
        />

        {/* Center Main Content Feed */}
        <main className="flex-1 min-w-0 flex flex-col min-h-screen pb-20 md:pb-8">
          <Header />
          <div className={`flex-1 ${isFullWidthPage ? 'px-2 sm:px-6 md:px-8 py-3 md:py-6 max-w-7xl' : 'px-3 sm:px-6 py-4 md:py-8 max-w-3xl'} mx-auto w-full`}>
            <Outlet
              context={{
                onOpenCreatePost: () => setIsCreatePostOpen(true),
                onOpenCreateReel: () => setIsCreateReelOpen(true),
                onOpenCreateStory: () => setIsCreateStoryOpen(true)
              }}
            />
          </div>
        </main>

        {/* Right Suggestions & Trending Sidebar */}
        {!isFullWidthPage && <RightSidebar />}
      </div>

      {/* Floating Speed Dial (FAB) for Instant Post/Reel/Story Actions */}
      <FloatingSpeedDial
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenCreateReel={() => setIsCreateReelOpen(true)}
        onOpenCreateStory={() => setIsCreateStoryOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      {/* Global Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSuccess={() => {
          setIsCreatePostOpen(false);
          window.location.reload();
        }}
      />

      <CreateReelModal
        isOpen={isCreateReelOpen}
        onClose={() => setIsCreateReelOpen(false)}
        onReelCreated={() => {
          setIsCreateReelOpen(false);
          window.location.reload();
        }}
      />

      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        onSuccess={() => {
          setIsCreateStoryOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

