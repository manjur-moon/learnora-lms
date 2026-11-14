import test from "node:test";
import assert from "node:assert/strict";
import { resolveVideoSource } from "../src/utils/videoSource.ts";

test("YouTube watch, share, shorts, and embed URLs resolve to privacy-enhanced embed", () => {
  const urls = [
    "https://www.youtube.com/watch?v=j942wKiXFu8",
    "https://youtu.be/j942wKiXFu8?t=32",
    "https://m.youtube.com/shorts/j942wKiXFu8",
    "https://www.youtube-nocookie.com/embed/j942wKiXFu8",
  ];
  for (const value of urls) {
    assert.deepEqual(resolveVideoSource(value), {
      kind: "iframe", provider: "YouTube", src: "https://www.youtube-nocookie.com/embed/j942wKiXFu8?rel=0",
    });
  }
});

test("Vimeo player URLs resolve safely", () => {
  assert.deepEqual(resolveVideoSource("https://vimeo.com/123456789"), {
    kind: "iframe", provider: "Vimeo", src: "https://player.vimeo.com/video/123456789?dnt=1",
  });
});

test("MP4 and WebM support query parameters", () => {
  for (const file of ["lecture.mp4", "lecture.webm"]) {
    assert.equal(resolveVideoSource(`https://cdn.example.com/${file}?token=abc`).kind, "file");
  }
});

test("Malicious and unsupported URLs never become arbitrary iframe URLs", () => {
  const bad = [
    "javascript:alert(1)",
    "data:text/html,hello",
    "https://youtube.com.evil.example/watch?v=j942wKiXFu8",
    "https://youtu.be/not-id",
    "https://www.youtube.com/watch?v=bad",
    "https://vimeo.com/bad-channel",
    "https://example.com/dashboard",
    "not a URL",
  ];
  for (const value of bad) {
    assert.equal(resolveVideoSource(value).kind, "unsupported", value);
  }
});
