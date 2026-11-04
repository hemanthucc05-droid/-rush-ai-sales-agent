import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";
export const dynamic = "force-dynamic";
export default async function SettingsPage() {
 const supabase = await createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) redirect("/login");
 const { data: memberships } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1);
 if (!memberships?.[0]?.workspace_id) redirect("/");
 const sentReady = !!process.env.SENT_API_KEY;
 const whatsappReady = !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_BUSINESS_ACCOUNT_ID);
 const smsReady = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
 const cards = [
  { title: "Sent — WhatsApp + SMS", detail: "Unified messaging with automatic routing, WhatsApp capability checks and SMS fallback.", href: "/settings/integrations/sent", label: sentReady ? "API key detected" : "Setup required", icon: "S" },
  { title: "WhatsApp Business (Meta direct)", detail: "Alternative direct connection to Meta WhatsApp Business Cloud API.", href: "/settings/integrations/whatsapp", label: whatsappReady ? "Credentials detected" : "Not connected", icon: "WA" },
  { title: "SMS Messaging (Twilio)", detail: "Alternative Twilio SMS configuration for outbound messages and delivery status.", href: "/settings/integrations/sms", label: smsReady ? "Credentials detected" : "Not connected", icon: "SMS" },
  { title: "Email", detail: "Verified sending domain and email provider configuration.", href: "/settings/integrations/email", label: "Setup required", icon: "@" },
  { title: "Calendar", detail: "Calendar connection for available demo slots and bookings.", href: "/settings/integrations/calendar", label: "Setup required", icon: "CAL" }
 ];
 return <main className="app-shell"><aside className="sidebar"><div className="brand">RUSH <span>AI</span></div><div className="workspace-label">Workspace</div><nav><Link href="/">Overview</Link><Link href="/leads">Leads</Link><Link href="/campaigns">Campaigns</Link><Link href="/inbox">Inbox</Link><Link href="/bookings">Demo bookings</Link><Link href="/settings" className="active">Settings</Link></nav><div className="sidebar-foot"><small>{user.email}</small><form action={signOut}><button className="link-button">Sign out</button></form></div></aside><section className="main-panel"><header className="topbar"><Link href="/">← Overview</Link><span className="connected"><i/> Workspace settings</span></header><div className="page-content"><div className="page-heading"><div><p className="eyebrow">RUSH CONTROL CENTER</p><h1>Settings & integrations</h1><p>Connect the channels RUSH uses to reach prospects and manage conversations.</p></div></div><div className="integration-grid">{cards.map(card => <article className="integration-card" key={card.title}><div className="integration-icon">{card.icon}</div><span className="integration-state">{card.label}</span><h2>{card.title}</h2><p>{card.detail}</p><Link href={card.href}>Configure →</Link></article>)}</div><div className="security-callout"><b>Credential security</b><p>Provider secrets belong in encrypted server-side Vercel environment variables. Never put access tokens in browser code or public forms.</p></div></div></section></main>;
}
