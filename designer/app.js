'use strict';
/* Designer Home: income, pipeline, proof.
   One screen for a designer reselling Rose:
   - Income header from the designer's own prices (their client price minus
     their wholesale cost, times live clients). Estimates only.
   - A five-stage pipeline board. Stages and field names map to the partner
     console stage engine (claimed ~ deliveryApproved, installing ~
     installed/mapping, live ~ published) so a later sync with
     /api/rose-partner-clients is a mapping, not a rebuild.
   - A stage nudge on every card, with copy and WhatsApp actions.
   - Proof cards on live clients that turn two numbers into a forwardable
     sentence (v1 numbers are designer-entered; the socket for
     /api/rose-account-usage is noted in the plan).
   - Portfolio mode: bulk-scan client URLs with the existing
     /api/rose-site-scan and build Maker payload links for each.
   State lives in localStorage on this device (roseDesignerHome:v1).
   Agency identity is shared with the Maker (roseMakerAgency:v1), and the
   Maker's My Roses list (roseMakerRoses:v1) is imported once. */
const API = 'https://wildrose-widget.wildeautomations.com';
const $ = id => document.getElementById(id);
const STAGES = [
  { id: 'draft', label: 'Draft', owner: 'AGENCY', ownerClass: 'agency' },
  { id: 'sent', label: 'Sent', owner: 'CLIENT', ownerClass: 'client' },
  { id: 'claimed', label: 'Claimed', owner: 'AGENCY', ownerClass: 'agency' },
  { id: 'installing', label: 'Installing', owner: 'ROSE', ownerClass: 'rose' },
  { id: 'live', label: 'Live', owner: 'CLIENT', ownerClass: 'client' }
];
const KEY = 'roseDesignerHome:v1';
const TRIAL = { days: 30, voiceMinutes: 75 };

function money(n) { return 'CA$' + Math.round(n).toLocaleString('en-CA'); }
function agency() { try { return JSON.parse(localStorage.getItem('roseMakerAgency:v1') || '{}'); } catch { return {}; } }
function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function save(cards) { try { localStorage.setItem(KEY, JSON.stringify(cards)); } catch {} }
function prices() { return { client: Math.max(0, Number($('clientPrice').value) || 0), wholesale: Math.max(0, Number($('wholesaleCost').value) || 0) }; }

function nudgeFor(card) {
  const link = card.link || '';
  switch (card.stage) {
    case 'draft': return `Hi, I built something for ${card.businessName}: your own AI front desk, already working on your website. Have a look, chat or talk to her: ${link}`;
    case 'sent': return `Just bumping this up: your Rose is still waiting here when you have two minutes. She answers from your own website, and the preview is free for ${TRIAL.days} days: ${link}`;
    case 'claimed': return `Thanks for claiming your Rose. Next step is getting her code onto your website. I can do that for you, or walk you through it in five minutes, whichever you prefer.`;
    case 'installing': return `Rose is being set up on your website now. She stays off until you review her in your Workground and publish, so nothing goes live without your say so.`;
    case 'live': return proofSentence(card) || `Your Rose is live on your website. I will keep an eye on how she is doing and share what visitors are asking.`;
    default: return '';
  }
}
function proofSentence(card) {
  const p = card.proof || {};
  if (!p.questions && !p.leads) return '';
  const bits = [];
  if (p.questions) bits.push(`answered ${p.questions} visitor question${p.questions === 1 ? '' : 's'}`);
  if (p.leads) bits.push(`captured ${p.leads} lead${p.leads === 1 ? '' : 's'}`);
  return `This week your Rose ${bits.join(' and ')} on your website. She is working while you are busy elsewhere.`;
}

/* ---------- import the Maker's list once ---------- */
function importMakerList(cards) {
  let maker = [];
  try { maker = JSON.parse(localStorage.getItem('roseMakerRoses:v1') || '[]'); } catch {}
  const seen = new Set(cards.map(c => c.link));
  let added = 0;
  for (const item of maker) {
    if (!item.link || seen.has(item.link)) continue;
    cards.push({ id: 'c' + Date.now() + added, businessName: item.businessName || item.website, website: item.website, stage: item.sent ? 'sent' : 'draft', link: item.link, createdAt: item.madeAt || new Date().toISOString(), sentAt: item.sent ? item.madeAt : '', claimedAt: '', liveAt: '', note: '', proof: { questions: 0, leads: 0 } });
    added++;
  }
  return added;
}

/* ---------- rendering ---------- */
function renderIncome(cards) {
  const { client, wholesale } = prices();
  const margin = Math.max(0, client - wholesale);
  const live = cards.filter(c => c.stage === 'live').length;
  const pipeline = cards.filter(c => ['claimed', 'installing'].includes(c.stage)).length;
  $('incomeNow').textContent = money(margin * live);
  $('incomeSub').textContent = live ? `From ${live} live client${live === 1 ? '' : 's'} at ${money(margin)} margin each.` : 'From 0 live clients. Your first live Rose starts this number.';
  $('incomePipeline').textContent = pipeline ? `If your ${pipeline} claimed/installing client${pipeline === 1 ? '' : 's'} go live: ${money(margin * (live + pipeline))} / month.` : '';
  $('agencyLabel').textContent = agency().name ? agency().name + ' · Designer Home' : 'Designer Home';
}
function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
function button(label, cls, fn) { const b = el('button', cls || 'back', label); b.type = 'button'; b.addEventListener('click', fn); return b; }

function renderBoard() {
  const cards = load();
  const board = $('board'); board.replaceChildren();
  $('boardEmpty').style.display = cards.length ? 'none' : '';
  for (const stage of STAGES) {
    const col = el('div', 'stage-col');
    const inStage = cards.filter(c => c.stage === stage.id);
    const h = el('h3', '', stage.label + ' '); const count = el('span', '', String(inStage.length)); h.append(count); col.append(h);
    for (const card of inStage) col.append(renderCard(card, stage));
    board.append(col);
  }
  renderIncome(cards);
}
function renderCard(card, stage) {
  const node = el('article', 'card');
  node.append(el('b', '', card.businessName || card.website));
  node.append(el('span', 'site', card.website));
  node.append(el('span', 'owner ' + stage.ownerClass, 'Next move: ' + stage.owner));
  node.append(el('p', 'nudge', nudgeFor(card)));
  const row = el('div', 'row');
  if (card.link) {
    row.append(button('Copy link', 'back', ev => navigator.clipboard.writeText(card.link).then(() => { ev.target.textContent = 'Copied'; setTimeout(() => ev.target.textContent = 'Copy link', 1300); })));
    const open = el('a', 'mini back', 'Open'); open.href = card.link; open.target = '_blank'; open.rel = 'noopener'; row.append(open);
    const wa = el('a', 'mini back', 'WhatsApp'); wa.href = 'https://wa.me/?text=' + encodeURIComponent(nudgeFor(card)); wa.target = '_blank'; wa.rel = 'noopener'; row.append(wa);
  }
  row.append(button('Copy nudge', 'back', ev => navigator.clipboard.writeText(nudgeFor(card)).then(() => { ev.target.textContent = 'Copied'; setTimeout(() => ev.target.textContent = 'Copy nudge', 1300); })));
  node.append(row);
  const move = el('div', 'row');
  const idx = STAGES.findIndex(s => s.id === card.stage);
  if (idx > 0) move.append(button('← ' + STAGES[idx - 1].label, 'back', () => moveCard(card.id, STAGES[idx - 1].id)));
  if (idx < STAGES.length - 1) move.append(button(STAGES[idx + 1].label + ' →', 'primary', () => moveCard(card.id, STAGES[idx + 1].id)));
  move.append(button('Delete', 'back', () => { if (confirm('Remove ' + (card.businessName || card.website) + ' from this board?')) { save(load().filter(c => c.id !== card.id)); renderBoard(); } }));
  node.append(move);
  const note = document.createElement('input'); note.className = 'note'; note.placeholder = 'Note for you…'; note.value = card.note || '';
  note.addEventListener('change', () => { const all = load(); const found = all.find(c => c.id === card.id); if (found) { found.note = note.value; save(all); } });
  node.append(note);
  if (card.stage === 'live') node.append(renderProof(card));
  return node;
}
function renderProof(card) {
  const wrap = el('div', 'proof');
  wrap.append(el('b', '', 'Weekly proof, forward it'));
  for (const [key, label] of [['questions', 'Questions answered'], ['leads', 'Leads captured']]) {
    const lab = el('label', '', label);
    const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.value = card.proof?.[key] || 0;
    input.addEventListener('change', () => { const all = load(); const found = all.find(c => c.id === card.id); if (found) { found.proof = found.proof || { questions: 0, leads: 0 }; found.proof[key] = Math.max(0, Number(input.value) || 0); save(all); renderBoard(); } });
    lab.append(input); wrap.append(lab);
  }
  const sentence = proofSentence(card);
  if (sentence) {
    wrap.append(el('p', 'sentence', sentence));
    const row = el('div', 'row');
    row.append(button('Copy proof', 'back', ev => navigator.clipboard.writeText(sentence).then(() => { ev.target.textContent = 'Copied'; setTimeout(() => ev.target.textContent = 'Copy proof', 1300); })));
    const wa = el('a', 'mini back', 'Send proof'); wa.href = 'https://wa.me/?text=' + encodeURIComponent(sentence); wa.target = '_blank'; wa.rel = 'noopener'; row.append(wa);
    wrap.append(row);
  }
  return wrap;
}
function moveCard(id, stageId) {
  const all = load(); const card = all.find(c => c.id === id); if (!card) return;
  card.stage = stageId;
  if (stageId === 'sent' && !card.sentAt) card.sentAt = new Date().toISOString();
  if (stageId === 'claimed' && !card.claimedAt) card.claimedAt = new Date().toISOString();
  if (stageId === 'live' && !card.liveAt) card.liveAt = new Date().toISOString();
  save(all); renderBoard();
}

/* ---------- portfolio mode ---------- */
function encodePayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function websiteUrl(value) {
  let v = String(value || '').trim();
  if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
  const url = new URL(v);
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) throw new Error('bad URL');
  return url.href;
}
$('portfolioForm').addEventListener('submit', async event => {
  event.preventDefault();
  const status = $('portfolioStatus'), btn = $('portfolioButton');
  const lines = $('portfolioUrls').value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 20);
  if (!lines.length) { status.textContent = 'Paste at least one website, one per line.'; return; }
  btn.disabled = true;
  const ag = agency();
  const cards = load(); let ok = 0; const failures = [];
  for (let i = 0; i < lines.length; i++) {
    let website;
    try { website = websiteUrl(lines[i]); } catch { failures.push(lines[i] + ' (not a valid address)'); continue; }
    status.textContent = `Scanning ${i + 1} of ${lines.length}: ${website}…`;
    try {
      const r = await fetch(API + '/api/rose-site-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website, sourcePage: location.href }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.scraped?.pagesScanned?.length) throw new Error('scan failed');
      const scan = data.scraped;
      const name = (scan.brandName || scan.businessName || new URL(website).hostname).slice(0, 90);
      const color = (scan.brandColors || []).find(c => /^#[0-9a-f]{6}$/i.test(c)) || '#f15a29';
      const payload = { v: 1, website, businessName: name, clientEmail: '', agentName: 'Rose', greeting: `Hi! I can help you explore ${name} and find what you need. What can I help with?`, goals: ['answer_questions', 'capture_leads'], tone: 'friendly', color, correction: '', agency: { name: ag.name || '', code: ag.code || '' }, trial: TRIAL, madeAt: new Date().toISOString() };
      const link = new URL('../maker/preview.html?d=' + encodePayload(payload), location.href).href;
      cards.unshift({ id: 'c' + Date.now() + i, businessName: name, website, stage: 'draft', link, createdAt: payload.madeAt, sentAt: '', claimedAt: '', liveAt: '', note: 'From portfolio mode', proof: { questions: 0, leads: 0 } });
      ok++;
    } catch { failures.push(website + ' (Rose could not read enough of it)'); }
  }
  save(cards); renderBoard();
  status.textContent = `Done. ${ok} Rose${ok === 1 ? '' : 's'} added as Drafts.` + (failures.length ? ' Skipped: ' + failures.join('; ') : '');
  btn.disabled = false;
  if (ok) $('portfolioUrls').value = '';
});

/* ---------- agency + prices wiring ---------- */
function syncAgencyInputs() {
  const ag = agency();
  if (ag.name && !$('agencyName').value) $('agencyName').value = ag.name;
  if (ag.code && !$('agencyCode').value) $('agencyCode').value = ag.code;
}
for (const id of ['agencyName', 'agencyCode']) $(id).addEventListener('input', () => { try { localStorage.setItem('roseMakerAgency:v1', JSON.stringify({ name: $('agencyName').value.trim(), code: $('agencyCode').value.trim() })); } catch {} renderIncome(load()); });
for (const id of ['clientPrice', 'wholesaleCost']) $(id).addEventListener('input', () => { try { localStorage.setItem('roseDesignerPrices:v1', JSON.stringify(prices())); } catch {} renderIncome(load()); });
try { const p = JSON.parse(localStorage.getItem('roseDesignerPrices:v1') || 'null'); if (p) { $('clientPrice').value = p.client; $('wholesaleCost').value = p.wholesale; } } catch {}

/* ---------- boot: import Maker list, then render ---------- */
{
  const cards = load();
  if (importMakerList(cards)) save(cards);
  syncAgencyInputs();
  renderBoard();
}
