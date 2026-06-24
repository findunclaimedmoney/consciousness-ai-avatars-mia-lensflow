import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, AlertCircle, Zap } from "lucide-react";

type SessionState = "loading" | "valid" | "already-sent" | "invalid";

type FormData = {
  firstName: string;
  lastName: string;
  dob: string;
  currentAddress: string;
  previousAddresses: string;
  previousSurnames: string;
};

const empty: FormData = {
  firstName: "", lastName: "", dob: "", currentAddress: "",
  previousAddresses: "", previousSurnames: "",
};

export default function MiaResearch() {
  usePageSEO({
    title: "Mia Speed Research — Submit Your Details | MissingCash",
    description: "Submit your details for Mia to research every Australian unclaimed money database and email you a personalised report.",
  });

  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session") ?? "";

  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [customerEmail, setCustomerEmail] = useState("");
  const [form, setForm] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSessionState("invalid");
      return;
    }
    fetch(`/api/mia/research/session?session=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.alreadySent) {
          setCustomerEmail(data.email ?? "");
          setSessionState("already-sent");
        } else if (data.valid) {
          setCustomerEmail(data.email ?? "");
          setSessionState("valid");
        } else {
          setSessionState("invalid");
        }
      })
      .catch(() => setSessionState("invalid"));
  }, [sessionId]);

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid = form.firstName && form.lastName && form.dob && form.currentAddress;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/mia/research/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeSessionId: sessionId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionState === "loading") {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your session…</p>
        </div>
      </div>
    );
  }

  if (sessionState === "invalid") {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-2xl font-heading tracking-wider text-white mb-3">Invalid Session</h1>
          <p className="text-muted-foreground mb-6">
            This link is invalid or has expired. Please use the link from your Mia Speed Research confirmation email.
          </p>
          <p className="text-sm text-muted-foreground">
            Need help? Email <a href="mailto:support@missingcash.com.au" className="text-primary underline">support@missingcash.com.au</a>
          </p>
        </div>
      </div>
    );
  }

  if (sessionState === "already-sent") {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-heading tracking-wider text-white mb-3">Report Already Sent</h1>
          <p className="text-muted-foreground mb-3">
            Mia has already sent your personalised research report to <strong className="text-white">{customerEmail}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Can't find it? Check your spam folder or email <a href="mailto:support@missingcash.com.au" className="text-primary underline">support@missingcash.com.au</a>
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/40 mb-8">
            <Zap className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-heading tracking-wider text-white mb-3">Mia Is On It!</h1>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Mia is now generating your personalised report across all 8 Australian unclaimed money databases. Your report will be emailed to <strong className="text-white">{customerEmail}</strong> within the next few minutes.
          </p>
          <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-3 mb-6">
            <h3 className="font-bold text-white mb-2">Your report will cover:</h3>
            {[
              "ATO myGov — Lost super & unclaimed tax refunds",
              "ASIC / MoneySmart — Bank accounts, investments & life insurance",
              "All 8 state & territory revenue office registers",
              "Computershare & Link Market Services share registries",
              "Fair Work unpaid wages",
              "Rental bonds & lottery unclaimed prizes",
              "Your personalised priority search order",
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-primary">✓</span>
                <p className="text-sm text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Questions while you wait? Open <span className="text-primary font-semibold">Mia</span> using the chat button below — she's ready to help.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
            <Zap className="w-4 h-4" /> Mia Speed Research — Session Confirmed
          </div>
          <h1 className="text-4xl font-heading tracking-wider text-white mb-3">
            SUBMIT YOUR <span className="text-primary">DETAILS</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Mia will use your details to search every Australian unclaimed money database and email a full personalised report to <strong className="text-white">{customerEmail}</strong>.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm text-muted-foreground">First Name *</Label>
                <Input id="firstName" value={form.firstName} onChange={set("firstName")} placeholder="Jane" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last Name *</Label>
                <Input id="lastName" value={form.lastName} onChange={set("lastName")} placeholder="Smith" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-sm text-muted-foreground">Date of Birth *</Label>
              <Input id="dob" type="date" value={form.dob} onChange={set("dob")} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currentAddress" className="text-sm text-muted-foreground">Current Address *</Label>
              <Input id="currentAddress" value={form.currentAddress} onChange={set("currentAddress")} placeholder="123 Example St, Wanneroo WA 6065" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="previousAddresses" className="text-sm text-muted-foreground">
                Previous Addresses <span className="text-xs text-muted-foreground/60">(optional — helps search more states)</span>
              </Label>
              <Textarea
                id="previousAddresses"
                value={form.previousAddresses}
                onChange={set("previousAddresses")}
                placeholder="e.g. 45 Old Road, Parramatta NSW 2150 (2018–2022)"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="previousSurnames" className="text-sm text-muted-foreground">
                Previous Surnames / Maiden Name <span className="text-xs text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                id="previousSurnames"
                value={form.previousSurnames}
                onChange={set("previousSurnames")}
                placeholder="e.g. Johnson (maiden name)"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full h-14 text-lg font-bold tracking-wider rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgba(245,185,66,0.35)] mt-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Mia is starting your research…</>
              ) : (
                <><Zap className="w-5 h-5 mr-2" /> Start My Research — Send Report</>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-1">
              🔒 Your details are used only to generate your research report and are stored securely. See our <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
