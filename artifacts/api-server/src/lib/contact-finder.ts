import { logger } from "./logger";

const SCRAPINGBEE_API = "https://app.scrapingbee.com/api/v1/";

export interface FoundContact {
  phone?: string;
  email?: string;
  address?: string;
  source: string;
}

// ---------- helpers ----------

function extractPhones(text: string): string[] {
  const raw = text.match(/(?:\+?61|0)[\s.-]?[2-9][\d\s.-]{7,9}/g) ?? [];
  return [...new Set(raw.map((p) => p.replace(/[\s.-]/g, "").replace(/^61/, "0")))].filter(
    (p) => /^0[2-9]\d{8}$/.test(p)
  );
}

function extractEmails(text: string): string[] {
  const raw = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [];
  const blocked = [
    "example.com", "sentry.io", "w3.org", "scrapingbee.com",
    "cloudflare.com", "google.com", "bing.com", "duckduckgo.com",
    "schema.org", "amazonaws.com", "wixpress.com", "squarespace.com",
  ];
  return [...new Set(raw)].filter(
    (e) => !blocked.some((b) => e.endsWith(b)) && e.length < 80
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isCompanyName(name: string): boolean {
  const upper = name.toUpperCase();
  const tokens = [
    "PTY", "LTD", "TRUST", "FUND", "SUPER", "SUPERANNUATION",
    "FOUNDATION", "ASSOCIATION", "INCORPORATED", "INC", "GROUP",
    "HOLDINGS", "INVESTMENTS", "SERVICES", "ENTERPRISES",
    "& CO", "AND CO", "FAMILY", "ESTATE OF", "ESTATE",
  ];
  return tokens.some((t) => upper.includes(t));
}

export function parseName(raw: string): { firstName: string; lastName: string } | null {
  if (isCompanyName(raw)) return null;
  const cleaned = raw.replace(/[^a-zA-Z\s,'-]/g, " ").trim();
  if (cleaned.includes(",")) {
    const [last, ...rest] = cleaned.split(",").map((s) => s.trim());
    const first = rest.join(" ").split(" ")[0] ?? "";
    if (!first || !last) return null;
    return { firstName: first, lastName: last };
  }
  const parts = cleaned.split(/\s+/);
  if (parts.length < 2) return null;
  return { firstName: parts[0]!, lastName: parts[parts.length - 1]! };
}

// ---------- ScrapingBee fetch ----------

async function sbFetch(url: string, apiKey: string, renderJs = false, stealth = false): Promise<string> {
  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    render_js: renderJs ? "true" : "false",
    block_ads: "true",
    country_code: "au",
    ...(stealth ? { stealth_proxy: "true" } : { premium_proxy: "true" }),
    ...(renderJs ? { wait: "2500" } : {}),
  });
  const res = await fetch(`${SCRAPINGBEE_API}?${params.toString()}`, {
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`ScrapingBee ${res.status}`);
  return res.text();
}

// ---------- source 1: DuckDuckGo — general contact search ----------

async function searchDuckDuckGoGeneral(name: string, state: string | null, apiKey: string): Promise<FoundContact | null> {
  const location = state ?? "Australia";
  const q = `"${name}" ${location} contact phone email`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=au-en`;
  try {
    const html = await sbFetch(url, apiKey, false, true);
    const text = stripHtml(html);
    const phones = extractPhones(text);
    const emails = extractEmails(text);
    if (phones.length === 0 && emails.length === 0) return null;
    return { phone: phones[0], email: emails[0], source: "DuckDuckGo" };
  } catch (err) {
    logger.warn({ err, name }, "contact-finder: DDG general failed");
    return null;
  }
}

// ---------- source 2: DuckDuckGo — email dork (AU ISP + webmail providers) ----------

async function searchDuckDuckGoEmail(name: string, state: string | null, apiKey: string): Promise<string | null> {
  const suburb = state ? state.replace(/\s+\d{4}$/, "").trim() : "Australia";
  // Include both webmail and common Australian ISP email domains
  const q = `"${name}" ${suburb} (gmail OR hotmail OR yahoo OR outlook OR bigpond OR iinet OR optusnet OR tpg OR internode OR live)`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=au-en`;
  try {
    const html = await sbFetch(url, apiKey, false, true);
    const emails = extractEmails(stripHtml(html));
    return emails[0] ?? null;
  } catch (err) {
    logger.warn({ err, name }, "contact-finder: DDG email dork failed");
    return null;
  }
}

// ---------- source 3: Google SERP email dork ----------

async function searchGoogleEmail(name: string, state: string | null, apiKey: string): Promise<string | null> {
  const location = state ?? "Australia";
  // Google email dork — searches for the name alongside email domain fragments
  const q = `"${name}" "${location}" "@gmail.com" OR "@hotmail.com" OR "@yahoo.com" OR "@bigpond.com" OR "@iinet.net.au" OR "@outlook.com"`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&num=10&hl=en&gl=au`;
  try {
    const html = await sbFetch(url, apiKey, false, true);
    const emails = extractEmails(stripHtml(html));
    return emails[0] ?? null;
  } catch (err) {
    logger.warn({ err, name }, "contact-finder: Google email dork failed");
    return null;
  }
}

// ---------- source 4: White Pages AU ----------

async function searchWhitePages(firstName: string, lastName: string, state: string | null, apiKey: string): Promise<FoundContact | null> {
  const suburb = state ? state.replace(/\s+\d{4}$/, "").trim() : "";
  const name = encodeURIComponent(`${firstName} ${lastName}`);
  const loc = encodeURIComponent(suburb);
  const url = `https://www.whitepages.com.au/residential?name=${name}${loc ? `&location=${loc}` : ""}`;
  try {
    const html = await sbFetch(url, apiKey, true, true);
    const text = stripHtml(html);
    const phones = extractPhones(text);
    const emails = extractEmails(text);
    const addrMatch = text.match(/\d+\s+[A-Za-z][\w\s]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Court|Ct|Way|Close|Cl|Place|Pl)[,\s]+[A-Za-z\s]+(?:NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+\d{4}/i);
    if (phones.length === 0 && emails.length === 0 && !addrMatch) return null;
    return { phone: phones[0], email: emails[0], address: addrMatch?.[0], source: "White Pages" };
  } catch (err) {
    logger.warn({ err, firstName, lastName }, "contact-finder: White Pages failed");
    return null;
  }
}

// ---------- source 5: Yellow Pages ----------

async function searchYellowPages(firstName: string, lastName: string, state: string | null, apiKey: string): Promise<FoundContact | null> {
  const query = encodeURIComponent(`${firstName} ${lastName}`);
  const loc = encodeURIComponent(state ?? "Australia");
  const url = `https://www.yellowpages.com.au/search/listings?clue=${query}&locationClue=${loc}&type=people`;
  try {
    const html = await sbFetch(url, apiKey, true, false);
    const text = stripHtml(html);
    const phones = extractPhones(text);
    const addrMatch = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)\s+(?:NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+\d{4}/);
    if (phones.length === 0 && !addrMatch) return null;
    return { phone: phones[0], address: addrMatch?.[0], source: "Yellow Pages" };
  } catch (err) {
    logger.warn({ err, firstName, lastName }, "contact-finder: Yellow Pages failed");
    return null;
  }
}

// ---------- source 6: ABN Lookup (government fallback — address only) ----------

async function searchABN(name: string, apiKey: string): Promise<FoundContact | null> {
  const query = encodeURIComponent(name);
  const url = `https://abr.business.gov.au/Search/ResultsActive?SearchText=${query}&IsCurrentIndicator=Y`;
  try {
    const html = await sbFetch(url, apiKey, false, false);
    const text = stripHtml(html);
    const addrMatch = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*)\s+(?:NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+\d{4}/);
    if (addrMatch) return { address: addrMatch[0], source: "ABN Lookup" };
    return null;
  } catch (err) {
    logger.warn({ err, name }, "contact-finder: ABN search failed");
    return null;
  }
}

// ---------- main export ----------
// Strategy: collect best phone + best email from ALL sources independently.
// Do NOT stop at a phone-only hit — keep looking for email across all sources.
// Only skip remaining sources once we have BOTH phone + email.

export async function findContact(
  name: string,
  state: string | null
): Promise<FoundContact | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    logger.warn("contact-finder: no SCRAPINGBEE_API_KEY");
    return null;
  }

  const parsed = parseName(name);
  if (!parsed) {
    logger.info({ name }, "contact-finder: skipping — looks like a company");
    return null;
  }

  const { firstName, lastName } = parsed;
  const fullName = `${firstName} ${lastName}`;

  let bestPhone: string | undefined;
  let bestEmail: string | undefined;
  let bestAddress: string | undefined;
  let bestSource = "unknown";

  function merge(r: FoundContact | null, source: string) {
    if (!r) return;
    if (r.email && !bestEmail) { bestEmail = r.email; bestSource = source; }
    if (r.phone && !bestPhone) { bestPhone = r.phone; if (!bestEmail) bestSource = source; }
    if (r.address && !bestAddress) bestAddress = r.address;
  }

  // Pass 1 — DuckDuckGo general
  merge(await searchDuckDuckGoGeneral(fullName, state, apiKey), "DuckDuckGo");
  if (bestEmail && bestPhone) {
    logger.info({ name, email: bestEmail, phone: bestPhone }, "contact-finder: full hit after DDG general");
    return { email: bestEmail, phone: bestPhone, address: bestAddress, source: bestSource };
  }

  await new Promise((r) => setTimeout(r, 400));

  // Pass 2 — DuckDuckGo email dork (only if no email yet)
  if (!bestEmail) {
    const email = await searchDuckDuckGoEmail(fullName, state, apiKey);
    if (email) { bestEmail = email; bestSource = "DuckDuckGo (email dork)"; }
    await new Promise((r) => setTimeout(r, 400));
  }

  // Pass 3 — Google email dork (only if still no email)
  if (!bestEmail) {
    const email = await searchGoogleEmail(fullName, state, apiKey);
    if (email) { bestEmail = email; bestSource = "Google (email dork)"; }
    await new Promise((r) => setTimeout(r, 400));
  }

  // Pass 4 — White Pages (good for phone + address)
  if (!bestPhone || !bestEmail) {
    merge(await searchWhitePages(firstName, lastName, state, apiKey), "White Pages");
    await new Promise((r) => setTimeout(r, 400));
  }

  // Pass 5 — Yellow Pages (residential phone fallback)
  if (!bestPhone) {
    merge(await searchYellowPages(firstName, lastName, state, apiKey), "Yellow Pages");
    await new Promise((r) => setTimeout(r, 400));
  }

  // Pass 6 — ABN Lookup (address-only government fallback)
  if (!bestAddress) {
    merge(await searchABN(fullName, apiKey), "ABN Lookup");
  }

  if (!bestPhone && !bestEmail && !bestAddress) {
    logger.info({ name }, "contact-finder: no contact found");
    return null;
  }

  logger.info({ name, email: bestEmail, phone: bestPhone, address: bestAddress, source: bestSource }, "contact-finder: result");
  return { phone: bestPhone, email: bestEmail, address: bestAddress, source: bestSource };
}
