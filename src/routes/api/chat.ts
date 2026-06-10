import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = auth.slice(7);

        const body = (await request.json()) as {
          messages?: UIMessage[];
          threadId?: string;
        };
        const messages = body.messages;
        const threadId = body.threadId;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("Bad request", { status: 400 });
        }

        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          },
        );

        const { data: userData } = await supabase.auth.getUser(token);
        const userId = userData.user?.id;
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const { data: thread } = await supabase
          .from("ai_threads")
          .select("id, user_id, organization_id")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread || thread.user_id !== userId) {
          return new Response("Forbidden", { status: 403 });
        }

        // Light club context for the model
        const [members, events, sponsors, bookings] = await Promise.all([
          supabase
            .from("members")
            .select("first_name, last_name, role", { count: "exact" })
            .eq("organization_id", thread.organization_id)
            .limit(20),
          supabase
            .from("events")
            .select("title, starts_at, location")
            .eq("organization_id", thread.organization_id)
            .order("starts_at", { ascending: true })
            .limit(10),
          supabase
            .from("sponsors")
            .select("name, amount_cents, active")
            .eq("organization_id", thread.organization_id)
            .limit(20),
          supabase
            .from("bookings")
            .select("facility, starts_at, ends_at")
            .eq("organization_id", thread.organization_id)
            .order("starts_at", { ascending: true })
            .limit(10),
        ]);

        const system = `Du bist die Vereins-KI von Clubbase. Du hilfst Vereinsvorständen bei Verwaltung, Planung, Kommunikation, Finanzen und Sponsoren. Antworte immer auf Deutsch, präzise, klar und freundlich. Nutze Markdown für Struktur.

Vereinsdaten (Auszug):
- Mitglieder gesamt (sichtbar): ${members.count ?? members.data?.length ?? 0}
- Beispiel-Mitglieder: ${JSON.stringify(members.data?.slice(0, 5) ?? [])}
- Kommende Events: ${JSON.stringify(events.data ?? [])}
- Sponsoren: ${JSON.stringify(sponsors.data ?? [])}
- Platzbuchungen: ${JSON.stringify(bookings.data ?? [])}`;

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            try {
              const last = finalMessages[finalMessages.length - 1];
              const prevUser = [...finalMessages]
                .reverse()
                .find((m) => m.role === "user");
              const inserts: Array<{ thread_id: string; role: string; parts: unknown }> =
                [];
              if (prevUser) {
                inserts.push({
                  thread_id: threadId,
                  role: "user",
                  parts: prevUser.parts as unknown,
                });
              }
              if (last && last.role === "assistant") {
                inserts.push({
                  thread_id: threadId,
                  role: "assistant",
                  parts: last.parts as unknown,
                });
              }
              if (inserts.length) {
                await supabase.from("ai_messages").insert(inserts);
                await supabase
                  .from("ai_threads")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", threadId);
              }
            } catch (e) {
              console.error("save messages failed", e);
            }
          },
        });
      },
    },
  },
});
