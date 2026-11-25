/* PinSketch — circuit core
 * Everything lives on a grid (G px per unit). Every pin, breadboard hole and
 * wire end is a grid point. Points that are joined (by wires, breadboard strips,
 * closed switches...) form a "net". Each net gets a logic value:
 *   1 = HIGH, 0 = LOW, null = floating, 'X' = short circuit.
 * Bulbs / LEDs light when a current path exists from a HIGH source to a LOW source.
 */
'use strict';

const G = 20;
const PARTS = {};

function defPart(type, def) {
  PARTS[type] = Object.assign({ type, name: type, cat: 'Misc', level: 'both', pins: [], defaults: {}, props: [] }, def);
}
const pkey = (x, y) => x + ',' + y;
function rotPt(x, y, r) {
  r = ((r % 4) + 4) % 4;
  if (r === 0) return [x, y];
  if (r === 1) return [-y, x];
  if (r === 2) return [-x, -y];
  return [y, -x];
}
function pinsOf(c) { const d = PARTS[c.type]; return typeof d.pins === 'function' ? d.pins(c) : d.pins; }
function pinWorld(c, p) { const [rx, ry] = rotPt(p.x, p.y, c.rot || 0); return [c.x + rx, c.y + ry]; }
function pinByName(c, n) { return pinsOf(c).find(p => p.n === n); }
function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }

class UF {
  constructor() { this.p = new Map(); }
  find(a) {
    let p = this.p.get(a);
    if (p === undefined) { this.p.set(a, a); return a; }
    let r = a;
    for (;;) { const q = this.p.get(r); if (q === r) break; r = q; }
    let x = a;
    while (x !== r) { const nx = this.p.get(x); this.p.set(x, r); x = nx; }
    return r;
  }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.p.set(ra, rb); }
}

class Circuit {
  constructor() { this.comps = []; this.wires = []; this.seq = 1; }
  addComp(type, x, y, props, rot) {
    const d = PARTS[type];
    if (!d) throw new Error('Unknown part ' + type);
    const c = { id: 'c' + this.seq++, type, x, y, rot: rot || 0, props: Object.assign(clone(d.defaults || {}), props || {}), st: {} };
    if (d.init) d.init(c);
    this.comps.push(c);
    return c;
  }
  addWire(pts, color) {
    const clean = [];
    for (const p of pts) { const q = [Math.round(p[0]), Math.round(p[1])]; const l = clean[clean.length - 1]; if (!l || l[0] !== q[0] || l[1] !== q[1]) clean.push(q); }
    if (clean.length < 2) return null;
    const w = { id: 'w' + this.seq++, pts: clean, color: color || '#2563eb' };
    this.wires.push(w);
    return w;
  }
  remove(obj) {
    this.comps = this.comps.filter(c => c !== obj);
    this.wires = this.wires.filter(w => w !== obj);
  }
  toJSON() {
    return {
      comps: this.comps.map(c => ({ id: c.id, type: c.type, x: c.x, y: c.y, rot: c.rot || 0, props: c.props })),
      wires: this.wires.map(w => ({ id: w.id, pts: w.pts, color: w.color })),
    };
  }
  load(data) {
    this.comps = []; this.wires = []; this.seq = 1;
    let max = 0;
    for (const o of (data.comps || [])) {
      const d = PARTS[o.type]; if (!d) continue;
      const c = { id: o.id, type: o.type, x: o.x, y: o.y, rot: o.rot || 0, props: Object.assign(clone(d.defaults || {}), o.props || {}), st: {} };
      if (d.init) d.init(c);
      this.comps.push(c);
      max = Math.max(max, parseInt(String(o.id).slice(1)) || 0);
    }
    for (const o of (data.wires || [])) {
      this.wires.push({ id: o.id, pts: o.pts.map(p => [p[0], p[1]]), color: o.color });
      max = Math.max(max, parseInt(String(o.id).slice(1)) || 0);
    }
    this.seq = max + 1;
  }
}

class Solver {
  constructor(circ) { this.circ = circ; this.vals = new Map(); this.loadState = new Map(); this.holeInfo = new Map(); this.connPts = new Set(); this.shorts = 0; }

  // ---------- helpers used by parts ----------
  root(c, pin) { const k = c._pk && c._pk[pin]; return k === undefined ? null : this.uf.find(k); }
  net(c, pin) { const r = this.root(c, pin); return r === null ? undefined : this.vals.get(r); }
  v(c, pin) { const n = this.net(c, pin); return n ? n.v : null; }
  lvl(c, pin) { const n = this.net(c, pin); return n ? n.lvl : 0; }
  hi(c, pin) { return this.v(c, pin) === 1; }
  load(c, id) { return this.loadState.get(c.id + ':' + (id || '0')) || 0; }
  powered(c, vcc, gnd) { return this.v(c, vcc) === 1 && this.v(c, gnd) === 0; }

  run() {
    const circ = this.circ, uf = new UF();
    this.uf = uf;
    const pg = this.pg = new Map(); // point graph: every physical connection between two grid points
    const edge = (a, b, w) => { if (a === b) return; if (!pg.has(a)) pg.set(a, []); if (!pg.has(b)) pg.set(b, []); pg.get(a).push({ to: b, w, from: a }); pg.get(b).push({ to: a, w, from: b }); };
    this.holeInfo = new Map();
    this.connPts = new Set();
    for (const c of circ.comps) {
      const d = PARTS[c.type];
      if (d.groups) {
        for (const g of d.groups(c)) {
          let first = null;
          for (const h of g) {
            const k = pkey(c.x + h[0], c.y + h[1]);
            this.holeInfo.set(k, { c, label: h[2] });
            this.connPts.add(k);
            if (first === null) { first = k; uf.find(k); } else { uf.union(first, k); edge(prev, k, null); }
            var prev = k;
          }
        }
      }
      c._pk = {};
      for (const p of pinsOf(c)) {
        const [wx, wy] = pinWorld(c, p);
        const k = pkey(wx, wy);
        c._pk[p.n] = k; uf.find(k); this.connPts.add(k);
      }
    }
    for (const w of circ.wires) {
      if (w.pts.length < 2) continue;
      const a = pkey(w.pts[0][0], w.pts[0][1]), b = pkey(w.pts[w.pts.length - 1][0], w.pts[w.pts.length - 1][1]);
      uf.union(a, b); this.connPts.add(a); this.connPts.add(b); edge(a, b, w);
    }
    for (const c of circ.comps) {
      const d = PARTS[c.type];
      if (d.links) for (const [a, b] of d.links(c, this)) if (c._pk[a] && c._pk[b]) { uf.union(c._pk[a], c._pk[b]); edge(c._pk[a], c._pk[b], null); }
    }

    // iterate logic until stable
    this.oscillating = false;
    this.serial = false;
    const comps = circ.comps;
    let it = 0;
    for (; it < 250; it++) {
      this.vals = this.resolve();
      this.serial = it >= 20; // after 20 sync rounds, update one thing at a time (breaks latch races)
      let changed = false;
      for (const c of comps) {
        const d = PARTS[c.type];
        if (d.update && d.update(c, this)) { changed = true; if (this.serial) break; }
      }
      if (!changed) break;
    }
    if (it >= 250) this.oscillating = true;

    this.shorts = 0;
    for (const v of this.vals.values()) if (v.v === 'X') this.shorts++;
    this.computeLoads();
    for (const c of comps) { const d = PARTS[c.type]; if (d.visual) d.visual(c, this); }
  }

  resolve() {
    const vals = new Map(), strong = new Map(), weak = [], uf = this.uf, drvPts = this.drv = new Map();
    for (const c of this.circ.comps) {
      const d = PARTS[c.type];
      if (!d.drive) continue;
      const drv = d.drive(c, this);
      if (!drv) continue;
      for (const dr of drv) {
        const [pin, v, s = 2, lvl] = dr;
        const k = c._pk[pin]; if (k === undefined) continue;
        const r = uf.find(k);
        if (s === 2) {
          let dp = drvPts.get(r); if (!dp) { dp = {}; drvPts.set(r, dp); }
          if (v && !dp.hi) { dp.hi = k; dp.hiC = c; } if (!v && !dp.lo) { dp.lo = k; dp.loC = c; }
          let e = strong.get(r);
          if (!e) { e = { h: 0, l: 0, lh: 0, ll: 0 }; strong.set(r, e); }
          if (v) { e.h++; e.lh = Math.max(e.lh, lvl === undefined ? 1 : lvl); }
          else { e.l++; e.ll = Math.max(e.ll, lvl || 0); }
        } else weak.push([r, v ? 1 : 0, lvl]);
      }
    }
    for (const [r, e] of strong) {
      if (e.h && e.l) vals.set(r, { v: 'X', s: 2, lvl: 0 });
      else vals.set(r, e.h ? { v: 1, s: 2, lvl: e.lh } : { v: 0, s: 2, lvl: e.ll });
    }
    for (const [r, v, lvl] of weak) if (!vals.has(r)) vals.set(r, { v, s: 1, lvl: v ? (lvl === undefined ? 1 : lvl) : 0 });
    // resistors pass a weak copy of a value to an undriven net (pull-ups / pull-downs / series resistors)
    const rl = [];
    for (const c of this.circ.comps) {
      const d = PARTS[c.type];
      if (d.resist) for (const [a, b] of d.resist(c)) if (c._pk[a] && c._pk[b]) rl.push([uf.find(c._pk[a]), uf.find(c._pk[b])]);
    }
    for (let pass = 0; pass < 6 && rl.length; pass++) {
      let ch = false;
      for (const [a, b] of rl) {
        const va = vals.get(a), vb = vals.get(b);
        if (va && !vb && va.v !== 'X') { vals.set(b, { v: va.v, s: 1, lvl: va.lvl }); ch = true; }
        else if (vb && !va && vb.v !== 'X') { vals.set(a, { v: vb.v, s: 1, lvl: vb.lvl }); ch = true; }
      }
      if (!ch) break;
    }
    return vals;
  }

  computeLoads() {
    const edges = [], adj = new Map(), uf = this.uf, vals = this.vals;
    for (const c of this.circ.comps) {
      const d = PARTS[c.type];
      if (!d.loads) continue;
      for (const L of d.loads(c)) {
        if (!c._pk[L.a] || !c._pk[L.b]) continue;
        const e = { c, id: L.id || '0', a: uf.find(c._pk[L.a]), b: uf.find(c._pk[L.b]), ka: c._pk[L.a], kb: c._pk[L.b], dir: !!L.dir, kind: L.kind || 'light' };
        const i = edges.length; edges.push(e);
        if (!adj.has(e.a)) adj.set(e.a, []); adj.get(e.a).push(i);
        if (!adj.has(e.b)) adj.set(e.b, []); adj.get(e.b).push(i);
      }
    }
    const isSrc = (r, want) => {
      const v = vals.get(r); if (!v || v.s !== 2 || v.v === 'X') return false;
      return want === 1 ? (v.v === 1 || v.lvl > 0) : (v.v === 0 && !(v.lvl > 0));
    };
    const blocked = r => { const v = vals.get(r); return !!(v && v.s === 2); };
    const srcLvl = (r, want) => want === 1 ? (vals.get(r).lvl || 1) : 1;
    // want 1: walk "upstream" looking for a HIGH source; want 0: "downstream" to a LOW source
    // returns {lvl, n, path:[{e, from, to}]} — path runs from start towards the source/sink
    const reach = (start, want, excl) => {
      if (isSrc(start, want)) return { lvl: srcLvl(start, want), n: 0, path: [], end: start };
      if (blocked(start)) return null;
      const seen = new Set([start]);
      const par = new Map();
      const trace = (o, ei, n) => { const path = [{ e: edges[ei], from: n, to: o }]; let cur = n; while (par.has(cur)) { const p = par.get(cur); path.unshift({ e: edges[p.ei], from: p.from, to: cur }); cur = p.from; } return path; };
      let q = [[start, 0]];
      while (q.length) {
        const nq = [];
        for (const [n, cnt] of q) {
          for (const ei of (adj.get(n) || [])) {
            if (ei === excl) continue;
            const e = edges[ei];
            let o;
            if (e.a === n) { if (e.dir && want === 1) continue; o = e.b; }
            else { if (e.dir && want === 0) continue; o = e.a; }
            if (o === n) continue;
            const nc = cnt + (e.kind === 'light' ? 1 : 0);
            if (isSrc(o, want)) return { lvl: srcLvl(o, want), n: nc, path: trace(o, ei, n), end: o };
            if (blocked(o) || seen.has(o)) continue;
            seen.add(o); par.set(o, { from: n, ei }); nq.push([o, nc]);
          }
        }
        q = nq;
      }
      return null;
    };
    this.loadState = new Map();
    const flows = []; // [entryPointKey, exitPointKey, amount] inside one net, plus component crossings
    const keyOn = (e, net) => net === e.a ? e.ka : e.kb;
    edges.forEach((e, i) => {
      if (e.kind === 'res') return;
      const tryDir = (a, b, ka, kb) => {
        if (a === b) return null;
        const up = reach(a, 1, i); if (!up) return null;
        const dn = reach(b, 0, i); if (!dn) return null;
        return { r: up.lvl / (1 + up.n + dn.n), up, dn, ka, kb };
      };
      let best = tryDir(e.a, e.b, e.ka, e.kb);
      if (!e.dir) { const o = tryDir(e.b, e.a, e.kb, e.ka); if (o && (!best || o.r > best.r)) best = o; }
      const r = best ? best.r : 0;
      this.loadState.set(e.c.id + ':' + e.id, Math.round(r * 100) / 100);
      if (!best || r <= 0) return;
      // chain of components from the HIGH source down to the LOW sink, as point-to-point crossings
      const chain = []; // list of [inKey, outKey] for each component crossed, in current order
      for (let k = best.up.path.length - 1; k >= 0; k--) { const st = best.up.path[k]; chain.push([keyOn(st.e, st.to), keyOn(st.e, st.from)]); }
      chain.push([best.ka, best.kb]);
      for (const st of best.dn.path) chain.push([keyOn(st.e, st.from), keyOn(st.e, st.to)]);
      const dr = this.drv;
      const srcD = dr.get(best.up.end) || {}, sinkD = dr.get(best.dn.end) || {};
      let entry = srcD.hi;
      // a chip output that sources current really takes it from its VCC pin
      const icOf = c => c && PARTS[c.type].pinNames ? pinsOf(c).length : 0;
      if (entry && icOf(srcD.hiC)) {
        const vk = srcD.hiC._pk[String(icOf(srcD.hiC))], vd = (dr.get(this.uf.find(vk)) || {}).hi;
        if (vd) { flows.push([vd, vk, r]); flows.push([vk, entry, r, 'part']); }
      }
      for (const [kin, kout] of chain) { if (entry) flows.push([entry, kin, r]); flows.push([kin, kout, r, 'part']); entry = kout; }
      const sink = sinkD.lo;
      if (sink && entry) flows.push([entry, sink, r]);
      if (sink && icOf(sinkD.loC)) { // a chip output that sinks current passes it to its GND pin
        const gk = sinkD.loC._pk[String(icOf(sinkD.loC) / 2)], gd = (dr.get(this.uf.find(gk)) || {}).lo;
        if (gd) { flows.push([sink, gk, r, 'part']); flows.push([gk, gd, r]); }
      }
    });
    this.computeFlow(flows);
  }

  /* turn net-level flows into animated segments: wires (with direction) and other straight segments */
  computeFlow(flows) {
    const pg = this.pg, wireFlow = new Map(), segs = [], seenSeg = new Set();
    const path = (a, b) => { // BFS over physical connections
      if (a === b) return [];
      const par = new Map([[a, null]]); let q = [a];
      while (q.length) {
        const nq = [];
        for (const n of q) for (const ed of (pg.get(n) || [])) {
          if (par.has(ed.to)) continue;
          par.set(ed.to, ed);
          if (ed.to === b) { const out = []; let cur = b; while (par.get(cur)) { const p = par.get(cur); out.unshift(p); cur = p.from; } return out; }
          nq.push(ed.to);
        }
        q = nq;
      }
      return null;
    };
    const addSeg = (pts, amt, kind) => { const k = pts.join(';'); if (seenSeg.has(k)) return; seenSeg.add(k); segs.push({ pts: pts.map(s => s.split(',').map(Number)), amt, kind }); };
    for (const [a, b, amt, kind] of flows) {
      if (kind === 'part') { addSeg([a, b], amt, 'part'); continue; }
      const p = path(a, b); if (!p) continue;
      let run = null;
      for (const ed of p) {
        if (ed.w) {
          if (run) { addSeg(run, amt, 'strip'); run = null; }
          const fwd = pkey(ed.w.pts[0][0], ed.w.pts[0][1]) === ed.from;
          const prev = wireFlow.get(ed.w.id);
          if (!prev || prev.amt < amt) wireFlow.set(ed.w.id, { fwd, amt });
        } else { if (!run) run = [ed.from]; run.push(ed.to); }
      }
      if (run) addSeg(run, amt, 'strip');
    }
    this.wireFlow = wireFlow; this.flowSegs = segs;
    // logic signals: HIGH nets driven by an output, flowing away from the driver
    const sig = new Map();
    for (const [root, dp] of (this.drv || new Map())) {
      const v = this.vals.get(root);
      if (!v || v.v !== 1 || !dp.hi) continue;
      const dist = new Map([[dp.hi, 0]]); let q = [dp.hi];
      while (q.length) { const nq = []; for (const n of q) for (const ed of (pg.get(n) || [])) { if (dist.has(ed.to)) continue; dist.set(ed.to, dist.get(n) + 1); if (ed.w && !wireFlow.has(ed.w.id)) sig.set(ed.w.id, { fwd: pkey(ed.w.pts[0][0], ed.w.pts[0][1]) === ed.from }); nq.push(ed.to); } q = nq; }
    }
    this.sigFlow = sig;
  }
}

if (typeof module !== 'undefined') module.exports = { G, PARTS, defPart, pkey, rotPt, pinsOf, pinWorld, pinByName, esc, clone, UF, Circuit, Solver };
