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
- Verified November 17, 2026: navigation, persistence, dialog guidance, live chat, mobile/desktop layout and preview isolation. Live voice was checked with a synthetic microphone: speech recognition, the Pro-plan answer, nonzero returned audio, spoken-request visual guidance and clean call ending. Mobile checks use a touch-enabled phone viewport.

## Highlight overlap protection

Rose moves its floating panel to the left when it covers the highlighted control. If that still overlaps, or on narrow screens, it collapses to a guidance bar at the opposite edge.

Run `node admin-demo/test-widget-overlap.cjs` with Playwright installed (`PLAYWRIGHT_MODULE` may point to an existing installation). The seven browser cases load the real widget, force overlap, verify the target receives hit testing, and click it. Cases cover desktop, a wide target, mobile targets above and below the midpoint, side-panel mode and full-width mode.

## Marketing demo polish (November 17, 2026)

- Three real task starters appear inside Rose on first use; the dashboard remains a normal Atlas workspace.
- Natural phrases such as “I forgot my password,” “hook up Stripe” and “invite a teammate” use the published task catalog. Voice uses that same catalog.
- Key, workflow, webhook and invitation forms report completion after their actual sample action succeeds. Closing a dialog clears its old guide.
- Chat outages still offer local guided tasks. Preferences persist, and Reset sample workspace clears both sample data and this demo’s Rose conversation.
- `node admin-demo/test-experience.cjs` covers the first-use, recovery and complete desktop/mobile flows. Use `ATLAS_LOCAL=1` to serve local files at the canonical demo URL before deployment, and `TEST_FILTER` to run one named scenario.

See `QA.md` for the verification scope.

API Reference is a published guided destination. “wheres the api reference,” “where’s the API reference?” and “API docs” open the Reference tab directly and replace an earlier paused guide.
