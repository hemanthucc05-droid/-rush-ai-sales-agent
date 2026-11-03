"use client";

import { useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bot, CalendarDays, ChevronDown,
  CircleHelp, Command, ContactRound, LayoutDashboard, MessageCircle,
  MoreHorizontal, Plus, Search, Send, Settings2, ShieldCheck, Sparkles,
  Target, Users, Zap, Bell, CheckCircle2, Clock3, Filter, Menu
} from "lucide-react";

const leads = [
  { initials: "AK", name: "Aarav Khanna", role: "Chief Technology Officer", company: "NimbleStack", status: "Interested", time: "2 min ago", color: "violet", message: "This looks interesting. Can you share how it works with our current stack?" },
  { initials: "SM", name: "Sarah Mitchell", role: "VP of Operations", company: "CloudNorth", status: "Qualified", time: "18 min ago", color: "blue", message: "Could we schedule a quick walkthrough next week?" },
  { initials: "RV", name: "Rahul Verma", role: "Founder", company: "ScalePilot", status: "Follow-up", time: "42 min ago", color: "orange", message: "Please send me the details. I'll review them." },
  { initials: "EC", name: "Emily Chen", role: "Chief Financial Officer", company: "BrightLayer", status: "New lead", time: "1 hr ago", color: "pink", message: "Thanks for reaching out." },
];

const chart = [34, 48, 40, 62, 54, 76, 61, 83, 70, 92, 78, 100];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const filtered = leads.filter(l => `${l.name} ${l.company} ${l.role}`.toLowerCase().includes(query.toLowerCase()));
  const nav = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Leads", icon: Users },
    { label: "Conversations", icon: MessageCircle },
    { label: "Campaigns", icon: Send },
    { label: "Demo bookings", icon: CalendarDays },
  ];
  const metrics = [
    { label: "Total leads", value: "2,486", delta: "+12.8%", icon: Users, note: "vs. last month" },
    { label: "Messages delivered", value: "8,942", delta: "+18.4%", icon: MessageCircle, note: "vs. last month" },
    { label: "Reply rate", value: "24.6%", delta: "+4.2%", icon: Activity, note: "vs. last month" },
    { label: "Demos booked", value: "86", delta: "+21.6%", icon: CalendarDays, note: "vs. last month" },
  ];

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Zap size={19} fill="currentColor" /></div><span>RUSH</span><span className="brand-ai">AI</span></div>
        <div className="workspace"><div className="workspace-icon">R</div><div><b>RUSH Workspace</b><small>Sales team</small></div><ChevronDown size={15} /></div>
        <div className="nav-label">WORKSPACE</div>
        <nav>{nav.map(({label, icon: Icon}) => <button key={label} className={`nav-item ${active===label?"active":""}`} onClick={()=>setActive(label)}><Icon size={18}/>{label}{label==="Conversations"&&<span className="nav-count">4</span>}</button>)}</nav>
        <div className="nav-label agents-label">AI AGENTS</div>
        <button className="nav-item"><Bot size={18}/> Sales assistant <span className="live-dot"/></button>
        <button className="nav-item"><Sparkles size={18}/> Lead researcher</button>
        <button className="nav-item"><Target size={18}/> Qualification agent</button>
        <div className="sidebar-bottom">
          <div className="usage-card"><div className="usage-top"><span>Monthly activity</span><span>68%</span></div><div className="usage-bar"><i/></div><small>Connect your accounts to activate RUSH.</small></div>
          <button className="nav-item"><Settings2 size={18}/> Settings</button>
          <button className="nav-item"><CircleHelp size={18}/> Help center</button>
          <div className="profile"><div className="avatar user">HK</div><div><b>Workspace owner</b><small>Administrator</small></div><MoreHorizontal size={18}/></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="crumb"><span>Workspace</span><span className="slash">/</span><b>{active}</b></div>
          <div className="top-actions"><div className="status-pill"><i/> Demo mode</div><button className="icon-btn"><Bell size={18}/><i className="notification"/></button><div className="avatar user">HK</div></div>
        </header>
        <div className="content">
          <div className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={13}/> YOUR AI SALES COMMAND CENTER</div><h1>Good morning, Hemanth <span>✦</span></h1><p>Here’s what’s happening with your sales conversations today.</p></div>
            <div className="welcome-actions"><button className="btn-secondary"><CalendarDays size={16}/> Last 30 days <ChevronDown size={14}/></button><button className="btn-primary" onClick={()=>setShowMenu(!showMenu)}><Plus size={17}/> New action</button>{showMenu&&<div className="action-menu"><button onClick={()=>setActive("Leads")}>Add leads</button><button onClick={()=>setActive("Campaigns")}>Create campaign</button><button onClick={()=>setActive("Conversations")}>Open inbox</button></div>}</div>
          </div>

          <div className="metrics">{metrics.map(({label,value,delta,icon:Icon,note})=><div className="metric-card" key={label}><div className="metric-head"><span>{label}</span><div className="metric-icon"><Icon size={17}/></div></div><div className="metric-value">{value}</div><div className="metric-foot"><span className="positive"><ArrowUpRight size={14}/>{delta}</span><span>{note}</span></div></div>)}</div>

          <div className="middle-grid">
            <div className="panel performance">
              <div className="panel-heading"><div><h2>Outreach performance</h2><p>Message activity over the last 12 days</p></div><button className="dots"><MoreHorizontal size={19}/></button></div>
              <div className="chart-legend"><span><i className="legend-blue"/> Messages sent</span><span><i className="legend-purple"/> Replies received</span></div>
              <div className="chart-area"><div className="y-labels"><span>1,000</span><span>750</span><span>500</span><span>250</span><span>0</span></div><div className="chart-lines"><div/><div/><div/><div/><div/><div className="bars">{chart.map((v,i)=><div className="bar-pair" key={i}><i style={{height:`${v}%`}}/><b style={{height:`${Math.max(10,v*.28)}%`}}/></div>)}</div></div></div>
              <div className="x-labels"><span>Oct 23</span><span>Oct 26</span><span>Oct 29</span><span>Nov 1</span><span>Nov 3</span></div>
            </div>
            <div className="panel agent-panel">
              <div className="panel-heading"><div><h2>RUSH agent status</h2><p>Your AI sales workforce</p></div><span className="status-live">● Ready</span></div>
              <div className="agent-feature"><div className="agent-orb"><Bot size={25}/><span/></div><div><b>Sales assistant</b><small>Conversation intelligence</small></div><span className="ready-tag">Standby</span></div>
              <div className="agent-feature"><div className="mini-agent purple"><Sparkles size={19}/></div><div><b>Lead researcher</b><small>Prospect enrichment</small></div><span className="ready-tag">Standby</span></div>
              <div className="agent-feature"><div className="mini-agent green"><Target size={19}/></div><div><b>Qualification agent</b><small>Intent & lead scoring</small></div><span className="ready-tag">Standby</span></div>
              <div className="connect-note"><ShieldCheck size={16}/><span>Connect WhatsApp and AI credentials to activate agents.</span></div>
            </div>
          </div>

          <div className="panel conversations">
            <div className="panel-heading conversation-heading"><div><h2>Recent conversations</h2><p>Stay on top of your latest prospect activity</p></div><button className="view-all" onClick={()=>setActive("Conversations")}>View inbox <ArrowUpRight size={15}/></button></div>
            <div className="table-tools"><div className="search-box"><Search size={16}/><input placeholder="Search prospects or companies..." value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="btn-secondary small"><Filter size={15}/> Filters</button></div>
            <div className="conversation-table"><div className="table-head"><span>CONTACT</span><span>LAST MESSAGE</span><span>STATUS</span><span>LAST ACTIVITY</span><span/></div>
              {filtered.map((lead,i)=><button className={`table-row ${selected===i?"selected":""}`} key={lead.name} onClick={()=>setSelected(i)}><span className="contact-cell"><span className={`avatar ${lead.color}`}>{lead.initials}</span><span><b>{lead.name}</b><small>{lead.role} · {lead.company}</small></span></span><span className="message-preview">{lead.message}</span><span><i className={`status-tag ${lead.status.toLowerCase().replace(" ","-")}`}>{lead.status}</i></span><span className="activity-time"><Clock3 size={13}/>{lead.time}</span><MoreHorizontal size={17} className="row-more"/></button>)}
              {filtered.length===0&&<div className="empty">No prospects match your search.</div>}
            </div>
          </div>
          <div className="footer-note"><span>RUSH AI · SALES WORKSPACE</span><span>Dashboard preview · Sample data</span></div>
        </div>
      </section>
    </main>
  );
}
