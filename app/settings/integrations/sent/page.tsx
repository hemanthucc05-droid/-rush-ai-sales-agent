import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspaces";
import { signOut } from "../../../actions";
import SentSandboxTest from "./SentSandboxTest";

export const dynamic = "force-dynamic";

export default async function SentIntegrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: members } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1);
  if (!activeWorkspace?.id) redirect("/");
  const configured = Boolean(process.env.SENT_API_KEY);

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand">RUSH <span>AI</span></div><div className="workspace-label">Workspace</div><nav><Link href="/">Overview</Link><Link href="/leads">Leads</Link><Link href="/campaigns">Campaigns</Link><Link href="/inbox">Inbox</Link><Link href="/bookings">Demo bookings</Link><Link href="/settings" className="active">Settings</Link><Link href="/workspaces">Switch workspace</Link></nav><div className="sidebar-foot"><small>{user.email}</small><form action={signOut}><button className="link-button">Sign out</button></form></div></aside>
    <section className="main-panel"><header className="topbar"><Link href="/settings">← Integrations</Link><span className="connected"><i/> Sent provider</span></header>
      <div className="page-content">
        <div className="page-heading"><div><p className="eyebrow">CHANNEL CONFIGURATION</p><h1>Sent — WhatsApp & SMS</h1><p>One messaging provider for automatic channel routing, delivery events and two-way conversations.</p></div></div>
        <div className="provider-banner"><div className="integration-icon green">S</div><div><b>Sent API v3</b><p>Messages are routed by Sent when you choose the automatic channel.</p></div><span className={configured ? "provider-connected" : "provider-pending"}>{configured ? "API key detected" : "API key missing"}</span></div>
        <section className="data-card"><div className="section-heading"><div><h2>Server configuration</h2><p>Add these in Vercel → Project → Settings → Environment Variables. Never expose them in browser code.</p></div></div>
          <div className="credential-row"><div><b>Sent API key</b><code>SENT_API_KEY</code></div><span className={configured ? "credential-ok" : "credential-missing"}>{configured ? "Detected" : "Missing"}</span></div>
          <div className="credential-row"><div><b>Webhook signing secret</b><code>SENT_WEBHOOK_SECRET</code></div><span className="credential-missing">Required for inbound events</span></div>
        </section>
        <SentSandboxTest />
        <section className="data-card setup-steps"><h2>How channel routing works</h2><ol>
          <li><b>Automatic:</b> send with channel <code>sent</code>. Sent can attempt WhatsApp and fall back to SMS when the recipient is not WhatsApp-capable, subject to channel configuration and message rules.</li>
          <li><b>WhatsApp only:</b> send with channel <code>whatsapp</code>. This does not fall back to SMS.</li>
          <li><b>SMS only:</b> send with channel <code>sms</code>.</li>
        </ol><p className="integration-warning">A valid phone number does not prove consent. Production campaigns remain disabled until Rush stores consent evidence, enforces opt-outs and approved templates, verifies Sent webhook signatures and records inbound/outbound events. A sandbox test is simulated only.</p></section>
        <div className="page-actions"><Link className="secondary-action" href="/settings">Back to integrations</Link><a className="primary inline" href="https://docs.sent.dm/" target="_blank" rel="noreferrer">Sent API documentation ↗</a></div>
      </div>
    </section>
  </main>;
}
