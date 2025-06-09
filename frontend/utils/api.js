export function apiFetch(input, init) {
  const baseUrl = import.meta.env.VITE_API_URL;
  let url = input;
  if (typeof input === "string" && input.startsWith("/")) {
    url = baseUrl.replace(/\/$/, "") + input;
  }
  return fetch(url, init);
}

export function getMediaUrl(path) {
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (typeof path === "string" && path.startsWith("/uploads/")) {
    return socketUrl.replace(/\/$/, "") + path;
  }
  return path;
}
