import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Sparkles, 
  ExternalLink, 
  Paperclip, 
  Search, 
  Smile, 
  FolderGit2, 
  FileText, 
  CheckCheck,
  Bot
} from 'lucide-react';
import { fetchConversations, fetchMessages, sendMessage, uploadFile } from '../api';

const QUICK_PROMPTS = [
  { label: '✨ Review Specs', text: 'Hi! I just reviewed the project requirements and have a few ideas.' },
  { label: '🎨 Figma / Repo', text: 'Could you share the Figma link or repo access for review?' },
  { label: '🎓 Free After Class', text: 'I am available for a quick sync today after my classes!' },
  { label: '🚀 Milestone Ready', text: 'Submitted the latest milestone draft for your review.' }
];

export default function ChatDrawer({ 
  currentUser, 
  initialOtherUser, 
  initialProject, 
  onClose,
  onOpenProject 
}) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePartner, setActivePartner] = useState(initialOtherUser || null);
  const [activeProject, setActiveProject] = useState(initialProject || null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState('chat'); // 'threads' | 'chat'

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load conversation threads
  useEffect(() => {
    loadThreads();
  }, [currentUser]);

  // When initial partner changes or passed in prop
  useEffect(() => {
    if (initialOtherUser) {
      setActivePartner(initialOtherUser);
      if (initialProject) setActiveProject(initialProject);
      setMobileView('chat');
    }
  }, [initialOtherUser, initialProject]);

  // When active partner changes, load messages and poll periodically
  useEffect(() => {
    if (activePartner) {
      loadChatMessages();
      const interval = setInterval(loadChatMessages, 3500);
      return () => clearInterval(interval);
    }
  }, [activePartner, activeProject, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function loadThreads() {
    try {
      const data = await fetchConversations(currentUser.id);
      setConversations(data);
      // If no initial partner set, pick the first thread
      if (!activePartner && data.length > 0 && data[0].otherUser) {
        setActivePartner(data[0].otherUser);
        setActiveProject(data[0].project);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadChatMessages() {
    if (!activePartner) return;
    try {
      const msgs = await fetchMessages({
        userId1: currentUser.id,
        userId2: activePartner.id,
        projectId: activeProject?.id
      });
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  async function handleFileAttachment(e) {
    const file = e.target.files?.[0];
    if (!file || !activePartner) return;
    setUploadingFile(true);
    try {
      const res = await uploadFile(file);
      await sendMessage({
        project_id: activeProject?.id || null,
        sender_id: currentUser.id,
        receiver_id: activePartner.id,
        message: inputMessage.trim() ? inputMessage.trim() : `📎 Sent file: ${res.file.name}`,
        attachment_url: res.file.url,
        attachment_name: res.file.name
      });
      setInputMessage('');
      await loadChatMessages();
      loadThreads();
    } catch (err) {
      alert('Failed to upload file: ' + err.message);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activePartner || sending) return;

    setSending(true);
    const textToSend = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage({
        project_id: activeProject?.id || null,
        sender_id: currentUser.id,
        receiver_id: activePartner.id,
        message: textToSend
      });
      await loadChatMessages();
      loadThreads();
      inputRef.current?.focus();
    } catch (err) {
      alert('Failed to send message: ' + err.message);
      setInputMessage(textToSend); // Restore on error
    } finally {
      setSending(false);
    }
  }

  function handleQuickPrompt(text) {
    setInputMessage(text);
    inputRef.current?.focus();
  }

  const filteredConversations = conversations.filter(c => {
    if (!c.otherUser) return false;
    const nameMatch = c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    const projectMatch = c.project?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || projectMatch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end overflow-hidden animate-in fade-in duration-200">
      {/* Background backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Main Chat Drawer Modal */}
      <div className="bg-white w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-full shadow-2xl flex flex-col md:flex-row border-l border-gray-200 text-gray-900 overflow-hidden relative">
        
        {/* Left Column: Threads Sidebar */}
        <div className={`w-full md:w-80 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0 h-full ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ff6200] border border-orange-200 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
                    <span>Messages</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-[#ff6200]">Direct</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">Project workspace chats</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {conversations.length} Active
              </span>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 focus:border-[#ff6200] focus:bg-white rounded-lg focus:outline-hidden transition-all text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-500 font-medium">
                <div className="w-5 h-5 border-2 border-[#ff6200] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">No conversations yet</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Start messaging directly from any project proposal or candidate profile!
                </p>
              </div>
            ) : (
              filteredConversations.map(c => {
                const isActive = activePartner?.id === c.otherUser.id && activeProject?.id === c.project?.id;
                return (
                  <button
                    key={`${c.otherUser.id}_${c.project?.id || 'general'}`}
                    onClick={() => {
                      setActivePartner(c.otherUser);
                      setActiveProject(c.project);
                      setMobileView('chat');
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-orange-50 border border-orange-300 shadow-xs' 
                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <img 
                        src={c.otherUser.avatar} 
                        alt={c.otherUser.name} 
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.otherUser?.name || 'User')}&background=ff6200&color=fff&bold=true`;
                        }}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-white" 
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-[#ff6200]' : 'text-gray-900'}`}>
                          {c.otherUser.name}
                        </span>
                        {c.lastMessage && (
                          <span className="text-[9px] text-gray-400 shrink-0">
                            {new Date(c.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {c.project && (
                        <div className="flex items-center gap-1 text-[10px] text-[#ff6200] font-semibold truncate mb-1">
                          <FolderGit2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{c.project.title}</span>
                        </div>
                      )}

                      {c.lastMessage && (
                        <p className="text-[11px] text-gray-500 truncate leading-snug">
                          {c.lastMessage.message}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Logged-in profile badge */}
          <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2.5">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=ff6200&color=fff&bold=true`;
              }}
              className="w-7 h-7 rounded-full object-cover border border-gray-200 bg-white" 
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#ff6200] font-semibold capitalize">{currentUser.role} Account</p>
            </div>
          </div>
        </div>

        {/* Right Column: Active Conversation Stream & Composer */}
        <div className={`flex-1 min-w-0 flex flex-col h-full bg-[#f9fafb] ${mobileView === 'threads' ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Active Partner Top Bar */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 shadow-xs">
            {activePartner ? (
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile back button */}
                <button
                  onClick={() => setMobileView('threads')}
                  className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 rounded-lg"
                  title="Back to conversations"
                >
                  ←
                </button>

                <div className="relative shrink-0">
                  <img
                    src={activePartner.avatar}
                    alt={activePartner.name}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activePartner?.name || 'User')}&background=ff6200&color=fff&bold=true`;
                    }}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-white"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{activePartner.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      activePartner.role === 'student' 
                        ? 'bg-orange-50 text-[#ff6200] border border-orange-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {activePartner.role}
                    </span>
                  </div>
                  
                  {activeProject ? (
                    <button
                      onClick={() => onOpenProject(activeProject.id)}
                      className="text-[11px] text-[#ff6200] hover:underline font-semibold flex items-center gap-1 truncate text-left cursor-pointer transition-colors"
                    >
                      <span className="truncate">Project: {activeProject.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </button>
                  ) : (
                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Active • {activePartner.college || activePartner.headline || 'Verified Member'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-gray-500">Select a conversation</div>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                title="Close chat drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ff6200] mb-3 shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-900">Direct Workspace Chat</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                  Coordinate deliverables, share files, and clarify task scopes directly in real-time.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-md">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(qp.text)}
                      className="text-xs font-semibold text-gray-700 bg-white hover:bg-orange-50 hover:text-[#ff6200] px-3 py-1.5 rounded-lg border border-gray-200 transition-all cursor-pointer shadow-xs"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center my-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 px-3 py-0.5 rounded-full shadow-xs">
                    Today
                  </span>
                </div>

                {messages.map(m => {
                  const isMe = m.sender_id === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={m.sender_avatar}
                          alt={m.sender_name}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.sender_name || 'User')}&background=ff6200&color=fff&bold=true`;
                          }}
                          className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0 mb-1 bg-white"
                        />
                      )}
                      
                      <div
                        className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                          isMe
                            ? 'bg-[#ff6200] text-white rounded-br-xs font-normal'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        {m.attachment_url && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <a
                              href={m.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                                isMe
                                  ? 'bg-white/20 hover:bg-white/30 text-white'
                                  : 'bg-orange-50 hover:bg-orange-100 text-[#ff6200] border border-orange-200'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[170px]">{m.attachment_name || 'View Document'}</span>
                              <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
                            </a>
                          </div>
                        )}
                        <div
                          className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 font-medium ${
                            isMe ? 'text-orange-100' : 'text-gray-400'
                          }`}
                        >
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel Bar */}
          <div className="px-3 py-2 bg-white border-t border-gray-200 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
            <span className="text-[10px] font-bold text-[#ff6200] bg-orange-50 px-2 py-1 rounded-md flex items-center gap-1 shrink-0 border border-orange-200">
              <Sparkles className="w-3 h-3 text-[#ff6200]" />
              Quick:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPrompt(qp.text)}
                className="text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-orange-50 hover:text-[#ff6200] border border-gray-200 px-3 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message Composer / Send Chat Area */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 min-w-0 relative flex items-center rounded-xl border border-gray-300 bg-white focus-within:border-[#ff6200] focus-within:ring-1 focus-within:ring-[#ff6200] transition-all shadow-xs">
                
                {/* Paperclip / attachment file input trigger */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*,.zip,.doc,.docx"
                  onChange={handleFileAttachment}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingFile || !activePartner}
                  onClick={() => fileInputRef.current?.click()}
                  className="pl-3 pr-1 text-gray-400 hover:text-[#ff6200] transition-colors cursor-pointer disabled:opacity-50"
                  title="Upload & send PDF, image, or document"
                >
                  {uploadingFile ? (
                    <div className="w-4 h-4 border-2 border-[#ff6200] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </button>

                {/* Input text field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={`Message ${activePartner ? activePartner.name : 'here'}... (Press Enter to send)`}
                  disabled={!activePartner || sending}
                  className="w-full min-w-0 py-2.5 px-2 text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-gray-900 placeholder-gray-400"
                />

                {/* Smile / Emoji quick insert */}
                <button
                  type="button"
                  onClick={() => setInputMessage(prev => prev + ' 🚀')}
                  className="pr-3 pl-1 text-gray-400 hover:text-[#ff6200] transition-colors cursor-pointer hidden sm:block"
                  title="Insert emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* PeoplePerHour Vibrant Orange SEND BUTTON */}
              <button
                type="submit"
                disabled={sending || !inputMessage.trim() || !activePartner}
                className="shrink-0 px-4 sm:px-5 py-2.5 bg-[#ff6200] hover:bg-[#e55800] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
