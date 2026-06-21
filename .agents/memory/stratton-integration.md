---
name: Stratton Finance marketing integration
description: How the MissingCash finance page integrates with Stratton Finance (the partner referral "integration pack"), and the compliance constraints around it.
---

# Stratton Finance marketing integration

Stratton Finance is MissingCash's finance partner (consultant Erin Crofton, ACL 364340). Their marketing team (Ellie Westmoreland) issues a "marketing integration pack" defining how the referrer's finance page connects to Stratton. The pack offers TWO options — the referrer includes only ONE.

## The two options
- **Option 1 — Web form on the referrer's site.** Customer fills the finance form on MissingCash and stays on-site. The form submission is **emailed to `integrations@stratton.com.au`** in a consistent structure. That email IS the integration — Stratton's back end parses it into their CRM (Mystro). After the form is live, notify Stratton; their back-end hookup takes ~3-5 business days. (MissingCash is already built as Option 1.)
- **Option 2 — Content + button** linking to Stratton's quote tool via the unique tracking URL (no on-site form).

## Unique tracking URL
Used for any button linking back to Stratton. Must stay on ONE line with NO spaces (breaking it inserts `%`/spaces and kills lead tracking). It already lives in `Finance.tsx` as `STRATTON_QUOTE_URL`.

## Compliance constraints (do not improvise these)
- A specific **disclaimer is pre-approved by Stratton's compliance team and is REQUIRED on the finance page** (credit-assessment/terms/ACL 364340/"MissingCash may receive a financial benefit..."). It's rendered as an "Important Information" block on the finance page.
- Consent checkbox wording follows Stratton's pre-approved text (brokers contacting you + handled per Stratton's Privacy Policy).
- **The pack cannot be used on the LensFlow website.** This is WHY lead emails must be sent FROM a `@missingcash.com.au` address, not `lensflow.com.au` — a LensFlow-origin lead to Stratton would breach the agreement.

**Why it matters:** switching the lead email's from-address from lensflow→missingcash, and routing the lead to `integrations@stratton.com.au`, are gated together on `missingcash.com.au` being VERIFIED in Resend. Sending to Stratton from an unverified/lensflow address either fails or breaches compliance — do both changes at once, only after the domain shows Verified, then submit a test lead.

## Phase 2 (gift card promo)
On hold ~1 month pending Stratton's risk & compliance team. Build nothing for it until they approve.
