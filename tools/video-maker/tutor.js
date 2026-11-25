/* PinSketch tutorial-video driver: runs inside the real simulator page and animates
 * a cursor, captions and the construction of a demo circuit, step by step. */
'use strict';
(function () {
  const sleep = ms => new Promise(r => setTimeout(r, Math.max(0, ms)));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const css = `
  #tcur{position:fixed;left:0;top:0;z-index:9999;pointer-events:none;width:28px;height:28px;transform-origin:3px 3px;transition:transform .08s}
  #tcur.down{transform:scale(.82)}
  .tripple{position:fixed;z-index:9998;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #fbbf24;animation:trip .55s ease-out forwards}
  @keyframes trip{from{transform:scale(.3);opacity:1}to{transform:scale(1.4);opacity:0}}
  #tghost{position:fixed;z-index:9997;pointer-events:none;width:70px;height:54px;opacity:.85;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5));display:none}
  #tcap{position:fixed;z-index:9996;pointer-events:none;left:50%;bottom:22px;transform:translateX(-50%);width:max-content;background:rgba(2,6,23,.86);color:#fff;
    font:600 19px/1.35 Inter,system-ui,sans-serif;padding:10px 20px;border-radius:12px;border:1px solid rgba(148,163,184,.35);text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.45);transition:opacity .25s}
  #tcap:empty{opacity:0}
  #ttitle{position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
    background:radial-gradient(900px 500px at 75% 0%,#4c1d95 0%,transparent 60%),radial-gradient(800px 500px at 0% 100%,#0c4a6e 0%,transparent 55%),#0b1220;color:#fff;font-family:Inter,system-ui,sans-serif;transition:opacity .6s}
  #ttitle .lg{display:flex;align-items:center;gap:12px;font-size:30px}
  #ttitle .lg i{width:50px;height:50px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#f97316,#db2777);font-style:normal;font-size:26px}
  #ttitle .lg b{color:#f97316}
  #ttitle .lv{margin-top:26px;font-size:16px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:6px 14px;border-radius:999px}
  #ttitle h1{font-size:50px;margin:6px 0 0;letter-spacing:-1px;text-align:center;max-width:1100px}
  #ttitle p{font-size:22px;color:#cbd5e1;margin:4px 0 0}
  .tut-hl{fill:rgba(250,204,21,.10);stroke:#facc15;stroke-width:3;stroke-dasharray:10 6;animation:tdash 1s linear infinite;pointer-events:none}
  .tut-hlt{fill:#facc15;font:800 15px Inter,system-ui,sans-serif;paint-order:stroke;stroke:#0f172a;stroke-width:4px;pointer-events:none}
  @keyframes tdash{to{stroke-dashoffset:-32}}
  .stagehint{display:none!important}`;

  class Tutor {
    constructor(app) {
      this.app = app;
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      this.cur = document.createElement('div'); this.cur.id = 'tcur';
      this.cur.innerHTML = '<svg viewBox="0 0 28 28" width="28" height="28"><path d="M3,3 L3,23 L8.5,17.5 L12.5,26 L16,24.4 L12,16 L19.5,16 Z" fill="#fff" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round"/></svg>';
      document.body.appendChild(this.cur);
      this.ghost = document.createElement('div'); this.ghost.id = 'tghost'; document.body.appendChild(this.ghost);
      this.cap = document.createElement('div'); this.cap.id = 'tcap'; document.body.appendChild(this.cap);
      this.cx = innerWidth * 0.55; this.cy = innerHeight * 0.55; this.place();
    }
    /* ---------- cursor ---------- */
    place() { this.cur.style.left = this.cx + 'px'; this.cur.style.top = this.cy + 'px'; if (this.ghost.style.display === 'block') { this.ghost.style.left = (this.cx - 20) + 'px'; this.ghost.style.top = (this.cy - 16) + 'px'; } }
    async move(x, y, ms, onStep) {
      const x0 = this.cx, y0 = this.cy, t0 = performance.now();
      ms = Math.max(1, ms);
      for (;;) {
        const k = Math.min(1, (performance.now() - t0) / ms), e = ease(k);
        this.cx = x0 + (x - x0) * e; this.cy = y0 + (y - y0) * e; this.place();
        if (onStep) onStep(e);
        if (k >= 1) break;
        await new Promise(r => requestAnimationFrame(r));
      }
    }
    ripple() { const r = document.createElement('div'); r.className = 'tripple'; r.style.left = this.cx + 'px'; r.style.top = this.cy + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 600); }
    down() { this.cur.classList.add('down'); this.ripple(); }
    up() { this.cur.classList.remove('down'); }
    center(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
    w2s(wx, wy) { const a = this.app, r = a.svg.getBoundingClientRect(); return [r.left + a.view.x + wx * G * a.view.s, r.top + a.view.y + wy * G * a.view.s]; }
    caption(t) { this.cap.textContent = t || ''; }
    async clickEl(el, ms) {
      if (!el) return;
      el.scrollIntoView && el.scrollIntoView({ block: 'nearest' });
      const [x, y] = this.center(el);
      await this.move(x, y, ms || 450);
      this.down(); await sleep(90); el.click(); this.up(); await sleep(150);
    }
    pointer(type, x, y, target) {
      const t = target || document.elementFromPoint(x, y);
      if (t) t.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, button: 0, pointerId: 1, isPrimary: true }));
    }

    /* ---------- title card ---------- */
    title(level, num, title, sub) {
      let el = document.getElementById('ttitle');
      if (!el) { el = document.createElement('div'); el.id = 'ttitle'; document.body.appendChild(el); }
      const beg = level === 'beginner';
      el.innerHTML = `<div class="lg"><i>⚡</i><span>Pin<b>Sketch</b></span></div>
        <div class="lv" style="background:${beg ? '#14532d' : '#7c2d12'};color:${beg ? '#bbf7d0' : '#fed7aa'}">${beg ? 'Beginner' : 'Advanced'} · Lesson ${num}</div>
        <h1>${title}</h1><p>${sub || ''}</p>`;
      el.style.opacity = 1; el.style.display = 'flex';
    }
    async hideTitle() { const el = document.getElementById('ttitle'); if (!el) return; el.style.opacity = 0; await sleep(600); el.style.display = 'none'; }

    /* ---------- circuit construction ---------- */
    prepare(demoId, opts) {
      opts = opts || {};
      const a = this.app, d = DEMOS.find(x => x.id === demoId);
      a.stopAll(true);
      if (a.setEdit) a.setEdit(true, true);
      this.final = buildDemo(d).toJSON();
      const num = id => parseInt(String(id).slice(1)) || 0;
      this.order = [...this.final.comps.map(c => ({ k: 'c', o: c })), ...this.final.wires.map(w => ({ k: 'w', o: w }))].sort((p, q) => num(p.o.id) - num(q.o.id));
      a.circ.load(this.final); a.demoId = demoId; a.showLesson(d); a.renderAll(); a.fit();
      { // leave room for the caption bar at the bottom
        const r = a.svg.getBoundingClientRect(), k = (opts.zoom || 1) * 0.86, cx = r.width / 2, cy = r.height / 2;
        a.view.x = cx - (cx - a.view.x) * k; a.view.y = cy - (cy - a.view.y) * k - 42; a.view.s *= k; a.applyView();
      }
      this.view = Object.assign({}, a.view);
      $$('.demo').forEach(b => b.classList.toggle('active', b.dataset.demo === demoId));
      this.built = new Set();
      if (opts.prebuilt) { for (const it of this.order) this.built.add(it.o.id); }
      else { a.circ.load({ comps: [], wires: [] }); a.circ.seq = 5000; a.renderAll(); }
      a.view = Object.assign({}, this.view); a.applyView();
      a.rightTab('lesson'); a.leftTab('parts');
      if (a.adv) $('#serial').innerHTML = '';
    }
    comp(match) { // find a built comp by type / label / predicate
      const cs = this.app.circ.comps;
      if (typeof match === 'function') return cs.find(match);
      return cs.find(c => c.type === match || c.props.label === match || c.id === match);
    }
    comps(match) { return this.app.circ.comps.filter(c => typeof match === 'function' ? match(c) : c.type === match); }
    pending(filter) { return this.order.filter(it => !this.built.has(it.o.id) && (!filter || filter(it))); }
    connectable() {
      const a = this.app; a.ensureSolved();
      const s = new Set(a.solver.connPts);
      return s;
    }
    wireReady(w, pts) { const e1 = w.pts[0], e2 = w.pts[w.pts.length - 1]; return pts.has(pkey(e1[0], e1[1])) && pts.has(pkey(e2[0], e2[1])); }
    /* add parts matching filter (and optionally the wires that then become connectable) within ms */
    async parts(filter, ms, opts) {
      opts = opts || {};
      const f = typeof filter === 'string' ? (o => o.type === filter) : (Array.isArray(filter) ? (o => filter.includes(o.type)) : filter);
      const items = this.pending(it => it.k === 'c' && f(it.o));
      if (!items.length) return;
      const per = ms / items.length;
      for (const it of items) await this.addComp(it.o, per, opts.pop || per < 900);
    }
    async wires(ms, filter) {
      const t0 = performance.now();
      // repeatedly add wires whose ends are connectable
      const list = [];
      let pts = this.connectable();
      const cand = this.pending(it => it.k === 'w' && (!filter || filter(it.o)));
      let progress = true; const left = cand.slice();
      while (progress) {
        progress = false;
        for (let i = 0; i < left.length; i++) {
          if (this.wireReady(left[i].o, pts)) { const w = left[i].o; list.push(w); pts.add(pkey(...w.pts[0])); pts.add(pkey(...w.pts[w.pts.length - 1])); left.splice(i, 1); i--; progress = true; }
        }
      }
      if (!list.length) return;
      const per = ms / list.length;
      for (const w of list) await this.addWire(w, per, per < 700);
      const rest = ms - (performance.now() - t0); if (rest > 0) await sleep(rest);
    }
    wait(ms) { return sleep(ms); }
    reorder(idx) { const o = this.order; this.order = idx.map(i => o[i]); }
    async next(n, ms, pop) { // build the next n items in the demo's creation order
      const items = this.pending().slice(0, n), per = ms / Math.max(1, items.length);
      for (const it of items) { if (it.k === 'c') await this.addComp(it.o, per, pop || per < 900); else await this.addWire(it.o, per, pop || per < 650); }
    }
    async build(filter, ms) { await this.parts(filter, ms * 0.5); await this.wires(ms * 0.5); }
    async all(ms) { // everything left, fast
      const items = this.pending();
      const per = ms / Math.max(1, items.length);
      for (const it of items) { if (it.k === 'c') await this.addComp(it.o, per, true); else await this.addWire(it.o, per, true); }
    }
    realize(o) {
      const a = this.app, d = PARTS[o.type];
      const c = { id: o.id, type: o.type, x: o.x, y: o.y, rot: o.rot || 0, props: clone(o.props), st: {} };
      if (d.init) d.init(c);
      a.circ.comps.push(c); this.built.add(o.id);
      a.dirty = true; a.solve(); a.renderComp(c);
      if (d.mcu) a.refreshBoardSel(c.id);
      return c;
    }
    async addComp(o, ms, pop) {
      const a = this.app;
      if (o.type === 'note' || pop) {
        if (!pop || o.type === 'note') { const c = this.realize(o); await sleep(ms); return c; }
        const [tx, ty] = this.w2s(o.x, o.y);
        await this.move(tx, ty, ms * 0.6);
        this.down(); const c = this.realize(o); a.select({ comp: c }); this.up();
        await sleep(ms * 0.4); return c;
      }
      const item = $(`.pitem[data-type="${o.type}"]`);
      a.leftTab('parts');
      // smooth-scroll palette to the item
      const pane = item.closest('.lpane'), pr = pane.getBoundingClientRect(), ir = item.getBoundingClientRect();
      const want = pane.scrollTop + (ir.top - pr.top) - pr.height / 3;
      if (Math.abs(want - pane.scrollTop) > 20) { const s0 = pane.scrollTop, t0 = performance.now(), dur = ms * 0.15; while (performance.now() - t0 < dur) { pane.scrollTop = s0 + (want - s0) * ease((performance.now() - t0) / dur); await new Promise(r => requestAnimationFrame(r)); } pane.scrollTop = want; }
      const [ix, iy] = this.center(item);
      await this.move(ix, iy, ms * 0.25);
      this.down();
      this.ghost.innerHTML = item.querySelector('svg').outerHTML; this.ghost.style.display = 'block'; this.place();
      await sleep(ms * 0.05);
      const [tx, ty] = this.w2s(o.x, o.y);
      await this.move(tx, ty, ms * 0.35);
      this.ghost.style.display = 'none'; this.up();
      const c = this.realize(o); a.select({ comp: c });
      await sleep(ms * 0.2);
      return c;
    }
    async addWire(w, ms, pop) {
      const a = this.app;
      const P = w.pts.map(p => [p[0] * G, p[1] * G]);
      const path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('class', 'preview'); path.setAttribute('stroke', w.color); path.style.strokeDasharray = 'none';
      a.layTop.appendChild(path);
      const lens = []; let total = 0;
      for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); lens.push(l); total += l; }
      const partial = e => {
        let rem = total * e, d = `M${P[0][0]},${P[0][1]}`, x = P[0][0], y = P[0][1];
        for (let i = 1; i < P.length; i++) {
          const l = lens[i - 1];
          if (rem >= l) { x = P[i][0]; y = P[i][1]; d += ` L${x},${y}`; rem -= l; }
          else { const k = l ? rem / l : 0; x = P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k; y = P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k; d += ` L${x},${y}`; break; }
        }
        path.setAttribute('d', d); return [x, y];
      };
      if (pop) {
        const t0 = performance.now(), dur = ms * 0.7;
        while (performance.now() - t0 < dur) { partial(ease((performance.now() - t0) / dur)); await new Promise(r => requestAnimationFrame(r)); }
      } else {
        const [sx, sy] = this.w2s(...w.pts[0]);
        await this.move(sx, sy, ms * 0.3);
        this.down();
        const t0 = performance.now(), dur = ms * 0.5;
        const vp = () => { const r = a.svg.getBoundingClientRect(); return [r.left + a.view.x, r.top + a.view.y, a.view.s]; };
        while (performance.now() - t0 < dur) {
          const [x, y] = partial(ease((performance.now() - t0) / dur));
          const [ox, oy, s] = vp(); this.cx = ox + x * s; this.cy = oy + y * s; this.place();
          await new Promise(r => requestAnimationFrame(r));
        }
        this.up();
      }
      path.remove();
      const nw = { id: w.id, pts: w.pts.map(p => [p[0], p[1]]), color: w.color };
      a.circ.wires.push(nw); this.built.add(w.id);
      a.dirty = true; a.solve(); a.renderWire(nw);
      await sleep(pop ? ms * 0.3 : ms * 0.2);
    }

    /* ---------- interaction ---------- */
    actEl(c, act) { const g = this.app.els.get(c.id); return g && g.querySelector(`[data-act="${act}"]`); }
    async act(c, act, opts) {
      opts = opts || {};
      if (typeof c === 'string') c = this.comp(c);
      const el = this.actEl(c, act); if (!el) return;
      const [x, y] = this.center(el);
      await this.move(x, y, opts.move || 500);
      this.down(); this.pointer('pointerdown', x, y, el);
      await sleep(opts.hold || 120);
      this.pointer('pointerup', x, y, window); this.up();
      await sleep(opts.after || 250);
    }
    async press(c, holdMs) { return this.act(c, 'press', { hold: holdMs || 1200 }); }
    async toggle(c) { return this.act(c, 'toggle'); }
    async dip(c, i) { return this.act(c, 'dip:' + i, { move: 350, after: 150 }); }
    async setDip(c, bits, ms) { // bits string like "1010"
      if (typeof c === 'string') c = this.comp(c);
      for (let i = 0; i < 4; i++) { const want = bits[i] === '1'; if (!!c.props.sw[i] !== want) await this.dip(c, i); }
    }
    async hover(wx, wy, ms) {
      const [x, y] = this.w2s(wx, wy);
      await this.move(x, y, ms || 500);
      this.pointer('pointermove', x, y);
    }
    unhover() { this.app.clearHover(); }
    async select(c, ms) {
      if (typeof c === 'string') c = this.comp(c);
      const b = boxOf(c); const [x, y] = this.w2s((b[0] + b[2]) / 2 / G, (b[1] + b[3]) / 2 / G);
      await this.move(x, y, ms || 500); this.down(); this.app.select({ comp: c }); await sleep(120); this.up();
      return c;
    }
    async tab(name, ms) { await this.clickEl($(`[data-rtab="${name}"]`), ms); }
    async click(sel, ms) { await this.clickEl(typeof sel === 'string' ? $(sel) : sel, ms); }
    highlight(x0, y0, x1, y1, text) { // world grid units
      const a = this.app, g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'tut-hlg');
      g.innerHTML = `<rect class="tut-hl" x="${x0 * G}" y="${y0 * G}" width="${(x1 - x0) * G}" height="${(y1 - y0) * G}" rx="10"/>` + (text ? `<text class="tut-hlt" x="${x0 * G + 6}" y="${y0 * G - 8}">${esc(text)}</text>` : '');
      a.layTop.appendChild(g); return g;
    }
    highlightComp(c, text, pad) {
      if (typeof c === 'string') c = this.comp(c);
      const b = boxOf(c), p = (pad || 8) / G;
      return this.highlight(b[0] / G - p, b[1] / G - p, b[2] / G + p, b[3] / G + p, text);
    }
    async wide(on, ms) { // hide/show the side panels and zoom the circuit to fill the canvas
      $('.left').style.display = on ? 'none' : ''; $('.right').style.display = on ? 'none' : '';
      await new Promise(r => requestAnimationFrame(r));
      const sr = $('#stage').getBoundingClientRect();
      this.cap.style.left = (sr.left + sr.width / 2) + 'px'; this.cap.style.maxWidth = (sr.width - 40) + 'px';
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const c of this.app.circ.comps) { if (c.type === 'note') continue; const b = boxOf(c); x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); }
      await this.zoomTo(x0 / G - 0.5, y0 / G - 0.5, x1 / G + 0.5, y1 / G + 4.5, ms || 900);
    }
    clearHighlights() { $$('.tut-hlg').forEach(e => e.remove()); }
    async zoomTo(x0, y0, x1, y1, ms) { // world grid units, or 'home'
      const a = this.app, r = a.svg.getBoundingClientRect();
      let target;
      if (x0 === 'home') target = Object.assign({}, this.view);
      else {
        const pad = 30, s = Math.min(2.2, Math.min((r.width - 2 * pad) / ((x1 - x0) * G), (r.height - 2 * pad) / ((y1 - y0) * G)));
        target = { s, x: r.width / 2 - (x0 + x1) / 2 * G * s, y: r.height / 2 - (y0 + y1) / 2 * G * s };
      }
      const from = Object.assign({}, a.view), t0 = performance.now(); ms = ms || 800;
      while (performance.now() - t0 < ms) {
        const e = ease((performance.now() - t0) / ms);
        a.view = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, s: from.s + (target.s - from.s) * e };
        a.applyView(); await new Promise(r2 => requestAnimationFrame(r2));
      }
      a.view = target; a.applyView();
    }
    /* code editor */
    async showCodeLine(line, ms) {
      const ta = $('#code'); if (!ta) return;
      const lh = parseFloat(getComputedStyle(ta).lineHeight) || 19;
      const target = Math.max(0, (line - 3) * lh), s0 = ta.scrollTop, t0 = performance.now(); ms = ms || 500;
      while (performance.now() - t0 < ms) { ta.scrollTop = s0 + (target - s0) * ease((performance.now() - t0) / ms); $('#gutter').scrollTop = ta.scrollTop; await new Promise(r => requestAnimationFrame(r)); }
      ta.scrollTop = target; $('#gutter').scrollTop = target;
    }
    markCode(from, to) { // select text range to highlight it
      const ta = $('#code'), i = ta.value.indexOf(from); if (i < 0) return;
      const j = to ? ta.value.indexOf(to, i) + to.length : i + from.length;
      ta.focus(); ta.setSelectionRange(i, j);
    }
    async typeReplace(find, repl, ms, all) {
      const ta = $('#code');
      let count = 0;
      while (true) {
        const i = ta.value.indexOf(find); if (i < 0 || (!all && count)) break;
        ta.focus(); ta.setSelectionRange(i, i + find.length); await sleep(ms * 0.25);
        ta.setRangeText('', i, i + find.length, 'end');
        for (const ch of repl) { ta.setRangeText(ch, ta.selectionStart, ta.selectionStart, 'end'); ta.dispatchEvent(new Event('input')); await sleep(ms * 0.5 / repl.length); }
        count++;
      }
      ta.blur();
    }
    async knob(c, dy, ms) { // drag a potentiometer knob up (dy < 0) or down
      if (typeof c === 'string') c = this.comp(c);
      const el = this.actEl(c, 'pot'); if (!el) return;
      const [x, y] = this.center(el);
      await this.move(x, y, ms * 0.3); this.down(); this.pointer('pointerdown', x, y, el);
      const t0 = performance.now(), dur = ms * 0.6;
      for (;;) { const k = Math.min(1, (performance.now() - t0) / dur), yy = y + dy * ease(k); this.cy = yy; this.place(); this.pointer('pointermove', x, yy, window); if (k >= 1) break; await new Promise(r => requestAnimationFrame(r)); }
      this.pointer('pointerup', x, y + dy, window); this.up();
    }
    async serialType(text, ms) {
      const inp = $('#serIn'); if (!inp) return;
      await this.clickEl(inp, ms * 0.2); inp.value = '';
      for (const ch of text) { inp.value += ch; await sleep(ms * 0.45 / text.length); }
      await this.clickEl($('#btnSerSend'), ms * 0.2);
    }
    async setProp(c, key, value, ms) { // change a property through the Properties panel
      if (typeof c === 'string') c = this.comp(c);
      await this.select(c, ms * 0.25); await this.tab('props', ms * 0.2);
      const el = $(`#props [data-prop="${key}"]`); if (!el) return;
      await this.clickEl(el, ms * 0.2);
      el.value = String(value); el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
      await sleep(ms * 0.1);
    }
    async espTap(frac, path, ms) { // tap a spot in the virtual phone and navigate
      const fr = $('#browser'), r = fr.getBoundingClientRect();
      await this.move(r.left + r.width * frac[0], r.top + frac[1], ms || 500);
      this.down(); await sleep(100); this.up();
      this.app.navigate(path);
      await sleep(300);
    }
  }

  /* ---------- runner ---------- */
  window.runTutorial = async function (lessonId, durations) {
    const app = window.app, L = (window.LESSONS || []).find(l => l.id === lessonId);
    const T = new Tutor(app);
    window.T = T;
    try { localStorage.clear(); } catch (e) { /* ignore */ }
    T.title(L.level, L.num, L.title, L.sub);
    if (L.setup) L.setup(T); else T.prepare(L.demo || L.id, L.opts);
    const sr = $('#stage').getBoundingClientRect();
    T.cap.style.left = (sr.left + sr.width / 2) + 'px'; T.cap.style.maxWidth = (sr.width - 40) + 'px';
    await sleep(500);
    const starts = [];
    const t0 = Date.now();
    for (let i = 0; i < L.steps.length; i++) {
      const st = L.steps[i], D = durations[i] * 1000;
      const sStart = Date.now();
      starts.push((sStart - t0) / 1000);
      T.caption(st.cap || st.say);
      try {
        if (st.intro) { T.caption(''); await sleep(D - 900); await T.hideTitle(); }
        else if (st.do) await st.do(T, D * 0.92);
      } catch (e) { console.error('step', i, e && e.stack || e); }
      const rest = D - (Date.now() - sStart);
      if (rest > 0) await sleep(rest);
    }
    T.caption('');
    await sleep(700);
    return { t0: t0 / 1000, starts, end: (Date.now() - t0) / 1000 };
  };
})();
