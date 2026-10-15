# Rose Agent Configurator

A standalone configurator for Rose. It scans a public business website, mounts the same Rose chat and voice widget used in the demo, and sends the selected agent setup and scan ID to checkout. The API verifies the scan against the website before creating a Workground draft.

Demo links carry the website and scan into the configurator, so visitors start at agent setup. Direct visitors start with their website. A browser draft resumes only for the same website URL within one hour; a fresh visit starts clean.

The widget runs in preview mode. Visitor test requests are not delivered to the business. A failed or unsaved scan blocks checkout so a customer does not pay for an empty agent draft.

The live page is published with GitHub Pages from this repository's `main` branch.
