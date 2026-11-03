import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function SmsIntegrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const fields = [
    ["TWILIO_ACCOUNT_SID", "Twilio Account SID"],
    ["TWILIO_AUTH_TOKEN", "Twilio Auth Token"],
    ["TWILIO_PHONE_NUMBER", "Sending phone number"]
  ];
  const ready = fields.filter(([key]) => Boolean(process.env[key])).length;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">RUSH <span>AI</span></div>
        <div className="workspace-label">Workspace</div>
        <nav>
          <Link href="/">Overview</Link><Link href="/leads">Leads</Link>
          <Link href="/campaigns">Campaigns</Link><Link href="/inbox">Inbox</Link>
          <Link href="/bookings">Demo bookings</Link><Link href="/settings" className="active">Settings</Link>
        </nav>
        <div className="sidebar-foot"><small>{user.email}</small><form action={signOut}><button className="link-button">Sign out</button></form></div>
      </aside>
      <section className="main-panel">
        <header className="topbar"><Link href="/settings">← Integrations</Link><span className="connected">SMS setup</span></header>
        <div className="page-content">
          <p className="eyebrow">CHANNEL CONFIGURATION</p>
          <h1>SMS Messaging</h1>
          <p>Configure Twilio to send SMS messages and route prospect replies into the RUSH inbox.</p>
          <section className="data-card" style={{maxWidth: 780, marginTop: 24}}>
            <div className="section-heading"><div><h2>Twilio server credentials</h2><p>{ready} of {fields.length} required settings detected on the server.</p></div></div>
            {fields.map(([key, label]) => <div className="credential-row" key={key}><div><b>{label}</b><code>{key}</code></div><span className={process.env[key] ? "credential-ok" : "credential-missing"}>{process.env[key] ? "Detected" : "Missing"}</span></div>)}
            <p>Add these values in Vercel → Project → Settings → Environment Variables. Keep them server-side; never expose them in browser code or paste them into chat.</p>
          </section>
          <section className="data-card setup-steps">
            <h2>Connection checklist</h2>
            <ol>
              <li>Create or use a Twilio account and purchase or verify an SMS-capable sender number.</li>
              <li>Add the three credentials above to the Vercel project for the environments you use.</li>
              <li>Configure the inbound message webhook and delivery status callback after the RUSH endpoints are deployed.</li>
              <li>Send a test only to a number that has consented to receive your messages.</li>
            </ol>
            <p className="integration-warning">This page currently detects server credentials only. SMS sending, inbound webhooks, delivery receipts and STOP/HELP handling are not active until the secure provider endpoints are implemented and tested. For messages to recipients in India, confirm applicable DLT registration, sender ID and template requirements before sending.</p>
          </section>
          <div className="page-actions"><Link className="secondary-action" href="/settings">Back to integrations</Link><a className="primary inline" href="https://www.twilio.com/docs/messaging" target="_blank" rel="noreferrer">Twilio documentation ↗</a></div>
        </div>
      </section>
    </main>
  );
}
