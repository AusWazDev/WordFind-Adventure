// Sentry options for a child-directed app (CR-59, brief SF-8).
//
// Every player is treated as a possible child (decision S1), so Sentry keeps
// error capture and carries nothing that could identify or profile a player:
//
// - No tracing. `tracesSampleRate` is OMITTED, not 0: @sentry/core's
//   hasSpansEnabled() treats 0 as "enabled" (it tests `!= null`), so 0 would
//   keep the tracing machinery running. Under HashRouter the route names were
//   only ever "/" or "/index.html" anyway.
// - request.url is cut to scheme + host + path. The HashRouter hash carries
//   the route and its query (#/Game?mode=…&category=…&level=…).
// - User-Agent and Referer headers are removed.
// - Navigation breadcrumbs are dropped (their from/to carry the hash query).
// - The BrowserSession integration is removed: session envelopes carry the
//   user_agent and never pass through beforeSend.
//
// Error capture and the CR-58 captureException / addBreadcrumb calls in
// admob.js, purchases.js, HintModal.jsx and RemoveAdsModal.jsx are unchanged.

const STRIPPED_HEADERS = ['user-agent', 'referer'];

// Integrations removed from Sentry's defaults, by their registered name.
export const REMOVED_INTEGRATIONS = ['BrowserSession'];

export function scrubUrl(url) {
  if (typeof url !== 'string' || url === '') return url;
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    // Not an absolute URL: drop everything from the first ? or #.
    return url.split(/[?#]/)[0];
  }
}

export function scrubEvent(event) {
  const request = event?.request;
  if (request) {
    if (request.url !== undefined) request.url = scrubUrl(request.url);
    if (request.query_string !== undefined) delete request.query_string;
    if (request.headers) {
      for (const name of Object.keys(request.headers)) {
        if (STRIPPED_HEADERS.includes(name.toLowerCase())) delete request.headers[name];
      }
      if (Object.keys(request.headers).length === 0) delete request.headers;
    }
  }
  return event;
}

export function scrubBreadcrumb(breadcrumb) {
  if (breadcrumb?.category === 'navigation') return null;
  return breadcrumb;
}

export function removeIntegrations(defaults) {
  return defaults.filter(integration => !REMOVED_INTEGRATIONS.includes(integration.name));
}

export function buildSentryOptions({ dsn, environment, release }) {
  return {
    dsn,
    environment,
    release,
    sendDefaultPii: false,
    integrations: removeIntegrations,
    beforeSend: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
    enabled: !!dsn,
  };
}
