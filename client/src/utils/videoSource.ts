/**
 * Only trusted embeddable providers may appear inside an iframe.
 * Other HTTP(S) URLs remain unsupported instead of becoming arbitrary iframes.
 */
export type VideoSource =
  | { kind: "iframe"; provider: "YouTube" | "Vimeo"; src: string }
  | { kind: "file"; provider: "Video file"; src: string }
  | { kind: "unsupported"; provider: "Unsupported source" };

function validYouTubeId(value: string | null): value is string {
  return value !== null && /^[a-zA-Z0-9_-]{11}$/.test(value);
}

export function resolveVideoSource(raw: string): VideoSource {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { kind: "unsupported", provider: "Unsupported source" };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { kind: "unsupported", provider: "Unsupported source" };
  }

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);
  const youtubeHosts = new Set([
    "youtube.com", "www.youtube.com", "m.youtube.com",
    "youtube-nocookie.com", "www.youtube-nocookie.com",
  ]);

  if (youtubeHosts.has(host) || host === "youtu.be" || host === "www.youtu.be") {
    let id: string | null = null;
    if (host === "youtu.be" || host === "www.youtu.be") {
      if (parts.length === 1) id = parts[0];
    } else if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else if (["embed", "shorts", "live"].includes(parts[0] ?? "") && parts.length === 2) {
      id = parts[1];
    }
    if (validYouTubeId(id)) {
      return {
        kind: "iframe",
        provider: "YouTube",
        src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      };
    }
    return { kind: "unsupported", provider: "Unsupported source" };
  }

  if (host === "vimeo.com" || host === "www.vimeo.com" || host === "player.vimeo.com") {
    const id = parts[0] === "video" ? parts[1] : parts[0];
    if (id && /^\d+$/.test(id) && (parts.length === 1 || (parts[0] === "video" && parts.length === 2))) {
      return {
        kind: "iframe",
        provider: "Vimeo",
        src: `https://player.vimeo.com/video/${id}?dnt=1`,
      };
    }
    return { kind: "unsupported", provider: "Unsupported source" };
  }

  if (/\.(mp4|webm)$/i.test(url.pathname)) {
    return { kind: "file", provider: "Video file", src: url.toString() };
  }

  return { kind: "unsupported", provider: "Unsupported source" };
}
