import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspaces";
import { signOut, createWorkspace } from "./actions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspace = await getActiveWorkspace(supabase, user.id);
  if (!workspace) {
    return <main className="auth-shell"><section className="auth-card"><div className="brand">RUSH <span>AI</span></div><h1>Create your workspace</h1><p>Your account is authenticated. Create the first workspace to start using RUSH.</p><form action={createWorkspace}><label>Workspace name<input name="name" placeholder="My sales team" required minLength={2}/></label><button className="primary" type="submit">Create workspace</button></form><form action={signOut}><button className="link-button" type="submit">Sign out</button></form></section></main>;
  }

  const [leadCount, campaignCount, conversationCount, bookingCount, recentLeads] = await Promise.all([
    supabase.from("leads").select("id", {count:"exact",head:true}).eq("workspace_id",workspace.id),
    supabase.from("campaigns").select("id", {count:"exact",head:true}).eq("workspace_id",workspace.id),
    supabase.from("conversations").select("id", {count:"exact",head:true}).eq("workspace_id",workspace.id),
    supabase.from("demo_bookings").select("id", {count:"exact",head:true}).eq("workspace_id",workspace.id),
    supabase.from("leads").select("id,first_name,last_name,job_title,company_name,status,email,created_at").eq("workspace_id",workspace.id).order("created_at",{ascending:false}).limit(8)
  ]);

  const stats = [
    ["Leads", leadCount.count ?? 0, "/leads"],
    ["Campaigns", campaignCount.count ?? 0, "/campaigns"],
    ["Conversations", conversationCount.count ?? 0, "/inbox"],
    ["Demo bookings", bookingCount.count ?? 0, "/bookings"]
  ];

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand">RUSH <span>AI</span></div><div className="workspace-label">{workspace.name}</div><nav>
      <Link className="active" href="/">Overview</Link><Link href="/leads">Leads</Link><Link href="/campaigns">Campaigns</Link><Link href="/inbox">Inbox</Link><Link href="/bookings">Demo bookings</Link><Link href="/settings">Settings</Link><Link href="/workspaces">Switch workspace</Link>
    </nav><div className="sidebar-foot"><small>{user.email}</small><form action={signOut}><button className="link-button" type="submit">Sign out</button></form></div></aside>
    <section className="main-panel"><header className="topbar"><span>Workspace / Overview</span><span className="connected"><i/> Live database</span></header><div className="page-content">
      <div className="page-heading"><div><p className="eyebrow">SALES COMMAND CENTER</p><h1>Welcome to RUSH</h1><p>Your workspace is connected. These numbers are read live from your database.</p></div><Link className="primary inline" href="/leads">+ Add leads</Link></div>
      <div className="stats-grid">{stats.map(([label,value,href])=><Link href={String(href)} className="stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong><small>Live workspace records →</small></Link>)}</div>
      <section className="data-card"><div className="section-heading"><div><h2>Recent leads</h2><p>Latest contacts added to this workspace</p></div><Link href="/leads">Manage leads →</Link></div>
      {(recentLeads.data?.length ?? 0)===0?<div className="empty-state"><h3>Your workspace is ready</h3><p>No leads yet. Add your first contacts or import a CSV to start building your pipeline.</p><Link className="primary inline" href="/leads">Open lead manager</Link></div>:<div className="table-wrap"><table><thead><tr><th>Contact</th><th>Role</th><th>Company</th><th>Status</th></tr></thead><tbody>{recentLeads.data?.map(lead=><tr key={lead.id}><td><b>{[lead.first_name,lead.last_name].filter(Boolean).join(" ")||"Unnamed contact"}</b><small>{lead.email||"No email"}</small></td><td>{lead.job_title||"—"}</td><td>{lead.company_name||"—"}</td><td><span className="tag">{lead.status.replaceAll("_"," ")}</span></td></tr>)}</tbody></table></div>}
      </section>
      <p className="footnote">RUSH is connected to Supabase. Messaging and AI execution remain disabled until their provider integrations are configured.</p>
    </div></section>
  </main>;
}
