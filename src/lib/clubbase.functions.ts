import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, organization_id")
      .eq("id", userId)
      .maybeSingle();

    let organization = null;
    if (profile?.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .eq("id", profile.organization_id)
        .maybeSingle();
      organization = org;
    }
    return { profile, organization };
  });

export const createOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().min(2) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);

    const { data: org, error } = await supabase
      .from("organizations")
      .insert({ name: data.name, slug: `${slug}-${Date.now().toString(36)}` })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { error: upErr } = await supabase
      .from("profiles")
      .update({ organization_id: org.id })
      .eq("id", userId);
    if (upErr) throw new Error(upErr.message);

    return org;
  });

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("ai_threads")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ title: z.string().optional() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.organization_id) throw new Error("Kein Verein zugeordnet");

    const { data: thread, error } = await supabase
      .from("ai_threads")
      .insert({
        user_id: userId,
        organization_id: profile.organization_id,
        title: data.title ?? "Neue Konversation",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return thread;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("ai_threads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ threadId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("ai_messages")
      .select("id, role, parts, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant" | "system",
      parts: r.parts as unknown as Array<{ type: string; text?: string }>,
    }));
  });
