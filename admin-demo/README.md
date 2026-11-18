# Atlas SaaS workspace demo

Live: https://jack108510.github.io/rose-agent-configurator/admin-demo/

Atlas is a fictional SaaS workspace using the real Rose chat and voice service. Workspace data, credentials and setup actions are synthetic.

## Complete UI guidance

`rose-tools.json` declares every page, section and action currently exposed by Atlas. `atlas-guide.js` resolves requests against that catalog and current public workspace state. Viewing integrations, members or workflows is separate from connecting, inviting or creating. Ambiguous requests offer real choices; unavailable actions and read-only fields are identified explicitly. Requests about facts continue to the live assistant with current workspace state, not just the starting sample values.

The widget uses the same resolver for typed and spoken requests. Workflow details and additional keys are discovered from current demo state, so newly created items do not require hand-written catalog entries. Guidance continues through forms and dialogs, responds to saved connection state, and clears stale guidance when a task is changed or a dialog is closed. Actual DOM controls are never serialized into the saved guide session.

Every visible app button and editable field must be covered by a catalog target, a declared coverage selector, or a dynamic workflow/key mapping. The browser audit fails when a visible control is added without coverage. Read-only account fields are separately mapped. Tabs use canonical routes and survive refresh; browser Back stays functional.

## Verification

Install Playwright or point `PLAYWRIGHT_MODULE` at an existing installation. Set `ATLAS_LOCAL=1` on the browser suites to load local assets at the canonical URL. `ATLAS_OFFLINE=1` verifies that UI guidance works without any Rose service. Omit `ATLAS_LOCAL` to test the published demo. `TEST_FILTER` selects a named scenario in the complete/experience suites.

```sh
node --test admin-demo/test-guidance.mjs admin-demo/test-catalog.cjs
node admin-demo/test-complete-guidance.cjs
node admin-demo/test-experience.cjs
node admin-demo/test-browser.cjs
node admin-demo/test-widget-overlap.cjs
```

`SKIP_LIVE=1` excludes the final live-service fact check in `test-browser.cjs`. `test-live-state.cjs` optionally checks that the live assistant answers from a changed profile and workflow count. The GitHub Actions workflow runs all offline UI, language, persistence and overlap checks on demo changes.

See [QA.md](QA.md) for the audited scope and [CAPABILITIES.md](CAPABILITIES.md) for the current map. Voice checks use synthetic speech; mobile checks use touch-enabled phone viewports rather than physical iOS/Android hardware.
