# Rose Agent Configurator

A standalone configurator for Rose. It scans a public business website, mounts the same Rose chat and voice widget used in the demo, and sends the selected agent setup and scan ID to checkout. The API verifies the scan against the website before creating a Workground draft.

Demo links carry the website and scan into the configurator, so visitors start at agent setup. Direct visitors start with their website. A browser draft resumes only for the same website URL within one hour; a fresh visit starts clean.

The widget runs in preview mode. Visitor test requests are not delivered to the business. A failed or unsaved multi-page scan blocks checkout so a customer does not pay for an empty agent draft. Owners can inspect the scanned page links and enter a correction; that correction is saved in the Workground draft and takes priority over scan text in the live agent context.

This repository publishes a standalone copy from `main`. The customer-facing copy is published at `https://wildroseautomations.ca/configure/` from the `wildrose-automations` site's `gh-pages` branch.

## Rose client demo

The [Northline Electrical demo](https://jack108510.github.io/rose-agent-configurator/electrical-demo/) is a fictional Edmonton-area contractor site with the live Rose chat and voice widget. It uses a separate synthetic client profile on the isolated Rose pilot. Its hours, services, and service area match the site's published facts. Demo mode blocks lead handoff, bookings, and review requests; the sample contact details are not monitored.

The older [`install-test/`](https://jack108510.github.io/rose-agent-configurator/install-test/) bakery page remains an installation test, not the client showcase.
