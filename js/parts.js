/* PinSketch — component library
 * Each part: pins (grid units, local), draw(c) -> SVG (px, local), plus optional
 * drive / update / links / resist / loads / visual / act hooks used by the solver & editor.
 */
'use strict';

const BB_ROWS = { a: 4, b: 5, c: 6, d: 7, e: 8, f: 11, g: 12, h: 13, i: 14, j: 15 };
const BB_RAILS = { 't-': 1, 't+': 2, 'b+': 17, 'b-': 18 };

/* ---------- drawing helpers ---------- */
const HEX7 = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg', 'abcefg', 'cdefg', 'adef', 'bcdeg', 'adefg', 'aefg'];
function segDigit(x, y, w, h, on, color, offColor) {
  const t = Math.max(3, w * 0.17), hh = h / 2;
  const S = {
    a: [x + t, y, w - 2 * t, t], d: [x + t, y + h - t, w - 2 * t, t], g: [x + t, y + hh - t / 2, w - 2 * t, t],
    f: [x, y + t * 0.7, t, hh - t], b: [x + w - t, y + t * 0.7, t, hh - t],
    e: [x, y + hh + t * 0.3, t, hh - t], c: [x + w - t, y + hh + t * 0.3, t, hh - t],
  };
  let s = '';
  for (const k in S) {
    const [sx, sy, sw, sh] = S[k];
    s += `<rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="${sw.toFixed(1)}" height="${sh.toFixed(1)}" rx="${(t / 2).toFixed(1)}" fill="${on[k] ? color : (offColor || '#3b1f1f')}"${on[k] ? ' filter="url(#glow)"' : ''}/>`;
  }
  return s;
}
function lcdScreen(x, y, lines, on, bl) {
  const cw = 16, ch = 26;
  let s = `<rect x="${x - 10}" y="${y - 10}" width="${16 * cw + 20}" height="${2 * ch + 24}" rx="5" fill="${on && bl ? '#9fd84f' : (on ? '#5d7a2a' : '#3a4a1f')}" stroke="#1f2a10" stroke-width="3"/>`;
  for (let r = 0; r < 2; r++) {
    const line = (lines && lines[r]) || '';
    for (let i = 0; i < 16; i++) {
      const cx = x + i * cw, cy = y + r * (ch + 4);
      s += `<rect x="${cx + 1}" y="${cy}" width="${cw - 2}" height="${ch}" fill="${on ? 'rgba(0,40,0,0.10)' : 'rgba(0,0,0,0.12)'}"/>`;
      const chr = line[i];
      if (on && chr && chr !== ' ') s += `<text x="${cx + cw / 2}" y="${cy + 19}" class="lcdch">${esc(chr)}</text>`;
    }
  }
  return s;
}
function legs(list, len) { // little metal legs below pins
  return list.map(([x, y]) => `<rect x="${x - 2}" y="${y - (len || 10)}" width="4" height="${len || 10}" fill="#9ca3af"/>`).join('');
}
function label(x, y, txt, cls) { return `<text x="${x}" y="${y}" class="${cls || 'plabel'}">${esc(txt)}</text>`; }

/* =========================================================
 *   POWER
 * ========================================================= */
defPart('battery', {
  name: 'Battery (5V)', cat: 'Power', box: [-64, -22, 4, 58],
  pins: [{ n: '+', x: 0, y: 0, label: '+ positive' }, { n: '-', x: 0, y: 2, label: '− negative' }],
  drive: () => [['+', 1], ['-', 0]],
  draw: () => `
    <path d="M-18,0 H0" stroke="#dc2626" stroke-width="3"/><path d="M-18,40 H0" stroke="#111827" stroke-width="3"/>
    <rect x="-60" y="-14" width="44" height="68" rx="7" fill="#1f2937" stroke="#0b0f17" stroke-width="2"/>
    <rect x="-60" y="-14" width="44" height="24" rx="7" fill="#f59e0b"/><rect x="-60" y="2" width="44" height="8" fill="#f59e0b"/>
    <rect x="-44" y="-20" width="12" height="7" rx="2" fill="#9ca3af"/>
    <text x="-38" y="4" class="t-strong" fill="#111" text-anchor="middle" font-size="17">+</text>
    <text x="-38" y="32" fill="#fff" font-size="13" font-weight="700" text-anchor="middle">5V</text>
    <text x="-38" y="49" fill="#cbd5e1" font-size="13" text-anchor="middle">−</text>`,
});

defPart('vcc', {
  name: 'VCC (+5V)', cat: 'Power', box: [-18, -34, 18, 4],
  pins: [{ n: 'P', x: 0, y: 0, label: '+5V' }],
  drive: () => [['P', 1]],
  draw: () => `<path d="M0,0 V-18" stroke="#ef4444" stroke-width="3"/><path d="M-12,-18 H12" stroke="#ef4444" stroke-width="4"/>
    <text x="0" y="-24" fill="#ef4444" font-size="11" font-weight="700" text-anchor="middle">+5V</text>`,
});

defPart('gnd', {
  name: 'Ground (GND)', cat: 'Power', box: [-16, -4, 16, 30],
  pins: [{ n: 'P', x: 0, y: 0, label: 'GND 0V' }],
  drive: () => [['P', 0]],
  draw: () => `<path d="M0,0 V12 M-13,12 H13 M-8,18 H8 M-3,24 H3" stroke="#94a3b8" stroke-width="3" fill="none"/>`,
});

defPart('psu', {
  name: 'Breadboard Power Module', cat: 'Power', level: 'advanced', box: [-70, -14, 6, 374],
  defaults: { on: true },
  pins: [{ n: 'T-', x: 0, y: 0, label: 'Top rail −' }, { n: 'T+', x: 0, y: 1, label: 'Top rail +' }, { n: 'B+', x: 0, y: 16, label: 'Bottom rail +' }, { n: 'B-', x: 0, y: 17, label: 'Bottom rail −' }],
  drive: c => c.props.on ? [['T-', 0], ['T+', 1], ['B+', 1], ['B-', 0]] : [],
  act: (c, a, ph) => { if (ph === 'down') { c.props.on = !c.props.on; return 'props'; } return false; },
  draw: c => `
    <rect x="-66" y="-12" width="58" height="384" rx="6" fill="#1f2937" stroke="#0b0f17" stroke-width="2"/>
    <rect x="-60" y="20" width="44" height="44" rx="3" fill="#94a3b8"/><rect x="-52" y="30" width="28" height="24" rx="2" fill="#475569"/>
    <text x="-38" y="84" fill="#cbd5e1" font-size="9" text-anchor="middle">USB / DC</text>
    <g data-act="power" class="clickable"><rect x="-56" y="150" width="36" height="60" rx="5" fill="#0f172a" stroke="#64748b"/>
      <rect x="-50" y="${c.props.on ? 156 : 182}" width="24" height="22" rx="3" fill="${c.props.on ? '#22c55e' : '#e5e7eb'}"/></g>
    <text x="-38" y="226" fill="#e2e8f0" font-size="10" text-anchor="middle">${c.props.on ? 'ON' : 'OFF'}</text>
    <circle cx="-38" cy="250" r="6" fill="${c.props.on ? '#4ade80' : '#14532d'}" ${c.props.on ? 'filter="url(#glow)"' : ''}/>
    <text x="-38" y="300" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle" transform="rotate(-90 -38 300)">5V POWER</text>
    ${legs([[0, 0], [0, 20], [0, 320], [0, 340]], 0)}
    <path d="M-8,0 H0 M-8,20 H0 M-8,320 H0 M-8,340 H0" stroke="#9ca3af" stroke-width="3"/>`,
});

defPart('clock', {
  name: 'Clock (pulse)', cat: 'Inputs', box: [-66, -32, 4, 16],
  defaults: { hz: 1 },
  props: [{ key: 'hz', label: 'Frequency (Hz)', type: 'select', options: [0.5, 1, 2, 4, 10] }],
  pins: [{ n: 'Y', x: 0, y: 0, label: 'Clock out' }],
  drive: c => [['Y', c.st.v ? 1 : 0]],
  visual: c => { c.vis = { v: c.st.v ? 1 : 0, hz: c.props.hz }; },
  draw: c => `<path d="M-8,0 H0" stroke="#94a3b8" stroke-width="3"/>
    <rect x="-64" y="-14" width="56" height="28" rx="5" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
    <path d="M-58,6 H-52 V-6 H-44 V6 H-36 V-6 H-30" fill="none" stroke="#a78bfa" stroke-width="2"/>
    <circle cx="-18" cy="0" r="5" fill="${c.st.v ? '#f472b6' : '#4a1d3a'}"/>
    <text x="-36" y="-18" class="plabel">${c.props.hz} Hz</text>`,
});

/* =========================================================
 *   INPUTS
 * ========================================================= */
defPart('switch', {
  name: 'Toggle Switch', cat: 'Inputs', box: [-6, -48, 46, 4],
  defaults: { on: false, label: '' },
  props: [{ key: 'label', label: 'Label', type: 'text' }],
  pins: [{ n: 'A', x: 0, y: 0 }, { n: 'B', x: 2, y: 0 }],
  links: c => c.props.on ? [['A', 'B']] : [],
  input: { get: c => !!c.props.on, set: (c, v) => { c.props.on = !!v; } },
  act: (c, a, ph) => { if (ph === 'down') { c.props.on = !c.props.on; return 'props'; } return false; },
  draw: c => `${legs([[0, 0], [40, 0]], 10)}
    <rect x="-4" y="-30" width="48" height="22" rx="5" fill="#334155" stroke="#0f172a" stroke-width="2"/>
    <g data-act="toggle" class="clickable"><rect x="0" y="-27" width="40" height="16" rx="8" fill="${c.props.on ? '#16a34a' : '#64748b'}"/>
    <circle cx="${c.props.on ? 32 : 8}" cy="-19" r="7" fill="#f8fafc"/></g>
    <text x="20" y="-34" class="plabel">${esc(c.props.label || (c.props.on ? 'ON' : 'OFF'))}</text>`,
});

defPart('button', {
  name: 'Push Button', cat: 'Inputs', box: [-4, -40, 44, 4],
  defaults: { label: '' },
  props: [{ key: 'label', label: 'Label', type: 'text' }],
  pins: [{ n: 'A', x: 0, y: 0 }, { n: 'B', x: 2, y: 0 }],
  links: c => c.st.pressed ? [['A', 'B']] : [],
  input: { get: c => !!c.st.pressed, set: (c, v) => { c.st.pressed = !!v; } },
  act: (c, a, ph) => { if (ph === 'down') { c.st.pressed = true; return true; } if (ph === 'up') { c.st.pressed = false; return true; } return false; },
  draw: c => `${legs([[0, 0], [40, 0]], 8)}
    <rect x="2" y="-36" width="36" height="30" rx="4" fill="#1f2937" stroke="#0b0f17" stroke-width="2"/>
    <circle cx="4" cy="-33" r="1.5" fill="#64748b"/><circle cx="36" cy="-33" r="1.5" fill="#64748b"/>
    <g data-act="press" class="clickable"><circle cx="20" cy="-21" r="${c.st.pressed ? 9 : 11}" fill="${c.st.pressed ? '#b91c1c' : '#ef4444'}" stroke="#7f1d1d" stroke-width="2"/></g>
    ${c.props.label ? `<text x="20" y="-42" class="plabel">${esc(c.props.label)}</text>` : ''}`,
});

defPart('logicin', {
  name: 'Logic Input (0/1)', cat: 'Inputs', box: [-62, -12, 4, 12],
  defaults: { on: false, label: 'A' },
  props: [{ key: 'label', label: 'Label', type: 'text' }],
  pins: [{ n: 'Y', x: 0, y: 0, label: 'Output' }],
  drive: c => [['Y', c.props.on ? 1 : 0]],
  input: { get: c => !!c.props.on, set: (c, v) => { c.props.on = !!v; } },
  act: (c, a, ph) => { if (ph === 'down') { c.props.on = !c.props.on; return 'props'; } return false; },
  draw: c => `<path d="M-6,0 H0" stroke="#94a3b8" stroke-width="3"/>
    <rect x="-60" y="-10" width="54" height="20" rx="5" fill="#1e293b" stroke="${c.props.on ? '#f97316' : '#475569'}" stroke-width="2"/>
    <text x="-50" y="5" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle">${esc(c.props.label || '')}</text>
    <g data-act="toggle" class="clickable"><rect x="-40" y="-7" width="26" height="14" rx="7" fill="${c.props.on ? '#f97316' : '#475569'}"/>
    <circle cx="${c.props.on ? -21 : -33}" cy="0" r="5.5" fill="#fff"/></g>
    <text x="-10" y="4" fill="${c.props.on ? '#fdba74' : '#94a3b8'}" font-size="10" font-weight="700" text-anchor="middle">${c.props.on ? 1 : 0}</text>`,
});

defPart('dip4', {
  name: 'DIP Switch ×4', cat: 'Inputs', level: 'advanced', box: [-10, -2, 70, 62],
  defaults: { sw: [false, false, false, false] },
  pins: [1, 2, 3, 4, 5, 6, 7, 8].map(p => ({ n: String(p), x: p <= 4 ? p - 1 : 8 - p, y: p <= 4 ? 3 : 0, label: 'Pin ' + p + (p <= 4 ? ' (switch ' + p + ')' : ' (switch ' + (9 - p) + ')') })),
  links: c => c.props.sw.map((on, i) => on ? [String(i + 1), String(8 - i)] : null).filter(Boolean),
  act: (c, a, ph) => { if (ph === 'down') { const i = +a.split(':')[1]; c.props.sw[i] = !c.props.sw[i]; return 'props'; } return false; },
  draw: c => {
    let s = legs([[0, 8], [20, 8], [40, 8], [60, 8]], 8) + legs([[0, 60], [20, 60], [40, 60], [60, 60]], 8);
    s += `<rect x="-9" y="8" width="78" height="44" rx="3" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
      <text x="-5" y="18" fill="#fff" font-size="7" font-weight="700">ON</text>`;
    for (let i = 0; i < 4; i++) {
      const on = c.props.sw[i], x = i * 20;
      s += `<g data-act="dip:${i}" class="clickable"><rect x="${x - 6}" y="17" width="12" height="28" rx="2" fill="#7f1d1d"/>
        <rect x="${x - 5}" y="${on ? 18 : 31}" width="10" height="13" rx="2" fill="#f8fafc"/></g>
        <text x="${x}" y="51" fill="#fff" font-size="6" text-anchor="middle">${i + 1}</text>`;
    }
    return s;
  },
});

defPart('pot', {
  name: 'Potentiometer', cat: 'Inputs', box: [-8, -60, 48, 4],
  defaults: { pos: 50 },
  props: [{ key: 'pos', label: 'Position (%)', type: 'range', min: 0, max: 100 }],
  pins: [{ n: '1', x: 0, y: 0, label: 'End 1 (GND)' }, { n: 'W', x: 1, y: 0, label: 'Wiper (signal)' }, { n: '3', x: 2, y: 0, label: 'End 3 (VCC)' }],
  update: (c, S) => {
    const a = S.v(c, '1'), b = S.v(c, '3'), p = c.props.pos / 100;
    let w = null;
    if (a === 0 && b === 1) w = p; else if (a === 1 && b === 0) w = 1 - p;
    if (c.st.w !== w) { c.st.w = w; return true; }
    return false;
  },
  drive: c => c.st.w == null ? [] : [['W', c.st.w >= 0.5 ? 1 : 0, 2, c.st.w]],
  act: (c, a, ph, info) => {
    if (ph === 'down') { c.st.p0 = c.props.pos; return false; }
    if (ph === 'move') { const np = Math.max(0, Math.min(100, Math.round(c.st.p0 - info.dy * 0.6 + info.dx * 0.6))); if (np !== c.props.pos) { c.props.pos = np; return 'props'; } }
    return false;
  },
  draw: c => {
    const ang = -135 + c.props.pos * 2.7;
    return `${legs([[0, 0], [20, 0], [40, 0]], 8)}
      <rect x="-6" y="-42" width="52" height="36" rx="4" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="2"/>
      <g data-act="pot" class="clickable knob"><circle cx="20" cy="-24" r="13" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
      <path d="M20,-24 L20,-35" stroke="#0f172a" stroke-width="3" stroke-linecap="round" transform="rotate(${ang} 20 -24)"/></g>
      <text x="20" y="-46" class="plabel">${c.props.pos}%</text>`;
  },
});

/* =========================================================
 *   OUTPUTS
 * ========================================================= */
defPart('bulb', {
  name: 'Light Bulb', cat: 'Outputs', box: [-4, -70, 44, 4],
  defaults: { label: '' },
  props: [{ key: 'label', label: 'Label', type: 'text' }],
  pins: [{ n: 'A', x: 0, y: 0 }, { n: 'B', x: 2, y: 0 }],
  loads: () => [{ a: 'A', b: 'B', kind: 'light' }],
  output: c => (c.vis && c.vis.b > 0),
  visual: (c, S) => { c.vis = { b: S.load(c) }; },
  draw: c => {
    const b = (c.vis && c.vis.b) || 0;
    return `<path d="M0,0 V-8 H12 M40,0 V-8 H28" stroke="#9ca3af" stroke-width="3" fill="none"/>
      <rect x="10" y="-20" width="20" height="13" rx="2" fill="#9ca3af" stroke="#4b5563"/>
      <path d="M11,-16 H29 M11,-12 H29" stroke="#6b7280"/>
      ${b > 0 ? `<circle cx="20" cy="-36" r="${22 + 12 * b}" fill="#fde047" opacity="${0.25 + 0.35 * b}" filter="url(#glow2)"/>` : ''}
      <circle cx="20" cy="-36" r="17" fill="${b > 0 ? `rgba(253,224,71,${0.45 + 0.55 * b})` : 'rgba(226,232,240,0.25)'}" stroke="#cbd5e1" stroke-width="2"/>
      <path d="M14,-21 L16,-36 Q20,-42 24,-36 L26,-21" fill="none" stroke="${b > 0 ? '#f97316' : '#94a3b8'}" stroke-width="1.6"/>
      ${c.props.label ? `<text x="20" y="-58" class="plabel">${esc(c.props.label)}</text>` : ''}`;
  },
});

const LED_COLORS = { red: '#ef4444', green: '#22c55e', yellow: '#facc15', blue: '#3b82f6', white: '#f8fafc', orange: '#fb923c' };
defPart('led', {
  name: 'LED', cat: 'Outputs', box: [-6, -52, 26, 4],
  defaults: { color: 'red', label: '' },
  props: [{ key: 'color', label: 'Color', type: 'select', options: Object.keys(LED_COLORS) }, { key: 'label', label: 'Label', type: 'text' }],
  pins: [{ n: 'A', x: 0, y: 0, label: 'Anode (+, long leg)' }, { n: 'K', x: 1, y: 0, label: 'Cathode (−, short leg)' }],
  loads: () => [{ a: 'A', b: 'K', dir: true, kind: 'light' }],
  output: c => (c.vis && c.vis.b > 0),
  visual: (c, S) => { c.vis = { b: S.load(c) }; },
  draw: c => {
    const b = (c.vis && c.vis.b) || 0, col = LED_COLORS[c.props.color] || '#ef4444';
    return `<path d="M0,0 V-6 L3,-12 M20,0 V-12" stroke="#9ca3af" stroke-width="2.5" fill="none"/>
      ${b > 0 ? `<circle cx="10" cy="-24" r="${14 + 10 * b}" fill="${col}" opacity="${0.25 + 0.5 * b}" filter="url(#glow2)"/>` : ''}
      <path d="M0,-12 V-25 A10,10 0 0 1 20,-25 V-12 Z" fill="${col}" opacity="${b > 0 ? 0.55 + 0.45 * b : 0.45}" stroke="${col}" stroke-width="1.5"/>
      <rect x="-2" y="-14" width="24" height="4" rx="1" fill="${col}" opacity="0.8"/>
      <path d="M5,-27 A5,5 0 0 1 10,-31" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.6"/>
      ${c.props.label ? `<text x="10" y="-40" class="plabel">${esc(c.props.label)}</text>` : ''}`;
  },
});

defPart('probe', {
  name: 'Logic Output (lamp)', cat: 'Outputs', box: [-2, -16, 44, 26],
  defaults: { label: 'Y' },
  props: [{ key: 'label', label: 'Label', type: 'text' }],
  pins: [{ n: 'A', x: 0, y: 0, label: 'Input' }],
  output: c => (c.vis && c.vis.v === 1),
  visual: (c, S) => { const v = S.v(c, 'A'); c.vis = { v: v === null ? null : v }; },
  draw: c => {
    const v = c.vis && c.vis.v !== undefined ? c.vis.v : null, on = v === 1;
    return `<path d="M0,0 H12" stroke="#94a3b8" stroke-width="3"/>
      ${on ? '<circle cx="26" cy="0" r="20" fill="#ef4444" opacity="0.45" filter="url(#glow2)"/>' : ''}
      <circle cx="26" cy="0" r="14" fill="${on ? '#ef4444' : '#3f1d1d'}" stroke="${on ? '#fecaca' : '#64748b'}" stroke-width="2"/>
      <text x="26" y="4.5" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">${v === null ? '?' : v === 'X' ? '!' : v}</text>
      <text x="26" y="26" class="plabel">${esc(c.props.label || '')}</text>`;
  },
});

defPart('buzzer', {
  name: 'Buzzer', cat: 'Outputs', box: [-12, -52, 34, 4],
  pins: [{ n: 'P', x: 0, y: 0, label: '+' }, { n: 'N', x: 1, y: 0, label: '−' }],
  loads: () => [{ a: 'P', b: 'N', dir: true, kind: 'light' }],
  output: c => (c.vis && c.vis.b > 0),
  visual: (c, S) => { c.vis = { b: S.load(c) }; },
  draw: c => {
    const on = c.vis && c.vis.b > 0;
    return `${legs([[0, 0], [20, 0]], 8)}
      <circle cx="10" cy="-26" r="19" fill="#111827" stroke="#374151" stroke-width="2"/>
      <circle cx="10" cy="-26" r="4" fill="#374151"/><text x="-4" y="-38" fill="#ef4444" font-size="10" font-weight="700">+</text>
      ${on ? `<g class="buzz"><path d="M33,-36 Q40,-26 33,-16 M39,-41 Q49,-26 39,-11" stroke="#fbbf24" stroke-width="2.5" fill="none"/>
      <path d="M-13,-36 Q-20,-26 -13,-16" stroke="#fbbf24" stroke-width="2.5" fill="none"/><text x="10" y="-50" fill="#fbbf24" font-size="14" text-anchor="middle">♪ BEEP</text></g>` : ''}`;
  },
});

defPart('motor', {
  name: 'DC Motor / Fan', cat: 'Outputs', box: [-4, -56, 44, 4],
  pins: [{ n: 'A', x: 0, y: 0 }, { n: 'B', x: 2, y: 0 }],
  loads: () => [{ a: 'A', b: 'B', kind: 'light' }],
  output: c => (c.vis && c.vis.b > 0),
  visual: (c, S) => { c.vis = { b: S.load(c) }; },
  draw: c => {
    const b = (c.vis && c.vis.b) || 0;
    const blades = [0, 120, 240].map(a => `<path d="M20,-30 Q30,-48 22,-50 Q14,-46 20,-30" fill="#60a5fa" transform="rotate(${a} 20 -30)"/>`).join('');
    return `<path d="M0,0 V-8 H8 M40,0 V-8 H32" stroke="#9ca3af" stroke-width="3" fill="none"/>
      <circle cx="20" cy="-30" r="23" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
      <g class="${b > 0 ? 'spin' : ''}" style="${b > 0 ? `animation-duration:${(0.6 / b).toFixed(2)}s` : ''};transform-origin:20px -30px">${blades}</g>
      <circle cx="20" cy="-30" r="5" fill="#cbd5e1"/><text x="20" y="-56" class="plabel">M</text>`;
  },
});

/* ---------- 7 segment ---------- */
defPart('hex7', {
  name: 'Hex Display (4-bit)', cat: 'Displays', box: [-2, -16, 84, 76],
  pins: [0, 1, 2, 3].map(i => ({ n: 'D' + i, x: 0, y: i, label: 'D' + i + ' (bit ' + i + ', value ' + (1 << i) + ')' })),
  visual: (c, S) => { let n = 0; for (let i = 0; i < 4; i++) if (S.v(c, 'D' + i) === 1) n |= 1 << i; c.vis = { n }; },
  draw: c => {
    const n = (c.vis && c.vis.n) || 0, on = {};
    for (const ch of HEX7[n]) on[ch] = 1;
    let s = `<rect x="8" y="-14" width="72" height="88" rx="6" fill="#111827" stroke="#374151" stroke-width="2"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M0,${i * 20} H8" stroke="#94a3b8" stroke-width="3"/><text x="12" y="${i * 20 + 4}" fill="#94a3b8" font-size="8">${1 << i}</text>`;
    s += segDigit(36, -2, 32, 64, on, '#ef4444');
    return s;
  },
});

defPart('seg7', {
  name: '7-Segment (common cathode)', cat: 'Displays', level: 'advanced', box: [-12, -14, 92, 74],
  pins: [['g', 0, 0], ['f', 1, 0], ['COM1', 2, 0], ['a', 3, 0], ['b', 4, 0], ['e', 0, 3], ['d', 1, 3], ['COM2', 2, 3], ['c', 3, 3], ['dp', 4, 3]]
    .map(([n, x, y]) => ({ n, x, y, label: n.startsWith('COM') ? 'COM (common cathode → GND)' : 'Segment ' + n })),
  links: () => [['COM1', 'COM2']],
  visual: (c, S) => {
    const com = S.v(c, 'COM1') === 0, on = {};
    for (const k of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp']) if (com && S.v(c, k) === 1) on[k] = 1;
    c.vis = { on };
  },
  draw: c => {
    const on = (c.vis && c.vis.on) || {};
    return `${legs([[0, 6], [20, 6], [40, 6], [60, 6], [80, 6]], 6)}${legs([[0, 60], [20, 60], [40, 60], [60, 60], [80, 60]], 6)}
      <rect x="-10" y="5" width="100" height="50" rx="3" fill="#1c1917" stroke="#44403c" stroke-width="2"/>
      ${segDigit(24, 8, 26, 44, on, '#ef4444', '#2a1717')}
      <circle cx="62" cy="49" r="3" fill="${on.dp ? '#ef4444' : '#2a1717'}"/>`;
  },
});

/* ---------- LCDs ---------- */
defPart('lcd', {
  name: 'LCD 16×2 (binary)', cat: 'Displays', level: 'beginner', box: [-2, -24, 316, 144],
  defaults: { text: 'Hello, World!' },
  props: [{ key: 'text', label: 'Line 1 text', type: 'text' }],
  pins: [{ n: 'VCC', x: 0, y: 0, label: 'VCC (+5V)' }, { n: 'GND', x: 0, y: 1, label: 'GND' },
    { n: 'D0', x: 0, y: 3, label: 'D0 (value 1)' }, { n: 'D1', x: 0, y: 4, label: 'D1 (value 2)' }, { n: 'D2', x: 0, y: 5, label: 'D2 (value 4)' }, { n: 'D3', x: 0, y: 6, label: 'D3 (value 8)' }],
  visual: (c, S) => {
    const on = S.powered(c, 'VCC', 'GND');
    let n = 0, bits = '';
    for (let i = 3; i >= 0; i--) { const b = S.v(c, 'D' + i) === 1 ? 1 : 0; bits += b; n |= b << i; }
    c.vis = { on, l1: String(c.props.text || '').slice(0, 16), l2: `BIN:${bits} DEC:${n}` };
  },
  draw: c => {
    const v = c.vis || {};
    let s = `<rect x="8" y="-20" width="304" height="160" rx="8" fill="#14532d" stroke="#052e16" stroke-width="2"/>`;
    [['VCC', 0], ['GND', 1], ['D0', 3], ['D1', 4], ['D2', 5], ['D3', 6]].forEach(([n, y]) => {
      s += `<path d="M0,${y * 20} H8" stroke="#94a3b8" stroke-width="3"/><text x="14" y="${y * 20 + 4}" fill="#bbf7d0" font-size="9">${n}</text>`;
    });
    s += lcdScreen(46, 22, [v.l1, v.l2], v.on, true);
    s += `<text x="174" y="-6" fill="#bbf7d0" font-size="10" text-anchor="middle">LCD 16×2 ${v.on ? '' : '— no power (connect VCC & GND)'}</text>`;
    return s;
  },
});

defPart('lcd_i2c', {
  name: 'LCD 16×2 I2C', cat: 'Displays', level: 'advanced', box: [-2, -24, 356, 104],
  pins: [{ n: 'GND', x: 0, y: 0, label: 'GND' }, { n: 'VCC', x: 0, y: 1, label: 'VCC (5V)' }, { n: 'SDA', x: 0, y: 2, label: 'SDA (I2C data)' }, { n: 'SCL', x: 0, y: 3, label: 'SCL (I2C clock)' }],
  init: c => { c.st.buf = ['                ', '                ']; c.st.bl = false; c.st.ready = false; },
  visual: (c, S) => { c.vis = { on: S.powered(c, 'VCC', 'GND') && c.st.ready, pw: S.powered(c, 'VCC', 'GND'), bl: c.st.bl, l: c.st.buf.slice() }; },
  draw: c => {
    const v = c.vis || {};
    let s = `<rect x="8" y="-20" width="344" height="120" rx="6" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="2"/>
      <rect x="10" y="-14" width="28" height="80" rx="2" fill="#111827"/>`;
    ['GND', 'VCC', 'SDA', 'SCL'].forEach((n, i) => { s += `<path d="M0,${i * 20} H12" stroke="#94a3b8" stroke-width="3"/><text x="42" y="${i * 20 + 4}" fill="#dbeafe" font-size="9">${n}</text>`; });
    s += lcdScreen(80, 14, v.l, v.on, v.pw && v.bl);
    s += `<text x="210" y="-6" fill="#dbeafe" font-size="9" text-anchor="middle">I2C LCD · addr 0x27 ${v.pw ? '' : '· NO POWER'}</text>`;
    return s;
  },
});

/* =========================================================
 *   PASSIVES
 * ========================================================= */
const RES_BANDS = { '220': ['#dc2626', '#dc2626', '#78350f'], '330': ['#f97316', '#f97316', '#78350f'], '1k': ['#78350f', '#111', '#dc2626'], '4.7k': ['#facc15', '#7c3aed', '#dc2626'], '10k': ['#78350f', '#111', '#f97316'] };
defPart('resistor', {
  name: 'Resistor', cat: 'Passive', box: [-2, -10, 82, 10],
  defaults: { ohms: '220' },
  props: [{ key: 'ohms', label: 'Resistance (Ω)', type: 'select', options: Object.keys(RES_BANDS) }],
  pins: [{ n: 'A', x: 0, y: 0 }, { n: 'B', x: 4, y: 0 }],
  resist: () => [['A', 'B']],
  loads: () => [{ a: 'A', b: 'B', kind: 'res' }],
  draw: c => {
    const b = RES_BANDS[c.props.ohms] || RES_BANDS['220'];
    return `<path d="M0,0 H80" stroke="#9ca3af" stroke-width="2.5"/>
      <rect x="18" y="-7" width="44" height="14" rx="6" fill="#e7c899" stroke="#a16207"/>
      <rect x="25" y="-7" width="4" height="14" fill="${b[0]}"/><rect x="33" y="-7" width="4" height="14" fill="${b[1]}"/>
      <rect x="41" y="-7" width="4" height="14" fill="${b[2]}"/><rect x="53" y="-7" width="3" height="14" fill="#ca8a04"/>
      <text x="40" y="-11" class="plabel small">${c.props.ohms}Ω</text>`;
  },
});

defPart('note', {
  name: 'Text Label', cat: 'Misc', box: [-4, -16, 120, 8],
  defaults: { text: 'Label', color: '#fbbf24' },
  props: [{ key: 'text', label: 'Text', type: 'text' }, { key: 'color', label: 'Color', type: 'select', options: ['#fbbf24', '#e2e8f0', '#1f2937', '#38bdf8', '#f87171', '#4ade80'] }],
  pins: [],
  draw: c => `<text x="0" y="0" fill="${esc(c.props.color)}" font-size="14" font-weight="700" class="note">${esc(c.props.text)}</text>`,
});

/* =========================================================
 *   BEGINNER LOGIC GATES (ideal, self-powered)
 * ========================================================= */
const GATE_FN = {
  AND: (a, b) => a && b, OR: (a, b) => a || b, NAND: (a, b) => !(a && b), NOR: (a, b) => !(a || b),
  XOR: (a, b) => a !== b, XNOR: (a, b) => a === b, NOT: a => !a,
};
function gateSVG(t) {
  const st = 'fill="#1e293b" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round"';
  const bubble = /^N|XNOR/.test(t) && t !== 'NOT' ? true : t === 'NOT';
  let s = '';
  if (t === 'NOT') s += `<path d="M0,20 H22" stroke="#94a3b8" stroke-width="3"/>`;
  else s += `<path d="M0,0 H30 M0,40 H30" stroke="#94a3b8" stroke-width="3"/>`;
  let tip = 74;
  if (t === 'AND' || t === 'NAND') s += `<path d="M20,-8 H46 A28,28 0 0 1 46,48 H20 Z" ${st}/>`;
  else if (t === 'NOT') { s += `<path d="M20,4 L64,20 L20,36 Z" ${st}/>`; tip = 64; }
  else {
    s += `<path d="M16,-8 Q34,20 16,48 Q52,48 74,20 Q52,-8 16,-8 Z" ${st}/>`;
    if (t === 'XOR' || t === 'XNOR') s += `<path d="M8,-8 Q26,20 8,48" fill="none" stroke="#e2e8f0" stroke-width="2.5"/>`;
  }
  if (bubble) { s += `<circle cx="${tip + 5}" cy="20" r="5" ${st}/>`; tip += 10; }
  s += `<path d="M${tip},20 H100" stroke="#94a3b8" stroke-width="3"/>`;
  s += `<text x="${t === 'NOT' ? 36 : 42}" y="24" fill="#7dd3fc" font-size="${t.length > 3 ? 9 : 11}" font-weight="700" text-anchor="middle">${t}</text>`;
  return s;
}
for (const t of ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR']) {
  const one = t === 'NOT';
  defPart('g_' + t.toLowerCase(), {
    name: t + ' Gate', cat: 'Logic Gates', level: 'both', box: [-2, -12, 102, 52],
    pins: one ? [{ n: 'A', x: 0, y: 1, label: 'Input A' }, { n: 'Y', x: 5, y: 1, label: 'Output Y' }]
      : [{ n: 'A', x: 0, y: 0, label: 'Input A' }, { n: 'B', x: 0, y: 2, label: 'Input B' }, { n: 'Y', x: 5, y: 1, label: 'Output Y' }],
    update: (c, S) => {
      const a = S.v(c, 'A') === 1, b = one ? false : S.v(c, 'B') === 1;
      const o = GATE_FN[t](a, b) ? 1 : 0;
      if (c.st.o !== o) { c.st.o = o; return true; }
      return false;
    },
    drive: c => [['Y', c.st.o || 0]],
    draw: () => gateSVG(t),
  });
}

/* =========================================================
 *   DIP ICs (74xx / 4xxx) — must be powered (VCC=HIGH, GND=LOW)
 * ========================================================= */
function dipPins(n, names) {
  const half = n / 2, a = [];
  for (let p = 1; p <= n; p++) a.push({ n: String(p), x: p <= half ? p - 1 : n - p, y: p <= half ? 3 : 0, label: `Pin ${p}: ${names[p - 1]}` });
  return a;
}
function dipDraw(n, title, sub) {
  const half = n / 2, w = (half - 1) * 20;
  let s = '';
  for (let i = 0; i < half; i++) s += `<rect x="${i * 20 - 3}" y="0" width="6" height="10" fill="#cbd5e1"/><rect x="${i * 20 - 3}" y="50" width="6" height="10" fill="#cbd5e1"/>`;
  s += `<rect x="-9" y="8" width="${w + 18}" height="44" rx="3" fill="#1f2937" stroke="#0b0f17" stroke-width="2"/>
    <path d="M-9,24 A6,6 0 0 1 -9,36" fill="#0b0f17"/>
    <circle cx="0" cy="44" r="2.5" fill="#64748b"/>
    <text x="${w / 2}" y="29" fill="#f1f5f9" font-size="11" font-weight="700" text-anchor="middle" font-family="monospace">${title}</text>
    <text x="${w / 2}" y="42" fill="#94a3b8" font-size="8" text-anchor="middle">${sub}</text>`;
  return s;
}
function defIC(type, title, sub, n, names, logic, extra) {
  defPart(type, Object.assign({
    name: title + ' ' + sub, short: title, cat: 'ICs', level: 'advanced', box: [-10, -2, (n / 2 - 1) * 20 + 10, 62],
    pins: dipPins(n, names),
    pinNames: names,
    update: (c, S) => {
      const vcc = String(n), gnd = String(n / 2);
      let out = {};
      if (S.powered(c, vcc, gnd)) {
        const inp = p => S.v(c, String(p)) === 1;
        out = logic(inp, c, S) || {};
      }
      const prev = c.st.out || {};
      if (S.serial) { // change one output at a time (lets latches settle)
        const all = new Set([...Object.keys(prev), ...Object.keys(out)]);
        for (const k of all) if (prev[k] !== out[k]) { const nx = Object.assign({}, prev); if (out[k] === undefined) delete nx[k]; else nx[k] = out[k]; c.st.out = nx; return true; }
        return false;
      }
      const a = JSON.stringify(out);
      if (a !== JSON.stringify(prev)) { c.st.out = out; return true; }
      return false;
    },
    drive: c => Object.entries(c.st.out || {}).map(([p, v]) => [p, v ? 1 : 0]),
    visual: (c, S) => { c.vis = { pw: S.powered(c, String(n), String(n / 2)) }; },
    draw: c => dipDraw(n, title, sub) + (c.vis && c.vis.pw === false ? `<text x="${(n / 2 - 1) * 10}" y="-4" class="plabel warn">no power</text>` : ''),
  }, extra || {}));
}
const Q2 = ['1A', '1B', '1Y', '2A', '2B', '2Y', 'GND', '3Y', '3A', '3B', '4Y', '4A', '4B', 'VCC'];
function quad(fn) {
  return inp => { const o = {}; for (const [a, b, y] of [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]]) o[y] = fn(inp(a), inp(b)) ? 1 : 0; return o; };
}
defIC('ic7400', '74HC00', 'Quad NAND', 14, Q2, quad((a, b) => !(a && b)));
defIC('ic7408', '74HC08', 'Quad AND', 14, Q2, quad((a, b) => a && b));
defIC('ic7432', '74HC32', 'Quad OR', 14, Q2, quad((a, b) => a || b));
defIC('ic7486', '74HC86', 'Quad XOR', 14, Q2, quad((a, b) => a !== b));
defIC('ic7402', '74HC02', 'Quad NOR', 14, ['1Y', '1A', '1B', '2Y', '2A', '2B', 'GND', '3A', '3B', '3Y', '4A', '4B', '4Y', 'VCC'],
  inp => { const o = {}; for (const [a, b, y] of [[2, 3, 1], [5, 6, 4], [8, 9, 10], [11, 12, 13]]) o[y] = !(inp(a) || inp(b)) ? 1 : 0; return o; });
defIC('ic7404', '74HC04', 'Hex NOT', 14, ['1A', '1Y', '2A', '2Y', '3A', '3Y', 'GND', '4Y', '4A', '5Y', '5A', '6Y', '6A', 'VCC'],
  inp => { const o = {}; for (const [a, y] of [[1, 2], [3, 4], [5, 6], [9, 8], [11, 10], [13, 12]]) o[y] = inp(a) ? 0 : 1; return o; });
defIC('ic74283', '74HC283', '4-bit Adder', 16, ['Σ2 (S2)', 'B2', 'A2', 'Σ1 (S1)', 'A1', 'B1', 'C0 (carry in)', 'GND', 'C4 (carry out)', 'Σ4 (S4)', 'B4', 'A4', 'Σ3 (S3)', 'A3', 'B3', 'VCC'],
  inp => {
    const A = inp(5) | inp(3) << 1 | inp(14) << 2 | inp(12) << 3;
    const B = inp(6) | inp(2) << 1 | inp(15) << 2 | inp(11) << 3;
    const s = A + B + (inp(7) ? 1 : 0);
    return { 4: s & 1, 1: (s >> 1) & 1, 13: (s >> 2) & 1, 10: (s >> 3) & 1, 9: (s >> 4) & 1 };
  });
defIC('ic4511', 'CD4511', 'BCD→7seg', 16, ['B', 'C', 'LT (lamp test, tie HIGH)', 'BI (blank, tie HIGH)', 'LE (latch, tie LOW)', 'D', 'A', 'VSS (GND)', 'e', 'd', 'c', 'b', 'a', 'g', 'f', 'VDD (+5V)'],
  (inp, c) => {
    const segPin = { a: 13, b: 12, c: 11, d: 10, e: 9, f: 15, g: 14 };
    let n = inp(7) | inp(1) << 1 | inp(2) << 2 | inp(6) << 3;
    if (inp(5)) n = c.st.latch === undefined ? n : c.st.latch; else c.st.latch = n;
    let lit = '';
    if (!inp(3)) lit = 'abcdefg'; else if (!inp(4)) lit = ''; else if (n <= 9) lit = HEX7[n];
    const o = {}; for (const k in segPin) o[segPin[k]] = lit.includes(k) ? 1 : 0;
    return o;
  });

/* =========================================================
 *   BREADBOARD
 * ========================================================= */
defPart('breadboard', {
  name: 'Breadboard', cat: 'Boards', level: 'advanced', layer: 'bottom', isBoard: true,
  defaults: { cols: 30 },
  props: [{ key: 'cols', label: 'Columns', type: 'select', options: [30, 60] }],
  box: c => [0, 0, ((c ? c.props.cols : 30) + 3) * G, 19.5 * G],
  pins: [],
  groups: c => {
    const N = c.props.cols, g = [];
    for (let col = 1; col <= N; col++) {
      g.push('abcde'.split('').map(r => [col + 1, BB_ROWS[r], r + col]));
      g.push('fghij'.split('').map(r => [col + 1, BB_ROWS[r], r + col]));
    }
    for (const [k, y] of Object.entries(BB_RAILS)) {
      const nm = (k[0] === 't' ? 'top ' : 'bottom ') + (k[1] === '+' ? '+ (power) rail' : '− (ground) rail');
      const row = []; for (let col = 1; col <= N; col++) row.push([col + 1, y, nm]); g.push(row);
    }
    return g;
  },
  draw: c => {
    const N = c.props.cols, W = (N + 3) * G, H = 19.5 * G;
    let s = `<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="#f4f1ea" stroke="#d6d0c2" stroke-width="2"/>
      <rect x="10" y="${8.6 * G}" width="${W - 20}" height="${2.8 * G}" fill="#e7e2d6"/>
      <rect x="10" y="${9.75 * G}" width="${W - 20}" height="${0.5 * G}" fill="#d8d2c4"/>
      <path d="M${G},${0.4 * G} H${W - G}" stroke="#2563eb" stroke-width="2"/><path d="M${G},${2.6 * G} H${W - G}" stroke="#dc2626" stroke-width="2"/>
      <path d="M${G},${16.4 * G} H${W - G}" stroke="#dc2626" stroke-width="2"/><path d="M${G},${18.6 * G} H${W - G}" stroke="#2563eb" stroke-width="2"/>`;
    const sign = (y, t, col) => `<text x="${0.75 * G}" y="${y * G + 4}" fill="${col}" font-size="13" font-weight="700" text-anchor="middle">${t}</text><text x="${W - 0.75 * G}" y="${y * G + 4}" fill="${col}" font-size="13" font-weight="700" text-anchor="middle">${t}</text>`;
    s += sign(1, '−', '#2563eb') + sign(2, '+', '#dc2626') + sign(17, '+', '#dc2626') + sign(18, '−', '#2563eb');
    let holes = '';
    for (let col = 1; col <= N; col++) {
      const x = (col + 1) * G;
      for (const y of [1, 2, 17, 18, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15]) holes += `<rect x="${x - 3.5}" y="${y * G - 3.5}" width="7" height="7" rx="1.2"/>`;
      if (col === 1 || col % 5 === 0) s += `<text x="${x}" y="${3.25 * G}" class="bbnum">${col}</text><text x="${x}" y="${16.1 * G}" class="bbnum">${col}</text>`;
    }
    s += `<g class="holes">${holes}</g>`;
    for (const [r, y] of Object.entries(BB_ROWS)) s += `<text x="${G}" y="${y * G + 3.5}" class="bbnum">${r}</text><text x="${W - G}" y="${y * G + 3.5}" class="bbnum">${r}</text>`;
    return s;
  },
});

/* =========================================================
 *   MICROCONTROLLERS
 * ========================================================= */
const UNO_TOP = [['SCL', 6], ['SDA', 7], ['AREF', 8], ['GND', 9], ['D13', 10], ['D12', 11], ['D11', 12], ['D10', 13], ['D9', 14], ['D8', 15],
  ['D7', 17], ['D6', 18], ['D5', 19], ['D4', 20], ['D3', 21], ['D2', 22], ['D1', 23], ['D0', 24]];
const UNO_BOT = [['IOREF', 8], ['RESET', 9], ['3V3', 10], ['5V', 11], ['GND1', 12], ['GND2', 13], ['VIN', 14], ['A0', 16], ['A1', 17], ['A2', 18], ['A3', 19], ['A4', 20], ['A5', 21]];
const UNO_LABEL = n => ({ GND1: 'GND', GND2: 'GND', D13: '13', D12: '12', D11: '~11', D10: '~10', D9: '~9', D8: '8', D7: '7', D6: '~6', D5: '~5', D4: '4', D3: '~3', D2: '2', D1: 'TX→1', D0: 'RX←0' }[n] || n);
const UNO_PWM = [3, 5, 6, 9, 10, 11];

const ESP_TOP = [['D0', 1], ['D1', 2], ['D2', 3], ['D3', 4], ['D4', 5], ['3V3', 6], ['GND', 7], ['D5', 8], ['D6', 9], ['D7', 10], ['D8', 11], ['RX', 12], ['TX', 13], ['GNDb', 14], ['3V3b', 15]];
const ESP_BOT = [['A0', 1], ['RSV', 2], ['RSV2', 3], ['SD3', 4], ['SD2', 5], ['SD1', 6], ['CMD', 7], ['SD0', 8], ['CLK', 9], ['GNDc', 10], ['3V3c', 11], ['EN', 12], ['RST', 13], ['GNDd', 14], ['VIN', 15]];
const ESP_GPIO = { D0: 16, D1: 5, D2: 4, D3: 0, D4: 2, D5: 14, D6: 12, D7: 13, D8: 15, RX: 3, TX: 1, A0: 17 };
const ESP_LABEL = n => ({ GNDb: 'GND', GNDc: 'GND', GNDd: 'GND', '3V3b': '3V3', '3V3c': '3V3', RSV2: 'RSV' }[n] || n);

function mcuPinName(c, gpio) {
  gpio = Number(gpio);
  if (c.type === 'uno') return gpio <= 13 ? 'D' + gpio : (gpio <= 19 ? 'A' + (gpio - 14) : null);
  for (const k in ESP_GPIO) if (ESP_GPIO[k] === gpio) return k;
  return null;
}
function mcuDrive(c, power) {
  const d = power.slice();
  const io = c.st.io || {};
  for (const g in io) {
    const e = io[g], n = mcuPinName(c, g); if (!n) continue;
    if (e.mode === 'OUTPUT') d.push([n, e.val ? 1 : 0, 2, e.lvl == null ? (e.val ? 1 : 0) : e.lvl]);
    else if (e.mode === 'INPUT_PULLUP') d.push([n, 1, 1]);
  }
  return d;
}
function headerSVG(list, y, up, labelFn) {
  let s = '';
  for (const [n, x] of list) {
    s += `<rect x="${x * G - 8}" y="${y - 8}" width="16" height="16" fill="#111"/><rect x="${x * G - 3}" y="${y - 3}" width="6" height="6" fill="#d4d4d8"/>`;
    s += `<text x="${x * G}" y="${up ? y + 14 : y - 12}" class="hdr" transform="rotate(-90 ${x * G} ${up ? y + 14 : y - 12})" text-anchor="${up ? 'end' : 'start'}">${labelFn(n)}</text>`;
  }
  return s;
}

const UNO_CODE = `// Arduino UNO sketch
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Hello from Arduino!");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
`;
defPart('uno', {
  name: 'Arduino UNO', cat: 'Microcontrollers', level: 'advanced', layer: 'bottom', mcu: true, box: [-14, 0, 524, 380],
  defaults: { code: UNO_CODE },
  pins: [...UNO_TOP.map(([n, x]) => ({ n, x, y: 1, label: UNO_LABEL(n) })), ...UNO_BOT.map(([n, x]) => ({ n, x, y: 18, label: UNO_LABEL(n) }))],
  links: () => [['GND', 'GND1'], ['GND', 'GND2'], ['SDA', 'A4'], ['SCL', 'A5']],
  drive: c => mcuDrive(c, [['5V', 1], ['3V3', 1], ['VIN', 1], ['IOREF', 1], ['GND', 0], ['GND1', 0], ['GND2', 0]]),
  visual: c => { const io = (c.st.io || {})[13]; c.vis = { L: !!(io && io.mode === 'OUTPUT' && (io.lvl != null ? io.lvl > 0 : io.val)), run: !!c.st.running, tx: !!c.st.tx }; },
  draw: c => {
    const v = c.vis || {};
    return `<rect x="0" y="0" width="520" height="380" rx="14" fill="#0e7c86" stroke="#075e66" stroke-width="3"/>
      <rect x="-14" y="44" width="72" height="66" rx="3" fill="#a1a1aa" stroke="#52525b" stroke-width="2"/><rect x="-6" y="56" width="56" height="42" fill="#d4d4d8"/>
      <rect x="-8" y="262" width="60" height="70" rx="4" fill="#18181b"/><circle cx="22" cy="297" r="12" fill="#3f3f46"/>
      <rect x="${5.4 * G}" y="8" width="${10.2 * G}" height="24" fill="#18181b" rx="2"/><rect x="${16.4 * G}" y="8" width="${8.2 * G}" height="24" fill="#18181b" rx="2"/>
      <rect x="${7.4 * G}" y="348" width="${7.2 * G}" height="24" fill="#18181b" rx="2"/><rect x="${15.4 * G}" y="348" width="${6.2 * G}" height="24" fill="#18181b" rx="2"/>
      ${headerSVG(UNO_TOP, 20, true, UNO_LABEL)}${headerSVG(UNO_BOT, 360, false, UNO_LABEL)}
      <rect x="250" y="230" width="230" height="52" rx="4" fill="#18181b"/><text x="365" y="261" fill="#a1a1aa" font-size="12" text-anchor="middle" font-family="monospace">ATMEGA328P</text>
      <circle cx="250" cy="256" r="4" fill="#3f3f46"/>
      <text x="150" y="190" fill="#fff" font-size="40" font-weight="800" font-style="italic">UNO</text>
      <text x="150" y="216" fill="#e0f2fe" font-size="15" font-weight="700" letter-spacing="2">ARDUINO</text>
      <rect x="22" y="12" width="26" height="22" rx="4" fill="#d4d4d8"/><circle cx="35" cy="23" r="7" fill="#b91c1c"/><text x="35" y="44" class="hdr" text-anchor="middle">RESET</text>
      <rect x="182" y="66" width="12" height="8" rx="1" fill="${v.L ? '#fb923c' : '#7c2d12'}" ${v.L ? 'filter="url(#glow)"' : ''}/><text x="200" y="74" class="hdr">L</text>
      <rect x="182" y="84" width="12" height="8" rx="1" fill="${v.tx ? '#fbbf24' : '#713f12'}"/><text x="200" y="92" class="hdr">TX</text>
      <rect x="182" y="100" width="12" height="8" rx="1" fill="#713f12"/><text x="200" y="108" class="hdr">RX</text>
      <rect x="440" y="110" width="12" height="8" rx="1" fill="#4ade80" filter="url(#glow)"/><text x="458" y="118" class="hdr">ON</text>
      ${v.run ? '<text x="380" y="190" fill="#bbf7d0" font-size="12" font-weight="700">● RUNNING</text>' : '<text x="380" y="190" fill="#cffafe" font-size="11">■ stopped</text>'}`;
  },
});

const ESP_CODE = `// NodeMCU ESP8266 sketch
// Note: the built-in LED (GPIO2 / D4) is ACTIVE LOW.
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("ESP8266 ready");
}

void loop() {
  digitalWrite(LED_BUILTIN, LOW);   // LED on
  delay(300);
  digitalWrite(LED_BUILTIN, HIGH);  // LED off
  delay(300);
}
`;
defPart('esp8266', {
  name: 'ESP8266 NodeMCU', cat: 'Microcontrollers', level: 'advanced', layer: 'bottom', mcu: true, box: [0, -14, 356, 134],
  defaults: { code: ESP_CODE },
  pins: [...ESP_TOP.map(([n, x]) => ({ n, x, y: 0, label: ESP_LABEL(n) + (ESP_GPIO[n] !== undefined ? ` (GPIO${ESP_GPIO[n]})` : '') })),
    ...ESP_BOT.map(([n, x]) => ({ n, x, y: 6, label: ESP_LABEL(n) + (n === 'A0' ? ' (analog)' : '') }))],
  links: () => [['GND', 'GNDb'], ['GND', 'GNDc'], ['GND', 'GNDd'], ['3V3', '3V3b'], ['3V3', '3V3c']],
  drive: c => mcuDrive(c, [['3V3', 1], ['3V3b', 1], ['3V3c', 1], ['VIN', 1], ['GND', 0], ['GNDb', 0], ['GNDc', 0], ['GNDd', 0]]),
  visual: c => { const io = (c.st.io || {})[2]; c.vis = { L: !!(io && io.mode === 'OUTPUT' && !io.val), run: !!c.st.running, wifi: !!c.st.wifi, tx: !!c.st.tx }; },
  draw: c => {
    const v = c.vis || {};
    return `<rect x="4" y="-12" width="350" height="144" rx="8" fill="#1c1c1c" stroke="#000" stroke-width="2"/>
      ${headerSVG(ESP_TOP, 0, true, ESP_LABEL)}${headerSVG(ESP_BOT, 120, false, ESP_LABEL)}
      <rect x="30" y="30" width="150" height="62" rx="3" fill="#c0c4cc" stroke="#71717a"/>
      <path d="M38,36 h14 v12 h-10 v8 h10 v8 h-10 v8 h14" fill="none" stroke="#b45309" stroke-width="2.5"/>
      <text x="118" y="58" fill="#27272a" font-size="12" font-weight="800" text-anchor="middle">ESP8266</text>
      <text x="118" y="72" fill="#3f3f46" font-size="8" text-anchor="middle">ESP-12E · Wi-Fi</text>
      <circle cx="194" cy="40" r="5" fill="${v.L ? '#60a5fa' : '#1e3a5f'}" ${v.L ? 'filter="url(#glow)"' : ''}/><text x="203" y="43" class="hdr">LED D4</text>
      <rect x="322" y="42" width="40" height="36" rx="3" fill="#a1a1aa"/><rect x="330" y="50" width="26" height="20" fill="#52525b"/>
      <text x="250" y="66" fill="#e5e7eb" font-size="14" font-weight="700" text-anchor="middle">NodeMCU</text>
      <text x="250" y="84" fill="${v.wifi ? '#4ade80' : '#9ca3af'}" font-size="10" text-anchor="middle">${v.wifi ? '📶 Wi-Fi connected' : (v.run ? '● RUNNING' : '■ stopped')}</text>
      <rect x="205" y="92" width="22" height="14" rx="2" fill="#3f3f46"/><text x="216" y="114" class="hdr" text-anchor="middle">RST</text>
      <rect x="285" y="92" width="22" height="14" rx="2" fill="#3f3f46"/><text x="296" y="114" class="hdr" text-anchor="middle">FLASH</text>`;
  },
});

if (typeof module !== 'undefined') module.exports = Object.assign(module.exports || {}, { BB_ROWS, BB_RAILS, mcuPinName, ESP_GPIO });
