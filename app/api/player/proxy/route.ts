import { NextRequest } from "next/server";

function makeAbsolute(base: string, relative: string) {
  try {
    return new URL(relative, base).toString();
  } catch (e) {
    return relative;
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return new Response("Missing url", { status: 400 });
    }
    const decoded = decodeURIComponent(url);

    // Fetch the target
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let res;
    try {
      res = await fetch(decoded, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res) {
      return new Response("Bad gateway", { status: 502 });
    }

    const finalUrl = res.url || decoded;
    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    // If non-HTML, stream binary (scripts, images, css, video)
    if (!contentType.includes("text/html")) {
      const buffer = await res.arrayBuffer();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => (headers[k] = v));
      return new Response(Buffer.from(buffer), { status: 200, headers });
    }

    // HTML: rewrite links and scripts to be usable from our origin
    let body = await res.text();

    // Remove CSP meta tags that would block inline/frame resources
    body = body.replace(
      /<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi,
      "",
    );
    // Remove meta refresh tags that redirect
    body = body.replace(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*>/gi, "");

    // Insert a base tag so relative URLs resolve correctly
    if (body.includes("<head")) {
      body = body.replace(
        /<head(.*?)>/i,
        (m, g1) => `<head${g1}><base href="${finalUrl}">`,
      );
    } else {
      body = `<base href="${finalUrl}">` + body;
    }

    // Remove simple framebusting scripts and page navigation scripts.
    body = body.replace(
      /<script[^>]*>[\s\S]*?(top\.location|parent\.location|window\.top|window\.location|location\.(?:href|assign|replace)|window\.open\s*\()[\s\S]*?<\/script>/gi,
      "",
    );

    // Remove debugger statements inside scripts which can trigger devtools/pausing
    body = body.replace(/\bdebugger;?/gi, "");

    // Make relative src/href absolute
    body = body.replace(
      /(src|href)=["'](?!https?:|\/\/)([^"']+)["']/gi,
      (m, attr, val) => {
        const abs = makeAbsolute(finalUrl, val);
        return `${attr}="${abs}"`;
      },
    );

    // Rewrite protocol-relative urls to absolute
    body = body.replace(
      /(src|href)=["']\/\//gi,
      (m) => `${m.slice(0, 5)}https://`,
    );

    // Proxy external absolute resources (scripts/styles) through our proxy so they load same-origin
    body = body.replace(
      /(src|href)=["'](https?:\/\/[^"']+)["']/gi,
      (m, attr, url) => {
        const prox = `/api/player/proxy?url=${encodeURIComponent(url)}`;
        return `${attr}="${prox}"`;
      },
    );

    // Ensure anchors to proxied targets open in a new tab instead of navigating the iframe
    body = body.replace(
      /<a\b([^>]*)href=["'](\/api\/player\/proxy\?url=[^"']+)["']([^>]*)>/gi,
      (m, g1, g2, g3) => {
        return `<a${g1}href="${g2}" target="_blank" rel="noopener noreferrer"${g3}>`;
      },
    );

    // Remove any target attributes that try to break out of frames (_top, _parent)
    body = body.replace(/\s+target=["']\s*_(top|parent)\s*["']/gi, "");

    // Remove inline onclicks that perform location hops
    body = body.replace(
      /\sonclick=["'][^"']*(location\.href|location\.assign|location\.replace|top\.location|parent\.location)[^"']*["']/gi,
      "",
    );

    // Remove inline onload handlers that force navigation.
    body = body.replace(
      /\sonload=["'][^"']*(location\.href|location\.assign|location\.replace|top\.location|parent\.location|window\.location)[^"']*["']/gi,
      "",
    );

    // Ensure the response is HTML with no X-Frame-Options header
    const headers: Record<string, string> = {
      "content-type": "text/html; charset=utf-8",
    };

    return new Response(body, { status: 200, headers });
  } catch (e: any) {
    const message =
      e?.name === "AbortError" ? "timeout" : e?.message ?? "unknown";
    return new Response(message, { status: 502 });
  }
}
