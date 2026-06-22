---
name: MissingCash finance lead emails can't send
description: Why finance enquiry emails don't arrive, and the fix path.
---

`POST /api/finance/enquiry` emails the lead via Resend with from-address `leads@lensflow.com.au` — a leftover label written into the code, NOT a mailbox the user created. The Resend account behind `RESEND_API_KEY` currently has **zero verified domains** (`GET /domains` → `[]`), so it cannot send from lensflow OR from missingcash. Lead emails therefore do not arrive.

Compounding this: the email send only runs AFTER the DB insert succeeds; since prod has no DB (see missingcash-prod-database.md), in production the request 500s before the email is even attempted.

**Fix path:** verify `missingcash.com.au` in Resend (add the DKIM/SPF DNS records in Cloudflare), then change the from-address to an `@missingcash.com.au` address (compliance: Stratton leads must come from missingcash, not lensflow — see stratton-integration.md). Do not switch the from-address before verification or sends will fail.
