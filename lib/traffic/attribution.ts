function short(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function attribution(data: Record<string, unknown>) {
  const source = short(data.source, 120).toLowerCase().replace(/[^a-z0-9. _-]/g, "") || "direct";
  const medium = short(data.medium, 40).toLowerCase();
  const referrer = short(data.referrer, 120).toLowerCase().replace(/[^a-z0-9.-]/g, "");
  const candidate = source === "direct" ? referrer : source;
  const paid = /^(cpc|ppc|paid|paidsearch|paid_search|display|cpm)$/.test(medium) || Boolean(data.gclid || data.msclkid);
  // Only a search engine's main host counts as organic. ads.google.com is a referral without a paid marker.
  const search = /^(?:www\.|m\.)?(?:google|bing|yahoo|duckduckgo|ecosia)\.[a-z.]{2,}$/.test(candidate)
    || /^(?:google|bing|yahoo|duckduckgo|ecosia)$/.test(candidate);
  const social = /(^|\.)(facebook|instagram|linkedin|tiktok|pinterest|reddit|x|twitter)\./.test(candidate) || /^(facebook|instagram|linkedin|tiktok|pinterest|reddit|x|twitter)$/.test(candidate);
  const channel = paid ? "Paid" : medium === "email" ? "Email" : medium === "organic" || (!medium && search) ? "Organic search"
    : medium === "social" || (!medium && social) ? "Social" : source !== "direct" || referrer ? "Referral" : "Direct";
  return { channel, source: data.gclid && source === "direct" ? "google" : data.msclkid && source === "direct" ? "bing" : candidate || "direct", campaign: short(data.campaign, 120) };
}
