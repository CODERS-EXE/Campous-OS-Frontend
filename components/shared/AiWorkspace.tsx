"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  Image as ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  User as UserIcon,
  X,
  Terminal,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api, AiChatMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Code Block & Markdown Renderer
// ─────────────────────────────────────────────────────────────────────────────

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
      {/* Code Header */}
      <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 text-xs text-slate-400 border-b border-slate-800">
        <span className="flex items-center gap-1.5 font-mono font-semibold uppercase text-slate-300">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" /> Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy Code
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  // Split by code blocks bounded by ```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: "code"; language: string; value: string } | { type: "text"; value: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add plain text before code block
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.substring(lastIndex, match.index) });
    }
    parts.push({
      type: "code",
      language: match[1] || "text",
      value: match[2].trim(),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.substring(lastIndex) });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, idx) => {
        if (part.type === "code") {
          return <CodeBlock key={idx} code={part.value} language={part.language} />;
        }

        // Formatted Text
        const lines = part.value.split("\n");
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              // Header 3 or 2
              if (line.startsWith("### ")) {
                return (
                  <h4 key={lineIdx} className="font-bold text-base mt-2 mb-1 text-foreground">
                    {line.replace("### ", "")}
                  </h4>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h3 key={lineIdx} className="font-extrabold text-lg mt-3 mb-1 text-foreground">
                    {line.replace("## ", "")}
                  </h3>
                );
              }
              // Bullet lists
              if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
                const bulletText = line.trim().replace(/^[*\-]\s+/, "");
                return (
                  <div key={lineIdx} className="flex items-start gap-2 text-xs sm:text-sm pl-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{parseInlineStyles(bulletText)}</span>
                  </div>
                );
              }
              // Empty line
              if (!line.trim()) {
                return <div key={lineIdx} className="h-1" />;
              }

              return (
                <p key={lineIdx} className="text-xs sm:text-sm leading-relaxed">
                  {parseInlineStyles(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function parseInlineStyles(text: string) {
  // Simple bold and inline code parsing
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AiWorkspace Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface ExtendedAiChatMessage extends AiChatMessage {
  attachedImage?: string;
}

export function AiWorkspace() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ExtendedAiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history and suggested questions
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

  // Voice Input SpeechRecognition API Handler
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new (SpeechRecognition as any)();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Handle Image File Upload Preview
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy Chat Message
  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if ((!text && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    setInputMessage("");
    setSelectedImage(null);
    setError(null);

    const tempUserMsg: ExtendedAiChatMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      content: text,
      attachedImage: currentImage || undefined,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendAiMessage(text || "Please analyze the attached image.", selectedImage || null);
      const assistantMsg: ExtendedAiChatMessage = {
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
      const errMsg =
        err instanceof Error
          ? err.message
          : "Failed to connect to CampusOS AI Assistant. Please try again.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear Chat History
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
    <Card className="flex flex-col h-[calc(100vh-130px)] border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden text-card-foreground">
      {/* ── Header ── */}
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-transparent py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 text-white shadow-lg">
              <Bot className="h-6 w-6" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background shadow-sm" />
            </div>
            <div>
              <CardTitle className="text-lg font-extrabold flex items-center gap-2 tracking-tight">
                CampusOS AI Workspace
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Engine
                </span>
              </CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                Role: <span className="font-semibold text-foreground capitalize">{user.role.replace("_", " ")}</span> • Realtime campus intelligence
              </CardDescription>
            </div>
          </div>

          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 transition-all"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear Chat
            </Button>
          )}
        </div>
      </CardHeader>

      {/* ── Chat Messages Container ── */}
      <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-muted/20">
        {isFetchingHistory ? (
          <div className="flex h-full items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-semibold">Loading conversation history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 space-y-5">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent text-primary shadow-inner border border-primary/20">
              <BrainCircuit className="h-10 w-10 text-primary" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-pulse" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-extrabold text-xl tracking-tight text-foreground">
                How can I assist you today, {user.name.split(" ")[0]}?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Ask anything about academic performance, attendance analytics, hostel room status, fee dues, exam timetables, or general campus queries.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "group relative flex gap-3 sm:gap-4 max-w-4xl mx-auto transition-all",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {/* AI Avatar */}
              {msg.sender === "assistant" && (
                <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              {/* Message Bubble Card */}
              <div
                className={cn(
                  "relative rounded-3xl p-4 sm:p-5 shadow-md leading-relaxed transition-all max-w-[88%] sm:max-w-[80%]",
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white rounded-br-xs shadow-indigo-500/10"
                    : "bg-card border border-border/70 text-card-foreground rounded-bl-xs backdrop-blur-xl shadow-sm"
                )}
              >
                {/* Attached Image Preview */}
                {msg.attachedImage && (
                  <div className="mb-3 overflow-hidden rounded-2xl border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={msg.attachedImage} alt="Attachment" className="max-h-56 w-full object-cover" />
                  </div>
                )}

                {/* Content */}
                {msg.sender === "assistant" ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}

                {/* Timestamp & Copy Action */}
                <div className="mt-2.5 flex items-center justify-between gap-3 text-[10px] opacity-70">
                  <span>
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Just now"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    {copiedMessageId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* User Avatar */}
              {msg.sender === "user" && (
                <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-2xl bg-muted text-foreground border border-border/60 shadow-sm">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 max-w-4xl mx-auto justify-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-3xl rounded-bl-xs bg-card border border-border/70 px-5 py-4 text-muted-foreground flex items-center gap-3 shadow-md backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground animate-pulse">
                CampusOS AI is thinking...
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="max-w-4xl mx-auto rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive flex items-center justify-between gap-3 shadow-sm">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 hover:bg-destructive/20 rounded-xl text-xs"
              onClick={() => {
                setError(null);
              }}
            >
              <X className="mr-1.5 h-3.5 w-3.5" /> Dismiss
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* ── Suggested Prompts Chips Bar ── */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-4 sm:px-6 py-2.5 border-t border-border/60 bg-card/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Suggestions:
          </span>
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 rounded-full border border-border/60 bg-background/80 px-3.5 py-1 text-xs text-foreground/80 hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all shadow-sm font-semibold"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Modern Dock Input Bar ── */}
      <div className="border-t border-border/60 p-3 sm:p-4 bg-card/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto space-y-2"
        >
          {/* Image Thumbnail Preview */}
          {selectedImage && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Selected preview"
                className="h-16 w-16 rounded-xl object-cover border border-border shadow-md"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:scale-110 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/80 p-1.5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 shadow-inner transition-all">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Upload Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
              title="Attach Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            {/* Voice Input Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              className={`h-9 w-9 rounded-xl shrink-0 transition-all ${
                isListening
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 animate-pulse"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={isListening ? "Listening... Speak now" : "Voice Input"}
            >
              {isListening ? <MicOff className="h-4 w-4 text-rose-500" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Input Text Box */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isListening
                  ? "Listening to voice input..."
                  : `Ask CampusOS AI (${user.role.replace("_", " ")} context)...`
              }
              disabled={isLoading}
              className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-foreground focus:outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />

            {/* Send Action Button */}
            <Button
              type="submit"
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 font-semibold shadow-md shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Send
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
