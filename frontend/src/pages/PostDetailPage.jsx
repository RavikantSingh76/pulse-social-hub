import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../services/services';
import { PostCard } from '../components/post/PostCard';
import { ArrowLeft } from 'lucide-react';

export const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getPostById(id)
      .then(res => {
        if (res.success && res.data) setPost(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-center text-xs text-gray-400 py-12">Loading post...</p>;
  }

  if (!post) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center text-gray-400 space-y-3">
        <p className="text-sm font-bold">Post not found</p>
        <Link to="/" className="text-xs text-indigo-600 underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-indigo-600 mb-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Feed</span>
      </Link>
      <PostCard post={post} />
    </div>
  );
};
