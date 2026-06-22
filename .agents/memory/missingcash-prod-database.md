---
name: MissingCash production database not connected
description: Why DB-writing routes 500 on the live site, and the only correct fix.
---

The live (autoscale) deployment of MissingCash has **no production database connected**. The app reads `process.env.DATABASE_URL`, which in the workspace points to a dev-only Postgres (host `helium`, db `heliumdb`) — a single-label host that does not resolve inside deployments. So any route that writes to the DB returns 500 in production and the data is lost. Dev works fine.

**Symptom:** `POST /api/finance/enquiry` on https://missingcash.com.au returns HTTP 500; deployment logs show `getaddrinfo EAI_AGAIN helium`. `executeSql({environment:"production"})` returns PRODUCTION_DATABASE_ERROR. The dev DB has the enquiry rows; prod has none.

**Why:** confirmed by a live test POST (500), DATABASE_URL host parse (`helium`), and the production read-replica erroring.

**How to fix:** connect a production database via Replit's Publish flow (the user re-publishes; the publish flow provisions/migrates the prod DB). Do NOT script prod migrations, add startup DDL, or push schema in the deploy build — see the database-migrations-on-publish reference. After the user publishes, re-test the live endpoint and check deployment logs to confirm saves.

**Also:** the live deployment can serve STALE code — the live finance error message still showed the old landline `(08) 9446 9893` while the workspace code already has the correct mobile `0432 280 181`. A re-publish also ships the latest code.
