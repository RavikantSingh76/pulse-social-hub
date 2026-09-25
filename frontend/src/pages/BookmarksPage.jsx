import React, { useState, useEffect } from 'react';
import { postService } from '../services/services';
import { Bookmark, FolderPlus, Grid, Trash2, X, Plus } from 'lucide-react';
import { PostCard } from '../components/post/PostCard';

export default function BookmarksPage() {
  const [collections, setCollections] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newColName, setNewColName] = useState('');

  useEffect(() => {
    fetchCollections();
    fetchSavedPosts();
  }, [activeCollectionId]);

  const fetchCollections = async () => {
    try {
      const res = await postService.getCollections();
      if (res.data?.success) {
        setCollections(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      // Fetch saved posts
      const res = await postService.getFeed('FOR_YOU', 1, 30);
      if (res.data?.success) {
        let posts = res.data.data.posts.filter((p) => p.isSaved);
        if (activeCollectionId) {
          posts = posts.filter((p) => p.savedCollectionId === activeCollectionId);
        }
        setSavedPosts(posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      const res = await postService.createCollection({ name: newColName.trim() });
      if (res.data?.success) {
        setCollections((prev) => [res.data.data, ...prev]);
        setNewColName('');
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCollection = async (colId) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await postService.deleteCollection(colId);
      setCollections((prev) => prev.filter((c) => c.id !== colId));
      if (activeCollectionId === colId) setActiveCollectionId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-primary-600" />
            Saved Content & Collections
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize bookmarks into personalized collection folders
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-primary-500/25 cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCollectionId(null)}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeCollectionId === null
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Saved ({savedPosts.length})
        </button>
        {collections.map((col) => (
          <div key={col.id} className="relative group flex items-center">
            <button
              onClick={() => setActiveCollectionId(col.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                activeCollectionId === col.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{col.name}</span>
              <span className="text-[10px] opacity-75">({col.postCount || 0})</span>
            </button>
            <button
              onClick={() => handleDeleteCollection(col.id)}
              className="hidden group-hover:block absolute -top-1 -right-1 bg-rose-600 text-white p-0.5 rounded-full shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Saved Posts Grid/Feed */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">No saved items yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click the bookmark icon on any post to save it here for later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Create Collection Folder</h3>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <input
                id="bookmark-collection-name"
                name="collectionName"
                type="text"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="e.g. Design Inspiration, Quotes, Tutorials"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 cursor-pointer shadow-md shadow-primary-500/25"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
