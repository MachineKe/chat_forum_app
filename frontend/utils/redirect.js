/**
 * Reusable redirect function for navigation.
 * @param {string} url - The URL to redirect to.
 * @param {Object} [options] - Options for redirection.
 * @param {boolean} [options.newTab=false] - If true, open in a new tab.
 */
export function redirectTo(url, { newTab = false } = {}) {
  if (!url || typeof url !== "string") return;
  if (newTab) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.location.assign(url);
  }
}
