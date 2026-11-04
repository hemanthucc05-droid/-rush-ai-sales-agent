"use client";

import { useState } from "react";

type Result = { sandbox?: boolean; providerStatus?: number; result?: unknown; error?: string };

export default function SentSandboxTest() {
  const [to, setTo] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [parameterName, setParameterName] = useState("var_1");
  const [parameterValue, setParameterValue] = useState("Rush test");
  const [channel, setChannel] = useState("sent");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setResult(null);
    try {
      const response = await fetch("/api/sent/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to, templateId, parameterName, parameterValue, channel, sandbox: true })
      });
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return <section className="data-card" style={{maxWidth:780,marginTop:24}}>
    <div className="section-heading"><div><h2>Sandbox message test</h2><p>This sends a simulated request to Sent. Sandbox mode does not deliver a real message or charge a recipient.</p></div></div>
    <form onSubmit={submit} className="setup-steps">
      <label>Test recipient (E.164)<input required value={to} onChange={e=>setTo(e.target.value)} placeholder="+14155550123" /></label>
      <label>Approved template ID<input required value={templateId} onChange={e=>setTemplateId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></label>
      <div className="two-column-fields">
        <label>Template parameter<input required value={parameterName} onChange={e=>setParameterName(e.target.value)} placeholder="var_1" /></label>
        <label>Parameter value<input value={parameterValue} onChange={e=>setParameterValue(e.target.value)} /></label>
      </div>
      <label>Routing channel<select value={channel} onChange={e=>setChannel(e.target.value)}><option value="sent">Automatic routing (WhatsApp, then eligible fallback)</option><option value="whatsapp">WhatsApp only</option><option value="sms">SMS only</option></select></label>
      <button className="primary" disabled={busy}>{busy ? "Testing…" : "Run sandbox test"}</button>
    </form>
    {result && <pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",marginTop:16,padding:14,borderRadius:10,background:"var(--surface-muted, #f4f6f8)"}}>{JSON.stringify(result,null,2)}</pre>}
    <p className="integration-warning">Production sending is intentionally disabled. Before enabling it, Rush needs recorded channel consent, approved campaign revisions, opt-out suppression, webhook signature verification and persistent message-event handling.</p>
  </section>;
}
