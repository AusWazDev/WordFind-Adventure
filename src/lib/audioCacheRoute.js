// Service-worker route for the offline audio cache (CR-68, brief SF-13).
// Workbox tests a RegExp urlPattern against the full url.href, so the old
// /^\/audio\/.+\.mp3$/ never matched and no audio was ever cached. This matches
// on the pathname instead. Workbox serialises this function into sw.js with
// toString(), so it must stay self-contained: no imports, no outer variables.
export const audioCacheMatch = ({ url, sameOrigin }) => sameOrigin && /^\/audio\/.+\.mp3$/.test(url.pathname);
