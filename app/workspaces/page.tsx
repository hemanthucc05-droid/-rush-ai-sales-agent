import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { selectWorkspace, signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: memberships, error } = await supabase.from("workspace_members")
    .select("workspace_id, role, workspaces(id,name,slug)")
    .eq("user_id", user.id);
  if (error) throw new Error("Unable to load workspaces.");
  const workspaces = (memberships || []).map((m: any) => ({
    id: m.workspace_id, role: m.role, name: m.workspaces?.name || "Workspace", slug: m.workspaces?.slug || ""
  })).filter((w: any) => w.id);
  return <main className="auth-shell"><section className="auth-card">
    <div className="brand">RUSH <span>AI</span></div><p className="eyebrow">WORKSPACE SELECTOR</p><h1>Choose a workspace</h1>
    <p>Each workspace has separate leads, campaigns, conversations and integrations.</p>
    <div className="workspace-choice-list">{workspaces.map((w: any) => <form action={selectWorkspace} key={w.id}>
      <input type="hidden" name="workspace_id" value={w.id}/><button className="workspace-choice" type="submit"><span><b>{w.name}</b><small>{w.role} · {w.slug}</small></span><strong>Open →</strong></button>
    </form>)}</div>
    <p><Link href="/">Return to dashboard</Link></p><form action={signOut}><button className="link-button">Sign out</button></form>
  </section></main>;
}
