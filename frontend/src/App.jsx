import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExplorePage } from './pages/ExplorePage';
import { WatchPage } from './pages/WatchPage';
import ReelsPage from './pages/ReelsPage';
import SearchPage from './pages/SearchPage';
import BookmarksPage from './pages/BookmarksPage';
import SettingsPage from './pages/SettingsPage';
import CreatorStudioPage from './pages/CreatorStudioPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { HashtagPage } from './pages/HashtagPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import PlaylistsPage from './pages/PlaylistsPage';
import StudioDashboardPage from './pages/StudioDashboardPage';
import StudioEditorPage from './pages/StudioEditorPage';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-2xl shadow-xl',
          duration: 3500
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main Application Layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/watch" element={<WatchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/creator/studio" element={
            <ProtectedRoute>
              <CreatorStudioPage />
            </ProtectedRoute>
          } />
          <Route path="/bookmarks" element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/hashtags/:tag" element={<HashtagPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/studio" element={<StudioDashboardPage />} />
          <Route path="/reel-editor" element={<Navigate to="/studio" replace />} />
        </Route>

        {/* Dedicated Fullscreen Video Editor Workspace */}
        <Route path="/studio/editor/:projectId" element={<StudioEditorPage />} />
        <Route path="/studio/editor" element={<Navigate to="/studio/editor/new" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
