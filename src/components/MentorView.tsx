import React, { useEffect, useState, useRef } from "react";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Sparkles, 
  Loader2, 
  UserCircle,
  HelpCircle
} from "lucide-react";
import { ChatSession, ChatMessage } from "../types";

interface MentorViewProps {
  token: string | null;
}

export default function MentorView({ token }: MentorViewProps) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [input, setInput] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to latest bubbles
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async (selectLatestId: string | null = null) => {
    if (!token) return;
    try {
      setLoadingChats(true);
      const res = await fetch("/api/mentor/chats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
        
        if (data.length > 0) {
          const targetId = selectLatestId || data[data.length - 1].id;
          setActiveChatId(targetId);
          loadMessages(targetId);
        } else {
          // Auto create first chat thread
          createFirstChatThread();
        }
      }
    } catch (err) {
      console.error("Error setting chat channels:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const createFirstChatThread = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/mentor/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: "Career Placement Advisory" })
      });
      if (res.ok) {
        const data = await res.json();
        loadChats(data.id);
      }
    } catch (err) {
      console.error("Error seeding first thread:", err);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      setLoadingMsgs(true);
      const res = await fetch(`/api/mentor/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading chat messages:", err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartNewChat = async () => {
    if (!token) return;
    try {
      const title = prompt("Enter a topic/headline name for this conversation:");
      if (!title || !title.trim()) return;

      const res = await fetch("/api/mentor/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        loadChats(data.id);
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChatId || sending) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistic local UI bubble rendering
    const optimUserMsg: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimUserMsg]);
    
    try {
      setSending(true);
      const res = await fetch(`/api/mentor/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (res.ok) {
        const botReply = await res.json();
        setMessages(prev => [...prev, botReply]);
      }
    } catch (err) {
      console.error("Error messaging bot:", err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestion = (val: string) => {
    setInput(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="mentor-view-root">
      
      {/* Header element */}
      <div className="border-b border-gray-100 pb-5" id="mentor-header">
        <h2 className="text-2xl font-bold font-sans text-gray-900 tracking-tight">AI Placement Mentor</h2>
        <p className="text-sm text-gray-500">Ask placement guidance, formatting recommendations, or mock interview questions</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 flex overflow-hidden min-h-[500px] h-[600px] shadow-sm relative" id="mentor-chat-terminal">
        
        {/* Left Side: Threads drawer */}
        <div className="w-56 border-r border-[#f1f5f9] flex flex-col h-full bg-slate-50/10">
          <div className="p-4 border-b border-[#f1f5f9]">
            <button
              onClick={handleStartNewChat}
              id="btn-new-chat-session"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-200 text-gray-600 hover:text-violet-700 hover:border-violet-300 rounded-xl text-xs font-semibold cursor-pointer transition-all bg-white"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {loadingChats ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4.5 h-4.5 animate-spin text-violet-600" />
              </div>
            ) : chats.length === 0 ? (
              <span className="text-[10px] text-gray-400 block text-center py-4">No active conversations.</span>
            ) : (
              chats.map((c) => {
                const isActive = activeChatId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveChatId(c.id);
                      loadMessages(c.id);
                    }}
                    id={`chat-channel-${c.id}`}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium truncate tracking-tight transition-all block ${
                      isActive 
                        ? "bg-violet-600 text-white font-semibold shadow-sm" 
                        : "text-gray-600 hover:bg-slate-100"
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat box area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          
          <div className="p-4 border-b border-[#f1f5f9] bg-slate-50/30 flex justify-between items-center text-xs">
            <span className="font-bold text-gray-700">Chat Session Log</span>
            <div className="flex items-center gap-1 font-semibold uppercase text-violet-700 text-[10px] tracking-wider">
              <Sparkles className="w-4 h-4 fill-violet-200" />
              <span>Gemini Engine Active</span>
            </div>
          </div>

          {/* Messages board */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-scroller">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 max-w-sm mx-auto">
                <MessageSquare className="w-12 h-12 text-gray-300 fill-slate-50" />
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  Welcome to your Smart Placement Console! Send our mentor a query about resume formatting, interview preparation, career paths, or skill suggestion tags.
                </p>
                {/* Suggestions quick starters */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2" id="chat-starters">
                  <button onClick={() => handleQuickQuestion("How do I improve my resume ATS score?")} className="text-[10px] font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-100/50">
                    ATS Resume Tips
                  </button>
                  <button onClick={() => handleQuickQuestion("What are five key skill areas to learn next?")} className="text-[10px] font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-100/50">
                    High value Skills list
                  </button>
                  <button onClick={() => handleQuickQuestion("How can I prepare for junior software engineer interviews?")} className="text-[10px] font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-100/50">
                    Interview prep
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex items-start gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto text-left"}`} id={`chat-bubble-${idx}`}>
                    
                    {/* Avatar Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isUser ? "bg-indigo-100 text-indigo-700" : "bg-violet-600 text-white shadow-sm"
                    }`}>
                      {isUser ? (
                        <UserCircle className="w-5 h-5 text-indigo-700" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lucide lucide-zap fill-white text-transparent">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      )}
                    </div>

                    {/* Bubble box */}
                    <div className={`p-4 rounded-3xl border text-xs leading-relaxed font-light ${
                      isUser 
                        ? "bg-violet-600 text-white border-violet-600 rounded-br-none shadow-sm" 
                        : "bg-slate-50 text-gray-850 border-slate-100 rounded-bl-none whitespace-pre-line"
                    }`}>
                      <span>{m.content}</span>
                    </div>

                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-start gap-3 max-w-[80%] mr-auto text-left" id="chat-typing-indicator">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="fill-white text-transparent">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div className="p-3.5 rounded-3xl bg-slate-50 border border-slate-100 rounded-bl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-225"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input segment */}
          {activeChatId && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#f1f5f9] bg-white flex gap-3" id="chat-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about resume, interview prep, skill roadmap..."
                id="chat-input-text"
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-250 font-light text-xs focus:outline-none focus:border-violet-400"
                required
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                id="chat-send-btn"
                className="p-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-sm transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
