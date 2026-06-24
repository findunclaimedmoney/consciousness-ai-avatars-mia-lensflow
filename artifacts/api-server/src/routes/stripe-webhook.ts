import { Router, type IRouter } from "express";
import Stripe from "stripe";
import { Resend } from "resend";
import { db, miaResearchRequestsTable } from "@workspace/db";
import { generateGuide } from "../lib/guides-pdf";

const router: IRouter = Router();

const PRICE_TO_PRODUCT: Record<string, string> = {
  price_1TOZVABFhWjdi0urVfM1uOdH: "missingcash",
  price_1TPuoUBFhWjdi0urzZN7Sauv: "crypto",
  price_1TX1pZBFhWjdi0urODNB99ln: "cyber",
  price_1TX1rTBFhWjdi0urJECHDke8: "identity",
  price_1TX1zDBFhWjdi0urpXqepw6J: "bundle",
  price_1TliXfBFhWjdi0ur3omVxc8Q: "mia-research",
};

const GUIDE_TITLES: Record<string, string> = {
  missingcash: "MissingCash Premium Guide — How to Find Your Unclaimed Money",
  crypto: "MissingCrypto Recovery Guide",
  cyber: "Cyber Security Guide",
  identity: "Identity Theft Recovery Guide",
  bundle: "MissingCash Complete Bundle",
};

const FROM_ADDRESS = process.env.MISSINGCASH_DOMAIN_VERIFIED === "true"
  ? "MissingCash <leads@missingcash.com.au>"
  : "MissingCash <leads@lensflow.com.au>";

const SITE_BASE = "https://missingcash.com.au";

router.post("/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    req.log.error("STRIPE_WEBHOOK_SECRET is not configured");
    res.status(500).end();
    return;
  }

  if (!sig || typeof sig !== "string") {
    req.log.warn("Stripe webhook: missing signature header");
    res.status(400).end();
    return;
  }

  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body as Buffer, sig, secret);
  } catch (err) {
    req.log.warn({ err }, "Stripe webhook: signature verification failed");
    res.status(400).end();
    return;
  }

  res.json({ received: true });

  if (event.type !== "checkout.session.completed") return;

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email;
  const customerName = session.customer_details?.name ?? "there";

  if (!email) {
    req.log.warn({ sessionId: session.id }, "Stripe webhook: no customer email in session");
    return;
  }

  let priceId: string | null = null;
  try {
    const items = await stripeClient.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price"],
    });
    priceId = items.data[0]?.price?.id ?? null;
  } catch (err) {
    req.log.error({ err, sessionId: session.id }, "Stripe webhook: failed to fetch line items");
    return;
  }

  const product = priceId ? PRICE_TO_PRODUCT[priceId] : null;

  if (!product) {
    req.log.warn({ priceId, sessionId: session.id }, "Stripe webhook: unrecognised price ID");
    return;
  }

  req.log.info({ product, email }, "Stripe checkout completed — delivering product");

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (product === "mia-research") {
    try {
      await db.insert(miaResearchRequestsTable).values({
        stripeSessionId: session.id,
        email,
        customerName,
      }).onConflictDoNothing();

      const link = `${SITE_BASE}/mia-research?session=${session.id}`;

      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: "⚡ Your Mia Speed Research is Ready — Submit Your Details Now",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
            <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
              <h1 style="color:#f5b942;font-size:22px;margin:0;">MissingCash</h1>
              <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Mia Speed Research</p>
            </div>
            <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #f5b942;">
              <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Hi ${customerName}, your research session is confirmed ✅</h2>
              <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Thank you for purchasing Mia Speed Research. Mia will now search every Australian unclaimed money database using your personal details and email you a full written report.</p>
              <p style="color:#94a3b8;margin:0 0 24px;"><strong style="color:#f5b942;">Next step:</strong> Click the button below to submit your details so Mia can start your research.</p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${link}" style="background:#f5b942;color:#061826;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                  ⚡ Submit My Details — Start Research
                </a>
              </div>
              <p style="color:#6b7a8d;font-size:12px;text-align:center;margin:16px 0 0;">This link is unique to you. Your report will be emailed within minutes of submitting your details.</p>
            </div>
            <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
              <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
            </div>
          </div>`,
      });

      req.log.info({ email, sessionId: session.id }, "Mia research link emailed to customer");
    } catch (err) {
      req.log.error({ err, email }, "Failed to save research request or send Mia research email");
    }
    return;
  }

  const guideKeys = product === "bundle"
    ? (["missingcash", "crypto", "cyber", "identity"] as const)
    : ([product] as const);

  try {
    const attachments = await Promise.all(
      guideKeys.map(async (g) => {
        const buf = await generateGuide(g as "missingcash" | "crypto" | "cyber" | "identity");
        return {
          filename: `missingcash-${g}-guide.pdf`,
          content: buf.toString("base64"),
        };
      })
    );

    const isBundle = product === "bundle";
    const subject = isBundle
      ? "🏆 Your MissingCash Bundle — 4 Guides Inside"
      : `📄 Your ${GUIDE_TITLES[product] ?? "MissingCash Guide"} — Download Inside`;

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
          <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
            <h1 style="color:#f5b942;font-size:22px;margin:0;">MissingCash</h1>
          </div>
          <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #f5b942;">
            <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Hi ${customerName}, your guide${isBundle ? "s are" : " is"} attached ✅</h2>
            <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
              ${isBundle
                ? "Your complete MissingCash Bundle is attached to this email — all 4 guides as PDF files. Open them on any device."
                : `Your ${GUIDE_TITLES[product] ?? "guide"} is attached to this email as a PDF. Open it on any device.`
              }
            </p>
            ${isBundle ? `<ul style="color:#94a3b8;padding-left:20px;margin:0 0 20px;">
              <li>💰 MissingCash Premium Guide — How to Find Your Unclaimed Money</li>
              <li>₿ MissingCrypto Recovery Guide</li>
              <li>📱 Cyber Security Guide</li>
              <li>🪪 Identity Theft Recovery Guide</li>
            </ul>` : ""}
            <p style="color:#94a3b8;line-height:1.6;margin:16px 0;">If you have any questions about your guide, ask <strong style="color:#f5b942;">Mia</strong> at <a href="${SITE_BASE}" style="color:#f5b942;">missingcash.com.au</a> — she can walk you through any step in detail.</p>
            <div style="background:#061826;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #1a2a3a;">
              <p style="color:#f5b942;font-weight:bold;margin:0 0 8px;font-size:13px;">30-Day Money Back Guarantee</p>
              <p style="color:#6b7a8d;font-size:12px;margin:0;">Not happy? Email support@missingcash.com.au within 30 days for a full refund — no questions asked.</p>
            </div>
          </div>
          <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
            <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
          </div>
        </div>`,
      attachments,
    });

    req.log.info({ email, product, guides: guideKeys }, "Guide(s) emailed to customer");
  } catch (err) {
    req.log.error({ err, email, product }, "Failed to generate or email guide PDF(s)");
  }
});

export default router;
