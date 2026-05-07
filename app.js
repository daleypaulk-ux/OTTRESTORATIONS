/**
 * T.O.P. CRM — app.js
 * Vanilla JS, localStorage MVP. No build step.
 */
(function () {
  'use strict';

  var STORAGE_PREFIX = 'top_crm_v1_';
  var SESSION_MS = 30 * 24 * 60 * 60 * 1000;

  var KEYS = {
    meta: STORAGE_PREFIX + 'meta',
    users: STORAGE_PREFIX + 'users',
    leads: STORAGE_PREFIX + 'leads',
    session: STORAGE_PREFIX + 'session',
    chat: STORAGE_PREFIX + 'chat',
    pings: STORAGE_PREFIX + 'map_pings',
    appts: STORAGE_PREFIX + 'appointments',
    todos: STORAGE_PREFIX + 'todos',
    automations: STORAGE_PREFIX + 'automations',
    settings: STORAGE_PREFIX + 'settings',
    subs: STORAGE_PREFIX + 'subs',
    pay: STORAGE_PREFIX + 'pay',
    webhookLog: STORAGE_PREFIX + 'webhook_log',
  };

  var JOTFORMS = {
    appointmentSetter: { id: '241012768600044', title: 'Appointment Setter' },
    insuranceSlip: { id: '261253921838158', title: 'Insurance Contingency Slip' },
    certificateSat: { id: '240464564564057', title: 'Certificate of Satisfaction' },
    ottAgreement: { id: '240518847148059', title: 'OTT Agreement' },
    orderForm: { id: '240461189597063', title: 'Order Form' },
    contractAssist: { id: '252351816600046', title: 'Contract Assistance & Material Qty' },
    statTracker: { id: '250366797727068', title: 'Stat Tracker' },
    employment: { id: '250905826404052', title: 'Employment Agreement' },
  };

  var STAGE_LABELS = [
    'Inspection',
    'Insurance slip signed',
    'Adjuster meeting',
    'Pick shingles',
    'Upload scope',
    'MO / Contract',
    'Approve → supplier',
    'WO / Install',
    'Cert / walkaround',
    'Invoice + review req',
    'Collect payment',
    'PIF',
  ];

  // Inline SVG icon set (stroke-based, currentColor) — avoids broken emoji escapes
  // and keeps the menu legible across all platforms.
  var SVG = (function () {
    function s(path) {
      return (
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
        'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        path +
        '</svg>'
      );
    }
    return {
      home: s('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
      calendar: s('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>'),
      shield: s('<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>'),
      users: s('<path d="M16 11a4 4 0 10-8 0 4 4 0 008 0z"/><path d="M2 21c0-3.3 4-6 10-6s10 2.7 10 6"/>'),
      house: s('<path d="M3 12l9-9 9 9"/><path d="M5 11v9h14v-9"/><path d="M10 20v-5h4v5"/>'),
      grid: s('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
      chat: s('<path d="M21 12a8 8 0 11-3.5-6.6L21 5l-1 4a8 8 0 011 3z"/><path d="M8 11h8M8 14h5"/>'),
      map: s('<path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>'),
      hammer: s('<path d="M14 4l6 6-2 2-6-6 2-2z"/><path d="M11 7L4 14a2 2 0 102.8 2.8L14 10"/>'),
      sparkle: s('<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'),
      gear: s('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.5l1.6 1-2 3.5-1.9-.4a7.6 7.6 0 01-2 1.2L14.5 22h-5l-.6-2.2a7.6 7.6 0 01-2-1.2l-1.9.4-2-3.5 1.6-1a7.6 7.6 0 010-2.4L3 11l2-3.5 1.9.4a7.6 7.6 0 012-1.2L9.5 4.5h5l.6 2.2c.7.3 1.4.7 2 1.2l1.9-.4 2 3.5-1.6 1a7.6 7.6 0 010 2.5z"/>'),
      hardhat: s('<path d="M3 18h18v2H3z"/><path d="M5 18a7 7 0 0114 0"/><path d="M9 6h6v8H9z"/>'),
      doc: s('<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h6"/>'),
      cash: s('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v6M18 9v6"/>'),
      shirt: s('<path d="M4 7l4-3 4 2 4-2 4 3-3 3v10H7V10L4 7z"/>'),
      lock: s('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
    };
  })();

  var NAV_ITEMS = [
    { key: 'home', label: 'Home', icon: SVG.home },
    { key: 'appointments', label: 'Appointment Setter', icon: SVG.calendar },
    { key: 'slip', label: 'Insurance Permission Slip', icon: SVG.shield },
    { key: 'customers', label: 'Customers', icon: SVG.users },
    { key: 'portal', label: 'Homeowner Portal', icon: SVG.house },
    { key: 'boards', label: 'Boards', icon: SVG.grid },
    { key: 'chat', label: 'Team Chat', icon: SVG.chat },
    { key: 'map', label: 'Door Knock Map', icon: SVG.map },
    { key: 'jobs', label: 'Jobs & Orders', icon: SVG.hammer },
    { key: 'ai', label: 'AI Analyzer', icon: SVG.sparkle },
    { key: 'automations', label: 'Automations', icon: SVG.gear },
    { key: 'subs', label: 'Subcontractor Portal', icon: SVG.hardhat },
    { key: 'invoices', label: 'Invoicing', icon: SVG.doc },
    { key: 'pay', label: 'Rep Pay', icon: SVG.cash },
    { key: 'swag', label: 'Swag / Orders', icon: SVG.shirt },
    { key: 'settings', label: 'Settings', icon: SVG.gear },
    { key: 'admin', label: 'Admin', icon: SVG.lock },
  ];

  var CHAT_CHANNELS = [
    { id: 'posi', label: 'Posi-chat' },
    { id: 'wo', label: 'WO chat' },
    { id: 'mo', label: 'MO chat' },
    { id: 'invoice', label: 'Invoice Req chat' },
  ];

  var state = {
    users: [],
    leads: [],
    session: null,
    chat: {},
    pings: [],
    appts: [],
    todos: [],
    automations: {},
    settings: {},
    subs: [],
    payReports: [],
    currentLeadId: null,
    activeChatChannel: 'posi',
    map: null,
    mapMarkers: [],
    nightlyTimer: null,
    portalPreviewId: null,
  };

  function uid() {
    return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function loadJSON(key, fallback) {
    try {
      var s = localStorage.getItem(key);
      return s ? JSON.parse(s) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function migrate() {
    var meta = loadJSON(KEYS.meta, { v: 1 });
    if (!meta.v) meta.v = 1;
    saveJSON(KEYS.meta, meta);
  }

  function defaultLead(overrides) {
    var o = overrides || {};
    return {
      id: o.id || uid(),
      po: o.po || '',
      name: o.name || '',
      phone: o.phone || '',
      email: o.email || '',
      addr: o.addr || '',
      city: o.city || '',
      state: o.state || 'MO',
      src: o.src || 'Door',
      rep: o.rep || '',
      ins: o.ins || '',
      pol: o.pol || '',
      clm: o.clm || '',
      adj: o.adj || '',
      adjph: o.adjph || '',
      loss: o.loss || '',
      adjDate: o.adjDate || '',
      approvalDate: o.approvalDate || '',
      deliveryDate: o.deliveryDate || '',
      workDate: o.workDate || '',
      completionDate: o.completionDate || '',
      acv: Number(o.acv) || 0,
      dep: Number(o.dep) || 0,
      stage: Number(o.stage) || 1,
      slip: !!o.slip,
      slipDate: o.slipDate || '',
      subName: o.subName || '',
      subPhone: o.subPhone || '',
      subEmail: o.subEmail || '',
      woNotes: o.woNotes || '',
      materialOrder: o.materialOrder || { items: [] },
      legalVerbiage: o.legalVerbiage || '',
      contractUploaded: !!o.contractUploaded,
      contractName: o.contractName || '',
      complete: !!o.complete,
      invoice: Number(o.invoice) || 0,
      collected: Number(o.collected) || 0,
      completionSig: o.completionSig || '',
      denied: !!o.denied,
      notes: o.notes || '',
      photos: o.photos || [],
      docs: o.docs || [],
      timeline: o.timeline || [],
      ku: Number(o.ku) || 0,
      ci: Number(o.ci) || 0,
      slipsSigned: Number(o.slipsSigned) || 0,
      portalToken: o.portalToken || uid(),
      buildingCodes: o.buildingCodes || '',
      moDraft: o.moDraft || null,
      moApproved: !!o.moApproved,
    };
  }

  function seedUsers() {
    return [
      {
        id: 'u_owner',
        email: 'kyle.smith@ottrestoration.com',
        pass: 'Delayne.10',
        role: 'owner',
        name: 'Kyle Smith',
        office: 'Columbia',
        title: 'Owner',
        photo: '',
        banned: false,
        onboardingDone: true,
      },
      {
        id: 'u_admin',
        email: 'brandon@ottrestoration.com',
        pass: 'admin123',
        role: 'admin',
        name: 'Brandon Haffey',
        office: 'Columbia',
        title: 'Administrator',
        photo: '',
        banned: false,
        onboardingDone: true,
      },
      {
        id: 'u_rep',
        email: 'rep@ottrestoration.com',
        pass: 'rep123',
        role: 'rep',
        name: 'Sample Rep',
        office: 'Columbia',
        title: 'Sales Rep',
        photo: '',
        banned: false,
        onboardingDone: true,
      },
    ];
  }

  function fixBrandonEmail(users) {
    users.forEach(function (u) {
      if (u.email === 'brandon@ottrestation.com') u.email = 'brandon@ottrestoration.com';
    });
    return users;
  }

  function seedLeads(repEmail) {
    var r = repEmail || 'rep@ottrestoration.com';
    return [
      defaultLead({
        name: 'Smith, Jane',
        addr: '123 Main St',
        city: 'Columbia',
        phone: '5735550100',
        email: 'jane@example.com',
        rep: r,
        stage: 3,
        slip: true,
        slipDate: new Date().toISOString(),
        collected: 2500,
        acv: 12000,
        ku: 4,
        ci: 2,
        slipsSigned: 1,
      }),
      defaultLead({
        name: 'Doe, John',
        addr: '456 Oak Ave',
        city: 'Jefferson City',
        phone: '5735550200',
        email: 'john@example.com',
        rep: r,
        stage: 6,
        slip: true,
        collected: 8000,
        acv: 22000,
        ku: 6,
        ci: 3,
        slipsSigned: 1,
      }),
    ];
  }

  function initData() {
    migrate();
    var users = loadJSON(KEYS.users, null);
    if (!users || !users.length) {
      users = seedUsers();
      saveJSON(KEYS.users, users);
    } else {
      users = fixBrandonEmail(users);
      saveJSON(KEYS.users, users);
    }

    var leads = loadJSON(KEYS.leads, null);
    if (!leads || !leads.length) {
      leads = seedLeads();
      saveJSON(KEYS.leads, leads);
    }

    state.users = users;
    state.leads = leads;
    state.chat = loadJSON(KEYS.chat, {});
    CHAT_CHANNELS.forEach(function (ch) {
      if (!state.chat[ch.id]) state.chat[ch.id] = [];
    });
    state.pings = loadJSON(KEYS.pings, []);
    state.appts = loadJSON(KEYS.appts, []);
    state.todos = loadJSON(KEYS.todos, []);
    state.automations = loadJSON(KEYS.automations, {
      adjusterReminder: true,
      missedAppt: true,
      reviewAfterComplete: true,
      invoiceRemind: true,
    });
    state.settings = loadJSON(KEYS.settings, {
      ownerEmail: 'kyle.smith@ottrestoration.com',
      pmEmail: 'brandon@ottrestoration.com',
      googleMapsKey: '',
      hailtraceKey: '',
      anthropicKey: '',
      webhookSecret: '',
      hearthsBanner:
        '<a href="https://app.gethearth.com/partners/over-the-top-restoration?utm_campaign=52809&utm_content=white&utm_medium=contractor-website&utm_source=contractor&utm_term=700x110" target="_blank" rel="noopener"><img src="https://app.gethearth.com/contractor_images/over-the-top-restoration/banner.jpg?color=white&size_id=700x110" alt="Hearth financing" style="height:110px;width:100%;max-width:700px"/></a>',
      reviewUrl: 'https://g.page/r/CUaKMuxbsOhMEAI/review',
      lat: 38.9517,
      lon: -92.3341,
    });
    state.subs = loadJSON(KEYS.subs, []);
    state.payReports = loadJSON(KEYS.pay, []);
  }

  function persistLeads() {
    saveJSON(KEYS.leads, state.leads);
  }
  function persistUsers() {
    saveJSON(KEYS.users, state.users);
  }
  function persistChat() {
    saveJSON(KEYS.chat, state.chat);
  }
  function persistPings() {
    saveJSON(KEYS.pings, state.pings);
  }
  function persistAppts() {
    saveJSON(KEYS.appts, state.appts);
  }
  function persistTodos() {
    saveJSON(KEYS.todos, state.todos);
  }
  function persistAutomations() {
    saveJSON(KEYS.automations, state.automations);
  }
  function persistSettings() {
    saveJSON(KEYS.settings, state.settings);
  }
  function persistSubs() {
    saveJSON(KEYS.subs, state.subs);
  }
  function persistPay() {
    saveJSON(KEYS.pay, state.payReports);
  }

  function parsePortalHash() {
    var m = location.hash.match(/portal=([^&]+)/);
    if (!m) return;
    var token = decodeURIComponent(m[1]);
    var lead = state.leads.find(function (l) {
      return l.portalToken === token;
    });
    if (!lead) {
      toast('Invalid portal link');
      return;
    }
    state.session = {
      userId: 'portal_' + lead.id,
      role: 'homeowner',
      email: lead.email || 'homeowner',
      name: lead.name,
      leadId: lead.id,
      expires: Date.now() + SESSION_MS,
      remember: true,
    };
    saveJSON(KEYS.session, state.session);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    renderAll();
    topNav('portal');
  }

  function sessionValid(s) {
    return s && s.expires && Date.now() < s.expires;
  }

  function getUser() {
    if (!state.session) return null;
    if (state.session.role === 'homeowner') return { role: 'homeowner', name: state.session.name, leadId: state.session.leadId };
    return state.users.find(function (u) {
      return u.id === state.session.userId;
    });
  }

  function canSeeLead(lead) {
    var u = getUser();
    if (!u) return false;
    if (u.role === 'owner' || u.role === 'admin') return true;
    if (u.role === 'rep') return lead.rep === u.email;
    if (u.role === 'homeowner') return lead.id === u.leadId;
    return false;
  }

  function filterLeads() {
    return state.leads.filter(canSeeLead);
  }

  window.doLogin = function () {
    var email = (document.getElementById('login-email').value || '').trim().toLowerCase();
    var pass = document.getElementById('login-pass').value || '';
    var remember = document.getElementById('login-remember').checked;
    var err = document.getElementById('login-error');
    err.classList.add('hidden');

    var user = state.users.find(function (u) {
      return u.email.toLowerCase() === email && u.pass === pass;
    });
    if (!user) {
      err.textContent = 'Invalid email or password.';
      err.classList.remove('hidden');
      return;
    }
    if (user.banned) {
      err.textContent = 'Account suspended.';
      err.classList.remove('hidden');
      return;
    }

    state.session = {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      expires: Date.now() + (remember ? SESSION_MS : 24 * 60 * 60 * 1000),
      remember: remember,
    };
    saveJSON(KEYS.session, state.session);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    renderAll();
    topNav('home');
    toast('Welcome, ' + user.name);
  };

  window.doLogout = function () {
    state.session = null;
    localStorage.removeItem(KEYS.session);
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    toggleSmenu(false);
  };

  window.topNav = function (v) {
    document.querySelectorAll('.cv').forEach(function (el) {
      el.classList.remove('on');
    });
    var target = document.getElementById('cv-' + v);
    if (target) target.classList.add('on');
    document.querySelectorAll('.smenu-list li').forEach(function (li) {
      li.classList.toggle('active', li.dataset.nav === v);
    });
    document.querySelectorAll('.bottom-nav button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.bnav === v);
    });
    toggleSmenu(false);
    onViewShow(v);
  };

  function onViewShow(v) {
    if (v === 'map') initMapLazy();
    if (v === 'customer' && state.currentLeadId) renderCustomerDetail(state.currentLeadId);
    if (v === 'portal') renderHomeownerPortal();
    if (v === 'boards') renderBoards();
    if (v === 'chat') renderChat();
    if (v === 'automations') renderAutomations();
    if (v === 'subs') renderSubs();
    if (v === 'invoices') renderInvoices();
    if (v === 'pay') renderPay();
    if (v === 'settings') renderSettings();
    if (v === 'admin') renderAdmin();
    if (v === 'jobs') renderJobs();
    if (v === 'customers') {
      var cs = document.getElementById('customers-search');
      renderCustomersTable(cs ? cs.value : '');
      wireCustomersSearch();
    }
    if (v === 'appointments') {
      ensureAppointmentPage();
      autoOpenJotForm('appointmentSetter');
    }
    if (v === 'slip') autoOpenJotForm('insuranceSlip');
    if (v === 'swag') autoOpenJotForm('orderForm');
    if (v === 'home') renderHomeAppointments();
  }

  // Open a JotForm modal once per navigation. Skips if the modal is already
  // open so rapid tab-switching doesn't re-trigger the iframe load.
  function autoOpenJotForm(key) {
    var modal = document.getElementById('jotform-modal');
    if (modal && modal.classList.contains('on')) return;
    setTimeout(function () { window.openJotForm(key); }, 50);
  }

  window.toggleSmenu = function (open) {
    var menu = document.getElementById('smenu');
    var scrim = document.getElementById('scrim');
    var on = open === undefined ? !menu.classList.contains('on') : !!open;
    menu.classList.toggle('on', on);
    scrim.classList.toggle('on', on);
  };

  function renderSmenu() {
    var ul = document.getElementById('smenu-list');
    var u = getUser();
    ul.innerHTML = '';
    if (u && u.role === 'homeowner') {
      var li = document.createElement('li');
      li.dataset.nav = 'portal';
      li.innerHTML = '<span class="ico">' + SVG.house + '</span><span>Homeowner Portal</span>';
      li.onclick = function () {
        topNav('portal');
      };
      ul.appendChild(li);
      return;
    }
    NAV_ITEMS.forEach(function (item) {
      if (item.key === 'admin' && u && u.role !== 'owner' && u.role !== 'admin') return;
      var li = document.createElement('li');
      li.dataset.nav = item.key;
      li.innerHTML = '<span class="ico">' + item.icon + '</span><span>' + esc(item.label) + '</span>';
      li.onclick = function () {
        topNav(item.key);
      };
      ul.appendChild(li);
    });
  }

  function renderHeader() {
    var u = getUser();
    if (!u) return;
    var name = u.name || u.email || 'User';
    document.getElementById('user-name').textContent = name;
    var av = document.getElementById('user-avatar');
    if (u.photo) {
      av.innerHTML = '<img src="' + escAttr(u.photo) + '" alt=""/>';
    } else {
      av.textContent = (name || '?').charAt(0).toUpperCase();
    }
    var hg = document.getElementById('home-greeting');
    if (hg) hg.textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }
  function escAttr(s) {
    return String(s == null ? '' : s).replace(/"/g, '&quot;');
  }

  window.openProfile = function () {
    topNav('settings');
  };

  window.openNotifications = function () {
    var pm = state.settings.pmEmail || '';
    var mail =
      'mailto:' +
      pm +
      '?subject=' +
      encodeURIComponent('T.O.P. notification') +
      '&body=' +
      encodeURIComponent('—');
    var body =
      '<p>Quick actions (MVP uses native links):</p>' +
      '<p><a class="btn btn-primary btn-block" href="' +
      escAttr(mail) +
      '">Email PM</a></p>' +
      '<p class="muted small">PM email: ' +
      esc(pm || '(set in code defaults)') +
      '</p>';
    openModal('Notifications', body);
  };

  function toast(msg) {
    var w = document.getElementById('toast-wrap');
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    w.appendChild(t);
    setTimeout(function () {
      t.remove();
    }, 2800);
  }

  window.openModal = function (title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').classList.add('on');
  };

  window.closeModal = function () {
    document.getElementById('modal').classList.remove('on');
  };

  initData();
  state.session = loadJSON(KEYS.session, null);

  if (location.hash.indexOf('portal=') !== -1) {
    parsePortalHash();
  } else if (sessionValid(state.session)) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    renderAll();
  }

  function renderAll() {
    renderSmenu();
    renderHeader();
    renderHomeWidgets();
    renderApptQuick();
    renderApptPageForm();
    renderCustomersTable();
    renderLeaderboard();
    renderTeamTotals();
    scheduleNightlyChatRollup();
    wireSearch();
    wireCustomersSearch();
    checkMissedAppointments();
  }

  function formatLF(name) {
    if (!name) return '';
    name = String(name).trim();
    if (name.indexOf(',') !== -1) return name;
    var parts = name.split(/\s+/);
    if (parts.length < 2) return name;
    var first = parts[0];
    var last = parts.slice(1).join(' ');
    return last + ', ' + first;
  }

  function money(n) {
    n = Number(n) || 0;
    return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  }

  function addTimeline(lead, text) {
    lead.timeline = lead.timeline || [];
    lead.timeline.unshift({ ts: new Date().toISOString(), text: text });
    persistLeads();
  }

  function getLeadById(id) {
    return state.leads.find(function (l) {
      return l.id === id;
    });
  }

  function renderHomeWidgets() {
    fetchWeather();
    renderTodo();
    renderHomeAppointments();
  }

  // Appointments visible to the logged-in rep (or all for owner/admin).
  function appointmentsForCurrentUser() {
    var u = getUser();
    if (!u || u.role === 'homeowner') return [];
    var email = u.email || '';
    if (u.role === 'owner' || u.role === 'admin') return state.appts.slice();
    return state.appts.filter(function (a) {
      return a.rep === email;
    });
  }

  function renderHomeAppointments() {
    var host = document.getElementById('home-appts');
    if (!host) return;
    var u = getUser();
    if (!u || u.role === 'homeowner') {
      host.innerHTML = '';
      return;
    }
    var startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    var rows = appointmentsForCurrentUser()
      .filter(function (a) {
        return !a.completed;
      })
      .filter(function (a) {
        return new Date(a.when).getTime() >= startOfToday.getTime();
      })
      .sort(function (a, b) {
        return new Date(a.when) - new Date(b.when);
      })
      .slice(0, 25);
    if (!rows.length) {
      host.innerHTML =
        '<p class="muted" style="margin:0">No appointments scheduled from today forward. Save one from Quick Set or Appointment Setter.</p>';
      return;
    }
    host.innerHTML =
      '<table class="tbl"><thead><tr><th>When</th><th>Customer</th><th>Address</th></tr></thead><tbody>' +
      rows
        .map(function (a) {
          return (
            '<tr><td>' +
            esc(new Date(a.when).toLocaleString()) +
            '</td><td>' +
            esc(a.name) +
            '</td><td>' +
            esc(a.addr) +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table>';
  }

  /* ------------------------------------------------------------
     Weather: current conditions + Top 10 roof-risk areas (300 mi)
     ------------------------------------------------------------ */

  // Curated regional metro catalog (kept compact; covers OTT's likely operating
  // radius from Columbia, MO and supports any user-chosen center). Each entry:
  // { name: "City, ST", lat, lon }.
  var CITY_CATALOG = [
    // Missouri & immediate neighbors
    { n: 'Columbia, MO', a: 38.9517, o: -92.3341 },
    { n: 'Jefferson City, MO', a: 38.5767, o: -92.1735 },
    { n: 'Kansas City, MO', a: 39.0997, o: -94.5786 },
    { n: 'St. Louis, MO', a: 38.627, o: -90.1994 },
    { n: 'Springfield, MO', a: 37.2089, o: -93.2923 },
    { n: 'Joplin, MO', a: 37.0842, o: -94.5133 },
    { n: 'St. Joseph, MO', a: 39.7675, o: -94.8467 },
    { n: 'Cape Girardeau, MO', a: 37.3059, o: -89.5181 },
    { n: 'Branson, MO', a: 36.6437, o: -93.2185 },
    { n: 'Lake Ozark, MO', a: 38.197, o: -92.6371 },
    { n: 'Sedalia, MO', a: 38.7045, o: -93.2283 },
    { n: 'Hannibal, MO', a: 39.7084, o: -91.3585 },
    // Illinois
    { n: 'Springfield, IL', a: 39.7817, o: -89.6501 },
    { n: 'Peoria, IL', a: 40.6936, o: -89.589 },
    { n: 'Bloomington, IL', a: 40.4842, o: -88.9937 },
    { n: 'Champaign, IL', a: 40.1164, o: -88.2434 },
    { n: 'Chicago, IL', a: 41.8781, o: -87.6298 },
    { n: 'Rockford, IL', a: 42.2711, o: -89.0937 },
    { n: 'Decatur, IL', a: 39.8403, o: -88.9548 },
    { n: 'Quincy, IL', a: 39.9356, o: -91.4099 },
    // Iowa
    { n: 'Des Moines, IA', a: 41.5868, o: -93.625 },
    { n: 'Cedar Rapids, IA', a: 41.9779, o: -91.6656 },
    { n: 'Davenport, IA', a: 41.5236, o: -90.5776 },
    { n: 'Iowa City, IA', a: 41.6611, o: -91.5302 },
    { n: 'Council Bluffs, IA', a: 41.2619, o: -95.8608 },
    { n: 'Sioux City, IA', a: 42.4999, o: -96.4003 },
    { n: 'Waterloo, IA', a: 42.4928, o: -92.3426 },
    // Kansas
    { n: 'Topeka, KS', a: 39.0473, o: -95.6752 },
    { n: 'Wichita, KS', a: 37.6872, o: -97.3301 },
    { n: 'Overland Park, KS', a: 38.9822, o: -94.6708 },
    { n: 'Lawrence, KS', a: 38.9717, o: -95.2353 },
    { n: 'Manhattan, KS', a: 39.1836, o: -96.5717 },
    // Nebraska
    { n: 'Omaha, NE', a: 41.2565, o: -95.9345 },
    { n: 'Lincoln, NE', a: 40.8136, o: -96.7026 },
    { n: 'Grand Island, NE', a: 40.9264, o: -98.342 },
    // Arkansas
    { n: 'Little Rock, AR', a: 34.7465, o: -92.2896 },
    { n: 'Fayetteville, AR', a: 36.0822, o: -94.1719 },
    { n: 'Fort Smith, AR', a: 35.3859, o: -94.3985 },
    { n: 'Jonesboro, AR', a: 35.8423, o: -90.7043 },
    // Oklahoma
    { n: 'Oklahoma City, OK', a: 35.4676, o: -97.5164 },
    { n: 'Tulsa, OK', a: 36.154, o: -95.9928 },
    // Tennessee / Kentucky
    { n: 'Memphis, TN', a: 35.1495, o: -90.049 },
    { n: 'Nashville, TN', a: 36.1627, o: -86.7816 },
    { n: 'Louisville, KY', a: 38.2527, o: -85.7585 },
    { n: 'Lexington, KY', a: 38.0406, o: -84.5037 },
    // Indiana / Ohio
    { n: 'Indianapolis, IN', a: 39.7684, o: -86.1581 },
    { n: 'Evansville, IN', a: 37.9716, o: -87.5711 },
    { n: 'Cincinnati, OH', a: 39.1031, o: -84.512 },
    { n: 'Columbus, OH', a: 39.9612, o: -82.9988 },
    // Wisconsin / Minnesota
    { n: 'Madison, WI', a: 43.0731, o: -89.4012 },
    { n: 'Milwaukee, WI', a: 43.0389, o: -87.9065 },
    { n: 'Minneapolis, MN', a: 44.9778, o: -93.265 },
    { n: 'Rochester, MN', a: 44.0121, o: -92.4802 },
    // Texas (north/east only)
    { n: 'Dallas, TX', a: 32.7767, o: -96.797 },
    { n: 'Fort Worth, TX', a: 32.7555, o: -97.3308 },
    { n: 'Tulsa Suburbs, OK', a: 36.06, o: -95.79 },
    // South Dakota
    { n: 'Sioux Falls, SD', a: 43.5446, o: -96.7311 },
  ];

  function loadWeatherCenter() {
    var saved = loadJSON(STORAGE_PREFIX + 'weather_center', null);
    if (saved && typeof saved.lat === 'number' && typeof saved.lon === 'number') {
      return saved;
    }
    return { lat: state.settings.lat, lon: state.settings.lon, label: 'Columbia, MO (default)' };
  }
  function saveWeatherCenter(c) {
    saveJSON(STORAGE_PREFIX + 'weather_center', c);
  }

  function haversineMiles(lat1, lon1, lat2, lon2) {
    var R = 3958.8;
    var toRad = Math.PI / 180;
    var dLat = (lat2 - lat1) * toRad;
    var dLon = (lon2 - lon1) * toRad;
    var s1 = Math.sin(dLat / 2);
    var s2 = Math.sin(dLon / 2);
    var a = s1 * s1 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * s2 * s2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  function fetchWeather() {
    var center = loadWeatherCenter();
    renderWeatherCenterLine(center);
    fetchCurrentConditions(center);
    fetchVulnerableAreas(center);
  }

  function renderWeatherCenterLine(center) {
    var el = document.getElementById('weather-center');
    if (!el) return;
    el.textContent = 'Based near: ' + (center.label || (center.lat.toFixed(2) + ', ' + center.lon.toFixed(2)));
  }

  function fetchCurrentConditions(center) {
    var el = document.getElementById('weather-summary');
    if (!el) return;
    el.innerHTML = '<div class="skeleton" style="width:60%"></div><div class="skeleton" style="width:40%"></div>';
    var url =
      'https://api.open-meteo.com/v1/forecast?latitude=' +
      center.lat +
      '&longitude=' +
      center.lon +
      '&current=temperature_2m,precipitation_probability,wind_speed_10m' +
      '&hourly=precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph';
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var t = d.current && d.current.temperature_2m;
        var pr = (d.hourly && d.hourly.precipitation_probability) || [];
        var nextMax = pr.length ? Math.max.apply(null, pr.slice(0, 12)) : null;
        el.innerHTML =
          '<div class="weather-summary">' +
          '<span class="temp">' + Math.round(t) + '\u00B0F</span>' +
          '<span class="temp-sub">local estimate</span>' +
          '</div>' +
          (nextMax !== null
            ? '<div class="weather-rain">Next hours max rain chance: ' + nextMax + '%</div>'
            : '');
      })
      .catch(function () {
        el.textContent = 'Weather unavailable (offline or blocked).';
      });
  }

  function vulnerabilityScore(forecast) {
    // Score 0–100. Weighted blend of short-horizon precipitation probability,
    // wind gusts, and a small bump for total precipitation. Tuned for readability.
    var hourly = forecast.hourly || {};
    var pp = hourly.precipitation_probability || [];
    var gust = hourly.wind_gusts_10m || [];
    var precip = hourly.precipitation || [];
    var horizon = Math.min(48, pp.length, gust.length || 48);
    if (!horizon) return { score: 0, reason: 'No forecast data' };

    var maxRain = 0, maxGust = 0, totalPrecip = 0;
    for (var i = 0; i < horizon; i++) {
      if (pp[i] != null && pp[i] > maxRain) maxRain = pp[i];
      if (gust[i] != null && gust[i] > maxGust) maxGust = gust[i];
      if (precip[i] != null) totalPrecip += precip[i];
    }
    var rainComp = Math.min(100, maxRain) * 0.55;
    var gustComp = Math.min(100, (maxGust / 60) * 100) * 0.35;
    var precipComp = Math.min(100, totalPrecip * 12) * 0.10;
    var score = Math.round(rainComp + gustComp + precipComp);
    var bits = [];
    if (maxRain > 0) bits.push('rain ' + Math.round(maxRain) + '%');
    if (maxGust > 0) bits.push('gusts ' + Math.round(maxGust) + ' mph');
    return { score: score, reason: bits.join(', ') || 'mild conditions' };
  }

  function fetchOpenMeteoFor(lat, lon) {
    var url =
      'https://api.open-meteo.com/v1/forecast?latitude=' +
      lat +
      '&longitude=' +
      lon +
      '&hourly=precipitation_probability,wind_gusts_10m,precipitation' +
      '&forecast_days=2&temperature_unit=fahrenheit&wind_speed_unit=mph';
    return fetch(url).then(function (r) { return r.json(); });
  }

  function fetchVulnerableAreas(center) {
    var host = document.getElementById('weather-areas-body');
    if (!host) return;
    var candidates = CITY_CATALOG.map(function (c) {
      return { name: c.n, lat: c.a, lon: c.o, dist: haversineMiles(center.lat, center.lon, c.a, c.o) };
    }).filter(function (c) { return c.dist <= 300; });

    if (!candidates.length) {
      host.innerHTML = '<div class="muted small">No catalog cities within 300 miles of this center. Try a more central location.</div>';
      return;
    }

    candidates.sort(function (a, b) { return a.dist - b.dist; });
    var pool = candidates.slice(0, 24);

    host.innerHTML =
      '<div class="skeleton"></div>' +
      '<div class="skeleton" style="width:90%"></div>' +
      '<div class="skeleton" style="width:80%"></div>' +
      '<div class="skeleton" style="width:85%"></div>';

    runConcurrent(pool, 6, function (c) {
      return fetchOpenMeteoFor(c.lat, c.lon)
        .then(function (d) {
          var s = vulnerabilityScore(d);
          return { name: c.name, dist: c.dist, score: s.score, reason: s.reason };
        })
        .catch(function () {
          return { name: c.name, dist: c.dist, score: 0, reason: 'forecast unavailable' };
        });
    }).then(function (results) {
      results.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.dist - b.dist;
      });
      var top = results.slice(0, 10);
      if (!top.length) {
        host.innerHTML = '<div class="muted small">No data returned.</div>';
        return;
      }
      host.innerHTML =
        '<ol class="areas">' +
        top.map(function (r, idx) {
          return (
            '<li>' +
            '<span class="rank">' + (idx + 1) + '</span>' +
            '<div>' +
            '<div class="place">' + esc(r.name) + ' <span class="muted small">&middot; ' + Math.round(r.dist) + ' mi</span></div>' +
            '<div class="reason">' + esc(r.reason) + '</div>' +
            '</div>' +
            '<span class="score">' + r.score + '</span>' +
            '</li>'
          );
        }).join('') +
        '</ol>';
    });
  }

  function runConcurrent(items, limit, worker) {
    return new Promise(function (resolve) {
      var results = new Array(items.length);
      var i = 0, active = 0, done = 0;
      function next() {
        while (active < limit && i < items.length) {
          (function (idx) {
            active++;
            worker(items[idx]).then(function (r) {
              results[idx] = r;
              active--; done++;
              if (done === items.length) resolve(results);
              else next();
            });
          })(i++);
        }
        if (!items.length) resolve(results);
      }
      next();
    });
  }

  window.useMyWeatherLocation = function () {
    if (!navigator.geolocation) {
      toast('Geolocation not available in this browser.');
      return;
    }
    toast('Locating…');
    navigator.geolocation.getCurrentPosition(
      function (p) {
        var c = {
          lat: p.coords.latitude,
          lon: p.coords.longitude,
          label: 'My location',
        };
        // Reverse geocode for a friendlier label (best-effort, no key required).
        var revUrl =
          'https://geocoding-api.open-meteo.com/v1/reverse?latitude=' +
          c.lat + '&longitude=' + c.lon + '&count=1&language=en&format=json';
        fetch(revUrl)
          .then(function (r) { return r.json(); })
          .catch(function () { return null; })
          .then(function (data) {
            if (data && data.results && data.results[0]) {
              var r = data.results[0];
              c.label = r.name + (r.admin1 ? ', ' + r.admin1 : '');
            }
            saveWeatherCenter(c);
            fetchWeather();
            toast('Weather center updated');
          });
      },
      function () {
        toast('Location permission denied.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  };

  window.searchWeatherLocation = function () {
    var inp = document.getElementById('weather-search');
    if (!inp) return;
    var q = (inp.value || '').trim();
    if (!q) {
      toast('Type a city, ZIP, or address first.');
      return;
    }
    var url =
      'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(q) + '&count=1&language=en&format=json';
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.results || !data.results.length) {
          toast('No match for that location.');
          return;
        }
        var r = data.results[0];
        var c = {
          lat: r.latitude,
          lon: r.longitude,
          label: r.name + (r.admin1 ? ', ' + r.admin1 : '') + (r.country_code ? ', ' + r.country_code : ''),
        };
        saveWeatherCenter(c);
        inp.value = '';
        fetchWeather();
        toast('Weather center: ' + c.label);
      })
      .catch(function () {
        toast('Geocoding failed (network).');
      });
  };

  function renderApptQuick() {
    var host = document.getElementById('appt-quick');
    if (!host) return;
    host.innerHTML =
      '<div class="field"><label>Customer name</label><input id="qa-name" placeholder="Last, First or First Last"/></div>' +
      '<div class="grid-2">' +
      '<div class="field"><label>Address</label><input id="qa-addr"/></div>' +
      '<div class="field"><label>Phone</label><input id="qa-phone" type="tel"/></div>' +
      '</div>' +
      '<div class="grid-2">' +
      '<div class="field"><label>Date</label><input id="qa-date" type="date"/></div>' +
      '<div class="field"><label>Time</label><input id="qa-time" type="time"/></div>' +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-block" onclick="scheduleQuickAppt()">Check weather &amp; save</button>' +
      '<p class="muted small">Blocks scheduling when precipitation probability &gt; 70% at appointment hour (Open-Meteo).</p>';

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var ds = tomorrow.toISOString().slice(0, 10);
    var qaDate = document.getElementById('qa-date');
    if (qaDate) qaDate.value = ds;
  }

  // Read appointment fields from the given prefix (`qa` for Home quick form,
  // `ap` for the dedicated Appointment Setter page) and return a plain object.
  function collectApptFields(prefix) {
    function val(id) {
      var el = document.getElementById(id);
      return el ? (el.value || '').trim() : '';
    }
    return {
      name: val(prefix + '-name'),
      addr: val(prefix + '-addr'),
      phone: val(prefix + '-phone'),
      date: val(prefix + '-date'),
      time: val(prefix + '-time') || '09:00',
    };
  }

  function commitAppointmentRecord(f, rainPct, weatherOk) {
    var dt = new Date(f.date + 'T' + f.time + ':00');
    var u = getUser();
    state.appts.push({
      id: uid(),
      name: formatLF(f.name),
      addr: f.addr,
      phone: f.phone,
      when: dt.toISOString(),
      rep: u && u.email ? u.email : '',
      completed: false,
      missedNotified: false,
      rainPctSnapshot: typeof rainPct === 'number' ? rainPct : null,
      weatherOk: !!weatherOk,
    });
    persistAppts();
    renderBoards();
    renderHomeAppointments();
  }

  // Look up rain probability via Open-Meteo, then persist the appointment.
  // Shared by both quick (Home) and dedicated (Appointment Setter) saves.
  function persistAppointmentFromFields(f) {
    if (!f.name || !f.addr || !f.date) {
      toast('Name, address, and date are required.');
      return;
    }
    var lat = state.settings.lat;
    var lon = state.settings.lon;
    var dt = new Date(f.date + 'T' + f.time + ':00');
    var hourIdx = dt.getHours();
    var url =
      'https://api.open-meteo.com/v1/forecast?latitude=' +
      lat +
      '&longitude=' +
      lon +
      '&hourly=precipitation_probability&temperature_unit=fahrenheit';
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('weather http');
        return r.json();
      })
      .then(function (d) {
        var times = d.hourly && d.hourly.time;
        var probs = d.hourly && d.hourly.precipitation_probability;
        var rain = 0;
        if (times && probs) {
          for (var i = 0; i < times.length; i++) {
            if (times[i].indexOf(f.date) !== -1) {
              var hh = parseInt(times[i].slice(11, 13), 10);
              if (hh === hourIdx) {
                rain = probs[i] || 0;
                break;
              }
            }
          }
        }
        if (rain > 70) {
          toast('Rain chance ' + rain + '% — appointment blocked (>70%). Pick another time.');
          return;
        }
        commitAppointmentRecord(f, rain, true);
        toast('Appointment saved. Rain chance ~' + rain + '%.');
      })
      .catch(function () {
        commitAppointmentRecord(f, null, false);
        toast('Appointment saved. Weather check unavailable — review forecast manually.');
      });
  }

  window.scheduleQuickAppt = function () {
    persistAppointmentFromFields(collectApptFields('qa'));
  };

  function renderTodo() {
    var el = document.getElementById('todo-list');
    if (!el) return;
    var u = getUser();
    var email = u && u.email ? u.email : '';
    var mine = state.todos.filter(function (t) {
      return t.rep === email;
    });
    if (!mine.length) {
      el.innerHTML =
        '<div class="muted">No tasks — add below.</div>' +
        '<div class="field" style="margin-top:10px;"><input id="td-new" placeholder="New task…"/></div>' +
        '<button class="btn btn-sm" onclick="addTodo()">Add</button>';
      return;
    }
    el.innerHTML =
      mine
        .map(function (t) {
          return (
            '<div class="flex between" style="margin-bottom:6px;"><span>' +
            esc(t.text) +
            '</span><button class="btn btn-sm" onclick="completeTodo(\'' +
            escAttr(t.id) +
            "')\">Done</button></div>"
          );
        })
        .join('') +
      '<div class="field" style="margin-top:10px;"><input id="td-new" placeholder="New task…"/></div>' +
      '<button class="btn btn-sm" onclick="addTodo()">Add</button>';
  }

  window.addTodo = function () {
    var inp = document.getElementById('td-new');
    var text = inp && inp.value.trim();
    if (!text) return;
    var u = getUser();
    if (!u || !u.email) {
      toast('Tasks require an internal rep/admin session.');
      return;
    }
    state.todos.push({ id: uid(), text: text, rep: u.email, done: false });
    inp.value = '';
    persistTodos();
    renderTodo();
  };

  window.completeTodo = function (tid) {
    var t = state.todos.find(function (x) {
      return x.id === tid;
    });
    if (!t) return;
    state.todos = state.todos.filter(function (x) {
      return x.id !== t.id;
    });
    persistTodos();
    renderTodo();
  };

  function aggregateRepStats() {
    var map = {};
    filterLeads().forEach(function (l) {
      var key = l.rep || 'Unassigned';
      if (!map[key])
        map[key] = {
          rep: key,
          ku: 0,
          ci: 0,
          slips: 0,
          collected: 0,
          jobs: 0,
        };
      map[key].ku += Number(l.ku) || 0;
      map[key].ci += Number(l.ci) || 0;
      map[key].slips += Number(l.slipsSigned) || 0;
      map[key].collected += Number(l.collected) || 0;
      if (l.stage >= 12 || l.complete) map[key].jobs += 1;
    });
    return Object.keys(map)
      .map(function (k) {
        return map[k];
      })
      .sort(function (a, b) {
        return b.collected - a.collected;
      });
  }

  function renderLeaderboard() {
    var el = document.getElementById('leaderboard');
    if (!el) return;
    var rows = aggregateRepStats();
    if (!rows.length) {
      el.innerHTML = '<div class="muted">No rep metrics yet — add customers.</div>';
      return;
    }
    var medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
    el.innerHTML =
      '<table class="tbl"><thead><tr><th></th><th>Rep</th><th>KUs</th><th>CIs</th><th>Slips</th><th>Collected</th></tr></thead><tbody>' +
      rows
        .map(function (r, i) {
          var medal = i < 3 ? '<span class="medal">' + medals[i] + '</span>' : '';
          return (
            '<tr><td>' +
            medal +
            '</td><td>' +
            esc(r.rep) +
            '</td><td>' +
            r.ku +
            '</td><td>' +
            r.ci +
            '</td><td>' +
            r.slips +
            '</td><td>' +
            money(r.collected) +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table>';
  }

  function renderTeamTotals() {
    var el = document.getElementById('team-totals');
    if (!el) return;
    var leads = filterLeads();
    var totalKu = leads.reduce(function (s, l) {
      return s + (Number(l.ku) || 0);
    }, 0);
    var totalCi = leads.reduce(function (s, l) {
      return s + (Number(l.ci) || 0);
    }, 0);
    var collected = leads.reduce(function (s, l) {
      return s + (Number(l.collected) || 0);
    }, 0);
    var conv = totalKu + totalCi > 0 ? ((totalCi / (totalKu + totalCi)) * 100).toFixed(1) : '0.0';
    el.innerHTML =
      '<div class="grid">' +
      '<div><div class="kpi-sub">Team KUs</div><div class="kpi">' +
      totalKu +
      '</div></div>' +
      '<div><div class="kpi-sub">Team CIs</div><div class="kpi">' +
      totalCi +
      '</div></div>' +
      '<div><div class="kpi-sub">Conversion</div><div class="kpi">' +
      conv +
      '%</div></div>' +
      '<div><div class="kpi-sub">Collected</div><div class="kpi">' +
      money(collected) +
      '</div></div>' +
      '</div>';
  }

  function wireSearch() {
    var inp = document.getElementById('global-search');
    if (!inp || inp._wired) return;
    inp._wired = true;
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = inp.value.trim().toLowerCase();
        if (!q) return;
        var hits = filterLeads().filter(function (l) {
          return (
            (l.name && l.name.toLowerCase().indexOf(q) !== -1) ||
            (l.addr && l.addr.toLowerCase().indexOf(q) !== -1) ||
            (l.phone && l.phone.indexOf(q) !== -1) ||
            (l.email && l.email.toLowerCase().indexOf(q) !== -1)
          );
        });
        if (hits.length === 1) {
          openCustomer(hits[0].id);
        } else if (hits.length) {
          topNav('customers');
          document.getElementById('customers-search').value = inp.value;
          renderCustomersTable(inp.value);
          toast(hits.length + ' matches — narrowed list.');
        } else {
          toast('No matches.');
        }
      }
    });
  }

  function wireCustomersSearch() {
    var inp = document.getElementById('customers-search');
    if (!inp || inp._wired) return;
    inp._wired = true;
    inp.addEventListener('input', function () {
      renderCustomersTable(inp.value);
    });
  }

  // Idempotent: always (re)render the Appointment Setter page form so the view
  // is usable even if the user navigates here before Home has rendered.
  function ensureAppointmentPage() {
    var host = document.getElementById('appt-form');
    if (!host) return;
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var ds = tomorrow.toISOString().slice(0, 10);
    host.innerHTML =
      '<div class="field"><label>Name</label><input id="ap-name" placeholder="Last, First or First Last"/></div>' +
      '<div class="field"><label>Address</label><input id="ap-addr"/></div>' +
      '<div class="grid-2">' +
      '<div class="field"><label>Phone</label><input id="ap-phone" type="tel"/></div>' +
      '<div class="field"><label>Date</label><input id="ap-date" type="date" value="' + ds + '"/></div>' +
      '</div>' +
      '<div class="field"><label>Time</label><input id="ap-time" type="time" value="09:00"/></div>' +
      '<button type="button" class="btn btn-primary btn-block" onclick="saveApptPage()">Check weather &amp; save</button>' +
      '<p class="muted small">Blocks scheduling when precipitation probability &gt; 70% at appointment hour (Open-Meteo).</p>';
  }

  // Kept for backward compatibility with renderAll(); now delegates.
  function renderApptPageForm() {
    ensureAppointmentPage();
  }

  window.saveApptPage = function () {
    persistAppointmentFromFields(collectApptFields('ap'));
  };

  function renderCustomersTable(filter) {
    var host = document.getElementById('customers-table');
    if (!host) return;
    var q = (filter || '').trim().toLowerCase();
    var rows = filterLeads().filter(function (l) {
      if (!q) return true;
      var blob = (l.name + ' ' + l.addr + ' ' + l.phone + ' ' + l.email).toLowerCase();
      return blob.indexOf(q) !== -1;
    });
    if (!rows.length) {
      host.innerHTML = '<div class="empty">No customers yet.</div>';
      return;
    }
    host.innerHTML =
      '<table class="tbl"><thead><tr><th>Name</th><th>Address</th><th>Stage</th><th>Rep</th><th>Collected</th></tr></thead><tbody>' +
      rows
        .map(function (l) {
          return (
            '<tr onclick="openCustomer(\'' +
            l.id +
            "')\"><td>" +
            esc(formatLF(l.name)) +
            '</td><td>' +
            esc(l.addr) +
            '</td><td>' +
            l.stage +
            ' — ' +
            esc(STAGE_LABELS[l.stage - 1] || '') +
            '</td><td>' +
            esc(l.rep) +
            '</td><td>' +
            money(l.collected) +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table>';
  }

  window.openCustomerNew = function () {
    var u = getUser();
    var l = defaultLead({
      rep: u && u.role === 'rep' ? u.email : u && u.email ? u.email : 'rep@ottrestoration.com',
      name: 'New, Customer',
    });
    addTimeline(l, 'Customer created');
    state.leads.push(l);
    persistLeads();
    openCustomer(l.id);
    toast('Customer created');
  };

  window.openCustomer = function (id) {
    state.currentLeadId = id;
    topNav('customer');
  };

  window.openCsvImport = function () {
    openModal(
      'Import CSV',
      '<p class="muted">CSV columns: last_name,first_name,address,city,state,phone,email,rep_email</p>' +
        '<textarea id="csv-ta" rows="8" style="width:100%" placeholder="Smith,Jane,123 Main,Columbia,MO,573...,jane@...,rep@..."></textarea>' +
        '<button class="btn btn-primary btn-block" style="margin-top:10px" onclick="runCsvImport()">Import</button>'
    );
  };

  window.runCsvImport = function () {
    var raw = document.getElementById('csv-ta').value || '';
    var lines = raw.split(/\r?\n/).filter(Boolean);
    var n = 0;
    lines.forEach(function (line) {
      var p = line.split(',');
      if (p.length < 3) return;
      var last = p[0].trim();
      var first = p[1].trim();
      var addr = p[2].trim();
      var city = (p[3] || '').trim();
      var st = (p[4] || 'MO').trim();
      var phone = (p[5] || '').trim();
      var email = (p[6] || '').trim();
      var rep = (p[7] || 'rep@ottrestoration.com').trim();
      var l = defaultLead({
        name: last + ', ' + first,
        addr: addr,
        city: city,
        state: st,
        phone: phone,
        email: email,
        rep: rep,
      });
      addTimeline(l, 'Imported from CSV');
      state.leads.push(l);
      n++;
    });
    persistLeads();
    closeModal();
    renderCustomersTable();
    toast('Imported ' + n + ' rows');
  };

  function stageGate(lead, newStage) {
    if (newStage < 1 || newStage > 12) return 'Invalid stage';
    if (newStage >= 2 && !lead.slip) return 'Stage 2+ requires signed permission slip.';
    return null;
  }

  window.markSlipSigned = function (leadId) {
    var lead = getLeadById(leadId);
    if (!lead) return;
    lead.slip = true;
    lead.slipDate = new Date().toISOString();
    lead.slipsSigned = (Number(lead.slipsSigned) || 0) + 1;
    addTimeline(lead, 'Insurance permission slip marked signed');
    persistLeads();
    renderCustomerDetail(leadId);
    renderLeaderboard();
    toast('Permission slip recorded');
  };

  window.advanceStage = function (leadId, newStage) {
    var lead = getLeadById(leadId);
    if (!lead) return;
    var err = stageGate(lead, newStage);
    if (err) {
      toast(err);
      return;
    }
    lead.stage = newStage;
    addTimeline(lead, 'Stage set to ' + newStage + ' — ' + (STAGE_LABELS[newStage - 1] || ''));
    persistLeads();
    renderCustomerDetail(leadId);
    renderLeaderboard();
    renderTeamTotals();
  };

  window.renderCustomerDetail = function (leadId) {
    var host = document.getElementById('customer-detail');
    if (!host) return;
    var lead = getLeadById(leadId);
    if (!lead) {
      host.innerHTML = '<div class="empty">Customer not found.</div>';
      return;
    }
    var notifySms =
      'sms:' +
      (lead.phone || '').replace(/\D/g, '') +
      '?body=' +
      encodeURIComponent('OTT Restoration — update on your project.');
    var notifyMail =
      'mailto:' +
      (lead.email || '') +
      '?subject=' +
      encodeURIComponent('OTT Restoration update') +
      '&body=' +
      encodeURIComponent('Hi ' + lead.name + ',\n\n');
    host.innerHTML =
      '<div class="page-head">' +
      '<button class="btn btn-sm" onclick="topNav(\'customers\')">\u2190 Back</button>' +
      '<h1>' +
      esc(formatLF(lead.name)) +
      '</h1>' +
      '<span class="spacer"></span>' +
      '<a class="btn btn-sm" href="' +
      notifySms +
      '">SMS</a> ' +
      '<a class="btn btn-sm" href="' +
      notifyMail +
      '">Email</a> ' +
      '<button class="btn btn-sm" onclick="copyPortalLink(\'' +
      lead.id +
      "')\">Portal link</button>" +
      '</div>' +
      '<div class="tabs" id="cust-tabs">' +
      '<button type="button" class="active" data-tab="ov">Overview</button>' +
      '<button type="button" data-tab="ph">Photos</button>' +
      '<button type="button" data-tab="bl">Billing</button>' +
      '<button type="button" data-tab="dc">Docs</button>' +
      '<button type="button" data-tab="tl">Timeline</button>' +
      '<button type="button" data-tab="pr">Production</button>' +
      '<button type="button" data-tab="cm">Communication</button>' +
      '</div>' +
      '<div id="tab-ov" class="tabpane on"></div>' +
      '<div id="tab-ph" class="tabpane"></div>' +
      '<div id="tab-bl" class="tabpane"></div>' +
      '<div id="tab-dc" class="tabpane"></div>' +
      '<div id="tab-tl" class="tabpane"></div>' +
      '<div id="tab-pr" class="tabpane"></div>' +
      '<div id="tab-cm" class="tabpane"></div>';

    document.querySelectorAll('#cust-tabs button').forEach(function (btn) {
      btn.onclick = function () {
        document.querySelectorAll('#cust-tabs button').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        document.querySelectorAll('#customer-detail .tabpane').forEach(function (p) {
          p.classList.remove('on');
        });
        document.getElementById('tab-' + btn.dataset.tab).classList.add('on');
      };
    });

    renderTabOverview(lead);
    renderTabPhotos(lead);
    renderTabBilling(lead);
    renderTabDocs(lead);
    renderTabTimeline(lead);
    renderTabProduction(lead);
    renderTabComm(lead);
  };

  window.copyPortalLink = function (leadId) {
    var lead = getLeadById(leadId);
    if (!lead) return;
    var url = location.origin + location.pathname + '#portal=' + encodeURIComponent(lead.portalToken);
    navigator.clipboard.writeText(url).then(
      function () {
        toast('Portal link copied');
      },
      function () {
        prompt('Copy portal link:', url);
      }
    );
  };

  function renderTabOverview(lead) {
    var el = document.getElementById('tab-ov');
    var rem = Math.max(0, (Number(lead.acv) || 0) - (Number(lead.collected) || 0));
    var stagesHtml = '<div class="stages">';
    for (var i = 1; i <= 12; i++) {
      var cls = i < lead.stage ? 'done' : i === lead.stage ? 'current' : '';
      stagesHtml +=
        '<div class="stage-chip ' +
        cls +
        '" onclick="advanceStage(\'' +
        lead.id +
        "', " +
        i +
        ')"><span class="num">' +
        i +
        '</span>' +
        esc(STAGE_LABELS[i - 1] || '') +
        '</div>';
    }
    stagesHtml += '</div>';

    el.innerHTML =
      stagesHtml +
      '<div class="card" style="margin-top:12px;">' +
      '<h3>Snapshot</h3>' +
      '<div class="grid">' +
      '<div><div class="kpi-sub">Stage</div><div class="kpi">' +
      lead.stage +
      '</div></div>' +
      '<div><div class="kpi-sub">Collected</div><div class="kpi">' +
      money(lead.collected) +
      '</div></div>' +
      '<div><div class="kpi-sub">Remaining</div><div class="kpi">' +
      money(rem) +
      '</div></div>' +
      '<div><div class="kpi-sub">Rep</div><div class="kpi" style="font-size:16px">' +
      esc(lead.rep) +
      '</div></div>' +
      '</div>' +
      '<p><span class="pill ' +
      (lead.slip ? 'green' : 'red') +
      '">' +
      (lead.slip ? 'Permission slip on file' : 'Permission slip not marked') +
      '</span> &nbsp; <button type="button" class="btn btn-sm" onclick="markSlipSigned(\'' +
      lead.id +
      "')\">Mark slip signed</button></p>" +
      '<div class="field" style="margin-top:10px;"><label>Building codes / notes</label><textarea id="codes-ta">' +
      esc(lead.buildingCodes || '') +
      '</textarea></div>' +
      '<button class="btn btn-sm" onclick="saveCodes(\'' +
      lead.id +
      "')\">Save codes</button>" +
      '</div>';
  }

  window.saveCodes = function (id) {
    var lead = getLeadById(id);
    lead.buildingCodes = document.getElementById('codes-ta').value;
    addTimeline(lead, 'Building codes updated');
    persistLeads();
    toast('Saved');
  };

  function renderTabPhotos(lead) {
    var el = document.getElementById('tab-ph');
    el.innerHTML =
      '<div class="flex"><button class="btn btn-primary btn-sm" onclick="pickPhoto(\'' +
      lead.id +
      "')\">Upload photo</button></div>" +
      '<input type="file" id="photo-file" accept="image/*" class="hidden" onchange="uploadPhoto(\'' +
      lead.id +
      '\')"/>' +
      '<div class="photo-grid" style="margin-top:12px;">' +
      (lead.photos || [])
        .map(function (p) {
          return '<div class="ph"><img src="' + escAttr(p) + '" alt=""/></div>';
        })
        .join('') +
      '</div>';
  }

  window.pickPhoto = function () {
    document.getElementById('photo-file').click();
  };

  window.uploadPhoto = function (leadId) {
    var f = document.getElementById('photo-file').files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var lead = getLeadById(leadId);
      lead.photos = lead.photos || [];
      lead.photos.push(reader.result);
      addTimeline(lead, 'Photo uploaded');
      persistLeads();
      renderTabPhotos(lead);
    };
    reader.readAsDataURL(f);
  };

  function renderTabBilling(lead) {
    var el = document.getElementById('tab-bl');
    el.innerHTML =
      '<div class="card">' +
      '<p><strong>Collected:</strong> ' +
      money(lead.collected) +
      ' &nbsp; <strong>ACV:</strong> ' +
      money(lead.acv) +
      '</p>' +
      '<div class="field"><label>Add payment amount</label><input id="pay-amt" type="number" step="0.01"/></div>' +
      '<button class="btn btn-primary" onclick="addPayment(\'' +
      lead.id +
      "')\">Record payment</button>" +
      '<p class="muted small">Label shows &ldquo;collected&rdquo; on overview per spec.</p>' +
      '</div>';
  }

  window.addPayment = function (id) {
    var lead = getLeadById(id);
    var amt = Number(document.getElementById('pay-amt').value);
    if (!amt || amt <= 0) return;
    lead.collected = (Number(lead.collected) || 0) + amt;
    addTimeline(lead, 'Payment recorded: ' + money(amt));
    persistLeads();
    renderTabBilling(lead);
    renderTabOverview(lead);
    renderLeaderboard();
    renderTeamTotals();
  };

  function renderTabDocs(lead) {
    var el = document.getElementById('tab-dc');
    el.innerHTML =
      '<button class="btn btn-sm" onclick="pickDoc(\'' +
      lead.id +
      "')\">Upload document</button>" +
      '<input type="file" id="doc-file" class="hidden" onchange="uploadDoc(\'' +
      lead.id +
      '\')"/><ul style="margin-top:12px">' +
      (lead.docs || [])
        .map(function (d, i) {
          return '<li><a href="' + escAttr(d.data) + '" download="' + escAttr(d.name) + '">' + esc(d.name) + '</a></li>';
        })
        .join('') +
      '</ul>';
  }

  window.pickDoc = function () {
    document.getElementById('doc-file').click();
  };

  window.uploadDoc = function (leadId) {
    var f = document.getElementById('doc-file').files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var lead = getLeadById(leadId);
      lead.docs = lead.docs || [];
      lead.docs.push({ name: f.name, data: reader.result });
      addTimeline(lead, 'Document uploaded: ' + f.name);
      persistLeads();
      renderTabDocs(lead);
    };
    reader.readAsDataURL(f);
  };

  function renderTabTimeline(lead) {
    var el = document.getElementById('tab-tl');
    el.innerHTML =
      '<ul class="timeline">' +
      (lead.timeline || [])
        .map(function (t) {
          return (
            '<li><span class="dot"></span><div><div class="ts">' +
            esc(new Date(t.ts).toLocaleString()) +
            '</div><div class="text">' +
            esc(t.text) +
            '</div></div></li>'
          );
        })
        .join('') +
      '</ul>';
  }

  function renderTabProduction(lead) {
    var el = document.getElementById('tab-pr');
    var items = (lead.materialOrder && lead.materialOrder.items) || [];
    el.innerHTML =
      '<p class="muted">Material order line items (from AI analyzer / manual).</p>' +
      '<table class="tbl"><thead><tr><th>Item</th><th>Notes</th><th>Price</th><th></th></tr></thead><tbody>' +
      items
        .map(function (it, idx) {
          return (
            '<tr><td>' +
            esc(it.name) +
            '</td><td>' +
            esc(it.desc) +
            '</td><td>' +
            money(it.price) +
            '</td><td><input type="checkbox" ' +
            (it.checked ? 'checked' : '') +
            ' onchange="toggleMO(\'' +
            lead.id +
            "', " +
            idx +
            ',this)"/></td></tr>'
          );
        })
        .join('') +
      '</tbody></table>' +
      '<button class="btn btn-sm" onclick="topNav(\'ai\')">Open AI Analyzer</button>';
  }

  window.toggleMO = function (leadId, idx, el) {
    var lead = getLeadById(leadId);
    lead.materialOrder = lead.materialOrder || { items: [] };
    var it = lead.materialOrder.items[idx];
    if (!it) return;
    it.checked = el.checked;
    persistLeads();
  };

  function renderTabComm(lead) {
    var el = document.getElementById('tab-cm');
    el.innerHTML =
      '<div class="card">' +
      '<h3>Automated sequence (templates)</h3>' +
      '<p class="muted">MVP: editable templates; future: Twilio/SendGrid.</p>' +
      '<label>No-answer follow-up SMS</label>' +
      '<textarea id="tpl-sms">' +
      esc(
        'Hi {name}, this is OTT Restoration. We tried to reach you about your claim. Reply YES to confirm a call time.'
      ) +
      '</textarea>' +
      '<button class="btn btn-sm" style="margin-top:8px" onclick="sendTplSms(\'' +
      lead.id +
      "')\">Open SMS with template</button>" +
      '</div>';
  }

  window.sendTplSms = function (leadId) {
    var lead = getLeadById(leadId);
    var tpl = document.getElementById('tpl-sms').value || '';
    var body = tpl.replace(/\{name\}/g, lead.name || '');
    location.href = 'sms:' + (lead.phone || '').replace(/\D/g, '') + '?body=' + encodeURIComponent(body);
  };

  window.openJotForm = function (key) {
    var cfg = JOTFORMS[key];
    if (!cfg) return;
    var url = 'https://form.jotform.com/' + cfg.id;
    document.getElementById('jotform-title').textContent = cfg.title;
    document.getElementById('jotform-fallback').href = url;
    var iframe = document.getElementById('jotform-iframe');
    iframe.src = url + '?nojump';
    document.getElementById('jotform-modal').classList.add('on');
    if (window.jotformEmbedHandler) {
      try {
        window.jotformEmbedHandler.load(iframe);
      } catch (e) {}
    }
  };

  window.closeJotForm = function () {
    document.getElementById('jotform-modal').classList.remove('on');
    document.getElementById('jotform-iframe').src = 'about:blank';
  };

  function checkMissedAppointments() {
    var now = Date.now();
    state.appts.forEach(function (a) {
      if (a.completed || a.missedNotified) return;
      if (new Date(a.when).getTime() < now - 60 * 60 * 1000) {
        a.missedNotified = true;
        var pm = 'mailto:' + state.settings.pmEmail + '?subject=' + encodeURIComponent('Missed appointment: ' + a.name);
        toast('Missed appointment — notifying PM (mailto link).');
        window.open(pm);
      }
    });
    persistAppts();
  }

  function scheduleNightlyChatRollup() {
    if (state.nightlyTimer) clearTimeout(state.nightlyTimer);
    var now = new Date();
    var next = new Date();
    next.setHours(21, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    var ms = next.getTime() - now.getTime();
    state.nightlyTimer = setTimeout(function () {
      runNightlyRollup();
      scheduleNightlyChatRollup();
    }, ms);
  }

  function runNightlyRollup() {
    var ku = 0;
    var ci = 0;
    CHAT_CHANNELS.forEach(function (ch) {
      (state.chat[ch.id] || []).forEach(function (m) {
        var t = (m.text || '').toUpperCase();
        if (/\bKU\b|\bK\.U\.|\bKNOCK\b/.test(t)) ku++;
        if (/\bCI\b|\bCALL\b|\bCALL-?IN\b/.test(t)) ci++;
      });
    });
    var conv = ku + ci > 0 ? ((ci / (ku + ci)) * 100).toFixed(1) : '0.0';
    var msg =
      '[System] Nightly scoreboard — Team KUs: ' +
      ku +
      ', CIs: ' +
      ci +
      ', Conv: ' +
      conv +
      '%';
    state.chat.posi = state.chat.posi || [];
    state.chat.posi.push({
      ts: new Date().toISOString(),
      userId: 'system',
      name: 'System',
      text: msg,
    });
    persistChat();
    toast('Nightly chat rollup posted to Posi-chat');
  }

  function renderChat() {
    var chWrap = document.getElementById('chat-channels');
    chWrap.innerHTML = '';
    CHAT_CHANNELS.forEach(function (ch) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = ch.label;
      b.className = state.activeChatChannel === ch.id ? 'active' : '';
      b.onclick = function () {
        state.activeChatChannel = ch.id;
        renderChat();
      };
      chWrap.appendChild(b);
    });
    var stream = document.getElementById('chat-stream');
    var msgs = state.chat[state.activeChatChannel] || [];
    stream.innerHTML = msgs
      .map(function (m) {
        return (
          '<div class="chat-msg"><span class="who">' +
          esc(m.name || 'User') +
          '</span><span class="when">' +
          esc(new Date(m.ts).toLocaleString()) +
          '</span><div class="body">' +
          esc(m.text) +
          '</div></div>'
        );
      })
      .join('');
    stream.scrollTop = stream.scrollHeight;
  }

  window.sendChat = function () {
    var inp = document.getElementById('chat-input');
    var text = inp.value.trim();
    if (!text) return;
    var u = getUser();
    if (!u || u.role === 'homeowner') {
      toast('Team chat is for internal users.');
      return;
    }
    var msg = {
      ts: new Date().toISOString(),
      userId: state.session.userId || 'u',
      name: u.name || u.email || 'User',
      text: text,
    };
    state.chat[state.activeChatChannel] = state.chat[state.activeChatChannel] || [];
    state.chat[state.activeChatChannel].push(msg);
    inp.value = '';
    persistChat();
    renderChat();
  };

  function renderBoards() {
    var host = document.getElementById('boards-body');
    if (!host) return;
    var u = getUser();
    if (!u || u.role === 'homeowner') {
      host.innerHTML = '<div class="empty">Sign in as a team member to view boards.</div>';
      return;
    }
    var email = u.email || '';
    var leads =
      u.role === 'owner' || u.role === 'admin'
        ? state.leads
        : state.leads.filter(function (l) {
            return l.rep === email;
          });
    var appts = appointmentsForCurrentUser().sort(function (a, b) {
      return new Date(a.when) - new Date(b.when);
    });
    var apptRows =
      appts.length > 0
        ? appts
            .map(function (a) {
              return (
                '<tr><td>' +
                esc(new Date(a.when).toLocaleString()) +
                '</td><td>' +
                esc(a.name) +
                '</td><td>' +
                esc(a.addr) +
                '</td></tr>'
              );
            })
            .join('')
        : '<tr><td colspan="3" class="muted">No appointments yet — use Home or Appointment Setter.</td></tr>';
    var leadCards =
      leads.length > 0
        ? leads
            .map(function (l) {
              return (
                '<div class="card"><h3>' +
                esc(formatLF(l.name)) +
                '</h3><p class="muted">Stage ' +
                l.stage +
                '</p><button class="btn btn-sm" onclick="openCustomer(\'' +
                l.id +
                "')\">Open</button></div>"
              );
            })
            .join('')
        : '<div class="card"><p class="muted" style="margin:0">No leads assigned — import or add customers.</p></div>';
    host.innerHTML =
      '<div class="grid">' +
      leadCards +
      '</div>' +
      '<h2 style="margin-top:18px;font-family:Times New Roman,serif">Appointments</h2>' +
      '<table class="tbl"><thead><tr><th>When</th><th>Customer</th><th>Address</th></tr></thead><tbody>' +
      apptRows +
      '</tbody></table>';
  }

  function renderHomeownerPortal() {
    var root = document.getElementById('homeowner-portal');
    if (!root) return;
    var u = getUser();
    if (u.role !== 'homeowner') {
      renderInternalPortalPreview(root);
      return;
    }
    var lead = getLeadById(u.leadId);
    if (!lead) {
      root.innerHTML = '<div class="empty">Portal session invalid.</div>';
      return;
    }
    root.innerHTML = '<div class="page-head"><h1>Homeowner Portal</h1></div>' + renderPortalCardHtml(lead);
  }

  // Internal-user view: pick a lead and preview the homeowner-facing card inline.
  function renderInternalPortalPreview(root) {
    var leads = filterLeads();
    var selectedId = state.portalPreviewId && getLeadById(state.portalPreviewId) ? state.portalPreviewId : (leads[0] && leads[0].id);
    state.portalPreviewId = selectedId;
    var options = leads.map(function (l) {
      return '<option value="' + escAttr(l.id) + '"' + (l.id === selectedId ? ' selected' : '') + '>' +
        esc(l.name) + ' — ' + esc(l.addr || '') + '</option>';
    }).join('');

    var preview = '';
    if (selectedId) {
      var lead = getLeadById(selectedId);
      preview = renderPortalCardHtml(lead) +
        '<div class="card"><div class="flex between" style="gap:10px;flex-wrap:wrap">' +
        '<button class="btn btn-secondary btn-sm" onclick="copyPortalLink(\'' + lead.id + '\')">Copy portal link</button>' +
        '<button class="btn btn-sm" onclick="openCustomer(\'' + lead.id + '\')">Open full customer record</button>' +
        '</div></div>';
    } else {
      preview = '<div class="card"><div class="empty">No customers yet. Add one from the Customers view.</div></div>';
    }

    root.innerHTML =
      '<div class="page-head"><h1>Homeowner Portal</h1><p class="muted small">Internal preview of what a homeowner sees when they open their portal link.</p></div>' +
      '<div class="card"><div class="field"><label>Preview customer</label>' +
      '<select id="portal-pick" onchange="selectPortalPreview(this.value)">' + options + '</select></div></div>' +
      preview;
  }

  window.selectPortalPreview = function (id) {
    state.portalPreviewId = id;
    renderHomeownerPortal();
  };

  // Shared homeowner-facing portal card markup (used both for live homeowners
  // and the internal preview).
  function renderPortalCardHtml(lead) {
    if (!lead) return '<div class="empty">Customer not found.</div>';
    var rem = Math.max(0, (Number(lead.acv) || 0) - (Number(lead.collected) || 0));
    return (
      '<div class="card">' +
      '<p><strong>Job address:</strong> ' +
      esc(lead.addr + ', ' + lead.city + ' ' + lead.state) +
      '</p>' +
      '<p><strong>Collected:</strong> ' +
      money(lead.collected) +
      ' &nbsp; <strong>Remaining:</strong> ' +
      money(rem) +
      '</p>' +
      '<p><strong>Your rep:</strong> ' +
      esc(lead.rep) +
      '</p>' +
      '<div class="divider"></div>' +
      '<h3>Photos</h3><div class="photo-grid">' +
      (lead.photos || [])
        .slice(0, 6)
        .map(function (p) {
          return '<div class="ph"><img src="' + escAttr(p) + '"/></div>';
        })
        .join('') +
      '</div>' +
      '<div class="divider"></div>' +
      '<h3>Company docs</h3><p class="muted">Business license, COI, certificates — upload in Settings (admin).</p>' +
      '<h3>Financing</h3>' +
      (state.settings.hearthsBanner || '') +
      '<h3>Leave a review</h3><p><a href="' +
      escAttr(state.settings.reviewUrl) +
      '" target="_blank" rel="noopener">Google review link</a></p>' +
      '</div>'
    );
  }

  function mapErrorHtml(title, details) {
    return (
      '<div class="map-fail">' +
      '<p class="map-fail-title">' +
      esc(title) +
      '</p>' +
      '<p class="map-fail-body">' +
      (details || '') +
      '</p>' +
      '<ul class="map-fail-list">' +
      '<li>Use <strong>HTTPS</strong> (Netlify preview/production), not <code>file://</code>.</li>' +
      '<li>Google Cloud: enable <strong>Maps JavaScript API</strong> and <strong>billing</strong> on the project.</li>' +
      '<li>API key: <strong>Application restrictions</strong> = HTTP referrers — add your site, e.g. <code>https://*.netlify.app/*</code> and <code>http://localhost:*/*</code> for local dev.</li>' +
      '<li><strong>API restrictions</strong>: restrict to Google Maps APIs, or use &ldquo;Don&rsquo;t restrict&rdquo; while testing.</li>' +
      '</ul>' +
      '<p class="muted small">Paste the key in <strong>Settings</strong> &rarr; Google Maps JS API key, then reload this page.</p>' +
      '</div>'
    );
  }

  function showMapFailure(msg) {
    var el = document.getElementById('gmap');
    if (!el) return;
    el.innerHTML = mapErrorHtml('Google Maps could not load', esc(msg));
    renderPingList();
  }

  window.gm_authFailure = function () {
    showMapFailure(
      'The Maps JavaScript API rejected your API key (auth failure). Check API key restrictions and that Maps JavaScript API is enabled with billing.'
    );
  };

  function initMapLazy() {
    var key = (state.settings.googleMapsKey || '').trim();
    var el = document.getElementById('gmap');
    if (!el) return;

    if (location.protocol === 'file:') {
      el.innerHTML = mapErrorHtml(
        'Open this app over HTTPS',
        'Google Maps does not work from a <code>file://</code> page. Deploy to Netlify (or use a local HTTPS server) and open the site URL there.'
      );
      renderPingList();
      return;
    }

    if (!key) {
      el.innerHTML = mapErrorHtml(
        'Add a Maps API key',
        'Save your key under <strong>Settings</strong> &rarr; <strong>Google Maps JS API key</strong>, then return to this view.'
      );
      renderPingList();
      return;
    }

    if (window.google && window.google.maps) {
      try {
        setupGoogleMap();
      } catch (e) {
        showMapFailure(e && e.message ? e.message : String(e));
      }
      return;
    }

    if (document.querySelector('script[data-top-maps-api]')) {
      return;
    }

    window.initTopGoogleMap = function () {
      if (!window.google || !window.google.maps) {
        showMapFailure('Google Maps global object missing after load.');
        return;
      }
      try {
        setupGoogleMap();
      } catch (e) {
        showMapFailure(e && e.message ? e.message : String(e));
      }
    };

    var s = document.createElement('script');
    s.setAttribute('data-top-maps-api', '1');
    s.async = true;
    s.defer = true;
    s.src =
      'https://maps.googleapis.com/maps/api/js?key=' +
      encodeURIComponent(key) +
      '&callback=' +
      encodeURIComponent('initTopGoogleMap');
    s.onerror = function () {
      showMapFailure('Network blocked the Maps script, or the URL is invalid.');
    };
    document.head.appendChild(s);
  }

  function setupGoogleMap() {
    var el = document.getElementById('gmap');
    el.innerHTML = '';
    var center = { lat: state.settings.lat, lng: state.settings.lon };
    state.map = new google.maps.Map(el, {
      center: center,
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    state.mapMarkers.forEach(function (m) {
      m.setMap(null);
    });
    state.mapMarkers = [];
    state.pings.forEach(function (p) {
      var marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: state.map,
        title: p.address || 'Ping',
      });
      state.mapMarkers.push(marker);
    });
    renderPingList();
  }

  function renderPingList() {
    var ms = document.getElementById('map-search');
    if (ms && !ms._wired) {
      ms._wired = true;
      ms.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') lookupHail(ms.value);
      });
    }
  }

  window.lookupHail = function (address) {
    address = address || document.getElementById('map-search').value;
    toast('HailTrace integration: configure API key in Settings. Demo result for: ' + address);
  };

  window.addPingHere = function () {
    var addr = prompt('Address for ping (deduped):') || '';
    addr = addr.trim().toLowerCase();
    if (!addr) return;
    var exists = state.pings.some(function (p) {
      return (p.address || '').toLowerCase() === addr;
    });
    if (exists) {
      toast('Only one ping per address (spec).');
      return;
    }
    state.pings.push({
      id: uid(),
      address: addr,
      lat: state.settings.lat + (Math.random() - 0.5) * 0.05,
      lng: state.settings.lon + (Math.random() - 0.5) * 0.05,
      ts: new Date().toISOString(),
    });
    persistPings();
    initMapLazy();
    toast('Ping added');
  };

  window.aiAnalyzeMock = function () {
    var result = {
      lineItems: [
        { code: 'TEAR', desc: 'Tear off architectural shingles', qty: 25, unit: 'SQ', flag: 'Verify drip edge code' },
        { code: 'SHNG', desc: 'Install laminate shingles', qty: 25, unit: 'SQ', flag: null },
      ],
      supplements: [{ desc: 'Ice & water shield in valleys', reason: 'Common MO amendment' }],
      materialOrder: {
        items: [
          { name: 'Laminate shingles', desc: 'Match existing color class', price: 0, checked: false },
          { name: 'Synthetic underlayment', desc: '', price: 0, checked: false },
        ],
      },
    };
    showAiResult(result);
    toast('Demo AI result — no API call');
  };

  window.aiAnalyzeScope = function () {
    var text = document.getElementById('ai-scope-text').value || '';
    if (!text.trim()) {
      toast('Paste scope text first.');
      return;
    }
    var key = state.settings.anthropicKey;

    function directAnthropic() {
      if (!key) return Promise.reject(new Error('no key'));
      return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          messages: [
            {
              role: 'user',
              content:
                'Parse this roofing insurance scope into JSON with keys lineItems[], supplements[], materialOrder.items[]. Each line item: code,desc,qty,unit,flag?. Use concise professional language. Scope:\n' +
                text,
            },
          ],
        }),
      }).then(function (r) {
        return r.json();
      });
    }

    fetch('/.netlify/functions/anthropic-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: text }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var txt = data.content && data.content[0] && data.content[0].text;
        if (txt) {
          showAiResult({ raw: txt, source: 'netlify-proxy' });
          return;
        }
        return directAnthropic().then(function (d2) {
          var t2 = d2.content && d2.content[0] && d2.content[0].text;
          showAiResult({ raw: t2, source: 'direct-browser' });
        });
      })
      .catch(function () {
        return directAnthropic()
          .then(function (d2) {
            var t2 = d2.content && d2.content[0] && d2.content[0].text;
            showAiResult({ raw: t2, source: 'direct-browser' });
          })
          .catch(function () {
            toast('Claude unavailable — use Demo Result, or set ANTHROPIC_API_KEY on Netlify and/or in Settings.');
          });
      });
  };

  function showAiResult(obj) {
    var el = document.getElementById('ai-result');
    el.innerHTML =
      '<pre style="white-space:pre-wrap;background:#f7f7f5;padding:12px;border-radius:8px;border:1px solid #E8E8E6;font-size:12px">' +
      esc(JSON.stringify(obj, null, 2)) +
      '</pre>';
  }

  function renderAutomations() {
    var host = document.getElementById('automations-body');
    if (!host) return;
    host.innerHTML =
      '<div class="card">' +
      '<label class="checkbox"><input type="checkbox" id="auto-adj" ' +
      (state.automations.adjusterReminder ? 'checked' : '') +
      '/> 2 days after inspection → prompt adjuster scheduling</label>' +
      '<label class="checkbox"><input type="checkbox" id="auto-miss" ' +
      (state.automations.missedAppt ? 'checked' : '') +
      '/> Missed appointment alerts</label>' +
      '<label class="checkbox"><input type="checkbox" id="auto-rev" ' +
      (state.automations.reviewAfterComplete ? 'checked' : '') +
      '/> Review request after completion</label>' +
      '<label class="checkbox"><input type="checkbox" id="auto-inv" ' +
      (state.automations.invoiceRemind ? 'checked' : '') +
      '/> Invoice reminders</label>' +
      '<button class="btn btn-primary" style="margin-top:12px" onclick="saveAutomations()">Save</button>' +
      '</div>';
  }

  window.saveAutomations = function () {
    state.automations.adjusterReminder = document.getElementById('auto-adj').checked;
    state.automations.missedAppt = document.getElementById('auto-miss').checked;
    state.automations.reviewAfterComplete = document.getElementById('auto-rev').checked;
    state.automations.invoiceRemind = document.getElementById('auto-inv').checked;
    persistAutomations();
    toast('Automations saved');
  };

  function renderSubs() {
    var host = document.getElementById('subs-body');
    if (!host) return;
    host.innerHTML =
      '<div class="card">' +
      '<h3>Sub onboarding</h3>' +
      '<div class="field"><label>Company name</label><input id="sub-name"/></div>' +
      '<div class="field"><label>Receipt upload (AI placeholder)</label><input type="file" id="sub-rcpt"/></div>' +
      '<button class="btn btn-primary" onclick="saveSub()">Save subcontractor</button>' +
      '<div id="sub-list" style="margin-top:16px"></div>' +
      '</div>';
    var list = document.getElementById('sub-list');
    list.innerHTML =
      '<table class="tbl"><thead><tr><th>Company</th><th>Status</th></tr></thead><tbody>' +
      state.subs
        .map(function (s) {
          return '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.status || 'pending') + '</td></tr>';
        })
        .join('') +
      '</tbody></table>';
  }

  window.saveSub = function () {
    var name = document.getElementById('sub-name').value.trim();
    if (!name) return;
    state.subs.push({ id: uid(), name: name, status: 'pending', receipts: [] });
    persistSubs();
    renderSubs();
    toast('Sub saved (MVP)');
  };

  function renderInvoices() {
    var host = document.getElementById('invoices-body');
    if (!host) return;
    host.innerHTML =
      '<div class="card">' +
      '<h3>Hearth financing</h3>' +
      (state.settings.hearthsBanner || '') +
      '<p class="muted">Invoice PDF generation is Phase 3 — link customers from Customers tab.</p>' +
      '</div>';
  }

  function renderPay() {
    var host = document.getElementById('pay-body');
    if (!host) return;
    host.innerHTML =
      '<div class="card">' +
      '<h3>Rep pay structures</h3>' +
      '<label>Split (Labor / Material / Misc)</label>' +
      '<select id="pay-split"><option value="10/30/70">10 / 30 / 70</option><option value="10/50/50">10 / 50 / 50</option></select>' +
      '<button class="btn" style="margin-top:10px" onclick="genPayReport()">Generate Friday-style report</button>' +
      '<pre id="pay-out" style="margin-top:12px;padding:12px;background:#f7f7f5;border-radius:8px;font-size:12px"></pre>' +
      '</div>';
  }

  window.genPayReport = function () {
    var split = document.getElementById('pay-split').value;
    var lines = aggregateRepStats()
      .map(function (r) {
        return r.rep + ': collected ' + money(r.collected) + ' — split ' + split + ' (calc stub)';
      })
      .join('\n');
    document.getElementById('pay-out').textContent = lines || 'No data';
    state.payReports.push({ ts: new Date().toISOString(), text: lines });
    persistPay();
    toast('Report generated (stub)');
  };

  function renderJobs() {
    var host = document.getElementById('jobs-body');
    if (!host) return;
    var leads = filterLeads().filter(function (l) {
      return l.stage >= 6 && !l.complete;
    });
    leads.sort(function (a, b) { return (b.stage || 0) - (a.stage || 0); });

    var head =
      '<div class="card">' +
      '<div class="flex between" style="align-items:center;flex-wrap:wrap;gap:10px;">' +
      '<h3 style="margin:0">Active jobs</h3>' +
      '<span class="muted small">Showing customers in production (stage 6+).</span>' +
      '</div></div>';

    if (!leads.length) {
      host.innerHTML = head + '<div class="card"><div class="empty">No active jobs yet. Promote a customer past stage 6 (MO / Contract) to see them here.</div></div>';
      return;
    }

    var rows = leads.map(function (l) {
      var stageLabel = STAGE_LABELS[l.stage - 1] || '';
      var rem = Math.max(0, (Number(l.acv) || 0) - (Number(l.collected) || 0));
      var moCount = (l.materialOrder && l.materialOrder.items) ? l.materialOrder.items.length : 0;
      var moStatus = l.materialOrder && l.materialOrder.approved ? 'approved' : (moCount ? 'pending' : '—');
      return (
        '<tr>' +
        '<td><a href="javascript:void(0)" onclick="openCustomer(\'' + l.id + '\')">' + esc(l.name) + '</a>' +
        '<div class="muted small">' + esc((l.addr || '') + ', ' + (l.city || '') + ' ' + (l.state || '')) + '</div></td>' +
        '<td><span class="pill">' + l.stage + '</span> <span class="muted small">' + esc(stageLabel) + '</span></td>' +
        '<td>' + esc(l.rep || '') + '</td>' +
        '<td>' + money(l.collected) + ' <span class="muted small">/ rem ' + money(rem) + '</span></td>' +
        '<td>' + (moCount ? (moCount + ' items · ' + esc(moStatus)) : '<span class="muted">—</span>') + '</td>' +
        '<td><button class="btn btn-sm" onclick="openCustomer(\'' + l.id + '\')">Open</button></td>' +
        '</tr>'
      );
    }).join('');

    host.innerHTML =
      head +
      '<div class="card"><table class="tbl">' +
      '<thead><tr><th>Customer</th><th>Stage</th><th>Rep</th><th>Collected</th><th>Material order</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
  }

  function renderSettings() {
    var host = document.getElementById('settings-body');
    if (!host) return;
    var u = getUser();
    host.innerHTML =
      '<div class="card">' +
      '<h3>Profile</h3>' +
      '<div class="field"><label>Display name</label><input id="set-name" value="' +
      escAttr(u.name || '') +
      '"/></div>' +
      '<div class="field"><label>New password</label><input id="set-pass" type="password" placeholder="leave blank to keep"/></div>' +
      '<div class="field"><label>Profile photo</label><input type="file" id="set-photo" accept="image/*"/></div>' +
      '<button class="btn btn-primary" onclick="saveProfile()">Save profile</button>' +
      '<div class="divider"></div>' +
      '<h3>Integrations</h3>' +
      '<div class="field"><label>Google Maps JS API key</label><input id="set-maps" value="' +
      escAttr(state.settings.googleMapsKey || '') +
      '" autocomplete="off" spellcheck="false"/>' +
      '<p class="muted small" style="margin-top:6px">Enable <strong>Maps JavaScript API</strong> + billing in Google Cloud. Under key restrictions, add HTTP referrers for your live domain (e.g. <code>https://*.netlify.app/*</code>).</p></div>' +
      '<div class="field"><label>HailTrace API key</label><input id="set-hail" value="' +
      escAttr(state.settings.hailtraceKey || '') +
      '"/></div>' +
      '<div class="field"><label>Anthropic API key (dev only — prefer proxy)</label><input id="set-anth" value="' +
      escAttr(state.settings.anthropicKey || '') +
      '"/></div>' +
      '<div class="field"><label>Webhook ingest secret (matches Netlify)</label><input id="set-whsec" value="' +
      escAttr(state.settings.webhookSecret || '') +
      '"/></div>' +
      '<button class="btn" onclick="saveIntegrations()">Save integrations</button>' +
      '<p class="muted small">POST website leads to <code>/.netlify/functions/webhook-lead</code> with header <code>x-webhook-secret</code>.</p>' +
      '</div>';
  }

  window.saveProfile = function () {
    var u = getUser();
    if (!u || u.role === 'homeowner') {
      toast('Profile editing uses internal login.');
      return;
    }
    var usr = state.users.find(function (x) {
      return x.id === state.session.userId;
    });
    if (!usr) return;
    usr.name = document.getElementById('set-name').value.trim();
    var np = document.getElementById('set-pass').value;
    if (np) usr.pass = np;
    var f = document.getElementById('set-photo').files[0];
    if (f) {
      var r = new FileReader();
      r.onload = function () {
        usr.photo = r.result;
        persistUsers();
        renderHeader();
        toast('Profile saved');
      };
      r.readAsDataURL(f);
    } else {
      persistUsers();
      renderHeader();
      toast('Profile saved');
    }
  };

  window.saveIntegrations = function () {
    state.settings.googleMapsKey = document.getElementById('set-maps').value.trim();
    state.settings.hailtraceKey = document.getElementById('set-hail').value.trim();
    state.settings.anthropicKey = document.getElementById('set-anth').value.trim();
    state.settings.webhookSecret = document.getElementById('set-whsec').value.trim();
    persistSettings();
    toast('Integrations saved locally');
  };

  function renderAdmin() {
    var host = document.getElementById('admin-body');
    if (!host) return;
    var u = getUser();
    if (u.role !== 'owner' && u.role !== 'admin') {
      host.innerHTML = '<div class="empty">Admin only.</div>';
      return;
    }
    host.innerHTML =
      '<div class="card">' +
      '<h3>Users</h3>' +
      '<table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Office</th><th>Banned</th></tr></thead><tbody>' +
      state.users
        .map(function (usr, idx) {
          return (
            '<tr><td>' +
            esc(usr.name) +
            '</td><td>' +
            esc(usr.email) +
            '</td><td>' +
            esc(usr.role) +
            '</td><td>' +
            esc(usr.office || '') +
            '</td><td><input type="checkbox" ' +
            (usr.banned ? 'checked' : '') +
            ' onchange="toggleBan(' +
            idx +
            ')"/></td></tr>'
          );
        })
        .join('') +
      '</tbody></table>' +
      '<div class="divider"></div>' +
      '<h3>Company docs (portal)</h3>' +
      '<p class="muted">Upload COI, licenses — stored as data URLs in localStorage for MVP.</p>' +
      '<input type="file" id="admin-doc" /><button class="btn btn-sm" onclick="uploadCompanyDoc()">Upload</button>' +
      '</div>';
  }

  window.toggleBan = function (idx) {
    state.users[idx].banned = !state.users[idx].banned;
    persistUsers();
  };

  window.uploadCompanyDoc = function () {
    toast('Stored locally — migrate to cloud storage in Phase 3.');
  };

  window._TOP_APP = { state: state, persistLeads: persistLeads, KEYS: KEYS };
})();
