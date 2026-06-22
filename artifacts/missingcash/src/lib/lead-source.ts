// Captures marketing attribution from the landing-page URL so every lead shows
// which TikTok video / campaign drove it. Point all ads at the SAME page and
// just change the tag per video, e.g. /start?v=cars1
export function getLeadSource(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("v");
  const utmSource = params.get("utm_source");
  const utmCampaign = params.get("utm_campaign");
  const utmContent = params.get("utm_content");

  const parts = [
    v,
    utmCampaign && `utm_campaign=${utmCampaign}`,
    utmContent && `utm_content=${utmContent}`,
    utmSource && `utm_source=${utmSource}`,
  ].filter(Boolean) as string[];

  if (parts.length === 0) return null;
  return parts.join(" · ").slice(0, 120);
}
