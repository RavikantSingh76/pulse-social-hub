import React, { useState, useEffect, useRef } from 'react';
import { messageService, userService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Avatar } from '../components/common/Avatar';
import GroupChatModal from '../components/chat/GroupChatModal';
import CallModal from '../components/chat/CallModal';
import { formatDistanceToNow } from 'date-fns';
import {
  Search,
  Send,
  Image,
  Paperclip,
  CheckCheck,
  Circle,
  Sparkles,
  ArrowLeft,
  Users,
  Phone,
  Video,
  Reply,
  Trash2,
  Smile,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const { emitTyping, addEventListener, typingUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [activeCall, setActiveCall] = useState(null); // { isVideo: bool, targetUser: obj }

  // In-chat search
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await messageService.getConversations();
      const list = res.data?.data || res.data || (res.success ? res.data : []);
      if (Array.isArray(list)) {
        setConversations(list);
        if (list.length > 0 && !activeConv) {
          selectConversation(list[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    setReplyingTo(null);
    setShowChatSearch(false);
    try {
      const res = await messageService.getMessages(conv.id);
      const list = res.data?.data || res.data || (res.success ? res.data : []);
      if (Array.isArray(list)) {
        setMessages(list);
      }
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time WebSocket listener for incoming messages
  useEffect(() => {
    const unsubscribe = addEventListener('NEW_MESSAGE', (data) => {
      if (activeConv && data.conversationId === activeConv.id) {
        setMessages(prev => [...prev, data.message]);
      }
      loadConversations();
    });
    return unsubscribe;
  }, [activeConv, addEventListener]);

  // Debounced user search to start new chats
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      userService.searchUsers(searchQuery, 5).then(res => {
        if (res.data?.success && res.data.data) setUserSearchResults(res.data.data);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStartChatWithUser = async (targetUser) => {
    setSearchQuery('');
    setUserSearchResults([]);
    try {
      const res = await messageService.sendMessage({
        recipientId: targetUser.id,
        messageText: '👋'
      });
      await loadConversations();
      if (res.data?.data?.conversationId) {
        const found = conversations.find(c => c.id === res.data.data.conversationId);
        if (found) selectConversation(found);
      }
    } catch (err) {
      toast.error('Failed to initiate conversation');
    }
  };

  const handleTypingChange = (e) => {
    setMessageText(e.target.value);
    if (!activeConv || activeConv.isGroup) return;

    const otherId = activeConv.otherUser?.id;
    if (otherId) {
      emitTyping(otherId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(otherId, false);
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    const textToSend = messageText.trim();
    const replyId = replyingTo ? replyingTo.id : null;
    setMessageText('');
    setReplyingTo(null);
    setSending(true);

    try {
      const res = await messageService.sendMessage({
        conversationId: activeConv.id,
        messageText: textToSend,
        replyToMessageId: replyId
      });

      if (res.data?.success && res.data.data) {
        setMessages(prev => [...prev, res.data.data]);
        loadConversations();
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConv) return;

    const formData = new FormData();
    formData.append('conversationId', activeConv.id);
    formData.append('media', file);
    formData.append('messageText', messageText || '');
    if (replyingTo) formData.append('replyToId', replyingTo.id);

    try {
      const res = await messageService.sendMessageWithMedia(formData);
      if (res.data?.success && res.data.data) {
        setMessages(prev => [...prev, res.data.data]);
        setMessageText('');
        setReplyingTo(null);
        loadConversations();
      }
    } catch (err) {
      toast.error('Failed to upload attachment');
    }
  };

  const handleDeleteForEveryone = async (msgId) => {
    try {
      await messageService.deleteForEveryone(msgId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isDeletedForEveryone: true, messageText: 'This message was deleted', mediaUrl: null } : m));
    } catch (err) {
      toast.error('Could not delete message');
    }
  };

  const handleSearchInChat = async (e) => {
    e.preventDefault();
    if (!chatSearchQuery.trim() || !activeConv) return;

    try {
      const res = await messageService.searchMessages(activeConv.id, chatSearchQuery);
      if (res.data?.success && res.data.data) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isOtherUserTyping = activeConv && activeConv.otherUser && typingUsers[activeConv.otherUser.id];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden h-[84vh] flex">
      {/* Left Conversations Sidebar */}
      <div className={`w-full md:w-80 border-r border-slate-200/70 dark:border-slate-800 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        {/* Search & Create Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">Messages</h2>
            <button
              onClick={() => setShowGroupModal(true)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>New Group</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search or start new chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* User Search Quick Starters */}
          {userSearchResults.length > 0 && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 divide-y divide-slate-100 dark:divide-slate-700 max-h-48 overflow-y-auto">
              {userSearchResults.map(u => (
                <div
                  key={u.id}
                  onClick={() => handleStartChatWithUser(u)}
                  className="p-2.5 flex items-center space-x-2.5 cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  <Avatar src={u.avatarUrl} username={u.username} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{u.displayName}</p>
                    <p className="text-[10px] text-slate-400">@{u.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
          {loadingConvs ? (
            <p className="text-xs text-center text-slate-400 py-8">Loading chats...</p>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <p>No active conversations.</p>
              <p className="text-[11px]">Search a creator above to start chatting!</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isSelected = activeConv?.id === conv.id;
              const title = conv.isGroup ? conv.groupName : conv.otherUser?.displayName || conv.otherUser?.username;
              const avatar = conv.isGroup ? conv.groupAvatarUrl : conv.otherUser?.avatarUrl;
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary-50/70 dark:bg-primary-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Avatar src={avatar} username={title || 'chat'} size="md" isOnline={!conv.isGroup && conv.otherUser?.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                        {title}
                        {conv.isGroup && <span className="text-[10px] text-primary-500 font-normal">[Group]</span>}
                      </p>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-[10px] text-slate-400">
                          {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {conv.lastMessage?.messageText || (conv.lastMessage?.mediaUrl ? '📷 Attachment' : 'Start chatting...')}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Window */}
      {activeConv ? (
        <div className={`flex-1 flex flex-col bg-slate-50/40 dark:bg-slate-950/40 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveConv(null)}
                className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar
                src={activeConv.isGroup ? activeConv.groupAvatarUrl : activeConv.otherUser?.avatarUrl}
                username={activeConv.isGroup ? activeConv.groupName : activeConv.otherUser?.username}
                size="md"
                isOnline={!activeConv.isGroup && activeConv.otherUser?.isOnline}
              />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {activeConv.isGroup ? activeConv.groupName : activeConv.otherUser?.displayName}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeConv.isGroup
                    ? `${activeConv.members?.length || 2} members`
                    : activeConv.otherUser?.isOnline ? 'Online now' : `@${activeConv.otherUser?.username}`}
                </p>
              </div>
            </div>

            {/* Chat Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChatSearch(!showChatSearch)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Search Messages"
              >
                <Search className="w-4 h-4" />
              </button>

              {!activeConv.isGroup && activeConv.otherUser && (
                <>
                  <button
                    onClick={() => setActiveCall({ isVideo: false, targetUser: activeConv.otherUser })}
                    className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Audio Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveCall({ isVideo: true, targetUser: activeConv.otherUser })}
                    className="p-2 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* In-Chat Search Bar */}
          {showChatSearch && (
            <form onSubmit={handleSearchInChat} className="p-2.5 bg-slate-100 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="Search words in this chat..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-xs border-none text-slate-900 dark:text-white"
              />
              <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-semibold">
                Find
              </button>
              <button type="button" onClick={() => { setShowChatSearch(false); selectConversation(activeConv); }} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {messages.map((m, idx) => {
              const isMe = m.senderId === currentUser?.id;
              return (
                <div key={m.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
                  {/* Quote preview if reply */}
                  {m.replyTo && (
                    <div className="text-[11px] bg-slate-200/80 dark:bg-slate-800/80 px-3 py-1 rounded-t-xl mb-0.5 max-w-[70%] border-l-2 border-primary-500 text-slate-600 dark:text-slate-300">
                      <span className="font-bold mr-1">@{m.replyTo.senderUsername}:</span>
                      <span className="truncate">{m.replyTo.messageText || 'Attachment'}</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-3xl p-3.5 px-4.5 space-y-1 shadow-sm relative ${
                      isMe
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {m.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden mb-2">
                        {m.mediaUrl.endsWith('.mp4') ? (
                          <video src={m.mediaUrl.startsWith('http') ? m.mediaUrl : `http://localhost:8080${m.mediaUrl}`} controls className="w-full rounded-2xl" />
                        ) : (
                          <img src={m.mediaUrl.startsWith('http') ? m.mediaUrl : `http://localhost:8080${m.mediaUrl}`} alt="Attached" className="w-full rounded-2xl object-cover max-h-60" />
                        )}
                      </div>
                    )}
                    {m.messageText && (
                      <p className={`text-xs sm:text-sm leading-relaxed break-words ${m.isDeletedForEveryone ? 'italic opacity-60' : ''}`}>
                        {m.messageText}
                      </p>
                    )}
                    <div className={`flex items-center justify-end space-x-1 text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                      <span>{m.createdAt ? formatDistanceToNow(new Date(m.createdAt), { addSuffix: true }) : 'Just now'}</span>
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>

                  {/* Message hover actions */}
                  {!m.isDeletedForEveryone && (
                    <div className="hidden group-hover:flex items-center gap-1 mt-0.5 text-slate-400">
                      <button
                        onClick={() => setReplyingTo(m)}
                        className="p-1 hover:text-primary-500 transition-colors"
                        title="Reply quote"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      {isMe && (
                        <button
                          onClick={() => handleDeleteForEveryone(m.id)}
                          className="p-1 hover:text-rose-500 transition-colors"
                          title="Delete for everyone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {isOtherUserTyping && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                <span>{activeConv.otherUser?.displayName} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Replying banner */}
          {replyingTo && (
            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-950/40 border-t border-primary-200 dark:border-primary-900 flex items-center justify-between text-xs text-primary-700 dark:text-primary-300">
              <div className="flex items-center gap-2 truncate">
                <Reply className="w-4 h-4" />
                <span>Replying to <strong>@{replyingTo.senderUsername}</strong>: {replyingTo.messageText || 'Attachment'}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:opacity-75">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
                title="Attach photo or video"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />

              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={handleTypingChange}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md hover:opacity-90 disabled:opacity-30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-center p-8 bg-slate-50/30 dark:bg-slate-950/30 text-slate-400 space-y-2 flex-col">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center text-2xl mb-2">
            💬
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Select a conversation</h3>
          <p className="text-xs max-w-xs">Pick from your active direct messages or group chats on the left, or create a new group.</p>
        </div>
      )}

      {/* Group Chat Creation Modal */}
      {showGroupModal && (
        <GroupChatModal
          onClose={() => setShowGroupModal(false)}
          onCreated={(newGroup) => {
            setConversations(prev => [newGroup, ...prev]);
            selectConversation(newGroup);
          }}
        />
      )}

      {/* Voice/Video Call Modal */}
      {activeCall && (
        <CallModal
          targetUser={activeCall.targetUser}
          isVideo={activeCall.isVideo}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
};
