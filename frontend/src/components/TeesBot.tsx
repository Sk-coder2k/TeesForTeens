"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "What products do you have? 👕",
  "How long is delivery? 🚚",
  "What's your return policy? 🔄",
  "How do I track my order? 📦",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function TeesBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! 👋 I'm TeesBot — your style guide at TeesforTeens! Ask me anything about our products, orders, or delivery 🔥",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || isLoading) return;

    setInput("");
    setShowBubble(false);
    const newMessages: Message[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          includeProducts: true,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Oops, something went wrong 😅" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Try again in a moment! 🙏" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 ${
            isMinimized ? "h-16 overflow-hidden" : "h-[520px]"
          }`}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-t-3xl cursor-pointer"
            style={{ background: "linear-gradient(135deg, #0f1f1a, #29bc89)" }}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <img src="/logo.svg" alt="TeesBot" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">TeesBot</p>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  Always online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <Minimize2 size={15} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #0f1f1a, #29bc89)" }}>
                        <img src="/logo.svg" alt="" className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-br-sm"
                          : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                      }`}
                      style={msg.role === "user" ? { background: "linear-gradient(135deg, #1a3d2b, #29bc89)" } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #0f1f1a, #29bc89)" }}>
                      <img src="/logo.svg" alt="" className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-2 h-2 bg-[#29bc89] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-[#29bc89] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-[#29bc89] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies - show only on first message */}
              {messages.length === 1 && (
                <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white border-t border-gray-100">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-[#29bc89] text-[#29bc89] hover:bg-[#29bc89] hover:text-white transition-colors font-medium whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-3 border-t border-gray-100 bg-white rounded-b-3xl">
                <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-[#29bc89] transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #1a3d2b, #29bc89)" }}
                  >
                    <Send size={14} className="text-white translate-x-0.5" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-1.5">Powered by TeesforTeens AI</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-2">
        {/* Tooltip bubble */}
        {showBubble && !isOpen && (
          <div className="bg-white shadow-lg border border-gray-100 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm font-medium text-gray-800 animate-bounce-once max-w-[200px] text-right">
            👋 Need help shopping?
            <button onClick={() => setShowBubble(false)} className="ml-2 text-gray-400 hover:text-gray-600">
              <X size={12} className="inline" />
            </button>
          </div>
        )}

        <button
          onClick={() => { setIsOpen(!isOpen); setShowBubble(false); setIsMinimized(false); }}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #0f1f1a, #29bc89)" }}
        >
          {isOpen ? (
            <X size={22} className="text-white" />
          ) : (
            <div className="relative">
              <Sparkles size={24} className="text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
          )}
        </button>
      </div>
    </>
  );
}
