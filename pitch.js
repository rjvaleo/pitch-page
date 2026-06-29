/* pitch.js — parameterized pitch page renderer */

(function() {

  // ── CURSOR ──────────────────────────────────────────────────────────────────
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  document.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    cursorRing.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
  });
  document.querySelectorAll('a, button, [onclick], .proof-row, .stack-node, .nav-links span')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
    });

  // ── PROGRESS BAR ─────────────────────────────────────────────────────────────
  const progressBar = document.getElementById('progressBar');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    progressBar.style.width = pct + '%';
  });

  // ── SCROLL ANIMATIONS ────────────────────────────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  function observeAll() {
    document.querySelectorAll(
      '.section-label, .section-title, .section-subtitle, ' +
      '.stack-node, .stack-connector, .incident-card, .room-item, ' +
      '.record-item, .srpm-item, .day-item'
    ).forEach(el => observer.observe(el));
  }

  // ── NAV SCROLL ──────────────────────────────────────────────────────────────
  window.navScroll = function(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // ── PROOF ROW TOGGLE ─────────────────────────────────────────────────────────
  window.toggleProof = function(row) {
    row.classList.toggle('open');
  };

  // ── STACK NODE CLICK ─────────────────────────────────────────────────────────
  window.activateNode = function(node, label, desc, pmRole) {
    document.querySelectorAll('.stack-node').forEach(n => n.classList.remove('active'));
    node.classList.add('active');
    const panel = document.getElementById('stack-info');
    panel.innerHTML = `
      <h3>${label}</h3>
      <p>${desc}</p>
      <div class="pm-role">${pmRole}</div>
    `;
  };

  // ── RENDER FUNCTIONS ─────────────────────────────────────────────────────────

  function renderHero(cfg) {
    document.title = `RJ Valeo — ${cfg.company}`;
    document.getElementById('page-title').textContent = `RJ Valeo — ${cfg.company}`;
    document.getElementById('hero-eyebrow').textContent = `${cfg.role} · ${cfg.subtitle || 'Agile Delivery'}`;
    document.getElementById('hero-title').innerHTML = cfg.hero_title || `The right person<br>for <em>${cfg.company}</em>.`;
    document.getElementById('hero-sub').textContent = cfg.hero_sub || '';
    document.getElementById('footer-note').textContent =
      `Prepared specifically for ${cfg.company} — ${cfg.role}`;
  }

  function renderTheCase(cfg) {
    const grid = document.getElementById('proof-grid');
    const sub = document.getElementById('proof-subtitle');
    sub.textContent = cfg.proof_subtitle ||
      `Every requirement from the JD. Every answer from the work history. Click any row.`;

    (cfg.the_case || []).forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'proof-row';
      row.setAttribute('onclick', 'toggleProof(this)');
      row.innerHTML = `
        <div class="proof-cell"><div class="proof-need">${item.need}</div></div>
        <div class="proof-cell"><div class="proof-answer">${item.answer}</div></div>
        <div class="proof-toggle">+</div>
        ${item.detail ? `<div class="proof-detail">${item.detail}</div>` : ''}
      `;
      grid.appendChild(row);
    });
  }

  function renderStack(cfg) {
    const stack = cfg.the_stack || {};
    document.getElementById('stack-title').innerHTML =
      stack.headline || 'The technical ecosystem.';
    document.getElementById('stack-subhead').textContent =
      stack.subhead || 'Where data moves, where it breaks, what the PM owns.';

    const diagram = document.getElementById('stack-diagram');
    (stack.nodes || []).forEach((node, i) => {
      if (i > 0) {
        const conn = document.createElement('div');
        conn.className = 'stack-connector';
        diagram.appendChild(conn);
      }
      const nd = document.createElement('div');
      nd.className = 'stack-node';
      nd.setAttribute('onclick',
        `activateNode(this, ${JSON.stringify(node.label)}, ${JSON.stringify(node.desc)}, ${JSON.stringify(node.pm_role || '')})`
      );
      nd.innerHTML = `
        <div class="stack-node-label">${node.label}</div>
        <div class="stack-node-desc">${node.desc}</div>
      `;
      diagram.appendChild(nd);
    });
  }

  function renderIncidents(cfg) {
    const grid = document.getElementById('incident-grid');
    (cfg.when_things_break || []).forEach((incident, i) => {
      const card = document.createElement('div');
      card.className = 'incident-card';
      const steps = (incident.response || [])
        .map(s => `<li>${s}</li>`).join('');
      card.innerHTML = `
        <div class="incident-type">Incident ${i + 1}</div>
        <div class="incident-scenario">${incident.scenario}</div>
        <ul class="incident-steps">${steps}</ul>
      `;
      grid.appendChild(card);
    });
  }

  function renderRoom(cfg) {
    const grid = document.getElementById('room-grid');
    (cfg.how_i_run_a_room || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'room-item';
      div.innerHTML = `
        <div class="room-bullet">→</div>
        <div class="room-text">${item}</div>
      `;
      grid.appendChild(div);
    });
  }

  function renderRecord(cfg) {
    const list = document.getElementById('record-list');
    (cfg.track_record || []).forEach(entry => {
      const item = document.createElement('div');
      item.className = 'record-item';
      const points = (entry.points || []).map(p => `<li>${p}</li>`).join('');
      item.innerHTML = `
        <div class="record-meta">
          <div class="record-company">${entry.company}</div>
          <div class="record-role">${entry.role}</div>
          <div class="record-period">${entry.period}</div>
        </div>
        <ul class="record-points">${points}</ul>
      `;
      list.appendChild(item);
    });
  }

  function renderPartner(cfg) {
    const grid = document.getElementById('srpm-grid');
    const partner = cfg.sr_partner || {};

    const beforeCol = document.createElement('div');
    beforeCol.className = 'srpm-col';
    beforeCol.innerHTML = `<div class="srpm-label before">Before</div>
      <div class="srpm-items">${(partner.before || []).map(t =>
        `<div class="srpm-item">${t}</div>`).join('')}
      </div>`;

    const afterCol = document.createElement('div');
    afterCol.className = 'srpm-col';
    afterCol.innerHTML = `<div class="srpm-label after">After</div>
      <div class="srpm-items">${(partner.after || []).map(t =>
        `<div class="srpm-item">${t}</div>`).join('')}
      </div>`;

    grid.appendChild(beforeCol);
    grid.appendChild(afterCol);
  }

  function renderRamp(cfg) {
    const grid = document.getElementById('day-grid');
    (cfg.the_ramp || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'day-item';
      div.innerHTML = `
        <div class="day-timeframe">${item.timeframe}</div>
        <div class="day-deliverable">${item.deliverable}</div>
      `;
      grid.appendChild(div);
    });
  }

  // ── MAIN LOAD ────────────────────────────────────────────────────────────────
  function renderAll(cfg) {
    renderHero(cfg);
    renderTheCase(cfg);
    renderStack(cfg);
    renderIncidents(cfg);
    renderRoom(cfg);
    renderRecord(cfg);
    renderPartner(cfg);
    renderRamp(cfg);

    // Re-attach cursor expand to dynamically added elements
    document.querySelectorAll('.proof-row, .stack-node').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
    });

    observeAll();
  }

  // Get job slug from URL param
  const params = new URLSearchParams(window.location.search);
  const job = params.get('job');

  if (!job) {
    // No job param — show index of available jobs
    document.getElementById('hero-eyebrow').textContent = 'RJ Valeo · CSM · Georgetown, CO';
    document.getElementById('hero-title').innerHTML = 'Select a<br><em>pitch page</em>.';
    document.getElementById('hero-sub').textContent =
      'Add ?job=[slug] to the URL to load a specific pitch. Available: crocs, octave, davita, capgemini, akkodis, agile-coach';
    return;
  }

  fetch(`jobs/${job}.json`)
    .then(r => {
      if (!r.ok) throw new Error(`No config found for job: ${job}`);
      return r.json();
    })
    .then(cfg => {
      renderAll(cfg);
    })
    .catch(err => {
      document.getElementById('hero-eyebrow').textContent = 'Error';
      document.getElementById('hero-title').innerHTML = `Job not found:<br><em>${job}</em>`;
      document.getElementById('hero-sub').textContent = err.message;
      console.error(err);
    });

})();
