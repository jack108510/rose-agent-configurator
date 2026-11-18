# Rose Capability Atlas

Live: https://jack108510.github.io/rose-agent-configurator/capability-map/

An interactive constellation of site capabilities, with Rose's warm orb, glowing route traces, search, section filters, keyboard-accessible nodes, zoom/pan, a list view, reduced-motion support and responsive detail panels.

The default view reads `../admin-demo/rose-tools.json` directly. It visualizes the actual curated Atlas catalog rather than maintaining a second set of demo capabilities. Catalogued nodes are explicitly distinguished from scanner-verified targets; this page does not run a site scan or execute an action. Opening a capability opens its actual Atlas page in a separate tab.

## Local scan imports

**Open a site map** accepts a version 1 capability report, a full site-map export with `capabilityMap`, or the owner API response containing `map.capabilityReport`. The file is parsed locally and is never uploaded, saved to browser storage or committed to GitHub. Reloading restores Atlas. Labels and selectors render as text; external-origin capability URLs are excluded. Imports are limited to 5 MB and 2,000 capabilities.

An owner can obtain the report from their authenticated Workground site-map API using `GET /api/rose-account-site-map?capabilities=1` after the new shared mapper is deployed and the website is rescanned. That pipeline is separate from this standalone visualization. There is no account-token entry field or direct private API connection here.

Minimal report structure:

```json
{
  "version": 1,
  "website": "https://example.com",
  "capabilities": [{
    "id": "contact",
    "title": "Contact us",
    "kind": "page",
    "url": "https://example.com/contact",
    "target": "#contact-title",
    "profiles": {
      "desktop": {"verified": true},
      "mobile": {"verified": false, "status": "covered-target"}
    }
  }]
}
```

Device buttons show each profile's evidence independently. **Target verified** means that the supplied report records a target check, not that this viewer checked it or that a workflow outcome succeeded. Missing profile evidence stays **Not observed**. Review targets remain visible.

## Development and checks

From the repository root, serve static files with `python3 -m http.server 8931 --bind 127.0.0.1`. Open `http://127.0.0.1:8931/capability-map/`.

With Playwright installed, run `node capability-map/test-map.cjs`. Set `PLAYWRIGHT_MODULE` to an existing Playwright installation or `MAP_BASE` to another server URL when needed. The checks cover desktop and phone layouts, catalog loading, graph/list modes, search and empty results, target details and destination links, zoom/reset, local imports, device-specific evidence, text-only rendering, invalid-file recovery, source reset, browser exceptions and horizontal overflow. GitHub Actions runs these checks when the map or its source catalog changes.

The page is static and changes no Rose service, Workground settings, customer website or live account.
