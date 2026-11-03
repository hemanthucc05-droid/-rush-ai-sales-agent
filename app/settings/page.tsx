import Link from "next/link";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {signOut} from "../../actions";
export const dynamic="force-dynamic";
const channels = [
 {name:"WhatsApp Business",description:"Connect the official WhatsApp Business Platform to send and receive sales conversations.",href:"/settings/integrations/whatsapp",icon:"WA",tone:"green",provider:"Meta Cloud API"},
 {name:"SMS",description:"Connect an SMS provider for outbound messages, replies and delivery status.",href:"/settings/integrations/sms",icon:"SMS",tone:"blue",provider:"Twilio / MSG91"},
 {name:"Email",description:"Configure a verified sending domain and transactional or outbound email provider.",href:"/settings/integrations/email",icon:"@",tone:"purple",provider:"SMTP / Resend"},
 {name:"Calendar",description:"Connect calendars to offer available demo slots and create bookings.",href:"/settings/integrations/calendar",icon:"CAL",tone:"orange",provider:"Google / Microsoft"}
];
export default async function Page(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/login");
 const {data:members}=await supabase.from("workspace_members").select("workspace_id").eq("user_id",user.id).limit(1);if(!members?.[0]?.workspace_id)redirect("/");
 const status=(key:string)=>process.env[key]?"Credentials detected":"Not connected";
 const configured={
  whatsapp:!!(process.env.WHATSAPP_ACCESS_TOKEN&&process.env.WHATSAPP_PHONE_NUMBER_ID&&process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
  sms:!!(process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN&&process.env.TWILIO_PHONE_NUMBER)
 };
 return <main className="app-shell"><aside className="sidebar"><div className="brand">RUSH <span>AI</span></div><div className="workspace-label">Workspace</div><nav><Link href="/">Overview</Link><Link href="/leads">Leads</Link><Link href="/campaigns">Campaigns</Link><Link href="/inbox">Inbox</Link><Link href="/bookings">Demo bookings</Link><Link href="/settings" className="active">Settings</Link></nav><div className="sidebar-foot"><small>{user.email}</small><form action={signOut}><button className="link-button">Sign out</button></form></div></aside><section className="main-panel"><header className="topbar"><Link href="/">← Overview</Link><span className="connected"><i/> Workspace settings</span></header><div className="page-content"><div className="page-heading"><div><p className="eyebrow">RUSH CONTROL CENTER</p><h1>Settings & integrations</h1><p>Connect the channels RUSH uses to reach prospects and manage conversations.</p></div></div><div className="integration-summary"><div><span>WhatsApp</span><b className={configured.whatsapp?"is-ready":"is-off"}>{configured.whatsapp?"Credentials detected":"Not connected"}</b></div><div><span>SMS</span><b className={configured.sms?"is-ready":"is-off"}>{configured.sms?"Credentials detected":"Not connected"}</b></div><div><span>Workspace</span><b className="is-ready">Active</b></div></div><div className="integration-grid">{channels.map((c)=><article className="integration-card" key={c.name}><div className={"integration-icon "+c.tone}>{c.icon}</div><div className="integration-provider">{c.provider}</div><h2>{c.name}</h2><p>{c.description}</p><div className="integration-card-foot"><span className="integration-state"><i/> {c.name==="WhatsApp Business"?(configured.whatsapp?"Credentials detected":"Not connected"):c.name==="SMS"?(configured.sms?"Credentials detected":"Not connected"):"Setup required"}</span><Link href={c.href}>Configure <span>→</span></Link></div></article>)}</div><div className="security-callout"><b>Credential security</b><p>Provider secrets must be stored as encrypted server-side environment variables in Vercel. RUSH will never ask you to paste access tokens into a public form or expose them in browser code.</p></div></div></section></main>;
}
