/* =====================================================================
   IFTIKHAR UDDIN — INTERACTIVE PORTFOLIO BOOK
   Page-turn engine, navigation, project viewers, case study, modal.
   Content comes from projects/projects.js (window.PORTFOLIO).
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- data + helpers ---------- */
  const DATA = window.PORTFOLIO || {};
  const PROFILE = DATA.profile || {};
  const PROJECTS = Array.isArray(DATA.projects) ? DATA.projects : [];

  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => {
    const s = String(u || '').trim();
    if (!s) return '';
    if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return '';   // blocks javascript:, data:, etc.
    return s;                                          // relative path
  };
  const hostOf = u => { try { return new URL(u).host; } catch (e) { return ''; } };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TOTAL = 12, PAGE_W = 640, PAGE_H = 860;
  const FLIP_MS = reduceMotion ? 1 : 850;
  root.style.setProperty('--flip', FLIP_MS + 'ms');

  const CATS = {
    graphic: { label: 'Graphic Design' },
    web: { label: 'Web Development' },
    ai: { label: 'AI Solutions' }
  };
  const byCat = c => PROJECTS.filter(p => p.category === c);
  const toolsOf = p => Array.isArray(p.technologies) ? p.technologies : (p.technologies ? [p.technologies] : []);
  const findProject = id => PROJECTS.find(p => p.id === id);

  /* ---------- DOM ---------- */
  const book = $('#book');
  const source = $('#pageSource');
  const stage = $('#stage');
  const btnPrev = $('#btnPrev'), btnNext = $('#btnNext'), btnHome = $('#btnHome'), btnToc = $('#btnToc');
  const zonePrev = $('#zonePrev'), zoneNext = $('#zoneNext');
  const counterCur = $('#counterCur');
  const live = $('#live');
  const tocPanel = $('#tocPanel'), tocList = $('#tocList');
  const modal = $('#modal');
  const pages = $$('.page', source).sort((a, b) => a.dataset.page - b.dataset.page);

  /* ---------- folios ---------- */
  pages.forEach(p => {
    const n = +p.dataset.page;
    if (n >= 2 && n <= 11) {
      const f = document.createElement('footer');
      f.className = 'folio';
      f.innerHTML = `<span>Iftikhar Uddin</span><span>Creative Portfolio</span><span>${pad(n)}</span>`;
      $('.page-inner', p).appendChild(f);
    }
  });

  /* =====================================================================
     BOOK ENGINE
     spread mode : 6 leaves (front+back) -> 7 states (0 = closed cover … 6 = back cover)
     single mode : 12 leaves (front only) -> 12 states (state = page index)
     ===================================================================== */
  let mode = '';
  let state = 0;
  let maxState = 6;
  let leaves = [];
  let modalOpen = false;

  const pageToState = p => mode === 'spread' ? (p <= 1 ? 0 : p >= 12 ? 6 : Math.floor(p / 2)) : p - 1;
  const visiblePages = () => {
    if (mode === 'spread') return state === 0 ? [1] : state === 6 ? [12] : [2 * state, 2 * state + 1];
    return [state + 1];
  };

  function makeFace(side, page) {
    const f = document.createElement('div');
    f.className = 'face face--' + side;
    if (page) {
      if (page.classList.contains('is-dark')) f.classList.add('is-dark');
      const n = +page.dataset.page;
      if (n === 1 || n === 12) f.classList.add('is-cover');
      f.appendChild(page);
    }
    const shade = document.createElement('div');
    shade.className = 'face__shade';
    f.appendChild(shade);
    return f;
  }

  function setZ(i) {
    const l = leaves[i];
    l.el.style.zIndex = l.flipped ? i + 1 : leaves.length - i;
  }

  function build(newMode) {
    mode = newMode;
    root.dataset.mode = mode;
    maxState = mode === 'spread' ? 6 : 11;

    leaves.forEach(l => { clearTimeout(l.t); l.el.remove(); });
    leaves = [];
    pages.forEach(p => source.appendChild(p));        // park pages while rebuilding

    book.classList.add('no-anim');
    const count = mode === 'spread' ? 6 : 12;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'leaf';
      if (mode === 'spread') {
        el.appendChild(makeFace('front', pages[2 * i]));
        el.appendChild(makeFace('back', pages[2 * i + 1]));
      } else {
        el.appendChild(makeFace('front', pages[i]));
      }
      book.insertBefore(el, zonePrev);
      leaves.push({ el, flipped: false, t: 0 });
    }
    leaves.forEach((l, i) => {
      l.flipped = i < state;
      l.el.classList.toggle('is-flipped', l.flipped);
      setZ(i);
    });
    syncUI(true);
    void book.offsetWidth;                            // flush styles, then re-enable motion
    requestAnimationFrame(() => book.classList.remove('no-anim'));
  }

  function applyState(oldState) {
    const dir = state > oldState ? 1 : -1;
    const changed = [];
    leaves.forEach((l, i) => { if (l.flipped !== (i < state)) changed.push(i); });
    if (dir < 0) changed.reverse();
    const step = changed.length > 1 ? Math.min(70, 360 / changed.length) : 0;

    changed.forEach((i, n) => {
      const l = leaves[i];
      const delay = reduceMotion ? 0 : Math.round(n * step);
      l.flipped = i < state;
      clearTimeout(l.t);
      l.el.style.zIndex = 100 + (dir > 0 ? i : leaves.length - i);
      l.el.style.transitionDelay = delay + 'ms';
      l.el.style.setProperty('--d', delay + 'ms');
      l.el.classList.add('is-turning');
      l.el.classList.toggle('is-flipped', l.flipped);
      l.t = setTimeout(() => {
        l.el.classList.remove('is-turning');
        l.el.style.transitionDelay = '';
        setZ(i);
      }, FLIP_MS + delay + 80);
    });
    syncUI();
  }

  function goState(s) {
    s = Math.max(0, Math.min(maxState, s));
    if (s === state) return;
    const old = state;
    state = s;
    applyState(old);
  }
  const next = () => goState(state + 1);
  const prev = () => goState(state - 1);
  const goPage = p => goState(pageToState(Math.max(1, Math.min(TOTAL, p))));

  const titleOf = n => (pages[n - 1] && pages[n - 1].dataset.title) || '';

  function syncUI(silent) {
    const vis = visiblePages();
    pages.forEach(p => {
      const v = vis.includes(+p.dataset.page);
      p.toggleAttribute('inert', !v);
      p.setAttribute('aria-hidden', String(!v));
    });
    counterCur.textContent = vis.map(pad).join(' — ');
    btnPrev.disabled = state === 0;
    btnNext.disabled = state === maxState;
    btnHome.disabled = state === 0;
    zonePrev.disabled = state === 0;
    zoneNext.disabled = state === maxState;
    book.dataset.edge = mode === 'spread' ? (state === 0 ? 'front' : state === maxState ? 'back' : 'mid') : 'mid';
    $$('button', tocList).forEach(b => b.setAttribute('aria-current', String(vis.includes(+b.dataset.goto))));
    if (!silent) {
      live.textContent = `Page ${vis.map(pad).join(' and ')} of ${TOTAL}: ${vis.map(titleOf).join(', ')}`;
      try { history.replaceState(null, '', '#page-' + vis[0]); } catch (e) { /* file:// or sandboxed */ }
    }
  }

  /* ---------- layout: pick mode, size the book ---------- */
  function layout() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cs = getComputedStyle(root);
    const barT = parseFloat(cs.getPropertyValue('--bar-top')) || 56;
    const barB = parseFloat(cs.getPropertyValue('--bar-bottom')) || 64;
    const availH = vh - barT - barB - 24;
    const wantSpread = vw >= 1024 && vh >= 680;
    const newMode = wantSpread ? 'spread' : 'single';
    let pw, ph, k = 1;

    if (wantSpread) {
      const availW = vw - 72;
      pw = Math.min(availW / 2, availH * PAGE_W / PAGE_H, 700);
      ph = pw * PAGE_H / PAGE_W;
      k = pw / PAGE_W;
    } else {
      pw = Math.min(vw - 24, 560);
      ph = Math.max(300, Math.min(availH, 940));
    }
    root.style.setProperty('--pw', pw.toFixed(2) + 'px');
    root.style.setProperty('--ph', ph.toFixed(2) + 'px');
    root.style.setProperty('--k', k.toFixed(4));

    if (newMode !== mode) {
      const cur = mode ? visiblePages()[0] : startPage;
      mode = newMode;                       // so pageToState uses the new mode
      state = pageToState(cur);
      build(newMode);
    }
  }

  let startPage = 1;
  const m = /^#page-(\d+)$/.exec(location.hash || '');
  if (m) startPage = Math.max(1, Math.min(TOTAL, +m[1]));

  /* ---------- navigation wiring ---------- */
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  zonePrev.addEventListener('click', prev);
  zoneNext.addEventListener('click', next);
  btnHome.addEventListener('click', () => goPage(1));

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if (g) { goPage(+g.dataset.goto); closeToc(); return; }
    const a = e.target.closest('[data-action="open"]');
    if (a) { next(); return; }
    // click anywhere on the closed cover to open the book
    if (e.target.closest('.page--cover') && !e.target.closest('a, button') && state === 0) next();
    if (tocOpen && !e.target.closest('#tocPanel, #btnToc')) closeToc();
  });

  /* keyboard */
  document.addEventListener('keydown', e => {
    if (modalOpen) return handleModalKeys(e);
    if (e.key === 'Escape' && tocOpen) { closeToc(); btnToc.focus(); return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('select, input, textarea, [contenteditable], [role="tablist"]')) return;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); next(); break;
      case 'ArrowLeft': e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); goPage(1); break;
      case 'End': e.preventDefault(); goPage(TOTAL); break;
      case 'PageDown': if (mode === 'spread') { e.preventDefault(); next(); } break;
      case 'PageUp': if (mode === 'spread') { e.preventDefault(); prev(); } break;
    }
  });

  /* swipe */
  let tx = 0, ty = 0, tt = 0, tracking = false;
  stage.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || modalOpen) { tracking = false; return; }
    const t = e.touches[0]; tx = t.clientX; ty = t.clientY; tt = Date.now(); tracking = true;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - tt < 800) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* ---------- contents panel ---------- */
  let tocOpen = false;
  tocList.innerHTML = pages.map(p => `<li><button type="button" data-goto="${p.dataset.page}"><span>${pad(+p.dataset.page)}</span>${esc(p.dataset.title)}</button></li>`).join('');
  function openToc() {
    tocOpen = true; tocPanel.hidden = false;
    requestAnimationFrame(() => tocPanel.classList.add('is-open'));
    btnToc.setAttribute('aria-expanded', 'true');
  }
  function closeToc() {
    if (!tocOpen) return;
    tocOpen = false; tocPanel.classList.remove('is-open');
    btnToc.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!tocOpen) tocPanel.hidden = true; }, 260);
  }
  btnToc.addEventListener('click', e => { e.stopPropagation(); tocOpen ? closeToc() : openToc(); });

  /* =====================================================================
     PROJECT CONTENT
     ===================================================================== */
  const ph = (label, hint) => `<span class="ph" role="img" aria-label="Placeholder: add your project image here"><span class="ph__label">${esc(label || 'Project image')}</span><span class="ph__hint">${esc(hint || '1600 × 1000 px')}</span></span>`;
  const shot = (p, hint) => {
    const src = safeUrl(p.image);
    return src
      ? `<img class="shot" src="${esc(src)}" alt="${esc(p.alt || `${p.name} — ${p.type || ''}`)}" loading="lazy" decoding="async">`
      : ph('Project image', hint || 'projects/your-image.jpg');
  };
  const hookImages = scope => $$('img.shot', scope).forEach(img => {
    const swap = () => { img.outerHTML = ph('Image not found', img.getAttribute('src')); };
    img.addEventListener('error', swap, { once: true });
  });

  const vState = { graphic: 0, web: 0, ai: 0 };

  const bar = (cat, i, list) => `
    <div class="viewer__bar">
      <span class="viewer__count">Project <b>${pad(i + 1)}</b> / ${pad(list.length)}</span>
      ${list.length > 1 ? `<span class="viewer__arrows">
        <button class="arrowbtn" type="button" data-action="step" data-cat="${cat}" data-dir="-1" aria-label="Previous project"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button class="arrowbtn" type="button" data-action="step" data-cat="${cat}" data-dir="1" aria-label="Next project"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
      </span>` : ''}
    </div>`;

  const kicker = p => `<p class="kicker"><span>${esc(p.type)}</span><span>${esc(p.year)}</span></p>`;
  const viewBtn = p => `<button class="btn btn--solid" type="button" data-action="view" data-id="${esc(p.id)}">View Project</button>`;

  const RENDER = {
    graphic: (p, i, list) => `
      <div class="viewer">
        ${bar('graphic', i, list)}
        <button class="viewer__media" type="button" data-action="view" data-id="${esc(p.id)}" aria-label="Open project: ${esc(p.name)}, ${esc(p.type)}">
          ${shot(p, 'Add image · 1600 × 1000 px')}<span class="viewer__zoom" aria-hidden="true">View</span>
        </button>
        <div class="viewer__meta">
          ${kicker(p)}
          <h3 class="viewer__name">${esc(p.name)}</h3>
          <p class="viewer__desc">${esc(p.description)}</p>
          <dl class="facts"><dt>Tools</dt><dd>${esc(toolsOf(p).join(' • '))}</dd><dt>Year</dt><dd>${esc(p.year)}</dd></dl>
        </div>
        <div class="viewer__foot">
          ${viewBtn(p)}
          ${list.length > 1 ? `<div class="thumbs" role="group" aria-label="Choose a project">${list.map((q, n) => `
            <button class="thumb" type="button" data-action="pick" data-cat="graphic" data-idx="${n}" aria-label="Show project ${n + 1}: ${esc(q.type)}" aria-current="${n === i}">${safeUrl(q.image) ? shot(q) : `<span class="ph"></span><span class="n">${n + 1}</span>`}</button>`).join('')}</div>` : ''}
        </div>
      </div>`,

    web: (p, i, list) => {
      const live = safeUrl(p.liveUrl);
      const feats = Array.isArray(p.features) ? p.features : [];
      return `
      <div class="viewer">
        ${bar('web', i, list)}
        <button class="browser" type="button" data-action="view" data-id="${esc(p.id)}" aria-label="Open project: ${esc(p.name)}, ${esc(p.type)}">
          <span class="browser__bar"><i></i><i></i><i></i><span class="browser__url">${esc(hostOf(live) || 'yourwebsite.com')}</span></span>
          <span class="browser__screen">${shot(p, 'Add screenshot · 1600 × 1000 px')}</span>
        </button>
        <div class="viewer__meta">
          ${kicker(p)}
          <h3 class="viewer__name">${esc(p.name)}</h3>
          <p class="viewer__desc">${esc(p.description)}</p>
          <dl class="facts">
            <dt>Technologies</dt><dd>${esc(toolsOf(p).join(' • '))}</dd>
            ${feats.length ? `<dt>Features</dt><dd><ul class="featlist">${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul></dd>` : ''}
          </dl>
        </div>
        <div class="viewer__foot">
          <div class="actions">
            ${live ? `<a class="btn btn--gold" href="${esc(live)}" target="_blank" rel="noopener noreferrer">Live Website</a>`
                   : `<span class="btn btn--ghost" aria-disabled="true" title="Add liveUrl in projects/projects.js">Live Website</span>`}
            ${viewBtn(p)}
          </div>
        </div>
      </div>`;
    },

    ai: (p, i, list) => {
      const hasImg = !!safeUrl(p.image);
      return `
      <div class="viewer">
        ${bar('ai', i, list)}
        <div class="ai">
          <button class="phone" type="button" data-action="view" data-id="${esc(p.id)}" aria-label="Open project: ${esc(p.name)}, ${esc(p.type)}">
            ${hasImg ? shot(p) : `<span class="chat" aria-hidden="true">
              <span class="chat__head"><span class="chat__avatar"></span><span><b>Business Assistant</b><small>Online</small></span></span>
              <span class="chat__body">
                <span class="msg msg--in">Hi! How can I help you today?</span>
                <span class="msg msg--out">What services do you offer?</span>
                <span class="msg msg--in">I can share business information, answer common questions and connect you with the team.</span>
                <span class="msg msg--typing"><i></i><i></i><i></i></span>
              </span>
              <span class="chat__input">Type a message…</span></span>`}
          </button>
          <div class="ai__info">
            ${kicker(p)}
            <h3 class="viewer__name">${esc(p.name)}</h3>
            <p class="viewer__desc">${esc(p.description)}</p>
            <dl class="facts facts--stack">
              ${p.problem ? `<dt>Problem</dt><dd>${esc(p.problem)}</dd>` : ''}
              ${p.solution ? `<dt>Solution</dt><dd>${esc(p.solution)}</dd>` : ''}
              <dt>Technology</dt><dd>${esc(toolsOf(p).join(' • '))}</dd>
              ${p.result ? `<dt>Result</dt><dd>${esc(p.result)}</dd>` : ''}
            </dl>
          </div>
        </div>
        <div class="viewer__foot">${viewBtn(p)}</div>
        <div class="ai__caps">
          <p class="eyebrow">What I build</p>
          <ul class="tags"><li>Website chatbots</li><li>Customer support bots</li><li>WhatsApp-based solutions</li><li>API integrations</li><li>Automation</li></ul>
        </div>
      </div>`;
    }
  };

  function mountViewer(cat) {
    const mount = $(`[data-mount="${cat}"]`);
    if (!mount) return;
    const list = byCat(cat);
    if (!list.length) {
      mount.innerHTML = `<p class="empty">Projects for this category will appear here. Add them in projects/projects.js.</p>`;
      return;
    }
    vState[cat] = ((vState[cat] % list.length) + list.length) % list.length;
    mount.innerHTML = RENDER[cat](list[vState[cat]], vState[cat], list);
    hookImages(mount);
  }
  function swapViewer(cat, idx) {
    const mount = $(`[data-mount="${cat}"]`);
    if (!mount) return;
    vState[cat] = idx;
    mount.classList.add('is-swap');
    setTimeout(() => { mountViewer(cat); mount.classList.remove('is-swap'); }, reduceMotion ? 0 : 170);
  }

  /* ---------- case study (page 09) ---------- */
  const STAGES = [
    ['challenge', 'Challenge', 'What problem did the client or brief present? Describe the goal, the audience and the constraints.'],
    ['concept', 'Concept', 'Explain the idea and direction: research, references and the thinking behind the solution.'],
    ['design', 'Design', 'Show the visual system: typography, colour, layout, logo or interface decisions.'],
    ['development', 'Development', 'Describe how the design was built: tools, code structure, responsiveness, integrations or production steps.'],
    ['result', 'Final Result', 'Show the final delivered work and what it did for the client. Only include results that are real and verifiable.']
  ];
  let caseId = (PROJECTS[0] || {}).id;
  let caseStage = 0;

  function mountCaseShell() {
    const mount = $('[data-mount="case"]');
    if (!mount) return;
    if (!PROJECTS.length) { mount.innerHTML = `<p class="empty">Add a project in projects/projects.js to show its case study here.</p>`; return; }
    mount.innerHTML = `
      <div class="case">
        <label class="select"><span class="eyebrow">Choose a project</span>
          <select id="caseSelect" data-action="case-select">
            ${PROJECTS.map(p => `<option value="${esc(p.id)}">${esc(CATS[p.category] ? CATS[p.category].label : '')} — ${esc(p.name)} (${esc(p.type)})</option>`).join('')}
          </select>
        </label>
        <div id="caseBody"></div>
      </div>`;
    renderCase();
  }
  function renderCase() {
    const body = $('#caseBody');
    if (!body) return;
    const p = findProject(caseId) || PROJECTS[0];
    const cs = p.caseStudy || {};
    const key = STAGES[caseStage][0];
    const img = cs.images && cs.images[key] ? Object.assign({}, p, { image: cs.images[key] }) : p;
    $('#caseSelect').value = p.id;
    body.innerHTML = `
      <div class="case__media">${shot(img, 'Case study image · 1600 × 820 px')}</div>
      <div class="case__tabs" role="tablist" aria-label="Case study stages">
        ${STAGES.map((s, n) => `<button class="case__tab" type="button" role="tab" id="tab-${s[0]}" aria-selected="${n === caseStage}" tabindex="${n === caseStage ? 0 : -1}" data-action="stage" data-idx="${n}"><span>${pad(n + 1)}</span><em>${esc(s[1])}</em></button>`).join('')}
      </div>
      <div class="case__panel" role="tabpanel" aria-labelledby="tab-${key}">
        <span class="case__no">${pad(caseStage + 1)} — ${esc(STAGES[caseStage][1])}</span>
        <h3>${esc(STAGES[caseStage][1])}</h3>
        <p>${esc(cs[key] || STAGES[caseStage][2])}</p>
      </div>`;
    hookImages(body);
  }
  function openCase(id) {
    caseId = id; caseStage = 0;
    renderCase();
    closeModal(true);
    goPage(9);
  }

  /* ---------- delegated clicks inside the book ---------- */
  book.addEventListener('click', e => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;
    if (a === 'view') { e.stopPropagation(); openModal(t.dataset.id, t); }
    else if (a === 'step') {
      const cat = t.dataset.cat, n = byCat(cat).length;
      swapViewer(cat, (vState[cat] + (+t.dataset.dir) + n) % n);
    }
    else if (a === 'pick') swapViewer(t.dataset.cat, +t.dataset.idx);
    else if (a === 'stage') { caseStage = +t.dataset.idx; renderCase(); const nt = $(`#tab-${STAGES[caseStage][0]}`); if (nt) nt.focus(); }
  });
  book.addEventListener('change', e => {
    if (e.target.matches('[data-action="case-select"]')) { caseId = e.target.value; caseStage = 0; renderCase(); }
  });
  book.addEventListener('keydown', e => {
    const tab = e.target.closest && e.target.closest('[role="tab"]');
    if (!tab) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      caseStage = (caseStage + (e.key === 'ArrowRight' ? 1 : STAGES.length - 1)) % STAGES.length;
      renderCase();
      const nt = $(`#tab-${STAGES[caseStage][0]}`); if (nt) nt.focus();
    }
  });

  /* =====================================================================
     PROJECT MODAL
     ===================================================================== */
  const modalMedia = $('#modalMedia'), modalBody = $('#modalBody');
  let lastFocus = null;

  function openModal(id, trigger) {
    const p = findProject(id);
    if (!p) return;
    lastFocus = trigger || document.activeElement;
    const hasImg = !!safeUrl(p.image);
    modalMedia.className = 'modal__media' + (hasImg ? ' zoomable' : '');
    modalMedia.innerHTML = hasImg ? shot(p) : ph('Project image', 'Add your image in projects/projects.js');
    hookImages(modalMedia);

    const live = safeUrl(p.liveUrl), gh = safeUrl(p.githubUrl);
    const feats = Array.isArray(p.features) ? p.features : [];
    const cat = CATS[p.category] ? CATS[p.category].label : '';
    modalBody.innerHTML = `
      <p class="kicker"><span>${esc(cat)}</span><span>${esc(p.type)}</span><span>${esc(p.year)}</span></p>
      <h2 id="modalTitle">${esc(p.name)}</h2>
      <p class="lead">${esc(p.details || p.description)}</p>
      <dl class="facts">
        <dt>${p.category === 'graphic' ? 'Tools' : 'Technologies'}</dt><dd>${esc(toolsOf(p).join(' • '))}</dd>
        ${feats.length ? `<dt>Features</dt><dd><ul class="featlist">${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul></dd>` : ''}
        ${p.problem ? `<dt>Problem</dt><dd>${esc(p.problem)}</dd>` : ''}
        ${p.solution ? `<dt>Solution</dt><dd>${esc(p.solution)}</dd>` : ''}
        ${p.result ? `<dt>Result</dt><dd>${esc(p.result)}</dd>` : ''}
      </dl>
      <div class="modal__actions">
        ${live ? `<a class="btn btn--gold" href="${esc(live)}" target="_blank" rel="noopener noreferrer">Live Website</a>` : ''}
        ${gh ? `<a class="btn btn--ghost" href="${esc(gh)}" target="_blank" rel="noopener noreferrer">GitHub</a>` : ''}
        <button class="btn btn--solid" type="button" data-case="${esc(p.id)}">Read case study</button>
      </div>`;
    modal.hidden = false;
    modalOpen = true;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    $('.modal__close', modal).focus();
  }
  function closeModal(skipFocus) {
    if (!modalOpen) return;
    modalOpen = false;
    modal.classList.remove('is-open');
    setTimeout(() => { if (!modalOpen) modal.hidden = true; }, reduceMotion ? 0 : 320);
    if (!skipFocus && lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function handleModalKeys(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled])', modal).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  modal.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    const c = e.target.closest('[data-case]');
    if (c) { openCase(c.dataset.case); return; }
    if (e.target.closest('.modal__media.zoomable')) modalMedia.classList.toggle('is-zoomed');
  });
  modalMedia.addEventListener('mousemove', e => {
    if (!modalMedia.classList.contains('is-zoomed')) return;
    const r = modalMedia.getBoundingClientRect();
    modalMedia.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    modalMedia.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });

  /* =====================================================================
     CONTACT + PORTRAIT WIRING
     ===================================================================== */
  function wireProfile() {
    const val = k => String(PROFILE[k] || '').trim();
    const links = {
      email: val('email') && { href: 'mailto:' + val('email'), text: val('email') },
      whatsapp: val('whatsapp') && { href: 'https://wa.me/' + val('whatsapp').replace(/\D/g, ''), text: val('whatsapp') },
      linkedin: val('linkedin') && { href: safeUrl(val('linkedin')), text: val('linkedin').replace(/^https?:\/\/(www\.)?/, '') },
      github: val('github') && { href: safeUrl(val('github')), text: val('github').replace(/^https?:\/\/(www\.)?/, '') },
      website: val('website') && { href: safeUrl(val('website')), text: val('website').replace(/^https?:\/\/(www\.)?/, '') }
    };
    const external = h => /^https?:/i.test(h);
    $$('[data-contact]').forEach(el => {
      const d = links[el.dataset.contact];
      if (!d || !d.href) return;
      el.textContent = d.text; el.href = d.href; el.classList.remove('is-placeholder');
      if (external(d.href)) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    });
    $$('[data-contact-btn]').forEach(el => {
      const d = links[el.dataset.contactBtn];
      if (d && d.href) {
        el.href = d.href;
        if (external(d.href)) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
      } else {
        el.classList.add('is-placeholder');
        el.setAttribute('aria-disabled', 'true');
        el.title = 'Add this link in projects/projects.js';
        el.addEventListener('click', e => e.preventDefault());
      }
    });
    const portrait = safeUrl(PROFILE.portrait);
    if (portrait) $$('.portrait img').forEach(img => { img.src = portrait; });
  }

  /* =====================================================================
     CURSOR FOLLOWER (desktop only)
     ===================================================================== */
  function initCursor() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || reduceMotion) return;
    const c = $('#cursor'), label = $('.cursor__label', c);
    let x = -100, y = -100, cx = x, cy = y, shown = false;
    addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; cx = x; cy = y; c.classList.add('is-on'); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => { c.classList.remove('is-on'); shown = false; });
    document.addEventListener('mouseover', e => {
      const t = e.target;
      let cls = '', text = '';
      if (t.closest('.zone--next')) { cls = 'is-label'; text = state === 0 ? 'Open' : 'Next'; }
      else if (t.closest('.zone--prev')) { cls = 'is-label'; text = 'Back'; }
      else if (t.closest('.viewer__media, .browser, .phone, .modal__media.zoomable')) { cls = 'is-label'; text = 'View'; }
      else if (t.closest('a, button, select, .thumb')) cls = 'is-link';
      c.classList.remove('is-label', 'is-link');
      if (cls) c.classList.add(cls);
      label.textContent = text;
    });
    (function loop() {
      cx += (x - cx) * .2; cy += (y - cy) * .2;
      c.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* =====================================================================
     INIT
     ===================================================================== */
  ['graphic', 'web', 'ai'].forEach(mountViewer);
  mountCaseShell();
  wireProfile();
  hookImages(source);
  initCursor();

  state = 0;
  layout();                                    // builds the book in the right mode
  if (startPage > 1) { state = pageToState(startPage); build(mode); }

  let resizeT;
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 120); });
  addEventListener('orientationchange', () => setTimeout(layout, 200));

  /* loader -> reveal */
  const loader = $('#loader');
  const minWait = new Promise(r => setTimeout(r, reduceMotion ? 0 : 1250));
  const loaded = new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r)));
  const fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  const cap = new Promise(r => setTimeout(r, 4000));
  Promise.race([Promise.all([minWait, loaded, fonts]), cap]).then(() => {
    loader.classList.add('is-done');
    book.classList.add('is-ready');
    setTimeout(() => loader.remove(), 900);
  });
})();
