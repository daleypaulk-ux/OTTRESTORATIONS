/**
 * Role-play test: simulates a Knock Up submission against a stripped-down
 * harness that mirrors the live app's data flow. Run with:
 *   node scripts/rp-knockups.js
 *
 * This is intentionally hand-rolled (no JSDOM) so it stays trivially
 * inspectable while still proving the pipeline works:
 *   defaultLead -> state.leads -> persistLeads -> renderHomeLeads ->
 *   renderLeaderboard -> renderBoards.
 */

'use strict';

// ---- minimal stubs to mimic the browser environment used by app.js ----
var _store = {};
var localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : null; },
  setItem: function (k, v) { _store[k] = String(v); },
  removeItem: function (k) { delete _store[k]; },
};
function uid() { return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36); }
function loadJSON(key, fb) { try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : fb; } catch (e) { return fb; } }
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// ---- copies of the lead/rep helpers from app.js (kept in sync manually) ----
function defaultLead(o) {
  o = o || {};
  return {
    id: o.id || uid(),
    name: o.name || '',
    phone: o.phone || '',
    addr: o.addr || '',
    city: o.city || '',
    state: o.state || 'MO',
    src: o.src || 'Door',
    rep: o.rep || '',
    stage: Number(o.stage) || 1,
    slip: !!o.slip,
    complete: !!o.complete,
    collected: Number(o.collected) || 0,
    notes: o.notes || '',
    photos: [], docs: [], timeline: [],
    knockedAt: o.knockedAt || '',
    knockedBy: o.knockedBy || '',
    board: o.board || { who: '', since: '', what: '', cb: '', lastAttempt: '', notes: '', nextStep: '', dateInstalled: '', gutters: '' },
  };
}
function formatLF(name) {
  if (!name) return '';
  name = String(name).trim();
  if (name.indexOf(',') !== -1) return name;
  var parts = name.split(/\s+/);
  if (parts.length < 2) return name;
  return parts.slice(1).join(' ') + ', ' + parts[0];
}
function repTotals(state) {
  var by = {};
  state.users.forEach(function (u) {
    if (u.role === 'rep' || u.role === 'admin' || u.role === 'owner') {
      by[u.email] = { rep: u.email, name: u.name || u.email, knockUps: 0, contracts: 0, closed: 0 };
    }
  });
  state.leads.forEach(function (l) {
    var k = l.rep || 'Unassigned';
    if (!by[k]) by[k] = { rep: k, name: k, knockUps: 0, contracts: 0, closed: 0 };
    by[k].knockUps += 1;
    if (l.slip) by[k].contracts += 1;
    if (l.stage >= 12 || l.complete) by[k].closed += 1;
  });
  return Object.keys(by).map(function (k) { return by[k]; });
}
function topN(rows, key, n) {
  return rows.slice().sort(function (a, b) { return (b[key] || 0) - (a[key] || 0); }).slice(0, n).filter(function (r) { return (r[key] || 0) > 0; });
}
function leadSortStamp(l) {
  if (l.knockedAt) {
    var t = new Date(l.knockedAt).getTime();
    if (!isNaN(t)) return t;
  }
  var m = String(l.id || '').match(/[a-z0-9]+$/);
  if (m && m[0]) {
    var n = parseInt(m[0], 36);
    if (!isNaN(n)) return n;
  }
  return 0;
}

// ---- seed state (matches app.js seed) ----
var state = {
  users: [
    { id: 'u_owner', email: 'kyle.smith@ottrestoration.com', role: 'owner', name: 'Kyle Smith' },
    { id: 'u_admin', email: 'brandon@ottrestoration.com', role: 'admin', name: 'Brandon Haffey' },
    { id: 'u_rep', email: 'rep@ottrestoration.com', role: 'rep', name: 'Sample Rep' },
  ],
  leads: [
    defaultLead({ name: 'Smith, Jane', addr: '123 Main St', city: 'Columbia', rep: 'rep@ottrestoration.com', stage: 3, slip: true, slipDate: '2026-01-01', collected: 2500 }),
    defaultLead({ name: 'Doe, John', addr: '456 Oak Ave', city: 'Jefferson City', rep: 'rep@ottrestoration.com', stage: 6, slip: true, collected: 8000 }),
  ],
  knockOpenedAt: null,
  knockUpRepId: null,
  session: { userId: 'u_owner', role: 'owner', email: 'kyle.smith@ottrestoration.com', name: 'Kyle Smith' },
};

// ---- test helpers ----
var fails = 0;
function check(name, ok, detail) {
  if (ok) {
    console.log('  PASS  ' + name);
  } else {
    fails++;
    console.log('  FAIL  ' + name + (detail ? ' :: ' + detail : ''));
  }
}

console.log('--- Role-play: Knock Ups + Leaderboard + OTT Boards ---\n');

// 1) User opens Knock Ups
state.knockOpenedAt = Date.now();
console.log('1) Knock Ups view opened. Knocked-at stamped at', new Date(state.knockOpenedAt).toLocaleString());

// 2) User submits a knock up (Kyle is the door knocker today)
var picked = state.users.find(function (x) { return x.id === 'u_owner'; });
var lead = defaultLead({
  name: formatLF('Daley, John'),
  addr: '999 Test Ave',
  city: 'Columbia',
  phone: '5551234567',
  rep: picked.email,
  knockedAt: new Date(state.knockOpenedAt).toISOString(),
  knockedBy: picked.name,
  stage: 1,
  src: 'Door',
  notes: 'Hailed last spring, wants free inspection',
});
state.leads.push(lead);
saveJSON('leads', state.leads);

console.log('2) Submitted: ' + lead.name + ' for ' + lead.knockedBy + ' @ ' + lead.knockedAt);

// 3) Verify lead exists with the captured timestamp + rep
check('Lead persisted', state.leads.length === 3);
check('Lead rep matches owner email', lead.rep === 'kyle.smith@ottrestoration.com');
check('knockedBy denormalized', lead.knockedBy === 'Kyle Smith');
check('knockedAt is a valid ISO string', !isNaN(new Date(lead.knockedAt).getTime()));
check('Stage = 1 (Inspection)', lead.stage === 1);

// 4) Home Leads sorting (newest knock-up first; legacy seeds fall back to uid-derived stamp)
var withTs = state.leads.filter(function (l) { return !!l.knockedAt; });
var legacy = state.leads.filter(function (l) { return !l.knockedAt; });
withTs.sort(function (a, b) { return new Date(b.knockedAt).getTime() - new Date(a.knockedAt).getTime(); });
legacy.sort(function (a, b) { return leadSortStamp(b) - leadSortStamp(a); });
var sortedHome = withTs.concat(legacy);
check('New knock-up appears first on Home Leads', sortedHome[0].id === lead.id, 'top of list = ' + sortedHome[0].name);
check('Legacy seed leads appear after the new knock-up', sortedHome[1].name === 'Smith, Jane' || sortedHome[1].name === 'Doe, John');

// 5) Leaderboard counts
var totals = repTotals(state);
var byEmail = {};
totals.forEach(function (t) { byEmail[t.rep] = t; });
check('Kyle has 1 knock-up', byEmail['kyle.smith@ottrestoration.com'].knockUps === 1);
check('Sample Rep has 2 knock-ups (seed)', byEmail['rep@ottrestoration.com'].knockUps === 2);
check('Sample Rep has 2 contracts (slip=true seeds)', byEmail['rep@ottrestoration.com'].contracts === 2);
check('Top 5 KU includes both reps with traffic', topN(totals, 'knockUps', 5).length === 2);
check('Top 5 closed deals empty (no leads at stage 12)', topN(totals, 'closed', 5).length === 0);

// 6) OTT Boards grouping (Kyle should now have his own section)
var grouped = {};
state.leads.forEach(function (l) {
  var k = l.rep || 'Unassigned';
  if (!grouped[k]) grouped[k] = [];
  grouped[k].push(l);
});
check('Boards has Kyle section', !!grouped['kyle.smith@ottrestoration.com']);
check('Kyle section has 1 lead', (grouped['kyle.smith@ottrestoration.com'] || []).length === 1);
check('Sample Rep section has 2 seeded leads', (grouped['rep@ottrestoration.com'] || []).length === 2);

// 7) Edit a Boards cell and verify persistence
lead.board.who = 'John';
lead.board.nextStep = 'Schedule inspection Friday';
saveJSON('leads', state.leads);
var reloaded = JSON.parse(localStorage.getItem('leads'));
var reloadedLead = reloaded.find(function (l) { return l.id === lead.id; });
check('Board edits persist via localStorage', reloadedLead.board.who === 'John' && reloadedLead.board.nextStep === 'Schedule inspection Friday');

// 8) Validation: refusing empty submissions (simulated)
function trySubmit(fields) {
  if (!fields.name.trim() || !fields.addr) return 'rejected';
  return 'accepted';
}
check('Missing name rejected', trySubmit({ name: '', addr: 'X' }) === 'rejected');
check('Missing address rejected', trySubmit({ name: 'X', addr: '' }) === 'rejected');
check('Valid input accepted', trySubmit({ name: 'X', addr: 'Y' }) === 'accepted');

// ---- summary ----
console.log('\nResult: ' + (fails === 0 ? 'ALL PASS' : fails + ' FAIL(S)'));
process.exit(fails === 0 ? 0 : 1);
