import { Resend } from "resend";

export const runtime = "nodejs";

const MAX_LENGTH = {
  name: 100,
  phone: 40,
  projectType: 100,
  location: 180,
  details: 3000,
  sourcePage: 500,
};

type ContactPayload = {
  name?: unknown;
  phone?: unknown;
  projectType?: unknown;
  location?: unknown;
  details?: unknown;
  sourcePage?: unknown;
  website?: unknown;
  submittedAt?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength)
    : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function recipients() {
  return (process.env.CONTACT_TO_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return Response.json({ error: "Invalid request origin." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ error: "Invalid form submission." }, { status: 400 });
  }

  // Silently accept bot submissions that fill the hidden field.
  if (clean(payload.website, 200)) {
    return Response.json({ ok: true });
  }

  const name = clean(payload.name, MAX_LENGTH.name);
  const phone = clean(payload.phone, MAX_LENGTH.phone);
  const projectType = clean(payload.projectType, MAX_LENGTH.projectType);
  const location = clean(payload.location, MAX_LENGTH.location);
  const details = clean(payload.details, MAX_LENGTH.details) || "Not provided";
  const sourcePage = clean(payload.sourcePage, MAX_LENGTH.sourcePage) || "Unknown page";

  if (!name || !phone || !projectType || !location) {
    return Response.json(
      { error: "Please complete all required fields." },
      { status: 400 },
    );
  }

  const submittedAt = Number(payload.submittedAt);
  if (Number.isFinite(submittedAt) && Date.now() - submittedAt < 800) {
    return Response.json({ error: "Please wait a moment and try again." }, { status: 429 });
  }

  const to = recipients();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || to.length === 0) {
    console.error("Contact form email configuration is incomplete.");
    return Response.json(
      { error: "Email delivery is temporarily unavailable. Please call 352-464-5955." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Citrus Website <estimates@citrusdemolitionandlandclearing.com>";
  const subject = `New estimate request: ${projectType} in ${location}`;
  const rows = [
    ["Name", name],
    ["Phone", phone],
    ["Project type", projectType],
    ["Project location", location],
    ["Project details", details],
    ["Submitted from", sourcePage],
  ];

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text: rows.map(([label, value]) => `${label}: ${value}`).join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717;max-width:640px">
        <h1 style="font-size:24px;margin:0 0 20px">New website estimate request</h1>
        <table style="border-collapse:collapse;width:100%">
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <th style="border-bottom:1px solid #ddd;padding:10px 12px;text-align:left;vertical-align:top;width:150px">${escapeHtml(label)}</th>
                  <td style="border-bottom:1px solid #ddd;padding:10px 12px;white-space:pre-wrap">${escapeHtml(value)}</td>
                </tr>`,
            )
            .join("")}
        </table>
      </div>`,
  });

  if (error) {
    console.error("Resend contact form error:", error);
    return Response.json(
      { error: "We could not send your request. Please call 352-464-5955." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
