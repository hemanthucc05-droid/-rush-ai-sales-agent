import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ACTIVE_WORKSPACE_COOKIE = "rush_active_workspace";

export async function getActiveWorkspace(supabase: SupabaseClient, userId: string) {
  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, slug)")
    .eq("user_id", userId);
  if (error) throw new Error("Unable to load workspace memberships.");
  const available = (memberships || []).map((m: any) => ({
    id: m.workspace_id,
    role: m.role,
    name: m.workspaces?.name || "Workspace",
    slug: m.workspaces?.slug || ""
  })).filter((w) => w.id);
  if (!available.length) return null;

  const cookieStore = await cookies();
  const selectedId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;
  const selected = available.find((w) => w.id === selectedId);
  if (selected) return selected;
  if (available.length === 1) return available[0];
  redirect("/workspaces");
}
