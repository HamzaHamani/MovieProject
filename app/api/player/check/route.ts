import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: "missing url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const decoded = decodeURIComponent(url);

    // Try a quick GET with timeout.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let res;
    try {
      res = await fetch(decoded, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    const xFrameOptions = (
      res.headers.get("x-frame-options") ?? ""
    ).toLowerCase();
    const contentSecurityPolicy = (
      res.headers.get("content-security-policy") ?? ""
    ).toLowerCase();
    const finalUrl = res.url || decoded;

    const isRedirect = res.status >= 300 && res.status < 400;
    const frameBlocked =
      xFrameOptions.includes("deny") ||
      xFrameOptions.includes("sameorigin") ||
      contentSecurityPolicy.includes("frame-ancestors");

    let body = "";
    if (contentType.includes("text") || contentType.includes("html")) {
      body = await res.text();
    }

    const hasNavigationScript =
      /(?:top|parent|window)\.location|location\.(?:href|assign|replace)|window\.open\s*\(|meta[^>]+refresh/i.test(
        body,
      );

    const ok =
      res.ok &&
      !isRedirect &&
      !frameBlocked &&
      !hasNavigationScript &&
      (contentType.includes("text/html") ||
        contentType.includes("application/json") ||
        contentType.includes("text/plain") ||
        contentType.includes("video"));

    return new Response(
      JSON.stringify({ ok, url: finalUrl, status: res.status }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    const message =
      e?.name === "AbortError" ? "timeout" : e?.message ?? "unknown";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
