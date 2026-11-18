# Atlas QA — complete UI audit, November 17, 2026

## Scope

The audit covers all current Atlas pages, sections, buttons and editable fields. It separates navigation from actions, covers saved-state differences and uses actual UI controls. It does not claim support for arbitrary phrasing or features not present in Atlas.

## Automated checks

- 37 catalog capabilities, each exercised on desktop and a touch-enabled 390×844 viewport: 74 destination checks.
- Twelve additional complete-audit scenarios: visible-control coverage; tab refresh and invalid routes; changing a paused guide; connected Stripe management/disconnection; profile/preferences completion; newly created workflow details; named-key reveal/hide; webhook/invitation validation; honest setup previews; browser/requested Back; reloading an active guide; unsupported/ambiguous requests. Total: 86 browser cases.
- 17 first-use, complete-flow, recovery and reset scenarios.
- Six offline persistence/migration regressions, plus an optional live Pro-plan check.
- Seven overlap/hit-testing cases using the actual widget runtime.
- 106 language/catalog checks, including action/page separation, named items, ambiguous requests and unsupported actions.

The complete UI suite counts chat API requests and fails if any known UI request falls through to a conversational answer. The visible-control audit flags unmapped app buttons or editable fields. `.github/workflows/atlas-demo-qa.yml` runs the offline suites on future demo changes.

## Live service checks

The actual chat service answered using a changed profile name and an increased active-workflow count. Current facts include the public demo state and catalog capabilities; key values and unsaved form inputs are excluded from the state summary.

With a synthetic microphone recording, the actual voice service recognized an Atlas plan question, returned the Pro-plan answer and nonzero audio, and ended cleanly. A spoken Stripe setup request started the visual guide and highlighted Connect Stripe. The voice greeting identified Rose as the Atlas assistant. Audio/transcript observability hooks measured the real voice session; responses and speech recognition were not replaced.

Blocked microphone access displayed a recovery message and left chat guidance usable. Physical mobile microphone/speaker hardware and every browser engine are outside this verification scope.

## Sample boundaries

Stripe setup, invitation delivery, password reset, GitHub authorization and 2FA are explicitly sample or preview flows. They do not change real accounts, transmit email, publish credentials or request external permissions. Unsupported billing, deletion and unimplemented account changes offer existing Atlas controls instead of invented pages or confirmations.
