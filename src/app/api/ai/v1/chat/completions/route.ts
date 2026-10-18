// Same-origin AI relay for ED Code Assist (deployed mode).
//
// The tool's AI Assist panel calls POST /api/ai/v1/chat/completions with an
// Authorization: Bearer <admin-configured key> header when the direct provider
// endpoint is blocked by browser CORS (NVIDIA NIM and Groq both block direct
// browser calls). The X-AI-Provider request header selects the upstream:
//   'nvidia' (default) -> https://integrate.api.nvidia.com
//   'groq'             -> https://api.groq.com/openai
// This route forwards the request verbatim and relays the response. The key
// is NOT stored server-side — it travels with the request, so admin key
// management stays exactly as in the offline tool.
//
// PHI-safe: the request body (clinical notes) is never logged.
// The offline standalone file keeps using ai_gateway.py / direct calls.
//
// ---- VERCEL TWIN DIFFERENCES (vs the workspace copy of this route) ----
// 1. `maxDuration = 300` — Vercel Functions cap: 300s on the Hobby plan
//    (with Fluid compute, the default for new projects) and 300s default /
//    up to 800s on Pro. If an older project without Fluid compute rejects
//    it ("maxDuration between 1 and 60"), enable Fluid compute in the
//    project settings or lower this to 60.
// 2. The abort timer is 295s (workspace: 330s) so this route returns a
//    clean JSON timeout error just before the platform cutoff.

export const maxDuration = 300;

const UPSTREAMS: Record<string, string> = {
  nvidia: "https://integrate.api.nvidia.com",
  groq: "https://api.groq.com/openai",
};

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ") || auth.trim().length < 8) {
    return Response.json(
      { error: { message: "Missing Authorization: Bearer <key> header" } },
      { status: 401 }
    );
  }

  const provider = (req.headers.get("x-ai-provider") || "nvidia").toLowerCase();
  const base = UPSTREAMS[provider];
  if (!base) {
    return Response.json(
      {
        error: {
          message: `Unknown AI provider '${provider}' (supported: ${Object.keys(UPSTREAMS).join(", ")})`,
        },
      },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: { message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  // deep reasoning runs can take minutes; 295s so the JSON error wins the
  // race against the 300s platform cutoff (Hobby/Pro default)
  const timer = setTimeout(() => controller.abort(), 295_000);

  try {
    const upstream = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    const msg =
      e instanceof Error && e.name === "AbortError"
        ? "Upstream AI request timed out after 295s"
        : `Upstream AI request failed: ${e instanceof Error ? e.message : "unknown error"}`;
    return Response.json({ error: { message: msg } }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  return Response.json({
    status: "ok",
    route: "/api/ai/v1/chat/completions",
    method: "POST",
    providers: Object.keys(UPSTREAMS),
    note: "ED Code Assist AI relay (forwards to NVIDIA NIM or Groq per the X-AI-Provider header, with the caller's Bearer key)",
  });
}
