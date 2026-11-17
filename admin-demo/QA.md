# Atlas demo QA — November 17, 2026

## Scope

The demo uses the live Rose service with isolated prospect-preview sessions. Workspace actions and credentials are synthetic. This release changes the Atlas frontend only.

## Browser coverage

- 22 broad checks: navigation, reveal/hide, saved keys, permissions, Stripe validation/connect/disconnect, password previews, focus restoration, profile/workflow/webhook persistence, chat, five guided destinations, desktop/mobile layout, request destinations and browser exceptions.
- Seven targeted regressions: complete password and Stripe dialog guides, key permissions, workflow details/counts, multiple webhooks, existing-storage migration and the live Pro-plan answer.
- Seventeen experience cases: first-use task suggestions; natural password, Stripe and teammate requests; full key/workflow/Stripe flows on desktop and a touch-enabled 390×844 phone viewport; dialog cancellation/restart; saved preferences; unavailable-chat recovery; unsupported account deletion; complete demo reset; and API-reference navigation from a paused key guide on desktop/mobile.
- Seven overlap cases: ordinary desktop, unobstructed control, wide control, upper/lower mobile targets, side-panel mode and full-width mode. Tests verify hit testing and then click the highlighted control.
- Nineteen parser tests cover the published task catalog, including spoken requests.

Commands (Playwright must be installed; `PLAYWRIGHT_MODULE` can identify an existing installation):

```sh
node --test admin-demo/test-guidance.mjs
node admin-demo/test-browser.cjs
node admin-demo/test-experience.cjs
node admin-demo/test-widget-overlap.cjs
```

`ATLAS_LOCAL=1` on the browser and experience suites checks local assets against the live service before deployment. Without it, those suites exercise the published demo.

## Live voice verification

Chromium used a synthetic spoken microphone recording, not a person's microphone. The actual voice service recognized “What subscription plan is my Atlas workspace on?”, returned a Pro-plan answer, emitted nonzero audio samples and ended cleanly. A second spoken request, “Help me connect Stripe,” opened Integrations and highlighted Connect Stripe. Its greeting identified Rose as the Atlas assistant. Observability hooks recorded transcripts and audio energy without replacing the voice service, speech recognition or responses.

These checks cover automated Chromium and an emulated phone viewport; physical iOS/Android microphone permission and speaker hardware are outside this verification scope.
