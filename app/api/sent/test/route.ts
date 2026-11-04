import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/workspaces";

export const runtime = "nodejs";

const E164 = /^\+[1-9]\d{7,14}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDEMPOTENCY = /^[a-zA-Z0-9_-]{1,255}$/;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const workspaceId = (await cookies()).get(ACTIVE_WORKSPACE_COOKIE)?.value;
    if (!workspaceId) return NextResponse.json({ error: "Select a workspace before testing this integration." }, { status: 409 });
    const { data: membership, error: membershipError } = await supabase.from("workspace_members")
      .select("workspace_id").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle();
    if (membershipError || !membership) return NextResponse.json({ error: "Workspace membership required." }, { status: 403 });

    const apiKey = process.env.SENT_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Sent is not configured. Add SENT_API_KEY in Vercel." }, { status: 503 });

    const body = await request.json();
    const to = String(body.to || "").trim();
    const templateId = String(body.templateId || "").trim();
    const channel = String(body.channel || "sent");
    const parameterName = String(body.parameterName || "var_1").trim();
    const parameterValue = String(body.parameterValue || "").trim();

    // This endpoint is deliberately sandbox-only until consent, campaign approvals,
    // webhook persistence and suppression checks are implemented and verified.
    if (body.sandbox !== true) {
      return NextResponse.json({ error: "Only sandbox tests are enabled in this build. Production sends are disabled." }, { status: 403 });
    }
    if (!E164.test(to)) return NextResponse.json({ error: "Enter a valid E.164 number, e.g. +14155550123." }, { status: 400 });
    if (!UUID.test(templateId)) return NextResponse.json({ error: "Enter a valid template UUID." }, { status: 400 });
    if (!["sent", "whatsapp", "sms"].includes(channel)) return NextResponse.json({ error: "Channel must be sent, whatsapp or sms." }, { status: 400 });
    if (!/^[a-zA-Z0-9_]{1,64}$/.test(parameterName)) return NextResponse.json({ error: "Invalid template parameter name." }, { status: 400 });

    const suppliedKey = String(body.idempotencyKey || "").trim();
    const idempotencyKey = suppliedKey || `rush_sandbox_${crypto.randomUUID().replace(/-/g, "")}`;
    if (!IDEMPOTENCY.test(idempotencyKey)) return NextResponse.json({ error: "Invalid idempotency key." }, { status: 400 });

    const upstream = await fetch("https://api.sent.dm/v3/messages", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey,
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({
        sandbox: true,
        to: [to],
        channel: [channel],
        template: { id: templateId, parameters: { [parameterName]: parameterValue } }
      }),
      cache: "no-store"
    });

    const raw = await upstream.text();
    let result: unknown;
    try { result = JSON.parse(raw); } catch { result = { message: raw.slice(0, 1000) }; }
    return NextResponse.json({ sandbox: true, providerStatus: upstream.status, result }, { status: upstream.ok ? 200 : upstream.status });
  } catch (error) {
    console.error("Sent sandbox test failed", error);
    return NextResponse.json({ error: "Unable to complete the Sent sandbox test." }, { status: 500 });
  }
}
