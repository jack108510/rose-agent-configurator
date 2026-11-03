# Rose Maker for Designers

Spec: `~/workspace/goals/wildrose-designer-partner-test/files/designer-tool-map-and-spec.md`
(in the Wildrose designer partner test goal). This is v1, built only from
pieces that already exist live. No new backend was required.

## What it does

1. Designer logs in to their partner workspace (link on step one) and
   enters their company name and website once (kept in localStorage on
   their device). There is no agency code anywhere in the flow; Jack
   removed it on 2026-11-02 in favour of login plus company info.
2. Designer pastes a client website. The existing scan API
   (POST /api/rose-site-scan on wildrose-widget.wildeautomations.com) reads
   the site and returns brand name, brand colours, logo, pages, summary and
   page knowledge.
3. Setup defaults come from the scan (business name, first colour, logo).
   The designer can change agent name, greeting, goals, tone, colour, and
   add a fact correction, which outranks scan text in the agent context,
   same rule as the configurator.
4. A live preview of the real Rose widget (chat and voice, preview mode)
   mounts beside the form.
5. "Create preview link" produces a shareable `preview.html?d=...` link.
   The link carries the whole setup (website, business, agent setup,
   agency name, pilot trial terms) base64url-encoded. The
   designer's made Roses are listed under My Roses (localStorage on their
   device) with Copy link, Open, Mark sent, Delete.
6. `preview.html` is what the client opens: their own website in a frame
   with Rose layered on top, a header crediting the agency, the trial note
   (30 days, 75 voice minutes, no card), and a "Make it yours" button.
   Opening the page rescans the site for fresh knowledge, then mounts the
   widget with the designer's setup.
7. Claim goes to the existing configurator with `website` and `business`
   prefilled (it rescans automatically). Attribution will come from the
   designer's logged-in partner workspace once the claim is wired to it;
   the configurator's `source=partner-<code>` support from the first
   build is now unused by the Maker.

## The preview businessId rule (do not regress)

Never mount the widget with a synthetic businessId such as
`preview-<hostname>`. The widget API treats any businessId as a real client
id, and chat start returns "Business setup is incomplete". Both Maker pages
mount with no businessId and pass name, website and businessContext with
previewMode on. Verified live on 2026-11-02: chat start and a full message
round trip succeed with no businessId and fail with a synthetic one.
The same fix was applied to ../app.js, matching the wildrose-site-fixes
package (which fixed the wildrose-automations copy of /configure/).

## Known v1 limits, deliberate

- No server-side draft or viewed tracking: links are self-contained, so
  "Viewed" cannot be reported until the backend piece lands (agency
  attributed draft creation with a preview token, specced in the map doc).
  My Roses statuses are Created and Sent (manual) on the designer's device;
  Claimed and Live are visible in the partner console stage engine.
- Claim still ends at the existing configurator checkout. A no-card trial
  claim needs the backend trial path; until then the preview page states
  the pilot terms and the agency settles the trial with Wildrose as they
  do today.
- The Maker itself holds no session: the login button opens the partner
  workspace, and company info is remembered on this device only. A real
  in-Maker session arrives when the tools live on the Wildrose domain
  beside the partner workspace.

## Files

- `index.html`, `app.js`, `maker.css`: the Maker. Reuses `../styles.css`
  and the configurator's widget mounting pattern.
- `preview.html`: the client preview and claim page, self-contained.
