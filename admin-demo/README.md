# Atlas SaaS workspace

A fictional automation SaaS dashboard with the actual Rose website widget in its normal bottom-right corner. The application itself contains no Rose marketing, assistant sidebar, demo banner or scripted chat. Metrics and workspace actions use synthetic data.

`rose-widget.js` uses the live runtime retrieved from the existing Harbourlight Rose installation on November 16, 2026. A focused fix enables the existing published task catalog in the floating widget; it previously ran only in side-panel mode. It uses the live Rose pilot chat/voice service, native appearance and floating launcher. `rose-bridge.js` selects the service’s existing isolated prospect-preview mode. No backend software was rebuilt and no live account or external integration is changed.

Live: https://jack108510.github.io/rose-agent-configurator/admin-demo/

## Atlas integration

- `atlas-logo.svg` is the product logo and favicon.
- `rose-tools.json` maps natural requests to real Atlas routes and visible controls.
- The app handles hash routes including `#developers/api-keys` and `#settings/security` and exposes control state via ARIA so Rose can confirm a step changed the page.
- `node --test admin-demo/test-guidance.mjs` exercises the runtime’s actual request matcher for singular/plural API keys, password resets, Stripe setup, API-key creation and webhooks.
- `node admin-demo/test-browser.cjs` runs browser regressions with Playwright installed. Set `PLAYWRIGHT_MODULE` to its module path if needed; `ATLAS_LOCAL=1` verifies local assets against the live service before deployment.
- Workflow definitions, webhook endpoints and API-key permissions persist in this browser's demo storage. Existing saved workspaces migrate without losing their keys or profile.
- Site-authored `data-rose-guide-next` steps continue guidance through the Stripe and password dialogs. Completion is confirmed by the app's success event, after the sample action succeeds.
- Verified November 17, 2026: navigation, persistence, dialog guidance, live chat, mobile/desktop layout and preview isolation. Voice/audio was not tested.
