"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronDown,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, AiChatMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export function AiAssistant() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Fetch History and Suggestions when modal opens or user changes
  useEffect(() => {
    if (!user || !isOpen) return;

    const loadData = async () => {
      setIsFetchingHistory(true);
      setError(null);
      try {
        const [historyData, suggestionsData] = await Promise.all([
          api.getAiHistory().catch(() => []),
          api.getAiSuggestions().catch(() => ({ suggestions: [] })),
        ]);
        setMessages(historyData);
        setSuggestions(suggestionsData.suggestions || []);
      } catch {
        // Fallback gracefully
      } finally {
        setIsFetchingHistory(false);
      }
    };

    loadData();
  }, [user, isOpen]);

  if (!user) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage("");
    setError(null);

    // Optimistically add user message
    const tempUserMsg: AiChatMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendAiMessage(text);
      const assistantMsg: AiChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        content: res.reply,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestions(res.suggested_questions);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to connect to AI Assistant. Please try again.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear conversation history?")) return;
    try {
      await api.clearAiHistory();
      setMessages([]);
      setError(null);
    } catch {
      setError("Failed to clear conversation history.");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
              <Bot className="h-7 w-7 transition-transform group-hover:rotate-12" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 flex flex-col bg-background/95 backdrop-blur-md border shadow-2xl transition-all duration-300",
              isExpanded
                ? "inset-4 md:inset-8 rounded-2xl"
                : "bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[calc(100vh-2rem)] rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">CampusOS AI Assistant</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Role-Aware
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role.replace("_", " ")} Mode • {user.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleClearHistory}
                    title="Clear Conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hidden sm:inline-flex"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Minimize Window" : "Expand Window"}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => setIsOpen(false)}
                  title="Close AI Assistant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isFetchingHistory ? (
                <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                  <span className="text-sm">Loading chat history...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">How can I help you today?</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                      Ask about your attendance, exam results, timetable, assignments, hostel requests, or campus insights.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 text-sm",
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.sender === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm",
                        msg.sender === "user"
                          ? "bg-violet-600 text-white rounded-br-none"
                          : "bg-muted/80 text-foreground border rounded-bl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.sender === "user" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-muted text-muted-foreground border">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3 text-sm justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-bl-none bg-muted/80 border px-4 py-3 text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center justify-between gap-2">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-destructive/30 hover:bg-destructive/20"
                    onClick={() => handleSendMessage()}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Retry
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {suggestions.length > 0 && !isLoading && (
              <div className="px-4 py-2 border-t bg-muted/20 flex gap-2 overflow-x-auto scrollbar-none">
                {suggestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="shrink-0 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input */}
            <div className="border-t p-3 bg-background rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask AI (${user.role.replace("_", " ")} context)...`}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border bg-muted/40 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
