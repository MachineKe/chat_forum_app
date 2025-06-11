export function apiFetch(input, init) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  let url = input;
  if (typeof input === "string" && input.startsWith("/")) {
    url = baseUrl.replace(/\/$/, "") + input;
  }
  return fetch(url, init);
}

/**
 * Resolves a media path to a full URL if it is a relative /uploads/ path.
 * If the path is already a full URL, returns it as-is.
 */
export function resolveMediaUrl(path) {
  if (typeof path !== "string") return path;
  // If already a full URL (http/https), return as-is
  if (/^https?:\/\//.test(path)) return path;
  // If starts with /uploads/, prepend backend URL
  if (path.startsWith("/uploads/")) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + path;
  }
  // Otherwise, return as-is
  return path;
}

/**
 * Rewrites all src/href attributes in HTML that start with /uploads/ to use the backend URL.
 * Use for raw HTML rendering (dangerouslySetInnerHTML) to ensure media loads correctly.
 */
export function fixMediaSrcs(html) {
  if (typeof html !== "string") return html;
  const backend = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
  return html.replace(
    /(src|href)=["'](\/uploads\/[^"']+)["']/g,
    (match, attr, path) => `${attr}="${backend}${path}"`
  );
}
