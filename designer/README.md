# Designer Home

The design and install management home for Rose partner designers and
their clients: create the design, deliver it, install it, verify it,
publish it, then keep the proof flowing. Income and proof support that
core job.
Plan: `designer-home-plan.md` in the Wildrose designer partner test goal
files. Builds on the Rose Maker in `../maker/`.

## What is on the screen

- **Your Rose income.** Live clients times (your client price minus your
  Rose licensing fee). Both prices are inputs the designer controls and are
  stored on their device; the header says plainly that these are their
  numbers and an estimate, not a bill. A pipeline line shows what the
  number becomes if claimed and installing clients go live.
- **Add a client.** Three doors: the Maker with full setup control, a
  start-with-your-own-site shortcut into the Maker, and Portfolio mode.
- **Portfolio mode.** Paste up to 20 client URLs. Each is scanned live
  with POST /api/rose-site-scan, defaults are built from the scan
  (business name, first brand colour), a Maker-format preview link is
  generated, and a Draft card lands on the board. Failures are listed
  per URL.
- **Pipeline board.** Five stages: Draft, Sent, Claimed, Installing,
  Live. Each stage names the next move owner (AGENCY, CLIENT, or ROSE),
  following the partner console stage engine. Every card has its stage
  nudge written out, with Copy nudge, WhatsApp send, Copy link and Open
  actions, stage move buttons, a private note field, and delete. Claimed,
  Installing and Live cards carry an install checklist: install code
  sent, code added to site, install verified, client published. Ticking
  Client published moves the card to Live.
- **Proof.** On Live cards the designer enters questions answered and
  leads captured for the week; the card renders one forwardable sentence
  with copy and WhatsApp actions. This is the retention loop.
- **Continuity with the Maker.** Company name and website are shared with
  the Maker (same localStorage), and the Maker's My Roses list is
  imported into Draft or Sent on first load, so nothing made in the
  Maker is lost.

## State and limits, honestly

Everything is local to the designer's device (localStorage key
roseDesignerHome:v1). There is no server sync in this phase: no Viewed
tracking for sent links, stages are moved by hand, proof numbers are
entered by hand, and income uses designer-entered prices. The card
fields were chosen to map onto the partner clients API
(deliveryApproved, installed, published, mapping) so phase 2 can sync
from /api/rose-partner-clients and phase 3 can add server drafts,
viewed events, usage-driven proof, and partner billing rates. See the
plan file for the phase list.

## Files

- `index.html`, `app.js`, `home.css`. Reuses `../styles.css` and the
  Maker payload encoding so links open in `../maker/preview.html`.
