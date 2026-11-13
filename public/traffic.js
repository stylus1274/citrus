(function () {
  if (navigator.webdriver || location.pathname.startsWith("/traffic") || location.pathname.startsWith("/api/")) return;
  var key = "citrus_traffic_session";
  var now = Date.now();
  var session;
  try { session = JSON.parse(sessionStorage.getItem(key) || "null"); } catch (_) { session = null; }

  if (!session || !session.id || now - session.lastSeen > 30 * 60 * 1000) {
    var params = new URLSearchParams(location.search);
    var referrer = "";
    try {
      var ref = new URL(document.referrer);
      if (ref.host !== location.host) referrer = ref.hostname;
    } catch (_) { /* Direct visit. */ }
    session = {
      id: crypto.randomUUID(),
      lastSeen: now,
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
      gclid: params.has("gclid"),
      msclkid: params.has("msclkid"),
      referrer: referrer
    };
  }
  session.lastSeen = now;
  try { sessionStorage.setItem(key, JSON.stringify(session)); } catch (_) { /* Tracking still works for this page. */ }

  var body = JSON.stringify({
    session: session.id,
    path: location.pathname,
    source: session.source,
    medium: session.medium,
    campaign: session.campaign,
    referrer: session.referrer,
    gclid: session.gclid,
    msclkid: session.msclkid
  });
  var url = "/api/traffic/collect";
  if (!navigator.sendBeacon || !navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))) {
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body, keepalive: true }).catch(function () {});
  }
})();
