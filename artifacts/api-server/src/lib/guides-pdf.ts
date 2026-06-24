import PDFDocument from "pdfkit";

type GuideKey = "missingcash" | "crypto" | "cyber" | "identity";

function buildPDF(fn: (doc: InstanceType<typeof PDFDocument>) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 55, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    fn(doc);
    doc.end();
  });
}

const NAVY = "#061826";
const GOLD = "#f5b942";
const DARK = "#1a2a3a";
const MUTED = "#6b7a8d";
const WHITE = "#ffffff";

function header(doc: InstanceType<typeof PDFDocument>, title: string, subtitle: string) {
  doc.rect(0, 0, doc.page.width, 130).fill(NAVY);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(26).text("MissingCash", 55, 30);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(18).text(title, 55, 62);
  doc.fillColor(GOLD).font("Helvetica").fontSize(11).text(subtitle, 55, 90);
  doc.rect(0, 125, doc.page.width, 5).fill(GOLD);
  doc.y = 155;
}

function sectionTitle(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.moveDown(0.8);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(text);
  doc.moveDown(0.3);
  doc.rect(55, doc.y, 60, 2).fill(GOLD);
  doc.moveDown(0.6);
}

function bodyText(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.fillColor(DARK).font("Helvetica").fontSize(10).text(text, { lineGap: 3 });
  doc.moveDown(0.4);
}

function step(doc: InstanceType<typeof PDFDocument>, num: number, text: string) {
  const x = doc.x;
  const y = doc.y;
  doc.circle(x + 8, y + 8, 9).fill(GOLD);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text(String(num), x + 5, y + 4, { width: 8, align: "center" });
  doc.fillColor(DARK).font("Helvetica").fontSize(10).text(text, x + 24, y, { width: doc.page.width - x - 79, lineGap: 3 });
  doc.moveDown(0.5);
}

function tip(doc: InstanceType<typeof PDFDocument>, text: string) {
  const startY = doc.y;
  doc.rect(55, startY, doc.page.width - 110, 1).fill(GOLD + "40");
  doc.moveDown(0.2);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9).text("💡 TIP  ", { continued: true });
  doc.fillColor(DARK).font("Helvetica").fontSize(9).text(text, { lineGap: 2 });
  doc.moveDown(0.6);
}

function url(doc: InstanceType<typeof PDFDocument>, label: string, link: string) {
  doc.fillColor(MUTED).font("Helvetica").fontSize(9).text(`${label}: `, { continued: true });
  doc.fillColor("#0066cc").text(link, { underline: true });
  doc.moveDown(0.3);
}

function footer(doc: InstanceType<typeof PDFDocument>) {
  doc.on("pageAdded", () => {
    const bottom = doc.page.height - 35;
    doc.rect(0, bottom - 5, doc.page.width, 40).fill(NAVY);
    doc.fillColor(GOLD).font("Helvetica").fontSize(8)
      .text("© MissingCash | www.missingcash.com.au | ABN 52 347 989 391", 55, bottom, { align: "center", width: doc.page.width - 110 });
  });
}

export async function generateGuide(key: GuideKey): Promise<Buffer> {
  switch (key) {
    case "missingcash": return generateMissingCashGuide();
    case "crypto": return generateCryptoGuide();
    case "cyber": return generateCyberGuide();
    case "identity": return generateIdentityGuide();
  }
}

async function generateMissingCashGuide(): Promise<Buffer> {
  return buildPDF((doc) => {
    footer(doc);
    header(doc, "How to Find & Claim Your Unclaimed Money", "Step-by-step guide to all 8 Australian databases");

    bodyText(doc, "There is an estimated $2.6 billion+ in unclaimed money sitting across Australian government agencies and financial institutions. This guide walks you through every database — exactly where to search, what to enter, and how to claim what's yours.");

    sectionTitle(doc, "DATABASE 1 — ATO: Lost Superannuation");
    bodyText(doc, "The ATO holds billions in lost and unclaimed superannuation. If you've changed jobs, moved, or simply never checked — there may be super in your name.");
    step(doc, 1, "Go to www.my.gov.au and sign in with your myGov account (or create one — it's free).");
    step(doc, 2, "Link the ATO to your myGov account if not already linked.");
    step(doc, 3, "Navigate to: Super → Manage → Find lost super.");
    step(doc, 4, "The ATO will search all super funds registered under your Tax File Number.");
    step(doc, 5, "If lost super is found, you can consolidate it into your active fund directly from the portal.");
    tip(doc, "Use exactly the same name that appears on your Tax File Number. Maiden names and name variations may not match.");
    url(doc, "Portal", "www.my.gov.au");

    sectionTitle(doc, "DATABASE 2 — ATO: Unclaimed Tax Refunds");
    bodyText(doc, "If you haven't lodged a tax return or have an unclaimed refund, the ATO holds those funds.");
    step(doc, 1, "Log into myGov and navigate to the ATO service.");
    step(doc, 2, "Go to: Tax → Lodgements → Income tax to check outstanding returns.");
    step(doc, 3, "Check: Accounts → Account balance to see any credit balances.");
    step(doc, 4, "Lodge any overdue returns to release held refunds — no penalty for late lodgement if you're owed money.");
    tip(doc, "You can lodge tax returns up to 5 years back. Each year you're owed money, lodge the return to claim it.");

    sectionTitle(doc, "DATABASE 3 — ASIC / MoneySmart");
    bodyText(doc, "ASIC holds unclaimed money from bank accounts inactive for 7+ years, life insurance policies, and investments. This is one of the largest unclaimed money registers in Australia.");
    step(doc, 1, "Go to: www.moneysmart.gov.au/unclaimed-money");
    step(doc, 2, "Click 'Search for unclaimed money' and enter your first name, last name.");
    step(doc, 3, "Also search previous surnames (maiden name, name before/after marriage).");
    step(doc, 4, "Search deceased family members' names — unclaimed estates often appear here.");
    step(doc, 5, "If you find a match, click 'How to claim' next to the listing for instructions.");
    tip(doc, "Try variations of your name: middle name, shortened names (e.g. 'Liz' vs 'Elizabeth'). ASIC data comes from multiple sources with inconsistent name entry.");
    url(doc, "Search portal", "www.moneysmart.gov.au/unclaimed-money");

    doc.addPage();
    header(doc, "How to Find & Claim Your Unclaimed Money", "Step-by-step guide to all 8 Australian databases");

    sectionTitle(doc, "DATABASE 4 — Your Bank");
    bodyText(doc, "Banks must transfer dormant accounts (inactive 7+ years) to ASIC. But before they do, contact your banks directly — money recently turned dormant may still be with the bank.");
    step(doc, 1, "Contact each bank you've ever had an account with — even childhood accounts.");
    step(doc, 2, "Ask specifically: 'Do you have any dormant or unclaimed accounts in my name?'");
    step(doc, 3, "Provide your full name, date of birth, and previous addresses.");
    step(doc, 4, "If the bank has transferred funds to ASIC, they will tell you and direct you to MoneySmart.");
    tip(doc, "Commonwealth Bank, Westpac, ANZ and NAB all have unclaimed money teams. Call the general line and ask to be transferred.");

    sectionTitle(doc, "DATABASE 5 — State Revenue Offices");
    bodyText(doc, "Each state and territory holds unclaimed trust money from estates, court proceedings, and uncollected deposits.");
    step(doc, 1, "NSW: www.revenue.nsw.gov.au → search 'unclaimed money'");
    step(doc, 2, "VIC: www.sro.vic.gov.au → 'Unclaimed money' under Property");
    step(doc, 3, "QLD: www.unclaimed.treasury.qld.gov.au");
    step(doc, 4, "WA: www.finance.wa.gov.au → search for 'unclaimed moneys register'");
    step(doc, 5, "SA: www.revenuesa.sa.gov.au → 'Unclaimed money'");
    step(doc, 6, "TAS: www.sro.tas.gov.au → unclaimed money section");
    step(doc, 7, "NT: www.treasury.nt.gov.au → unclaimed monies");
    step(doc, 8, "ACT: www.revenue.act.gov.au → unclaimed money");
    tip(doc, "Search your name in EVERY state you've ever lived in — not just your current state. Many people find money in states they lived in years ago.");

    sectionTitle(doc, "DATABASE 6 — Share Registries");
    bodyText(doc, "If you've ever owned shares or received dividends that weren't paid, the funds may be held by Computershare or Link Market Services.");
    step(doc, 1, "Computershare: www.computershare.com/au → 'Investor Centre' → search your name.");
    step(doc, 2, "Link Market Services: www.linkmarketservices.com.au → 'Investor Centre' → search.");
    step(doc, 3, "Search for your name including maiden name or previous names.");
    step(doc, 4, "If you find a match, follow the online instructions to claim or update your details.");

    sectionTitle(doc, "DATABASE 7 — Fair Work: Unpaid Wages");
    bodyText(doc, "If a former employer failed to pay you correctly, the Fair Work Ombudsman may hold those wages.");
    step(doc, 1, "Go to: services.fairwork.gov.au/unpaid-wages/check-unpaid-wages");
    step(doc, 2, "Enter your name to search the unpaid wages register.");
    step(doc, 3, "If a match is found, follow the online claim process — it's free.");

    sectionTitle(doc, "DATABASE 8 — Lotteries & Rental Bonds");
    bodyText(doc, "Australian lotteries hold unclaimed prizes for a set period. Rental bonds may not have been returned after your tenancy.");
    step(doc, 1, "Oz Lotto / Tatts: Check your old tickets at www.thelott.com → 'Check my ticket'");
    step(doc, 2, "Lotterywest (WA): www.lotterywest.wa.gov.au → 'Check my ticket'");
    step(doc, 3, "NSW rental bonds: www.fairtrading.nsw.gov.au → 'Rental bonds'");
    step(doc, 4, "VIC rental bonds: www.rtba.vic.gov.au → search your bond");
    step(doc, 5, "QLD bonds: www.rta.qld.gov.au → 'Bond search'");

    doc.addPage();
    header(doc, "How to Find & Claim Your Unclaimed Money", "Step-by-step guide to all 8 Australian databases");

    sectionTitle(doc, "HOW TO LODGE A CLAIM");
    bodyText(doc, "Once you've found money in your name, here's how to claim it from each authority:");
    step(doc, 1, "ATO (Super/Tax): Claim directly via your myGov account. Follow on-screen prompts.");
    step(doc, 2, "ASIC/MoneySmart: Download and complete the claim form from moneysmart.gov.au. Attach certified ID.");
    step(doc, 3, "Banks: Visit a branch or contact the bank's unclaimed money team. Provide ID and proof of account.");
    step(doc, 4, "State Revenue: Each state has its own online or paper claim form — follow the instructions on their website.");
    step(doc, 5, "Share Registries: Claim online via Computershare or Link Investor Centre. Update your details to reactivate the account.");

    sectionTitle(doc, "DOCUMENTS YOU'LL NEED");
    bodyText(doc, "Most claims require:");
    const docs = [
      "Current government-issued photo ID (driver's licence or passport)",
      "Proof of address (utility bill or bank statement — less than 3 months old)",
      "Proof of previous addresses if claiming old accounts",
      "Marriage certificate or deed poll if claiming under a previous name",
      "Tax File Number (for ATO claims)",
      "Bank account details for the refund to be paid into",
    ];
    docs.forEach((d) => {
      doc.fillColor(DARK).font("Helvetica").fontSize(10).text(`✓  ${d}`, { lineGap: 2 });
    });
    doc.moveDown(0.6);

    sectionTitle(doc, "WHAT TO EXPECT — TIMELINES");
    step(doc, 1, "ATO super: Usually processed within 28 days once lodged.");
    step(doc, 2, "ASIC/MoneySmart: 20–40 business days after receiving your claim.");
    step(doc, 3, "Banks: Varies — from 5 business days to 6 weeks.");
    step(doc, 4, "State Revenue Offices: 4–8 weeks for most states.");
    step(doc, 5, "Share registries: 10–20 business days once identity verified.");
    tip(doc, "Keep a record of every claim you lodge — note the date, reference number, and name of the person you spoke to. This makes follow-up much easier.");

    sectionTitle(doc, "COMMON MISTAKES TO AVOID");
    const mistakes = [
      "Searching only under your current name — always search maiden names and previous surnames.",
      "Searching only your current state — search every state you've ever lived in.",
      "Giving up after one search — registers update regularly. Search again every 6–12 months.",
      "Paying a third party to search for you — searching is 100% free on all official government portals.",
      "Missing the deadline — ASIC unclaimed money has no expiry, but some state registers have time limits.",
    ];
    mistakes.forEach((m, i) => step(doc, i + 1, m));

    doc.moveDown(1);
    doc.rect(55, doc.y, doc.page.width - 110, 60).fill(NAVY);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text("Need help claiming?", 75, doc.y - 52, { width: doc.page.width - 150 });
    doc.fillColor(WHITE).font("Helvetica").fontSize(9).text("Visit www.missingcash.com.au or ask Mia — our AI assistant — for step-by-step guidance on claiming your specific money.", 75, doc.y - 28, { width: doc.page.width - 150, lineGap: 3 });
  });
}

async function generateCryptoGuide(): Promise<Buffer> {
  return buildPDF((doc) => {
    footer(doc);
    header(doc, "Crypto Recovery Guide", "Recover lost exchange accounts, wallets & inaccessible cryptocurrency");

    bodyText(doc, "Millions of dollars in cryptocurrency sits inaccessible in old exchange accounts, forgotten wallets, and lost hardware devices. This guide walks you through every recovery method used by Australians to reclaim their crypto — legally and safely.");

    sectionTitle(doc, "TYPES OF LOST CRYPTO");
    const types = [
      "Old exchange account (forgotten login, old email address)",
      "Lost 2FA device or authentication app",
      "Forgotten or partially remembered seed phrase / recovery phrase",
      "Old hardware wallet (Ledger or Trezor) with lost PIN",
      "Crypto held on an exchange that has since closed",
      "Inherited crypto from a deceased estate",
    ];
    types.forEach((t, i) => step(doc, i + 1, t));

    sectionTitle(doc, "AUSTRALIAN EXCHANGES — RECOVERY PROCESS");
    bodyText(doc, "Each Australian exchange has a specific account recovery process. Contact them via their official support channel only.");
    step(doc, 1, "CoinSpot: support.coinspot.com.au — Submit 'Account Recovery' request. Provide name, DOB, email used, government ID, and a selfie with ID.");
    step(doc, 2, "Swyftx: support.swyftx.com — 'Identity Verification' or 'Account Access' ticket. Turnaround: 2–5 business days.");
    step(doc, 3, "Independent Reserve: www.independentreserve.com/contact — Email support with your account email, DOB, and ID documents.");
    step(doc, 4, "BTC Markets: www.btcmarkets.net/contact — Submit account recovery through their support portal with verified identity.");
    step(doc, 5, "Binance (International): support.binance.com — Use the 'Account Recovery' flow on the login page. Expect 3–10 business days.");
    step(doc, 6, "Coinbase: help.coinbase.com — Use the account recovery form. You'll need to verify identity and prove account ownership.");
    tip(doc, "CRITICAL: Only contact exchanges through their official website. Scammers create fake recovery services and 'support' pages. Never pay anyone upfront to recover your exchange account.");

    sectionTitle(doc, "HARDWARE WALLET RECOVERY");
    bodyText(doc, "Ledger and Trezor devices can be recovered if you have your 24-word seed phrase (recovery phrase). Without the seed phrase, hardware wallet funds are generally unrecoverable.");
    step(doc, 1, "If you have your seed phrase: Purchase a new device of the same type, select 'Restore from recovery phrase', and enter your 24 words in order.");
    step(doc, 2, "If your device is locked (wrong PIN 3+ times): Your device will factory reset. You'll need your seed phrase to restore.");
    step(doc, 3, "Ledger Live: Download from ledger.com/ledger-live — use the official software only.");
    step(doc, 4, "Trezor Suite: Download from trezor.io/trezor-suite — use official software only.");
    tip(doc, "Never enter your seed phrase into any website, app, or form. Your seed phrase should only ever be entered directly into a physical hardware device. Entering it anywhere else will result in immediate theft.");

    doc.addPage();
    header(doc, "Crypto Recovery Guide", "Recover lost exchange accounts, wallets & inaccessible cryptocurrency");

    sectionTitle(doc, "SEED PHRASE RECOVERY (PARTIAL)");
    bodyText(doc, "If you remember most but not all of your 24-word seed phrase, recovery may be possible through specialised tools.");
    step(doc, 1, "Ian Coleman's BIP39 Tool: iancoleman.io/bip39 — offline tool for testing seed phrase variations. Download and run OFFLINE only — never use online.");
    step(doc, 2, "btcrecover: GitHub open-source tool for recovering wallets with partial passwords or seed phrases. Requires technical knowledge.");
    step(doc, 3, "Wallet Recovery Services: Legitimate services include Dave Bitcoin (walletrecoveryservices.com) — they work on a no-find-no-fee basis.");
    tip(doc, "Be cautious. Only a handful of legitimate seed phrase recovery services exist. Ask ASIC MoneySmart or AFCA to verify any service before engaging them.");

    sectionTitle(doc, "EXCHANGE CLOSURES");
    bodyText(doc, "If the exchange holding your crypto has closed down, your options depend on whether administrators were appointed.");
    step(doc, 1, "Check ASIC's insolvency register: www.asic.gov.au/online-services/search-asic-s-registers/ — search the exchange name.");
    step(doc, 2, "If administrators are appointed, register as a creditor in the administration process. AFCA can assist.");
    step(doc, 3, "FTX Australia: Australian customers should contact ASIC and check the FTX administration website for claim instructions.");
    step(doc, 4, "Contact AFCA (Australian Financial Complaints Authority): www.afca.org.au — they handle complaints against licensed financial services, including some crypto exchanges.");

    sectionTitle(doc, "DECEASED ESTATE CRYPTO");
    bodyText(doc, "Recovering crypto from a deceased person's estate requires legal authority and often technical recovery.");
    step(doc, 1, "Obtain probate or letters of administration from your state Supreme Court.");
    step(doc, 2, "Contact exchanges with proof of death, legal authority documents, and ID.");
    step(doc, 3, "For hardware wallets: If the seed phrase is documented in estate papers, use it to restore the wallet.");
    step(doc, 4, "Consult an estate lawyer familiar with digital assets — some firms specialise in this area.");
    tip(doc, "If the deceased person kept records, check: paper backups, USB drives, password managers, safe deposit boxes, and email for exchange registration confirmations.");

    sectionTitle(doc, "ATO TAX IMPLICATIONS");
    bodyText(doc, "When you recover cryptocurrency, it may have tax implications in Australia.");
    step(doc, 1, "Crypto is treated as property by the ATO, not currency. Recovering it is not a taxable event.");
    step(doc, 2, "When you sell or exchange recovered crypto, Capital Gains Tax (CGT) applies on the gain from original cost base.");
    step(doc, 3, "If you held the crypto for over 12 months, you may qualify for the 50% CGT discount.");
    step(doc, 4, "Consult a tax accountant familiar with cryptocurrency. The ATO provides crypto tax guidance at ato.gov.au/crypto.");

    sectionTitle(doc, "AVOIDING SCAMS");
    bodyText(doc, "The crypto recovery space is filled with scammers. Follow these rules absolutely:");
    const rules = [
      "Never pay upfront fees to anyone claiming to recover your crypto.",
      "Never share your seed phrase or private keys with anyone, ever.",
      "Ignore unsolicited messages on Telegram, Discord, Twitter/X, or Facebook offering recovery.",
      "Only use services listed on ASIC MoneySmart or verifiable via AFCA.",
      "If you've been scammed, report it to ACCC Scamwatch: www.scamwatch.gov.au",
    ];
    rules.forEach((r, i) => step(doc, i + 1, r));

    doc.moveDown(1);
    doc.rect(55, doc.y, doc.page.width - 110, 55).fill(NAVY);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text("Questions about your crypto recovery?", 75, doc.y - 47, { width: doc.page.width - 150 });
    doc.fillColor(WHITE).font("Helvetica").fontSize(9).text("Visit MissingCash and ask Mia — our AI assistant — for personalised guidance on your specific situation.", 75, doc.y - 25, { width: doc.page.width - 150 });
  });
}

async function generateCyberGuide(): Promise<Buffer> {
  return buildPDF((doc) => {
    footer(doc);
    header(doc, "Cyber Security Guide", "Protect your digital life, banking, and identity online");

    bodyText(doc, "Australians lose hundreds of millions of dollars annually to cybercrime. This guide gives you the practical steps to secure your accounts, prevent attacks, and know exactly what to do if something goes wrong.");

    sectionTitle(doc, "SECURE YOUR EMAIL FIRST");
    bodyText(doc, "Your email is the master key to every other account. Securing it is the single most important step.");
    step(doc, 1, "Enable two-factor authentication (2FA) on your email — see the 2FA section below.");
    step(doc, 2, "Use a strong, unique password that you don't use anywhere else. Use a password manager to generate and store it.");
    step(doc, 3, "Check your email's 'Security' settings for any suspicious recent logins. Gmail: myaccount.google.com/security | Outlook: account.microsoft.com/security");
    step(doc, 4, "Check: haveibeenpwned.com — enter your email to see if it's appeared in known data breaches.");
    step(doc, 5, "Remove any email forwarding rules you didn't create — these are a common hacker technique.");
    tip(doc, "Use a separate email address for banking and financial accounts. This keeps those accounts separate from your main email if it's compromised.");

    sectionTitle(doc, "SECURE YOUR ONLINE BANKING");
    step(doc, 1, "Enable SMS or app-based 2FA for every bank account you have.");
    step(doc, 2, "Never use banking apps on public Wi-Fi. Use mobile data instead.");
    step(doc, 3, "Set up transaction alerts on your bank account — get notified of every transaction over $1.");
    step(doc, 4, "Use your bank's official app only — download from the App Store or Google Play, not links in emails.");
    step(doc, 5, "Check your bank's login history regularly for any unrecognised devices or locations.");
    step(doc, 6, "Set a low daily transfer limit for new payees — most banks allow you to reduce this in settings.");
    tip(doc, "If you receive an unexpected call from someone claiming to be your bank asking for account details — hang up and call your bank directly using the number on the back of your card.");

    sectionTitle(doc, "SIM-SWAP ATTACK PREVENTION");
    bodyText(doc, "A SIM-swap attack is when a criminal transfers your phone number to a SIM card they control — giving them access to all your SMS 2FA codes. Prevention is critical.");
    step(doc, 1, "Contact your mobile carrier (Telstra, Optus, Vodafone) and ask them to place a 'SIM lock' or 'Port Out Protection' on your account.");
    step(doc, 2, "Add a PIN or passphrase to your mobile account — required to make any account changes.");
    step(doc, 3, "Switch your banking 2FA from SMS to an authenticator app (Google Authenticator or Microsoft Authenticator). Authenticator apps work even without a SIM.");
    step(doc, 4, "Be suspicious if your phone suddenly loses service — contact your carrier immediately.");
    tip(doc, "Call your carrier proactively: 'I'd like to add SIM swap protection to my account.' Telstra: 13 22 00 | Optus: 133 427 | Vodafone: 1555");

    doc.addPage();
    header(doc, "Cyber Security Guide", "Protect your digital life, banking, and identity online");

    sectionTitle(doc, "SET UP TWO-FACTOR AUTHENTICATION (2FA)");
    bodyText(doc, "2FA adds a second layer of security beyond your password. Even if your password is stolen, attackers can't get in without the second factor.");
    step(doc, 1, "Download Google Authenticator (free) or Authy from the App Store / Google Play.");
    step(doc, 2, "Go to each account's security settings and look for 'Two-Factor Authentication' or '2-Step Verification'.");
    step(doc, 3, "Select 'Authenticator App' (not SMS where possible) and scan the QR code shown.");
    step(doc, 4, "Save the backup codes provided — store them offline in a safe place.");
    step(doc, 5, "Priority accounts for 2FA: Email, banking, superannuation, myGov, social media, crypto exchanges.");
    tip(doc, "Authy is recommended over Google Authenticator because it backs up your 2FA codes to the cloud — if you lose your phone, you don't lose access to everything.");

    sectionTitle(doc, "PASSWORD MANAGER SETUP");
    bodyText(doc, "Using the same password across multiple sites means one breach exposes everything. A password manager solves this.");
    step(doc, 1, "Choose a reputable password manager: Bitwarden (free), 1Password ($3/month), or Dashlane.");
    step(doc, 2, "Bitwarden: Download from bitwarden.com — create account, install browser extension and mobile app.");
    step(doc, 3, "Import any existing passwords from your browser (Chrome/Safari settings → Passwords → Export).");
    step(doc, 4, "Let the password manager generate a unique, random 20+ character password for each site.");
    step(doc, 5, "Use a strong master password that you memorise — this is the only password you need to remember.");
    tip(doc, "Your browser's built-in password manager (Chrome, Safari) is acceptable but doesn't work across all browsers or devices. A dedicated manager gives you more control.");

    sectionTitle(doc, "WHAT TO DO IF YOU'VE BEEN HACKED");
    bodyText(doc, "If you suspect your accounts have been compromised, act fast:");
    step(doc, 1, "Change your email password immediately from a different, trusted device.");
    step(doc, 2, "Log out of all active sessions in your email security settings.");
    step(doc, 3, "Check all accounts linked to that email — change passwords on every one.");
    step(doc, 4, "Contact your bank immediately if financial accounts may be compromised. Most banks have a 24/7 fraud line.");
    step(doc, 5, "Report the breach to the ACSC (Australian Cyber Security Centre): www.cyber.gov.au or 1300 CYBER1.");
    step(doc, 6, "If your identity may have been used, contact the credit bureaus — see our Identity Theft Recovery Guide.");
    step(doc, 7, "Report scams and cyberattacks to Scamwatch: www.scamwatch.gov.au");
    tip(doc, "Time matters. The faster you act, the less damage a hacker can do. Start with your email — it's the key to everything else.");

    sectionTitle(doc, "ONGOING SECURITY HABITS");
    const habits = [
      "Keep your phone and computer software updated — updates patch security vulnerabilities.",
      "Use your bank's app rather than accessing banking through a browser.",
      "Don't click links in unexpected emails or SMS. Go directly to the website instead.",
      "Review your credit report annually at www.getcreditscoreaustralia.com.au (free).",
      "Check haveibeenpwned.com every few months for new data breaches.",
      "Never plug in unknown USB drives — they can install malware automatically.",
    ];
    habits.forEach((h, i) => step(doc, i + 1, h));

    doc.moveDown(1);
    doc.rect(55, doc.y, doc.page.width - 110, 55).fill(NAVY);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text("Questions about your cyber security?", 75, doc.y - 47, { width: doc.page.width - 150 });
    doc.fillColor(WHITE).font("Helvetica").fontSize(9).text("Ask Mia at www.missingcash.com.au — she can walk you through any of these steps in detail.", 75, doc.y - 25, { width: doc.page.width - 150 });
  });
}

async function generateIdentityGuide(): Promise<Buffer> {
  return buildPDF((doc) => {
    footer(doc);
    header(doc, "Identity Theft Recovery Guide", "Reclaim your identity — step-by-step for Australians");

    bodyText(doc, "Identity theft can devastate your finances and credit. But with the right steps, you can undo the damage, clear fraudulent accounts, and protect yourself from future attacks. This guide gives you the exact steps to take.");

    sectionTitle(doc, "IMMEDIATE STEPS — FIRST 24 HOURS");
    step(doc, 1, "Stay calm and act systematically. Early action limits the damage significantly.");
    step(doc, 2, "Contact your bank immediately — ask them to freeze your accounts and issue new cards.");
    step(doc, 3, "Change passwords for your email, banking, myGov, and any other important accounts.");
    step(doc, 4, "Report the identity theft to the Australian Federal Police or your local police and get a reference number.");
    step(doc, 5, "Call IDCARE (Australia's national identity support service): 1800 595 160 — free service that helps you create a response plan.");
    url(doc, "IDCARE", "www.idcare.org");
    tip(doc, "Keep a log of every call, email, and letter you send and receive about the identity theft — including dates, times, and names. This documentation is critical for dispute processes.");

    sectionTitle(doc, "PLACE FRAUD ALERTS ON YOUR CREDIT FILE");
    bodyText(doc, "Australia has three credit reporting bureaus. Contact all three to place a fraud alert or credit ban on your file.");
    step(doc, 1, "Equifax (formerly Veda): www.equifax.com.au — call 13 8332 or apply online for a ban.");
    step(doc, 2, "Experian: www.experian.com.au — call 1300 783 684 or submit a fraud alert online.");
    step(doc, 3, "illion (formerly Dun & Bradstreet): www.checkyourcredit.com.au — call 1300 734 806.");
    step(doc, 4, "Request a free credit report from each bureau — check for accounts you didn't open.");
    step(doc, 5, "A credit ban prevents new credit being issued in your name without an exception process. You can apply for a ban on all three bureaus.");
    tip(doc, "Under the Privacy Act, you have the right to a free credit report once per year. Under identity theft circumstances, bureaus must provide reports promptly.");

    sectionTitle(doc, "DISPUTING FRAUDULENT ACCOUNTS");
    bodyText(doc, "For each account opened fraudulently in your name, follow this process:");
    step(doc, 1, "Contact the financial institution directly — ask for their fraud team.");
    step(doc, 2, "Provide your police report reference number and proof of identity.");
    step(doc, 3, "Submit a written dispute — ask that the account be closed and removed from your credit file.");
    step(doc, 4, "Follow up in writing to the credit bureau to request removal of the listing once the institution confirms fraud.");
    step(doc, 5, "If the institution doesn't resolve your complaint within 45 days, escalate to AFCA: www.afca.org.au or 1800 931 678.");

    doc.addPage();
    header(doc, "Identity Theft Recovery Guide", "Reclaim your identity — step-by-step for Australians");

    sectionTitle(doc, "REPORTING TO AUTHORITIES");
    step(doc, 1, "Report to ACCC Scamwatch: www.scamwatch.gov.au — Australian government database of scams.");
    step(doc, 2, "Report to ReportCyber (ACSC): www.cyber.gov.au/report — for cybercrime and online fraud.");
    step(doc, 3, "Report to AFCA: www.afca.org.au — for financial institution disputes.");
    step(doc, 4, "If your Medicare card or Centrelink details were stolen, report to Services Australia: 132 490.");
    step(doc, 5, "If your tax file number was compromised, contact the ATO immediately: 13 28 61.");
    step(doc, 6, "If your driver's licence or passport was stolen, report to the relevant state authority and get new documents issued.");
    tip(doc, "Reporting serves two purposes: it creates an official record that helps your disputes, and it protects others by helping authorities track fraud patterns.");

    sectionTitle(doc, "TEMPLATE — FRAUD DISPUTE LETTER");
    bodyText(doc, "Use this template when disputing fraudulent accounts with financial institutions:");
    doc.moveDown(0.4);
    doc.rect(55, doc.y, doc.page.width - 110, 195).fill("#f0f4f8");
    const boxY = doc.y + 10;
    const boxWidth = doc.page.width - 140;
    doc.fillColor(DARK).font("Helvetica").fontSize(9).text(
      `[Your Full Name]\n[Your Address]\n[Date]\n\nFraud Team\n[Institution Name]\n\nRe: Fraudulent Account — [Account Number or Reference]\n\nI am writing to dispute account [number] which was opened in my name without my knowledge or consent. I am a victim of identity theft.\n\nI request that:\n1. This account be immediately frozen and closed.\n2. No adverse credit listing be made against my name.\n3. The account be removed from my credit file with [Equifax / Experian / illion].\n\nI have attached:\n• Police Report Reference: [Number]\n• Proof of Identity: [ID type]\n• Credit Bureau Fraud Alert: [Confirmation]\n\nPlease confirm receipt and your response within 14 days.\n\nYours sincerely,\n[Your Full Name]`,
      65, boxY, { width: boxWidth, lineGap: 2 }
    );
    doc.y = boxY + 185;

    sectionTitle(doc, "RECOVERY TIMELINE");
    bodyText(doc, "Recovery from identity theft takes time. Here's a realistic timeline:");
    step(doc, 1, "Week 1: Secure accounts, report to police, contact IDCARE, freeze credit file.");
    step(doc, 2, "Weeks 2–4: Contact each institution with fraudulent accounts. Lodge formal disputes.");
    step(doc, 3, "Months 1–3: Follow up on disputes. AFCA escalation if needed. Monitor credit report.");
    step(doc, 4, "Months 3–6: Credit file should be cleared of fraudulent listings. Continue monitoring.");
    step(doc, 5, "Ongoing: Review credit report annually. Maintain fraud alert on file.");
    tip(doc, "Use a credit monitoring service — illion's Credit Simple (free) or Equifax's monitoring service will alert you to any new credit inquiries or accounts opened in your name.");

    sectionTitle(doc, "PREVENTING FUTURE IDENTITY THEFT");
    const preventions = [
      "Never carry your Medicare card, TFN, or passport unless necessary.",
      "Shred financial documents before disposal — don't put them in recycling bins.",
      "Use different email addresses for financial accounts vs general use.",
      "Enable 2FA on all accounts — see our Cyber Security Guide.",
      "Monitor your credit file quarterly, not just annually.",
      "Be cautious about what personal information you share on social media.",
    ];
    preventions.forEach((p, i) => step(doc, i + 1, p));

    doc.moveDown(1);
    doc.rect(55, doc.y, doc.page.width - 110, 55).fill(NAVY);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text("Need personal guidance?", 75, doc.y - 47, { width: doc.page.width - 150 });
    doc.fillColor(WHITE).font("Helvetica").fontSize(9).text("Ask Mia at www.missingcash.com.au — she can guide you through each step for your specific situation, or connect you with IDCARE.", 75, doc.y - 25, { width: doc.page.width - 150 });
  });
}
