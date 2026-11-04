import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CLOCK_SKEW_SECONDS = 5 * 60;

function verifyStandardWebhook(rawBody: string, headers: Headers, secret: string) {
  const webhookId = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!webhookId || !timestamp || !signatures) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isInteger(timestampSeconds)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS) return false;

  // Standard Webhooks secrets are "whsec_" + base64-encoded key bytes.
  if (!secret.startsWith("whsec_")) return false;
  let key: Buffer;
  try {
    key = Buffer.from(secret.slice("whsec_".length), "base64");
  } catch {
    return false;
  }
  if (!key.length) return false;

  const signedContent = `${webhookId}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", key).update(signedContent, "utf8").digest();
  return signatures.split(" ").some((entry) => {
    const [version, encoded] = entry.split(",", 2);
    if (version !== "v1" || !encoded) return false;
    try {
      const supplied = Buffer.from(encoded, "base64");
      return supplied.length === expected.length && timingSafeEqual(supplied, expected);
    } catch {
      return false;
    }
  });
}

export async function POST(request: Request) {
  const secret = process.env.SENT_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Webhook receiver is not fully configured. Set SENT_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > 1024 * 1024) {
    return NextResponse.json({ error: "Webhook payload too large." }, { status: 413 });
  }
  if (!verifyStandardWebhook(rawBody, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature or timestamp." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid object");
    payload = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const webhookId = request.headers.get("webhook-id")!;
  const eventId = String(payload.id || payload.event_id || webhookId).slice(0, 255);
  const eventType = String(payload.type || payload.event || "unknown").slice(0, 128);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { error } = await admin.from("sent_webhook_events").upsert(
    {
      provider_event_id: eventId,
      webhook_id: webhookId,
      event_type: eventType,
      payload,
      received_at: new Date().toISOString(),
      processing_status: "received"
    },
    { onConflict: "provider_event_id", ignoreDuplicates: true }
  );

  if (error) {
    console.error("Unable to persist verified Sent webhook", error.message);
    return NextResponse.json({ error: "Webhook event could not be persisted." }, { status: 503 });
  }

  return NextResponse.json({ received: true, duplicateSafe: true }, { status: 202 });
}
