// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0bda1fb494b696e7b106ce731ddaf769@o4510727889879040.ingest.de.sentry.io/4510727893876816",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Note: consoleLoggingIntegration is not available in Sentry 7.91.0
  // It's available in Sentry 8.0+. We'll add it when we upgrade.
  integrations: [],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
