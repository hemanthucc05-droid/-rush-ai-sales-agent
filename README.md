# RUSH — WhatsApp AI Sales Agent

This is the first runnable frontend foundation for RUSH. It currently contains a responsive sales dashboard with sample/demo data. It does **not** send WhatsApp messages or call AI services yet.

## Run locally (Windows)

1. Install Node.js LTS from https://nodejs.org/en/download
2. Extract this folder.
3. Open the folder in VS Code (https://code.visualstudio.com/).
4. In VS Code, choose Terminal → New Terminal.
5. Run:
   ```bash
   npm install
   npm run dev
   ```
6. Open http://localhost:3000

## Next development stages

- Add authentication and tenant-aware Supabase database access.
- Add CSV lead import with explicit consent tracking.
- Add Sent integration using its official docs and server-side credentials.
- Add inbound webhook signature verification, event deduplication, retries and opt-out handling.
- Add OpenAI reply drafting with human approval initially.
- Add calendar availability checks and confirmed booking workflow.
- Add audit logs, monitoring, rate limits and security tests.

## Safety and launch notes

- Dashboard metrics and conversations are mock data for preview only.
- Never put API keys in client-side code or commit `.env.local`.
- Do not send unsolicited WhatsApp messages. Store opt-in source/time, respect WhatsApp templates and messaging-window rules, and honor opt-outs immediately.
- The app must be reviewed and tested before production use.
