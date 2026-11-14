/** Syntax validation only; the frontend separately checks embeddable video providers. */
export const isValidHttpUrl = (value: string): boolean => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
};
