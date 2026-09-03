import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Send, MessageCircle, Share2, Globe, Sparkles } from 'lucide-react';
import { userService, messageService } from '../../services/services';
import { Avatar } from '../common/Avatar';
import toast from 'react-hot-toast';

export const ShareModal = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false);
  const [connections, setConnections] = useState([]);
  const [sendingTo, setSendingTo] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const postUrl = `${window.location.origin}/post/${post?.id}`;

  useEffect(() => {
    if (isOpen) {
      userService.getSuggestions(6)
        .then(res => {
          const list = res.data?.data || res.data || (res.success ? res.data : []);
          if (Array.isArray(list)) setConnections(list);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendDm = async (user) => {
    try {
      setSendingTo(prev => ({ ...prev, [user.id]: true }));
      // Send post link in chat
      await messageService.sendMessage({
        recipientId: user.id,
        messageText: `Check out this post on Pulse: ${postUrl}`
      });
      toast.success(`Sent to @${user.username}!`);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setTimeout(() => {
        setSendingTo(prev => ({ ...prev, [user.id]: false }));
      }, 1500);
    }
  };

  const filteredConnections = connections.filter(c =>
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-2xl shadow-indigo-950/50 text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">Share Post</h3>
              <p className="text-[11px] text-slate-400">Share with friends or external apps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Send to Connections */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Send via Pulse DM</p>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {filteredConnections.slice(0, 6).map((conn) => {
              const isSent = sendingTo[conn.id];
              return (
                <button
                  key={conn.id}
                  onClick={() => handleSendDm(conn)}
                  className="flex flex-col items-center space-y-1.5 flex-shrink-0 group cursor-pointer"
                >
                  <div className="relative">
                    <Avatar src={conn.avatarUrl} username={conn.username} size="md" disableLink={true} />
                    {isSent && (
                      <div className="absolute inset-0 rounded-full bg-emerald-500/90 flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 max-w-[56px] truncate group-hover:text-cyan-400 transition-colors">
                    {conn.displayName?.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Link Copy Bar */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Direct Post Link</label>
          <div className="flex items-center space-x-2 p-2 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <input
              type="text"
              readOnly
              value={postUrl}
              className="flex-1 bg-transparent text-xs text-slate-400 focus:outline-none px-2 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* External Social Buttons */}
        <div className="pt-2 grid grid-cols-3 gap-2">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this post on Pulse: ' + postUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-colors"
          >
            <span>WhatsApp</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent('Check out this post on Pulse!')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 font-semibold text-xs transition-colors"
          >
            <span>Twitter / X</span>
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent('Check out this post on Pulse!')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/30 text-indigo-400 font-semibold text-xs transition-colors"
          >
            <span>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
};
