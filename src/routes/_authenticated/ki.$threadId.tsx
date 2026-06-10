import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages } from "@/lib/clubbase.functions";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ArrowUp, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const search = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/_authenticated/ki/$threadId")({
  validateSearch: search,
  component: Chat,
});

const PROMPTS = [
  "Sommersaison planen",
  "Sponsorenbericht schreiben",
  "Einladung zur JHV erstellen",
  "Mitglieder-Erinnerung senden",
];

function Chat() {
  const { threadId } = Route.useParams();
  const { q } = Route.useSearch();
  const getMessages = useServerFn(getThreadMessages);

  const { data: initial } = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: () => getMessages({ data: { threadId } }),
  });

  return initial ? (
    <ChatInner threadId={threadId} initial={initial} initialQuery={q} />
  ) : (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function ChatInner({
  threadId,
  initial,
  initialQuery,
}: {
  threadId: string;
  initial: Array<{ id: string; role: "user" | "assistant" | "system"; parts: unknown[] }>;
  initialQuery?: string;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentInitialRef = useRef(false);

  const initialMessages = initial.map((m) => ({
    id: m.id,
    role: m.role,
    parts: m.parts as UIMessage["parts"],
  })) as UIMessage[];

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (url, init) => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const headers = new Headers(init?.headers);
        if (token) headers.set("Authorization", `Bearer ${token}`);
        const body = init?.body ? JSON.parse(init.body as string) : {};
        return fetch(url, {
          ...init,
          headers,
          body: JSON.stringify({ ...body, threadId }),
        });
      },
    }),
  });

  const loading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (initialQuery && !sentInitialRef.current && initial.length === 0) {
      sentInitialRef.current = true;
      sendMessage({ text: initialQuery });
    }
  }, [initialQuery, initial.length, sendMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {messages.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary/15">
                <Sparkles className="size-5 text-primary" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Frag deine Vereins-KI – sie kennt euren Verein.
              </p>
            </div>
          )}

          <div className="space-y-8">
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="flex gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                    <Sparkles
                      className="size-3.5 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none flex-1 text-sm leading-relaxed text-foreground">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Sparkles className="size-3.5 text-primary animate-pulse" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Denkt nach…
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hairline-b">
        <div className="mx-auto max-w-3xl px-6 pb-6 pt-4">
          {messages.length === 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage({ text: p })}
                  className="rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hairline hover:border-primary hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={submit}
            className="surface-card flex items-end gap-2 p-2 transition-colors focus-within:border-primary"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              placeholder="Frag deine Vereins-KI…"
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground teal-glow transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" strokeWidth={2} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
