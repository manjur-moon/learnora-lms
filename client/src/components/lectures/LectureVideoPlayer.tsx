import { ExternalLink, Film, ShieldAlert } from "lucide-react";
import type { Lecture } from "../../types/lecture";
import { resolveVideoSource } from "../../utils/videoSource";

type Props = { lecture: Lecture | null };

/** Selecting a lecture remounts the media element; it never auto-plays. */
export function LectureVideoPlayer({ lecture }: Props) {
  if (!lecture) {
    return (
      <div className="detail-player__empty" role="status">
        <Film size={35} strokeWidth={1.4} aria-hidden="true" />
        <h3>No lessons available yet</h3>
        <p>When the administrator adds a lecture, you can watch it here.</p>
      </div>
    );
  }

  const source = resolveVideoSource(lecture.videoUrl);
  const mediaKey = `${lecture._id}-${source.kind === "unsupported" ? "unsupported" : source.src}`;

  if (source.kind === "unsupported") {
    let externalUrl: string | null = null;
    try {
      const url = new URL(lecture.videoUrl);
      if (url.protocol === "http:" || url.protocol === "https:") externalUrl = url.href;
    } catch { /* Invalid URL: no link */ }

    return (
      <div className="detail-player__empty" role="status">
        <ShieldAlert size={36} strokeWidth={1.4} aria-hidden="true" />
        <h3>This video can't be embedded</h3>
        <p>Supported formats include YouTube, Vimeo, MP4 and WebM.</p>
        {externalUrl && (
          <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="detail-player__external">
            Open original video <ExternalLink size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    );
  }

  if (source.kind === "file") {
    return (
      <video
        key={mediaKey}
        className="detail-player__media"
        controls
        playsInline
        preload="metadata"
        aria-label={`Video: ${lecture.title}`}
      >
        <source src={source.src} type={new URL(source.src).pathname.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4"} />
        Your browser does not support HTML5 video playback.
      </video>
    );
  }

  return (
    <iframe
      key={mediaKey}
      className="detail-player__media"
      src={source.src}
      title={`Video lesson: ${lecture.title}`}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
      allowFullScreen
    />
  );
}
