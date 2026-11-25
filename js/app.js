/* PinSketch — editor & UI */
'use strict';

const SVGNS = 'http://www.w3.org/2000/svg';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const WIRE_COLORS = ['#dc2626', '#3f3f46', '#2563eb', '#16a34a', '#eab308', '#f97316', '#9333ea', '#e5e7eb', '#0891b2', '#db2777'];
const CAT_ORDER = ['Boards', 'Microcontrollers', 'Power', 'Inputs', 'Outputs', 'Displays', 'Logic Gates', 'ICs', 'Passive', 'Misc'];

function boxOf(c) {
  const d = PARTS[c.type];
  const b = typeof d.box === 'function' ? d.box(c) : (d.box || [-20, -20, 20, 20]);
  const pts = [[b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]].map(([x, y]) => rotPt(x, y, c.rot || 0));
  const xs = pts.map(p => p[0] + c.x * G), ys = pts.map(p => p[1] + c.y * G);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
function stateText(n) {
  if (!n) return '<span class="st-z">floating (not connected to a source)</span>';
  if (n.v === 'X') return '<span class="st-x">SHORT CIRCUIT! (HIGH and LOW connected)</span>';
  const weak = n.s === 1 ? ' <i>(via resistor / pull-up)</i>' : '';
  if (n.v === 1) return `<span class="st-hi">HIGH (1)${n.lvl > 0 && n.lvl < 1 ? ' · ' + Math.round(n.lvl * 100) + '%' : ''}</span>${weak}`;
  if (n.lvl > 0) return `<span class="st-hi">analog ${Math.round(n.lvl * 100)}%</span>`;
  return `<span class="st-lo">LOW (0)</span>${weak}`;
}

class App {
  constructor(level) {
    this.level = level;
    this.adv = level === 'advanced';
    this.circ = new Circuit();
    this.solver = new Solver(this.circ);
    this.view = { x: 80, y: 80, s: 1 };
    this.sel = null;
    this.wireColor = this.adv ? '#2563eb' : '#f97316';
    this.showLevels = !this.adv;
    this.showFlow = true;
    this.undoStack = []; this.redoStack = [];
    this.mcus = new Map();
    this.dirty = true; this.needVis = true;
    this.els = new Map(); this.pinEls = new Map(); this.wireEls = new Map();
    this.drag = null; this.hoverKey = null;
    this.demoId = null;
    this.storeKey = 'pinsketch-' + level;
    this.buildUI();
    this.bindEvents();
    this.loadInitial();
    requestAnimationFrame(() => this.frame());
  }

  /* ======================= UI construction ======================= */
  buildUI() {
    const adv = this.adv;
    $('#app').innerHTML = `
    <header class="topbar">
      <a class="brand" href="index.html"><span class="logo">⚡</span><span>Pin<b>Sketch</b></span></a>
      <nav class="levels">
        <a href="beginner.html" class="${adv ? '' : 'active'}">🟢 Beginner</a>
        <a href="advanced.html" class="${adv ? 'active' : ''}">🔴 Advanced</a>
      </nav>
      <div class="grow"></div>
      <span id="simStatus" class="simstatus">● Live simulation</span>
      <a class="tbtn tlink" href="tutorials.html">🎬 Tutorials</a>
      <button class="tbtn" id="btnHelp">❔ Help</button>
    </header>
    <div class="toolbar">
      <button class="tbtn mobile-only" id="btnLeft">☰ Parts</button>
      <button class="tbtn" data-cmd="undo" title="Undo (Ctrl+Z)">↶</button>
      <button class="tbtn" data-cmd="redo" title="Redo (Ctrl+Y)">↷</button>
      <span class="sep"></span>
      <button class="tbtn" data-cmd="rotate" title="Rotate selected (R)">⟳ Rotate</button>
      <button class="tbtn" data-cmd="delete" title="Delete selected (Del)">🗑 Delete</button>
      <button class="tbtn" data-cmd="clear" title="Remove everything">✖ Clear</button>
      <span class="sep"></span>
      <span class="lbl">Wire</span><div class="swatches" id="swatches">${WIRE_COLORS.map(c => `<button class="sw" data-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
      <label class="chk" title="Color wires by logic level: red = HIGH, blue = LOW"><input type="checkbox" id="chkLevels" ${this.showLevels ? 'checked' : ''}> Signal colors</label>
      <label class="chk" title="Animate the current flowing through the circuit (from + to −)"><input type="checkbox" id="chkFlow" checked> Current flow</label>
      <span class="sep"></span>
      <button class="tbtn" data-cmd="zoomout" title="Zoom out">−</button>
      <span id="zoomLbl" class="lbl zl">100%</span>
      <button class="tbtn" data-cmd="zoomin" title="Zoom in">+</button>
      <button class="tbtn" data-cmd="fit" title="Fit circuit to screen">⤢ Fit</button>
      <span class="sep"></span>
      <button class="tbtn" data-cmd="export" title="Download circuit as a file">💾 Save</button>
      <button class="tbtn" data-cmd="import" title="Open a circuit file">📂 Open</button>
      ${adv ? `<span class="sep"></span><button class="tbtn run" data-cmd="runall" title="Upload & run code on all boards">▶ Run code</button><button class="tbtn stop" data-cmd="stopall">■ Stop</button>` : ''}
      <div class="grow"></div>
      <button class="tbtn mobile-only" id="btnRight">ℹ Panel</button>
      <input type="file" id="fileIn" accept=".json,application/json" hidden>
    </div>
    <div class="main">
      <aside class="left" id="leftPane">
        <div class="tabs"><button data-ltab="parts" class="active">🧩 Parts</button><button data-ltab="demos">🎓 Demos</button></div>
        <div class="lpane active" data-lpane="parts">
          <input class="search" id="partSearch" placeholder="Search parts…">
          <div id="palette"></div>
          <p class="hint small">Drag a part onto the canvas, or click it to add.</p>
        </div>
        <div class="lpane" data-lpane="demos"><div id="demoList"></div></div>
      </aside>
      <section class="stage" id="stage">
        <svg id="svg" tabindex="0">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glow2" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
            <pattern id="dots" width="${G}" height="${G}" patternUnits="userSpaceOnUse" x="-${G / 2}" y="-${G / 2}"><circle cx="${G / 2}" cy="${G / 2}" r="1.1" class="dot"/></pattern>
          </defs>
          <g id="vp">
            <rect x="-20000" y="-20000" width="40000" height="40000" fill="url(#dots)" class="bgrect"/>
            <g id="layBottom"></g><g id="layComps"></g><g id="layWires"></g><g id="layFlow"></g><g id="layHi"></g><g id="layPins"></g><g id="layTop"></g>
          </g>
        </svg>
        <div id="tip" class="tip"></div>
        <div id="banner" class="banner"></div>
        <div id="flowLegend" class="flowlegend"><span><i class="fl-cur"></i>current (+ → −)</span><span><i class="fl-sig"></i>logic signal</span></div>
        <div class="stagehint" id="stageHint">Drag empty space to pan · scroll to zoom · drag from a pin to draw a wire · <kbd>R</kbd> rotate · <kbd>Del</kbd> delete</div>
      </section>
      <aside class="right" id="rightPane">
        <div class="tabs" id="rtabs">
          <button data-rtab="lesson" class="active">📘 Lesson</button>
          <button data-rtab="props">⚙ Properties</button>
          ${adv ? '<button data-rtab="code">💻 Code</button><button data-rtab="serial">📟 Serial<span class="badge" id="serBadge"></span></button><button data-rtab="wifi">📶 Wi-Fi</button>' : ''}
          <button data-rtab="truth">🔢 Truth table</button>
        </div>
        <div class="rpane active" data-rpane="lesson"><div id="lesson" class="lesson"></div></div>
        <div class="rpane" data-rpane="props"><div id="props"></div></div>
        ${adv ? `
        <div class="rpane" data-rpane="code">
          <div class="coderow"><select id="boardSel"></select>
            <button class="tbtn run" id="btnRun">▶ Upload &amp; Run</button><button class="tbtn stop" id="btnStop">■</button></div>
          <div class="editor"><pre id="gutter" class="gutter"></pre><textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea></div>
          <p class="hint small">Arduino C++ is translated in the browser. Supported: pinMode, digitalWrite/Read, analogRead/Write, delay, millis, Serial, LiquidCrystal_I2C, ESP8266WiFi, ESP8266WebServer, and more.</p>
        </div>
        <div class="rpane" data-rpane="serial">
          <div class="coderow"><span class="lbl">Serial Monitor</span><div class="grow"></div><label class="chk"><input type="checkbox" id="autoScroll" checked> autoscroll</label><button class="tbtn" id="btnSerClear">Clear</button></div>
          <pre id="serial" class="serial"></pre>
          <div class="coderow"><input id="serIn" class="search" placeholder="Send text to the board…"><button class="tbtn" id="btnSerSend">Send</button></div>
        </div>
        <div class="rpane" data-rpane="wifi">
          <div class="phone">
            <div class="phonebar"><span id="wifiState">📵</span><input id="url" class="url" value="http://0.0.0.0/"><button class="tbtn" id="btnGo">Go</button></div>
            <iframe id="browser" sandbox="allow-scripts allow-forms" title="Virtual browser"></iframe>
          </div>
          <p class="hint small">A virtual phone on the same Wi-Fi network as the ESP8266. Run an ESP8266 web-server sketch and its page appears here.</p>
        </div>` : ''}
        <div class="rpane" data-rpane="truth">
          <p class="small">Lists every combination of the inputs (logic inputs, switches and buttons) and shows the outputs (lamps, bulbs, LEDs). Maximum 6 inputs.</p>
          <button class="tbtn run" id="btnTruth">Generate truth table</button>
          <div id="truth"></div>
        </div>
      </aside>
    </div>
    <div class="modal" id="help"><div class="modalbox">
      <button class="tbtn close" id="helpClose">✕</button>
      <h2>How to use PinSketch</h2>
      <div class="helpgrid">
        <div><h4>🧩 Add parts</h4><p>Drag a part from the left panel onto the canvas, or click it. Load a ready-made circuit from <b>Demos</b>.</p></div>
        <div><h4>🔌 Draw wires</h4><p>Press on a <b>pin</b> or a <b>breadboard hole</b> and drag to another one. Or click a pin, click empty spots to add bends, and click the target pin. <kbd>Esc</kbd> cancels.</p></div>
        <div><h4>✋ Move & edit</h4><p>Drag a part's body to move it. Select it to rotate (<kbd>R</kbd>), delete (<kbd>Del</kbd>), or edit its properties. Drag a selected wire's end handle to re-attach it.</p></div>
        <div><h4>👆 Interact</h4><p>Click switches, DIP sliders and logic inputs. Hold push buttons. Drag a potentiometer knob up or down.</p></div>
        <div><h4>⚡ Current flow</h4><p><span style="color:#fde047">Moving yellow dots</span> show current flowing from + to −. Faster dots mean more current. <span style="color:#e2e8f0">White dashes</span> show a logic signal travelling from an output to the inputs it drives. Turn this on or off with <b>Current flow</b> in the toolbar.</p></div>
        <div><h4>🔍 Inspect</h4><p>Hover a pin or hole to see its state (HIGH, LOW or floating). On a breadboard, connected holes light up green.</p></div>
        <div><h4>💻 Code (Advanced)</h4><p>Select an Arduino or ESP8266, edit the sketch in the <b>Code</b> tab and press <b>▶ Run</b>. Output appears in <b>Serial</b>, and web pages in <b>Wi-Fi</b>.</p></div>
      </div>
      <p class="small">Your work is saved in this browser automatically. Use <b>Save</b> / <b>Open</b> to keep circuit files. Shortcuts: <kbd>Ctrl</kbd>+<kbd>Z</kbd> undo, <kbd>Ctrl</kbd>+<kbd>Y</kbd> redo, <kbd>Ctrl</kbd>+<kbd>D</kbd> duplicate.</p>
      <p class="small muted">Simplified model: logic levels are HIGH/LOW, unconnected inputs read LOW (real TTL chips float HIGH, so always tie unused inputs in real life), and bulbs and LEDs light when a current path exists from + to −.</p>
    </div></div>`;
    this.svg = $('#svg'); this.vp = $('#vp');
    this.layBottom = $('#layBottom'); this.layComps = $('#layComps'); this.layWires = $('#layWires');
    this.layHi = $('#layHi'); this.layFlow = $('#layFlow'); this.layPins = $('#layPins'); this.layTop = $('#layTop');
    this.tip = $('#tip'); this.banner = $('#banner');
    this.buildPalette();
    this.buildDemoList();
    this.markSwatch();
  }

  buildPalette(filter) {
    const f = (filter || '').toLowerCase();
    const groups = {};
    for (const t in PARTS) {
      const d = PARTS[t];
      if (!this.adv && d.level === 'advanced') continue;
      if (f && !(d.name.toLowerCase().includes(f) || d.cat.toLowerCase().includes(f) || (d.short || '').toLowerCase().includes(f))) continue;
      (groups[d.cat] = groups[d.cat] || []).push(t);
    }
    let h = '';
    for (const cat of CAT_ORDER) {
      if (!groups[cat]) continue;
      h += `<div class="pcat"><div class="pcat-h">${cat}</div><div class="pgrid">`;
      for (const t of groups[cat]) {
        const d = PARTS[t];
        const c = { id: 'pv', type: t, x: 0, y: 0, rot: 0, props: clone(d.defaults || {}), st: {}, vis: {} };
        if (d.init) d.init(c);
        if (t === 'breadboard') c.props.cols = 30;
        const b = typeof d.box === 'function' ? d.box(c) : (d.box || [-20, -20, 20, 20]);
        let inner = '';
        try { inner = d.draw(c); } catch (e) { inner = ''; }
        h += `<div class="pitem" draggable="true" data-type="${t}" title="${esc(d.name)}">
          <svg viewBox="${b[0] - 6} ${b[1] - 6} ${b[2] - b[0] + 12} ${b[3] - b[1] + 12}" preserveAspectRatio="xMidYMid meet">${inner}${pinsOf(c).map(p => `<circle cx="${p.x * G}" cy="${p.y * G}" r="3" class="pindot"/>`).join('')}</svg>
          <span>${esc(d.short || d.name)}</span></div>`;
      }
      h += '</div></div>';
    }
    $('#palette').innerHTML = h || '<p class="small muted">No parts match.</p>';
  }

  buildDemoList() {
    const list = DEMOS.filter(d => d.level === this.level);
    const groupOf = d => !this.adv ? (d.id.match(/b-(simple|series|bell)/) ? 'Electricity basics' : 'Logic gates & displays')
      : d.id.startsWith('u-') ? 'Arduino UNO' : d.id.startsWith('e-') ? 'ESP8266 (Wi-Fi)' : 'Breadboard & logic ICs';
    let h = '', last = '';
    for (const d of list) {
      const g = groupOf(d);
      if (g !== last) { h += `<div class="dgroup">${g}</div>`; last = g; }
      const hasVid = typeof VIDEOS !== 'undefined' && VIDEOS.some(x => x.id === d.id);
      h += `<button class="demo" data-demo="${d.id}"><b>${esc(d.title)}${hasVid ? ' <i class="vbadge" title="Has a video tutorial">🎬</i>' : ''}</b><span>${esc(d.desc)}</span></button>`;
    }
    h += `<div class="dgroup">Your own</div><button class="demo" data-demo="__blank"><b>✚ Blank canvas</b><span>${this.adv ? 'Start with an empty breadboard' : 'Start from scratch'}</span></button>`;
    $('#demoList').innerHTML = h;
  }

  /* ======================= events ======================= */
  bindEvents() {
    const svg = this.svg;
    svg.addEventListener('pointerdown', e => this.onDown(e));
    window.addEventListener('pointermove', e => this.onMove(e));
    window.addEventListener('pointerup', e => this.onUp(e));
    svg.addEventListener('wheel', e => this.onWheel(e), { passive: false });
    svg.addEventListener('contextmenu', e => { e.preventDefault(); if (this.drag && this.drag.type === 'wire') this.cancelWire(); });
    svg.addEventListener('pointerleave', () => { if (!this.drag) this.clearHover(); });
    window.addEventListener('keydown', e => this.onKey(e));
    window.addEventListener('resize', () => this.applyView());

    $('.toolbar').addEventListener('click', e => {
      const b = e.target.closest('[data-cmd]'); if (b) this.cmd(b.dataset.cmd);
      const s = e.target.closest('.sw'); if (s) this.setWireColor(s.dataset.color);
    });
    $('#chkLevels').addEventListener('change', e => { this.showLevels = e.target.checked; this.renderWires(); });
    $('#chkFlow').addEventListener('change', e => { this.showFlow = e.target.checked; this._flowSig = null; this.renderFlow(); });
    $('#btnHelp').addEventListener('click', () => $('#help').classList.add('open'));
    $('#helpClose').addEventListener('click', () => $('#help').classList.remove('open'));
    $('#help').addEventListener('click', e => { if (e.target.id === 'help') $('#help').classList.remove('open'); });
    $('#btnLeft').addEventListener('click', () => { $('#leftPane').classList.toggle('open'); $('#rightPane').classList.remove('open'); });
    $('#btnRight').addEventListener('click', () => { $('#rightPane').classList.toggle('open'); $('#leftPane').classList.remove('open'); });
    $('#fileIn').addEventListener('change', e => this.importFile(e));

    // tabs
    $$('[data-ltab]').forEach(b => b.addEventListener('click', () => this.leftTab(b.dataset.ltab)));
    $$('[data-rtab]').forEach(b => b.addEventListener('click', () => this.rightTab(b.dataset.rtab)));

    // palette
    const pal = $('#palette');
    pal.addEventListener('dragstart', e => { const it = e.target.closest('.pitem'); if (it) { e.dataTransfer.setData('text/plain', it.dataset.type); e.dataTransfer.effectAllowed = 'copy'; } });
    pal.addEventListener('click', e => { const it = e.target.closest('.pitem'); if (it) this.addPartAtCenter(it.dataset.type); });
    $('#partSearch').addEventListener('input', e => this.buildPalette(e.target.value));
    const stage = $('#stage');
    stage.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
    stage.addEventListener('drop', e => {
      e.preventDefault();
      const t = e.dataTransfer.getData('text/plain'); if (!PARTS[t]) return;
      const p = this.world(e);
      this.addPart(t, Math.round(p.x / G), Math.round(p.y / G));
    });
    $('#demoList').addEventListener('click', e => { const b = e.target.closest('[data-demo]'); if (b) this.loadDemo(b.dataset.demo); });

    // truth table
    $('#btnTruth').addEventListener('click', () => this.truthTable());

    if (this.adv) {
      $('#boardSel').addEventListener('change', () => this.showCode());
      const ta = $('#code');
      ta.addEventListener('input', () => {
        const c = this.codeComp(); if (c) { c.props.code = ta.value; this.saveSoon(); }
        this.updateGutter();
      });
      ta.addEventListener('scroll', () => { $('#gutter').scrollTop = ta.scrollTop; });
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
        if (e.key === 'Enter') { // keep indentation
          const s = ta.selectionStart, line = ta.value.slice(ta.value.lastIndexOf('\n', s - 1) + 1, s);
          let ind = (line.match(/^\s*/) || [''])[0]; if (/\{\s*$/.test(line)) ind += '  ';
          e.preventDefault(); ta.setRangeText('\n' + ind, s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input'));
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); this.runBoard(this.codeComp()); }
      });
      $('#btnRun').addEventListener('click', () => this.runBoard(this.codeComp()));
      $('#btnStop').addEventListener('click', () => this.stopBoard(this.codeComp()));
      $('#btnSerClear').addEventListener('click', () => { $('#serial').innerHTML = ''; });
      const send = () => { const v = $('#serIn').value; for (const m of this.mcus.values()) if (m.alive) m.serialIn += v + '\n'; this.serialWrite(null, '» ' + v + '\n', 'sent'); $('#serIn').value = ''; };
      $('#btnSerSend').addEventListener('click', send);
      $('#serIn').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
      $('#btnGo').addEventListener('click', () => this.navigate($('#url').value));
      $('#url').addEventListener('keydown', e => { if (e.key === 'Enter') this.navigate($('#url').value); });
      window.addEventListener('message', e => {
        const fr = $('#browser');
        if (fr && e.source === fr.contentWindow && e.data && typeof e.data.espNav === 'string') this.navigate(e.data.espNav);
      });
    }
  }

  leftTab(t) {
    $$('[data-ltab]').forEach(b => b.classList.toggle('active', b.dataset.ltab === t));
    $$('[data-lpane]').forEach(p => p.classList.toggle('active', p.dataset.lpane === t));
  }
  rightTab(t) {
    $$('[data-rtab]').forEach(b => b.classList.toggle('active', b.dataset.rtab === t));
    $$('[data-rpane]').forEach(p => p.classList.toggle('active', p.dataset.rpane === t));
    this.rtab = t;
    if (t === 'code') this.showCode();
    if (t === 'serial') { const bd = $('#serBadge'); if (bd) bd.textContent = ''; }
    if (t === 'props') this.renderProps();
  }

  cmd(c) {
    switch (c) {
      case 'undo': this.doUndo(); break;
      case 'redo': this.doRedo(); break;
      case 'rotate': this.rotateSel(); break;
      case 'delete': this.deleteSel(); break;
      case 'clear':
        if (!confirm('Remove all parts and wires?')) return;
        this.pushUndo(); this.stopAll(); this.circ.load({ comps: [], wires: [] });
        if (this.adv) this.circ.addComp('breadboard', 0, 0, { cols: 30 });
        this.demoId = null; this.select(null); this.renderAll(); this.changed(); break;
      case 'zoomin': this.zoomAt(1.25); break;
      case 'zoomout': this.zoomAt(0.8); break;
      case 'fit': this.fit(); break;
      case 'export': this.exportFile(); break;
      case 'import': $('#fileIn').click(); break;
      case 'runall': this.runAll(); break;
      case 'stopall': this.stopAll(); break;
    }
  }

  setWireColor(col) {
    this.wireColor = col; this.markSwatch();
    if (this.sel && this.sel.wire) { this.pushUndo(); this.sel.wire.color = col; this.renderWire(this.sel.wire); this.changed(); }
  }
  markSwatch() { $$('.sw').forEach(s => s.classList.toggle('active', s.dataset.color === this.wireColor)); }

  /* ======================= view ======================= */
  world(e) {
    const r = this.svg.getBoundingClientRect();
    return { x: (e.clientX - r.left - this.view.x) / this.view.s, y: (e.clientY - r.top - this.view.y) / this.view.s };
  }
  applyView() {
    this.vp.setAttribute('transform', `translate(${this.view.x},${this.view.y}) scale(${this.view.s})`);
    $('#zoomLbl').textContent = Math.round(this.view.s * 100) + '%';
  }
  zoomAt(f, cx, cy) {
    const r = this.svg.getBoundingClientRect();
    if (cx === undefined) { cx = r.width / 2; cy = r.height / 2; }
    const s = Math.max(0.2, Math.min(4, this.view.s * f));
    const k = s / this.view.s;
    this.view.x = cx - (cx - this.view.x) * k; this.view.y = cy - (cy - this.view.y) * k; this.view.s = s;
    this.applyView();
  }
  onWheel(e) {
    e.preventDefault();
    const r = this.svg.getBoundingClientRect();
    this.zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
  }
  fit() {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of this.circ.comps) { const b = boxOf(c); x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); }
    for (const w of this.circ.wires) for (const p of w.pts) { x0 = Math.min(x0, p[0] * G); y0 = Math.min(y0, p[1] * G); x1 = Math.max(x1, p[0] * G); y1 = Math.max(y1, p[1] * G); }
    const r = this.svg.getBoundingClientRect();
    if (!isFinite(x0) || r.width < 10) { this.view = { x: 80, y: 80, s: 1 }; this.applyView(); return; }
    const pad = 40;
    const s = Math.max(0.25, Math.min(1.6, Math.min((r.width - 2 * pad) / (x1 - x0 || 1), (r.height - 2 * pad) / (y1 - y0 || 1))));
    this.view = { s, x: (r.width - (x1 - x0) * s) / 2 - x0 * s, y: (r.height - (y1 - y0) * s) / 2 - y0 * s };
    this.applyView();
  }

  /* ======================= rendering ======================= */
  byId(id) { return this.circ.comps.find(c => c.id === id) || this.circ.wires.find(w => w.id === id); }
  visKey(c) {
    const p = c.props.code !== undefined ? Object.assign({}, c.props, { code: 0 }) : c.props;
    return JSON.stringify(c.vis || 0) + JSON.stringify(p) + (c.st.pressed ? 1 : 0) + (c.st.v ? 1 : 0) + (c.rot || 0);
  }
  renderAll() {
    this.layFlow.innerHTML = ''; this._flowSig = null;
    this.layBottom.innerHTML = ''; this.layComps.innerHTML = ''; this.layWires.innerHTML = ''; this.layPins.innerHTML = ''; this.layHi.innerHTML = ''; this.layTop.innerHTML = '';
    this.els.clear(); this.pinEls.clear(); this.wireEls.clear();
    this.solve();
    for (const c of this.circ.comps) this.renderComp(c);
    for (const w of this.circ.wires) this.renderWire(w);
    this.applyView();
  }
  renderComp(c) {
    const d = PARTS[c.type];
    let g = this.els.get(c.id);
    if (!g) {
      g = document.createElementNS(SVGNS, 'g'); g.classList.add('comp'); g.dataset.id = c.id;
      (d.layer === 'bottom' ? this.layBottom : this.layComps).appendChild(g); this.els.set(c.id, g);
    }
    g.setAttribute('transform', `translate(${c.x * G},${c.y * G}) rotate(${(c.rot || 0) * 90})`);
    let inner;
    try { inner = d.draw(c); } catch (e) { inner = `<text fill="red">${esc(e.message)}</text>`; }
    g.innerHTML = inner + pinsOf(c).map(p => `<circle class="pindot" cx="${p.x * G}" cy="${p.y * G}" r="2.6"/>`).join('');
    g.classList.toggle('selected', !!(this.sel && this.sel.comp === c));
    c._vk = this.visKey(c);
    this.renderPins(c);
  }
  renderPins(c) {
    let g = this.pinEls.get(c.id);
    const pins = pinsOf(c);
    if (!pins.length) return;
    if (!g) { g = document.createElementNS(SVGNS, 'g'); g.classList.add('pins'); g.dataset.id = c.id; this.layPins.appendChild(g); this.pinEls.set(c.id, g); }
    g.innerHTML = pins.map(p => { const [x, y] = pinWorld(c, p); return `<circle class="pin" data-pin="${esc(p.n)}" cx="${x * G}" cy="${y * G}" r="7"/>`; }).join('');
  }
  moveCompEl(c) {
    const g = this.els.get(c.id);
    if (g) g.setAttribute('transform', `translate(${c.x * G},${c.y * G}) rotate(${(c.rot || 0) * 90})`);
    this.renderPins(c);
  }
  removeEls(obj) {
    for (const m of [this.els, this.pinEls, this.wireEls]) { const el = m.get(obj.id); if (el) { el.remove(); m.delete(obj.id); } }
  }
  wirePath(w) {
    const P = w.pts.map(p => [p[0] * G, p[1] * G]);
    if (P.length === 2 && this.adv) {
      const [a, b] = P, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
      if (len > 2.5 * G) {
        let nx = -dy / len, ny = dx / len; if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
        const off = Math.min(46, len * 0.14);
        const mx = (a[0] + b[0]) / 2 + nx * off, my = (a[1] + b[1]) / 2 + ny * off;
        return `M${a[0]},${a[1]} Q${mx.toFixed(1)},${my.toFixed(1)} ${b[0]},${b[1]}`;
      }
    }
    return 'M' + P.map(p => p.join(',')).join(' L');
  }
  wireColorNow(w) {
    if (!this.showLevels) return w.color;
    const S = this.solver;
    if (!S.uf) return '#64748b';
    const n = S.vals.get(S.uf.find(pkey(w.pts[0][0], w.pts[0][1])));
    if (!n) return '#64748b';
    if (n.v === 'X') return '#e879f9';
    if (n.v === 1) return n.lvl < 1 ? '#fb923c' : '#ef4444';
    if (n.lvl > 0) return '#fb923c';
    return '#3b82f6';
  }
  renderWire(w) {
    let g = this.wireEls.get(w.id);
    if (!g) { g = document.createElementNS(SVGNS, 'g'); g.classList.add('wire'); g.dataset.id = w.id; this.layWires.appendChild(g); this.wireEls.set(w.id, g); }
    const d = this.wirePath(w), col = this.wireColorNow(w), sel = this.sel && this.sel.wire === w;
    const a = w.pts[0], b = w.pts[w.pts.length - 1];
    g.classList.toggle('selected', !!sel);
    g.innerHTML = `<path class="wire-hit" d="${d}"/><path class="wire-out" d="${d}"/><path class="wire-col" d="${d}" stroke="${col}"/>
      <circle class="wend" cx="${a[0] * G}" cy="${a[1] * G}" r="3.6" fill="${col}"/><circle class="wend" cx="${b[0] * G}" cy="${b[1] * G}" r="3.6" fill="${col}"/>`;
    this.renderHandles();
  }
  renderWires() { for (const w of this.circ.wires) this.renderWire(w); }
  /* animated current flow (yellow dots, + → −) and logic signals (white dashes, output → inputs) */
  renderFlow() {
    const S = this.solver, lay = this.layFlow, leg = $('#flowLegend');
    if (!this.showFlow || !S.wireFlow) { if (this._flowSig !== '') { lay.innerHTML = ''; this._flowSig = ''; } if (leg) leg.style.display = 'none'; return; }
    const byId = new Map(this.circ.wires.map(w => [w.id, w]));
    const parts = [];
    for (const [id, f] of S.wireFlow) { const w = byId.get(id); if (w) parts.push(['c', id, f.fwd ? 1 : 0, f.amt, w.pts.join(';')]); }
    for (const [id, f] of S.sigFlow) { const w = byId.get(id); if (w) parts.push(['s', id, f.fwd ? 1 : 0, w.pts.join(';')]); }
    for (const sg of S.flowSegs) parts.push(['g', sg.pts.join(';'), sg.amt]);
    const sig = JSON.stringify(parts);
    if (sig === this._flowSig) return;
    this._flowSig = sig;
    const dur = amt => Math.max(0.3, Math.min(3, 0.75 / Math.max(0.05, amt))).toFixed(2);
    let h = '';
    for (const [id, f] of S.wireFlow) {
      const w = byId.get(id); if (!w) continue;
      const d = this.wirePath({ pts: f.fwd ? w.pts : w.pts.slice().reverse() });
      h += `<path class="flow-o" d="${d}" style="animation-duration:${dur(f.amt)}s"/><path class="flow" d="${d}" style="animation-duration:${dur(f.amt)}s"/>`;
    }
    for (const sg of S.flowSegs) {
      const d = 'M' + sg.pts.map(p => (p[0] * G) + ',' + (p[1] * G)).join(' L');
      h += `<path class="flow-o" d="${d}" style="animation-duration:${dur(sg.amt)}s"/><path class="flow ${sg.kind}" d="${d}" style="animation-duration:${dur(sg.amt)}s"/>`;
    }
    for (const [id, f] of S.sigFlow) {
      const w = byId.get(id); if (!w) continue;
      h += `<path class="sigflow" d="${this.wirePath({ pts: f.fwd ? w.pts : w.pts.slice().reverse() })}"/>`;
    }
    lay.innerHTML = h;
    if (leg) leg.style.display = h ? 'flex' : 'none';
  }
  renderHandles() {
    const w = this.sel && this.sel.wire;
    if (!w) { this.layTop.querySelectorAll('.whandle').forEach(e => e.remove()); return; }
    this.layTop.querySelectorAll('.whandle').forEach(e => e.remove());
    const last = w.pts.length - 1;
    for (const i of [0, last]) {
      const c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('class', 'whandle'); c.setAttribute('cx', w.pts[i][0] * G); c.setAttribute('cy', w.pts[i][1] * G); c.setAttribute('r', 7);
      c.dataset.w = w.id; c.dataset.i = i; this.layTop.appendChild(c);
    }
  }

  /* ======================= simulation loop ======================= */
  markDirty() { this.dirty = true; }
  solve() { this.solver.run(); this.dirty = false; this.needVis = true; }
  ensureSolved() { if (this.dirty) this.solve(); }
  frame() {
    const now = performance.now();
    for (const c of this.circ.comps) {
      if (c.type !== 'clock') continue;
      const per = 500 / (+c.props.hz || 1);
      if (!c.st.next) c.st.next = now + per;
      else if (now >= c.st.next) { c.st.v = !c.st.v; c.st.next = now + per; this.dirty = true; }
    }
    if (this.dirty) this.solve();
    if (this.needVis) this.refreshVisuals();
    requestAnimationFrame(() => this.frame());
  }
  refreshVisuals() {
    this.needVis = false;
    for (const c of this.circ.comps) if (this.visKey(c) !== c._vk) this.renderComp(c);
    if (this.showLevels) for (const w of this.circ.wires) {
      const g = this.wireEls.get(w.id); if (!g) continue;
      const col = this.wireColorNow(w);
      g.querySelectorAll('.wire-col').forEach(p => p.setAttribute('stroke', col));
      g.querySelectorAll('.wend').forEach(p => p.setAttribute('fill', col));
    }
    this.renderFlow();
    const S = this.solver, msgs = [];
    if (S.shorts) msgs.push('⚠ Short circuit! A HIGH and a LOW are connected directly. Check the magenta/red wires.');
    if (S.oscillating) msgs.push('⚠ The circuit is oscillating (an output feeds back into itself).');
    for (const c of this.circ.comps) if (PARTS[c.type].pinNames && c.vis && !c.vis.pw && !msgs.some(m => m.includes('IC'))) msgs.push('ℹ An IC is not powered: connect its VCC pin to + and its GND pin to −.');
    this.banner.innerHTML = msgs.map(m => `<div>${m}</div>`).join('');
    this.banner.style.display = msgs.length ? 'block' : 'none';
    if (this.hoverKey) this.showHoverInfo(this.hoverKey, true);
    const now = performance.now();
    if (this.rtab === 'props' && this.sel && this.sel.comp && (!this._lastPinRefresh || now - this._lastPinRefresh > 250)) { this._lastPinRefresh = now; this.updatePinTable(); }
    const running = [...this.mcus.values()].filter(m => m.alive).length;
    $('#simStatus').innerHTML = '● Live simulation' + (running ? ` · <b>${running} board${running > 1 ? 's' : ''} running</b>` : '');
  }

  /* ======================= pointer handling ======================= */
  snap(p) { return [Math.round(p.x / G), Math.round(p.y / G)]; }
  isConn(g) { return this.solver.connPts.has(pkey(g[0], g[1])); }
  nearConn(p) {
    const g = this.snap(p);
    if (Math.hypot(p.x / G - g[0], p.y / G - g[1]) > 0.45) return null;
    return this.isConn(g) ? g : null;
  }
  onDown(e) {
    if (e.button === 2) return;
    this.svg.focus({ preventScroll: true });
    const p = this.world(e);
    this.ensureSolved();
    if (e.button === 1) { this.drag = { type: 'pan', sx: e.clientX, sy: e.clientY, vx: this.view.x, vy: this.view.y }; return; }
    if (this.drag && this.drag.type === 'wire') { this.wireClick(p); return; }
    const t = e.target;
    const compEl = t.closest('.comp'), comp = compEl ? this.byId(compEl.dataset.id) : null;
    const actEl = t.closest('[data-act]');
    if (actEl && comp) {
      this.select({ comp });
      const d = PARTS[comp.type];
      this.drag = { type: 'act', comp, act: actEl.dataset.act, sx: e.clientX, sy: e.clientY };
      this.afterAct(comp, d.act ? d.act(comp, actEl.dataset.act, 'down', { dx: 0, dy: 0 }) : false);
      e.preventDefault();
      return;
    }
    const pinEl = t.closest('.pin');
    if (pinEl) {
      const c = this.byId(pinEl.parentNode.dataset.id);
      if (c) { this.startWire(pinWorld(c, pinByName(c, pinEl.dataset.pin))); return; }
    }
    const h = t.closest('.whandle');
    if (h) { this.drag = { type: 'wend', w: this.byId(h.dataset.w), i: +h.dataset.i, undone: false }; return; }
    const wEl = t.closest('.wire');
    if (wEl) { this.select({ wire: this.byId(wEl.dataset.id) }); this.drag = { type: 'none' }; return; }
    if (comp && !PARTS[comp.type].isBoard) { this.startCompDrag(comp, p); return; }
    const cp = this.nearConn(p);
    if (cp) { this.startWire(cp); return; }
    if (comp) { this.startCompDrag(comp, p); return; }
    this.select(null);
    this.drag = { type: 'pan', sx: e.clientX, sy: e.clientY, vx: this.view.x, vy: this.view.y };
    this.svg.classList.add('panning');
  }
  onMove(e) {
    const D = this.drag;
    if (!D) { if (e.target && this.svg.contains(e.target)) this.hover(this.world(e)); return; }
    const p = this.world(e);
    switch (D.type) {
      case 'pan':
        this.view.x = D.vx + (e.clientX - D.sx); this.view.y = D.vy + (e.clientY - D.sy); this.applyView(); break;
      case 'comp': {
        const dx = Math.round((p.x - D.px) / G), dy = Math.round((p.y - D.py) / G);
        if (dx === D.ldx && dy === D.ldy) break;
        if (!D.moved) { this.pushUndo(); D.moved = true; this.clearHover(); }
        D.ldx = dx; D.ldy = dy;
        D.comp.x = D.cx + dx; D.comp.y = D.cy + dy; this.moveCompEl(D.comp);
        for (const [c, x0, y0] of D.att.comps) { c.x = x0 + dx; c.y = y0 + dy; this.moveCompEl(c); }
        const touched = new Set();
        for (const [w, i, x0, y0] of D.att.ends) { w.pts[i] = [x0 + dx, y0 + dy]; touched.add(w); }
        for (const w of touched) this.renderWire(w);
        this.dirty = true;
        break;
      }
      case 'wire': {
        const g = this.snap(p);
        if (D.mode === 'press' && (g[0] !== D.pts[0][0] || g[1] !== D.pts[0][1])) D.dragged = true;
        D.cur = g; this.renderPreview(); this.hover(p);
        break;
      }
      case 'wend': {
        const g = this.snap(p), w = D.w;
        if (w.pts[D.i][0] === g[0] && w.pts[D.i][1] === g[1]) break;
        if (!D.undone) { this.pushUndo(); D.undone = true; }
        w.pts[D.i] = g; this.renderWire(w); this.dirty = true; this.hover(p);
        break;
      }
      case 'act': {
        const d = PARTS[D.comp.type];
        if (d.act) this.afterAct(D.comp, d.act(D.comp, D.act, 'move', { dx: e.clientX - D.sx, dy: e.clientY - D.sy }));
        break;
      }
    }
  }
  onUp(e) {
    const D = this.drag;
    this.svg.classList.remove('panning');
    if (!D) return;
    if (D.type === 'act') { const d = PARTS[D.comp.type]; if (d.act) this.afterAct(D.comp, d.act(D.comp, D.act, 'up', {})); this.drag = null; return; }
    if (D.type === 'comp') { if (D.moved) this.changed(); this.drag = null; return; }
    if (D.type === 'wend') {
      const w = D.w, a = w.pts[0], b = w.pts[w.pts.length - 1];
      if (a[0] === b[0] && a[1] === b[1]) { this.circ.remove(w); this.removeEls(w); this.select(null); }
      if (D.undone) this.changed();
      this.drag = null; return;
    }
    if (D.type === 'wire') {
      if (D.mode === 'press') {
        D.mode = 'click';
        if (D.dragged) {
          const g = this.snap(this.world(e));
          if (this.isConn(g)) { D.pts.push(g); this.finishWire(); }
          else if (g[0] !== D.pts[0][0] || g[1] !== D.pts[0][1]) { D.pts.push(g); this.renderPreview(); }
        }
      }
      return;
    }
    this.drag = null;
  }
  afterAct(c, r) {
    if (!r) return;
    if (r === 'props') { this.saveSoon(); if (this.rtab === 'props') this.renderProps(); }
    this.renderComp(c); this.dirty = true;
  }

  startCompDrag(comp, p) {
    this.select({ comp });
    this.drag = { type: 'comp', comp, px: p.x, py: p.y, cx: comp.x, cy: comp.y, ldx: 0, ldy: 0, moved: false, att: this.attachedTo(comp) };
  }
  attachedTo(comp) {
    const S = this.solver, att = { comps: [], ends: [] };
    if (PARTS[comp.type].isBoard) {
      const holes = new Set();
      for (const [k, info] of S.holeInfo) if (info.c === comp) holes.add(k);
      for (const c of this.circ.comps) {
        if (c === comp || PARTS[c.type].isBoard || PARTS[c.type].mcu) continue;
        const ks = Object.values(c._pk || {});
        if (ks.length && ks.every(k => holes.has(k))) att.comps.push([c, c.x, c.y]);
      }
      for (const w of this.circ.wires) for (const i of [0, w.pts.length - 1]) if (holes.has(pkey(...w.pts[i]))) att.ends.push([w, i, w.pts[i][0], w.pts[i][1]]);
    } else {
      const keys = new Set(Object.values(comp._pk || {}).filter(k => !S.holeInfo.has(k)));
      for (const w of this.circ.wires) for (const i of [0, w.pts.length - 1]) if (keys.has(pkey(...w.pts[i]))) att.ends.push([w, i, w.pts[i][0], w.pts[i][1]]);
    }
    return att;
  }

  startWire(pt) {
    this.select(null);
    this.drag = { type: 'wire', mode: 'press', pts: [[pt[0], pt[1]]], cur: [pt[0], pt[1]], dragged: false };
    this.renderPreview();
  }
  wireClick(p) {
    const D = this.drag, g = this.snap(p), last = D.pts[D.pts.length - 1];
    if (g[0] === last[0] && g[1] === last[1]) { if (D.pts.length >= 2) this.finishWire(); return; }
    D.pts.push(g);
    if (this.isConn(g)) this.finishWire(); else this.renderPreview();
  }
  finishWire() {
    const D = this.drag; this.drag = null;
    this.layTop.querySelectorAll('.preview').forEach(e => e.remove());
    if (D.pts.length < 2) return;
    this.pushUndo();
    const w = this.circ.addWire(D.pts, this.wireColor);
    if (!w) return;
    this.dirty = true; this.solve();
    this.renderWire(w); this.changed();
  }
  cancelWire() { this.drag = null; this.layTop.querySelectorAll('.preview').forEach(e => e.remove()); }
  renderPreview() {
    const D = this.drag;
    this.layTop.querySelectorAll('.preview').forEach(e => e.remove());
    const pts = [...D.pts, D.cur];
    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('class', 'preview');
    path.setAttribute('d', 'M' + pts.map(p => (p[0] * G) + ',' + (p[1] * G)).join(' L'));
    path.setAttribute('stroke', this.wireColor);
    this.layTop.appendChild(path);
    const ok = this.isConn(D.cur);
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('class', 'preview ' + (ok ? 'ok' : 'free')); c.setAttribute('cx', D.cur[0] * G); c.setAttribute('cy', D.cur[1] * G); c.setAttribute('r', ok ? 7 : 4);
    this.layTop.appendChild(c);
  }

  /* hover: tooltips + connected-hole highlight */
  hover(p) {
    const g = this.snap(p);
    const near = Math.hypot(p.x / G - g[0], p.y / G - g[1]) <= 0.45 && this.isConn(g);
    const k = near ? pkey(g[0], g[1]) : null;
    if (k === this.hoverKey) { if (k) this.placeTip(); return; }
    this.hoverKey = k;
    if (!k) { this.clearHover(); return; }
    this.showHoverInfo(k);
  }
  clearHover() { this.hoverKey = null; this.tip.style.display = 'none'; this.layHi.innerHTML = ''; }
  showHoverInfo(k, refresh) {
    const S = this.solver;
    if (!S.uf) return;
    const root = S.uf.find(k), net = S.vals.get(root);
    const lines = [];
    for (const c of this.circ.comps) {
      if (!c._pk) continue;
      for (const n in c._pk) if (c._pk[n] === k) { const pn = pinByName(c, n); lines.push(`<b>${esc(PARTS[c.type].short || PARTS[c.type].name)}</b> · ${esc((pn && pn.label) || n)}`); }
    }
    const hole = S.holeInfo.get(k);
    if (hole) lines.push(`Breadboard hole <b>${esc(hole.label)}</b>`);
    if (!lines.length) lines.push('Wire end');
    lines.push('State: ' + stateText(net));
    this.tip.innerHTML = lines.join('<br>');
    this.tip.style.display = 'block';
    if (!refresh) this.placeTip();
    // highlight connected holes / pins
    let h = '';
    for (const key of S.connPts) {
      if (S.uf.find(key) !== root) continue;
      const [x, y] = key.split(',').map(Number);
      h += S.holeInfo.has(key) ? `<rect class="hl" x="${x * G - 5}" y="${y * G - 5}" width="10" height="10" rx="2"/>` : `<circle class="hl" cx="${x * G}" cy="${y * G}" r="5.5"/>`;
    }
    const [x, y] = k.split(',').map(Number);
    h += `<circle class="hl-main" cx="${x * G}" cy="${y * G}" r="8"/>`;
    this.layHi.innerHTML = h;
  }
  placeTip() {
    if (!this.hoverKey) return;
    const [x, y] = this.hoverKey.split(',').map(Number);
    const r = this.svg.getBoundingClientRect(), sr = $('#stage').getBoundingClientRect();
    let tx = x * G * this.view.s + this.view.x + r.left - sr.left + 14, ty = y * G * this.view.s + this.view.y + r.top - sr.top + 14;
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight;
    if (tx + tw > sr.width - 6) tx -= tw + 28;
    if (ty + th > sr.height - 6) ty -= th + 28;
    this.tip.style.left = tx + 'px'; this.tip.style.top = ty + 'px';
  }

  onKey(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const k = e.key;
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? this.doRedo() : this.doUndo(); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'y') { e.preventDefault(); this.doRedo(); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'd') { e.preventDefault(); this.duplicateSel(); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 's') { e.preventDefault(); this.exportFile(); return; }
    if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); this.deleteSel(); }
    else if (k === 'r' || k === 'R') this.rotateSel();
    else if (k === 'Escape') { if (this.drag && this.drag.type === 'wire') this.cancelWire(); else this.select(null); $('#help').classList.remove('open'); }
    else if (k === '+' || k === '=') this.zoomAt(1.2);
    else if (k === '-') this.zoomAt(0.83);
    else if (k === 'f' || k === 'F') this.fit();
  }

  /* ======================= editing ======================= */
  addPart(type, x, y) {
    const d = PARTS[type];
    this.pushUndo();
    const props = {};
    if (type === 'breadboard') props.cols = 30;
    const c = this.circ.addComp(type, x, y, props);
    this.dirty = true; this.solve();
    this.renderComp(c); this.select({ comp: c }); this.changed();
    if (d.mcu && this.adv) { this.refreshBoardSel(); }
    return c;
  }
  addPartAtCenter(type) {
    const r = this.svg.getBoundingClientRect();
    const p = { x: (r.width / 2 - this.view.x) / this.view.s, y: (r.height / 2 - this.view.y) / this.view.s };
    const off = (this.circ.comps.length % 5) * 2;
    this.addPart(type, Math.round(p.x / G) + off, Math.round(p.y / G) + off);
    $('#leftPane').classList.remove('open');
  }
  select(s) {
    const prev = this.sel;
    this.sel = s;
    if (prev && prev.comp) { const g = this.els.get(prev.comp.id); if (g) g.classList.remove('selected'); }
    if (prev && prev.wire) { const g = this.wireEls.get(prev.wire.id); if (g) g.classList.remove('selected'); }
    if (s && s.comp) { const g = this.els.get(s.comp.id); if (g) g.classList.add('selected'); }
    if (s && s.wire) { const g = this.wireEls.get(s.wire.id); if (g) g.classList.add('selected'); }
    this.renderHandles();
    this.renderProps();
    if (s && s.comp && PARTS[s.comp.type].mcu && this.adv) { this.refreshBoardSel(s.comp.id); if (this.rtab === 'code') this.showCode(); }
  }
  deleteSel() {
    const s = this.sel; if (!s) return;
    this.pushUndo();
    const obj = s.comp || s.wire;
    if (s.comp && this.mcus.has(s.comp.id)) { this.mcus.get(s.comp.id).stop(); this.mcus.delete(s.comp.id); }
    this.circ.remove(obj); this.removeEls(obj);
    this.select(null); this.dirty = true; this.changed();
    if (s.comp && PARTS[s.comp.type].mcu) this.refreshBoardSel();
  }
  rotateSel() {
    const c = this.sel && this.sel.comp; if (!c || PARTS[c.type].isBoard) return;
    this.pushUndo(); c.rot = ((c.rot || 0) + 1) % 4; this.renderComp(c); this.dirty = true; this.changed();
  }
  duplicateSel() {
    const c = this.sel && this.sel.comp; if (!c) return;
    this.pushUndo();
    const n = this.circ.addComp(c.type, c.x + 2, c.y + 2, clone(c.props), c.rot);
    this.dirty = true; this.solve(); this.renderComp(n); this.select({ comp: n }); this.changed();
  }

  /* ======================= undo / persistence ======================= */
  snapshot() { return JSON.stringify(this.circ.toJSON()); }
  pushUndo() { this.undoStack.push(this.snapshot()); if (this.undoStack.length > 80) this.undoStack.shift(); this.redoStack = []; }
  restore(json) {
    const running = [...this.mcus.keys()];
    this.stopAll(true);
    this.circ.load(JSON.parse(json)); this.select(null); this.renderAll(); this.saveSoon();
    if (this.adv) this.refreshBoardSel();
    if (running.length) for (const c of this.circ.comps) if (running.includes(c.id)) this.runBoard(c);
  }
  doUndo() { if (!this.undoStack.length) return; this.redoStack.push(this.snapshot()); this.restore(this.undoStack.pop()); }
  doRedo() { if (!this.redoStack.length) return; this.undoStack.push(this.snapshot()); this.restore(this.redoStack.pop()); }
  changed() { this.dirty = true; this.saveSoon(); if (this.rtab === 'props') this.renderProps(); }
  saveSoon() {
    clearTimeout(this._saveT);
    this._saveT = setTimeout(() => {
      try { localStorage.setItem(this.storeKey, JSON.stringify({ v: 1, demo: this.demoId, circuit: this.circ.toJSON() })); } catch (e) { /* storage may be unavailable */ }
    }, 400);
  }
  loadInitial() {
    const hm = /demo=([\w-]+)/.exec(location.hash || '');
    if (hm && DEMOS.some(d => d.id === hm[1] && d.level === this.level)) { this.loadDemo(hm[1], true); return; }
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storeKey) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.circuit && saved.circuit.comps && saved.circuit.comps.length) {
      this.circ.load(saved.circuit); this.demoId = saved.demo;
      this.renderAll();
      requestAnimationFrame(() => this.fit());
      const d = DEMOS.find(x => x.id === this.demoId);
      this.showLesson(d);
      if (this.adv) this.refreshBoardSel();
    } else {
      const first = DEMOS.find(d => d.level === this.level);
      this.loadDemo(first.id, true);
    }
  }
  loadDemo(id, initial) {
    this.stopAll(true);
    if (!initial) this.pushUndo();
    if (id === '__blank') {
      this.circ.load({ comps: [], wires: [] });
      if (this.adv) this.circ.addComp('breadboard', 0, 0, { cols: 30 });
      this.demoId = null; this.showLesson(null);
    } else {
      const d = DEMOS.find(x => x.id === id); if (!d) return;
      this.circ.load(buildDemo(d).toJSON());
      this.demoId = id; this.showLesson(d);
    }
    this.select(null); this.renderAll(); this.saveSoon();
    requestAnimationFrame(() => this.fit());
    $$('.demo').forEach(b => b.classList.toggle('active', b.dataset.demo === id));
    this.rightTab('lesson');
    $('#leftPane').classList.remove('open');
    if (this.adv) {
      $('#serial').innerHTML = '';
      this.refreshBoardSel();
      if (this.circ.comps.some(c => PARTS[c.type].mcu)) setTimeout(() => this.runAll(), 300);
      const fr = $('#browser'); if (fr) fr.srcdoc = this.browserMsg('No web page yet', 'Run an ESP8266 web-server sketch.');
    }
  }
  exportFile() {
    const blob = new Blob([JSON.stringify({ app: 'pinsketch', level: this.level, circuit: this.circ.toJSON() }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = (this.demoId || 'circuit') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  importFile(e) {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(rd.result);
        const circ = data.circuit || data;
        if (!circ.comps) throw new Error('Not a circuit file');
        this.pushUndo(); this.stopAll(true);
        this.circ.load(circ); this.demoId = null; this.showLesson(null);
        this.select(null); this.renderAll(); this.saveSoon(); this.fit();
        if (this.adv) this.refreshBoardSel();
      } catch (err) { alert('Could not open file: ' + err.message); }
    };
    rd.readAsText(f);
    e.target.value = '';
  }

  /* ======================= side panels ======================= */
  showLesson(d) {
    const el = $('#lesson');
    if (d) {
      const v = typeof VIDEOS !== 'undefined' && VIDEOS.find(x => x.id === d.id);
      el.innerHTML = (v ? `<div class="lvid"><div class="lvid-h">🎬 Video tutorial · ${esc(v.dur)}</div>
        <video controls preload="none" playsinline poster="videos/${v.id}.jpg" src="videos/${v.id}.mp4"></video></div>` : '') + d.info;
      return;
    }
    el.innerHTML = this.adv ? `<h3>Advanced lab</h3>
      <p>Build real circuits on a <b>breadboard</b> with 74HC logic chips, DIP switches, LEDs, displays and microcontrollers.</p>
      <ul><li>Open <b>🎓 Demos</b> for the 2-bit and 4-bit adders, a BCD decoder, an SR latch, Arduino sketches and ESP8266 Wi-Fi projects.</li>
      <li>Hover over breadboard holes to see which ones are connected.</li>
      <li>Add an <b>Arduino UNO</b> or <b>ESP8266</b> from Parts, select it, and write code in the <b>💻 Code</b> tab.</li></ul>`
      : `<h3>Beginner lab</h3>
      <p>Learn electricity and digital logic step by step.</p>
      <ul><li>Open <b>🎓 Demos</b> and work through them in order.</li>
      <li>Drag parts from <b>🧩 Parts</b>: batteries, bulbs, switches, gates, an LCD…</li>
      <li>Drag from one pin to another to draw a wire.</li>
      <li>Use the <b>🔢 Truth table</b> tab to check your logic circuits.</li></ul>`;
  }

  renderProps() {
    const el = $('#props'); if (!el) return;
    const s = this.sel;
    if (!s) { el.innerHTML = '<p class="muted">Select a part or a wire to see its properties.</p><p class="small">Tip: hover over a pin to see whether it is HIGH, LOW or floating.</p>'; return; }
    if (s.wire) {
      const w = s.wire;
      el.innerHTML = `<h3>Wire</h3><p class="small">${w.pts.length - 2} bend point(s)</p>
        <div class="prow"><label>Color</label><div class="swatches">${WIRE_COLORS.map(c => `<button class="sw ${c === w.color ? 'active' : ''}" data-wc="${c}" style="background:${c}"></button>`).join('')}</div></div>
        <div class="prow"><label>Signal</label><div>${stateText(this.solver.vals.get(this.solver.uf.find(pkey(...w.pts[0]))))}</div></div>
        <button class="tbtn danger" id="pDel">🗑 Delete wire</button>`;
      el.querySelectorAll('[data-wc]').forEach(b => b.addEventListener('click', () => this.setWireColor(b.dataset.wc)));
      $('#pDel').addEventListener('click', () => this.deleteSel());
      return;
    }
    const c = s.comp, d = PARTS[c.type];
    let h = `<h3>${esc(d.name)}</h3><p class="small muted">${c.id} · position ${c.x}, ${c.y}</p>`;
    for (const p of d.props || []) {
      const v = c.props[p.key];
      h += `<div class="prow"><label>${esc(p.label)}</label>`;
      if (p.type === 'select') h += `<select data-prop="${p.key}">${p.options.map(o => `<option value="${esc(o)}" ${String(o) === String(v) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      else if (p.type === 'range') h += `<input type="range" min="${p.min}" max="${p.max}" value="${v}" data-prop="${p.key}"><span class="rv">${v}</span>`;
      else h += `<input type="text" value="${esc(v)}" data-prop="${p.key}" maxlength="40">`;
      h += '</div>';
    }
    h += `<div class="btnrow">${d.isBoard ? '' : '<button class="tbtn" id="pRot">⟳ Rotate</button>'}<button class="tbtn" id="pDup">⧉ Duplicate</button><button class="tbtn danger" id="pDel">🗑 Delete</button></div>`;
    if (d.mcu) h += `<div class="btnrow"><button class="tbtn run" id="pRun">▶ Run</button><button class="tbtn stop" id="pStop">■ Stop</button><button class="tbtn" id="pCode">💻 Edit code</button></div>`;
    if (pinsOf(c).length && pinsOf(c).length <= 40) h += `<h4>Pins</h4><table class="pins" id="pinTable"></table>`;
    el.innerHTML = h;
    el.querySelectorAll('[data-prop]').forEach(inp => {
      const key = inp.dataset.prop, def = d.props.find(p => p.key === key);
      let undone = false;
      const apply = () => {
        if (!undone) { this.pushUndo(); undone = true; }
        let v = inp.value;
        if (def.type === 'range' || (def.options && typeof def.options[0] === 'number')) v = Number(v);
        c.props[key] = v;
        if (def.type === 'range') inp.nextElementSibling.textContent = v;
        this.renderComp(c); this.changed_noProps();
        if (c.type === 'breadboard') this.solve();
      };
      inp.addEventListener(inp.tagName === 'SELECT' ? 'change' : 'input', apply);
    });
    const on = (id, f) => { const b = $('#' + id); if (b) b.addEventListener('click', f); };
    on('pRot', () => this.rotateSel()); on('pDup', () => this.duplicateSel()); on('pDel', () => this.deleteSel());
    on('pRun', () => this.runBoard(c)); on('pStop', () => this.stopBoard(c)); on('pCode', () => { this.refreshBoardSel(c.id); this.rightTab('code'); });
    this.updatePinTable();
  }
  changed_noProps() { this.dirty = true; this.saveSoon(); }
  updatePinTable() {
    const t = $('#pinTable'); const c = this.sel && this.sel.comp;
    if (!t || !c) return;
    const S = this.solver;
    t.innerHTML = pinsOf(c).map(p => `<tr><td>${esc(p.label || p.n)}</td><td>${stateText(S.net(c, p.n))}</td></tr>`).join('');
  }

  /* ---- truth table ---- */
  truthTable() {
    const out = $('#truth');
    const sortYX = (a, b) => a.y - b.y || a.x - b.x;
    const ins = this.circ.comps.filter(c => PARTS[c.type].input).sort(sortYX);
    const outs = this.circ.comps.filter(c => PARTS[c.type].output).sort(sortYX);
    if (!ins.length || !outs.length) { out.innerHTML = '<p class="warn">Add at least one input (logic input, switch or button) and one output (lamp, bulb, LED…).</p>'; return; }
    if (ins.length > 6) { out.innerHTML = '<p class="warn">Too many inputs (max 6).</p>'; return; }
    const name = (c, i, pfx) => c.props.label || (pfx + (i + 1));
    const saved = ins.map(c => PARTS[c.type].input.get(c));
    const rows = [];
    for (let m = 0; m < (1 << ins.length); m++) {
      ins.forEach((c, i) => PARTS[c.type].input.set(c, (m >> (ins.length - 1 - i)) & 1));
      this.solver.run();
      rows.push([...ins.map((c, i) => (m >> (ins.length - 1 - i)) & 1), ...outs.map(c => PARTS[c.type].output(c) ? 1 : 0)]);
    }
    ins.forEach((c, i) => PARTS[c.type].input.set(c, saved[i]));
    this.solve();
    for (const c of this.circ.comps) c._vk = null;
    this.needVis = true;
    out.innerHTML = tt([...ins.map((c, i) => name(c, i, 'In')), ...outs.map((c, i) => name(c, i, 'Out'))], rows) +
      `<p class="small muted">Inputs: ${ins.map((c, i) => esc(name(c, i, 'In')) + ' (' + esc(PARTS[c.type].name) + ')').join(', ')}</p>`;
  }

  /* ======================= microcontrollers ======================= */
  boards() { return this.circ.comps.filter(c => PARTS[c.type].mcu); }
  refreshBoardSel(selectId) {
    if (!this.adv) return;
    const sel = $('#boardSel'), bs = this.boards();
    const cur = selectId || sel.value;
    sel.innerHTML = bs.length ? bs.map(c => `<option value="${c.id}">${esc(PARTS[c.type].name)} (${c.id})</option>`).join('') : '<option value="">— add an Arduino or ESP8266 —</option>';
    if (bs.some(c => c.id === cur)) sel.value = cur;
    this.showCode();
  }
  codeComp() { const id = $('#boardSel') && $('#boardSel').value; return id ? this.circ.comps.find(c => c.id === id) : null; }
  showCode() {
    const c = this.codeComp(), ta = $('#code');
    if (!ta) return;
    if (!c) { ta.value = '// Add an Arduino UNO or ESP8266 NodeMCU from the Parts panel,\n// then write its code here.'; ta.disabled = true; }
    else if (document.activeElement !== ta || ta.dataset.cid !== c.id) { ta.disabled = false; ta.value = c.props.code || ''; ta.dataset.cid = c.id; }
    this.updateGutter();
  }
  updateGutter() {
    const ta = $('#code'); if (!ta) return;
    const n = ta.value.split('\n').length;
    let s = ''; for (let i = 1; i <= n; i++) s += i + '\n';
    $('#gutter').textContent = s;
  }
  runBoard(c) {
    if (!c) return;
    if (this.mcus.has(c.id)) this.mcus.get(c.id).stop();
    const m = new MCU(this, c);
    this.mcus.set(c.id, m);
    m.start();
    this.dirty = true;
  }
  stopBoard(c) {
    if (!c) return;
    const m = this.mcus.get(c.id);
    if (m) { m.stop(); this.mcus.delete(c.id); this.serialWrite(c, '— stopped —\n', 'sys'); }
    this.dirty = true;
  }
  runAll() { const bs = this.boards(); if (!bs.length) { this.serialWrite(null, 'No microcontroller in the circuit.\n', 'warn'); return; } for (const c of bs) this.runBoard(c); }
  stopAll(silent) {
    for (const [id, m] of this.mcus) { m.stop(); if (!silent) this.serialWrite(m.c, '— stopped —\n', 'sys'); }
    this.mcus.clear();
    for (const c of this.circ.comps) if (PARTS[c.type].mcu) { c.st.io = {}; c.st.running = false; c.st.wifi = false; }
    this.webMcu = null;
    this.dirty = true;
  }
  serialWrite(c, text, cls) {
    if (!this.adv || !text) return;
    const pre = $('#serial');
    const multi = this.boards().length > 1 && c;
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = multi ? text.replace(/(^|\n)(?=.)/g, `$1[${c.id}] `) : text;
    pre.appendChild(span);
    while (pre.childNodes.length > 1500) pre.removeChild(pre.firstChild);
    if ($('#autoScroll').checked) pre.scrollTop = pre.scrollHeight;
    if (this.rtab !== 'serial') { const b = $('#serBadge'); if (b) b.textContent = '•'; }
  }
  findI2CLcd(board) {
    this.ensureSolved();
    const S = this.solver;
    const sda = S.root(board, board.type === 'uno' ? 'A4' : 'D2'), scl = S.root(board, board.type === 'uno' ? 'A5' : 'D1');
    return this.circ.comps.find(c => c.type === 'lcd_i2c' && S.root(c, 'SDA') === sda && S.root(c, 'SCL') === scl) || null;
  }

  /* ---- ESP8266 virtual browser ---- */
  browserServer(mcu, server) {
    if (!this.adv) return;
    if (!server) { if (this.webMcu === mcu) { this.webMcu = null; const fr = $('#browser'); if (fr) fr.srcdoc = this.browserMsg('Server stopped', 'The ESP8266 is not running.'); $('#wifiState').textContent = '📵'; } return; }
    this.webMcu = mcu;
    const api = mcu.c.st.wifi;
    if (server.started && api) {
      const ip = '192.168.1.' + (40 + (parseInt(mcu.c.id.slice(1)) % 50));
      $('#url').value = 'http://' + ip + '/';
      $('#wifiState').textContent = '📶';
      if (!mcu._navigated) { mcu._navigated = true; setTimeout(() => this.navigate('/'), 200); }
    }
  }
  browserMsg(t, s) {
    return `<html><body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#334155;display:flex;align-items:center;justify-content:center;height:90vh;text-align:center"><div><div style="font-size:40px">🌐</div><h3>${esc(t)}</h3><p>${esc(s)}</p></div></body></html>`;
  }
  async navigate(url) {
    const fr = $('#browser'); if (!fr) return;
    let path = String(url || '/').trim();
    try { if (/^https?:/i.test(path)) { const u = new URL(path); path = u.pathname + u.search; } } catch (e) { path = '/'; }
    if (!path.startsWith('/')) path = '/' + path;
    const m = this.webMcu;
    if (!m || !m.alive || !m.server || !m.server.started || !m.c.st.wifi) {
      fr.srcdoc = this.browserMsg('This site can\'t be reached', 'No ESP8266 web server is running and connected to Wi-Fi.');
      return;
    }
    const ip = $('#url').value.replace(/^https?:\/\//, '').split('/')[0];
    $('#url').value = 'http://' + ip + path;
    fr.srcdoc = this.browserMsg('Loading…', path);
    const r = await m.request(path);
    if (!r.code) { fr.srcdoc = this.browserMsg('No response', r.body); return; }
    let body = r.body;
    if (!/html/i.test(r.type || '')) body = `<pre style="font:14px monospace;white-space:pre-wrap">${esc(body)}</pre>`;
    const inject = `<script>(function(){document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a){e.preventDefault();parent.postMessage({espNav:a.getAttribute('href')},'*');}});document.addEventListener('submit',function(e){e.preventDefault();var f=e.target;var q=new URLSearchParams(new FormData(f)).toString();var act=f.getAttribute('action')||'/';parent.postMessage({espNav:act+(q?'?'+q:'')},'*');});})();<\/script>`;
    fr.srcdoc = /<\/body>/i.test(body) ? body.replace(/<\/body>/i, inject + '</body>') : body + inject;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App(document.body.dataset.level || 'beginner');
});
