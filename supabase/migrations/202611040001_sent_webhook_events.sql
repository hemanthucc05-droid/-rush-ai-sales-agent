-- Store verified Sent.dm webhook deliveries for asynchronous processing.
-- The table is intentionally not exposed to browser roles; server-side service role only.
create table if not exists public.sent_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  webhook_id text not null,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processing', 'processed', 'failed')),
  processed_at timestamptz,
  processing_error text
);

create index if not exists sent_webhook_events_status_received_idx
  on public.sent_webhook_events (processing_status, received_at);

alter table public.sent_webhook_events enable row level security;
revoke all on public.sent_webhook_events from anon, authenticated;
grant all on public.sent_webhook_events to service_role;
