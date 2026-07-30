"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api, AiChatMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export function AiWorkspace() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  if (!user) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage("");
    setError(null);

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
    <Card className="flex flex-col h-[calc(100vh-140px)] border shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-transparent py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                CampusOS AI Workspace
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Context
                </span>
              </CardTitle>
              <CardDescription>
                Tailored AI Assistance for {user.name} ({user.role.replace("_", " ")})
              </CardDescription>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
        {isFetchingHistory ? (
          <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
            <span>Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Welcome to CampusOS AI Workspace</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Ask any questions about attendance, exam performance, fee status, timetable schedules, hostel requests, or college insights.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4 text-sm max-w-4xl mx-auto",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.sender === "assistant" && (
                <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-5 py-3.5 whitespace-pre-wrap leading-relaxed shadow-sm",
                  msg.sender === "user"
                    ? "bg-violet-600 text-white rounded-br-none max-w-[80%]"
                    : "bg-background border text-foreground rounded-bl-none max-w-[85%]"
                )}
              >
                {msg.content}
              </div>
              {msg.sender === "user" && (
                <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-muted text-muted-foreground border">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex gap-4 text-sm max-w-4xl mx-auto justify-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl rounded-bl-none bg-background border px-5 py-4 text-muted-foreground flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2.5 w-2.5 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2.5 w-2.5 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 hover:bg-destructive/20"
              onClick={() => handleSendMessage()}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Suggested prompts bar */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-6 py-3 border-t bg-background/50 flex gap-2 overflow-x-auto">
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 rounded-full border bg-background px-4 py-1.5 text-xs text-muted-foreground hover:bg-violet-600 hover:text-white transition-all shadow-sm font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask CampusOS AI Assistant (${user.role.replace("_", " ")} context)...`}
            disabled={isLoading}
            className="flex-1 rounded-xl border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="h-11 px-6 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 font-medium"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
