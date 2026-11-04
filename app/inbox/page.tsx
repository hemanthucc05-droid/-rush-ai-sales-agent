import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspaces";
import {signOut} from "../actions";
export const dynamic="force-dynamic";
export default async function Page(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const activeWorkspace = await getActiveWorkspace(supabase, user.id); const wid = activeWorkspace?.id;if(!wid)redirect("/");
 const {data, error}=await supabase.from("conversations").select("*").eq("workspace_id",wid).order("created_at",{ascending:false}).limit(100);
 return <main className="app-shell"><aside className="sidebar"><div className="brand">RUSH <span>AI</span></div><div className="workspace-label">Workspace</div><nav><Link href="/">Overview</Link><Link href="/leads">Leads</Link><Link href="/campaigns" className="">Campaigns</Link><Link href="/inbox" className="active">Inbox</Link><Link href="/bookings" className="">Demo bookings</Link><Link href="/settings" className="">Settings</Link><Link href="/workspaces">Switch workspace</Link></nav><div className="sidebar-foot"><small>{user.email}</small><form action={signOut}><button className="link-button">Sign out</button></form></div></aside><section className="main-panel"><header className="topbar"><Link href="/">← Overview</Link><span className="connected"><i/> Live database</span></header><div className="page-content"><div className="page-heading"><div><p className="eyebrow">RUSH WORKSPACE</p><h1>Inbox</h1><p>Workspace conversations and prospect activity.</p></div></div><section className="data-card"><div className="section-heading"><div><h2>Inbox records</h2><p>{data?.length??0} records · live database</p></div></div>{error?<p className="error-text">{error.message}</p>:!data?.length?<div className="empty-state"><h3>No inbox yet</h3><p>Contact|Channel / status|Last activity</p></div>:<div className="table-wrap"><table><thead><tr><th>Contact</th><th>Channel / status</th><th>Last activity</th></tr></thead><tbody>{data.map((row:any)=><tr key={row.id}><td>{row.name||row.title||row.lead_id||row.id}</td><td>{row.status||row.channel||row.direction||"—"}</td><td>{row.created_at?new Date(row.created_at).toLocaleString():"—"}</td></tr>)}</tbody></table></div>}</section></div></section></main>;
}
