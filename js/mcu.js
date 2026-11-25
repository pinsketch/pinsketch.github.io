/* PinSketch — Arduino / ESP8266 simulator
 * A small Arduino-C++ → JavaScript translator plus a runtime that drives the
 * board's pins inside the circuit simulation. Supports the common Arduino API,
 * Serial, LiquidCrystal_I2C, ESP8266WiFi and ESP8266WebServer.
 */
'use strict';

const CTYPE = '(?:(?:static|const|volatile|unsigned|signed)\\s+)*(?:void|long\\s+long|long|int|short|float|double|bool|boolean|byte|char|String|uint8_t|uint16_t|uint32_t|uint64_t|int8_t|int16_t|int32_t|int64_t|size_t|word|unsigned)\\b(?:\\s*\\*)?';
const CONTROL_WORDS = new Set(['if', 'for', 'while', 'switch', 'return', 'catch', 'else', 'do', 'sizeof']);
const SIM_CLASSES = ['LiquidCrystal_I2C', 'ESP8266WebServer', 'WebServer', 'Servo'];

function transpileArduino(src) {
  const lits = [];
  let out = '', i = 0;
  // 1) protect string/char literals, drop comments (keep line numbers)
  while (i < src.length) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '/' && nx === '/') { let j = src.indexOf('\n', i); if (j < 0) j = src.length; i = j; continue; }
    if (ch === '/' && nx === '*') { let j = src.indexOf('*/', i + 2); j = j < 0 ? src.length : j + 2; out += src.slice(i, j).replace(/[^\n]/g, ''); i = j; continue; }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== ch && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
      j++;
      lits.push(src.slice(i, j));
      out += '__L' + (lits.length - 1) + '__';
      i = j; continue;
    }
    out += ch; i++;
  }
  let s = out;
  // integer-typed variable names (so that  x = a / b  truncates like C)
  const INT_T = '(?:(?:static|const|volatile)\\s+)*(?:unsigned\\s+|signed\\s+)?(?:long\\s+long|long|int|short|byte|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|size_t|word|unsigned)';
  const intNames = new Set();
  s.replace(new RegExp('\\b' + INT_T + '\\s+(\\w+)\\s*(?=[=;,)])', 'g'), (m, n) => { intNames.add(n); return m; });
  // 2) preprocessor
  s = s.replace(/^[ \t]*#[ \t]*include.*$/gm, '');
  s = s.replace(/^[ \t]*#[ \t]*define[ \t]+(\w+)[ \t]+(.+)$/gm, 'const $1 = $2;');
  s = s.replace(/^[ \t]*#.*$/gm, '');
  // 3) C++ lambdas  [](){ ... }
  s = s.replace(/\[\s*[&=]?\s*\]\s*\(\s*\)\s*\{/g, 'async () => {');
  // 4) prototypes
  s = s.replace(new RegExp('^[ \\t]*' + CTYPE + '\\s*(\\w+)\\s*\\(([^)]*)\\)\\s*;', 'gm'), (m, name) => CONTROL_WORDS.has(name) ? m : '');
  // 5) function definitions
  const fnNames = [];
  s = s.replace(new RegExp('(^|[;}\\s])' + CTYPE + '\\s*(\\w+)\\s*\\(([^)]*)\\)\\s*\\{', 'g'), (m, pre, name, params) => {
    if (CONTROL_WORDS.has(name)) return m;
    fnNames.push(name);
    const ps = params.split(',').map(p => {
      p = p.trim(); if (!p || p === 'void') return '';
      let def = '';
      const eq = p.indexOf('='); if (eq >= 0) { def = ' = ' + p.slice(eq + 1).trim(); p = p.slice(0, eq); }
      const nm = p.replace(/[\[\]&*]/g, ' ').trim().split(/\s+/).pop();
      return nm + def;
    }).filter(Boolean);
    return pre + 'async function ' + name + '(' + ps.join(', ') + ') {';
  });
  // 6) object declarations   LiquidCrystal_I2C lcd(0x27,16,2);
  s = s.replace(new RegExp('\\b(' + SIM_CLASSES.join('|') + ')\\s+(\\w+)\\s*(?:\\(([^)]*)\\))?\\s*;', 'g'), (m, cls, nm, args) => `const ${nm} = new ${cls}(${args || ''});`);
  // 7) arrays
  s = s.replace(new RegExp(CTYPE + '\\s*(\\w+)\\s*((?:\\[[^\\]]*\\]\\s*)+)=\\s*\\{', 'g'), 'let $1 = __ARR{');
  let idx;
  while ((idx = s.indexOf('__ARR{')) >= 0) {
    let j = idx + 5, depth = 0, res = '';
    for (; j < s.length; j++) {
      const c = s[j];
      if (c === '{') { depth++; res += '['; }
      else if (c === '}') { depth--; res += ']'; if (depth === 0) { j++; break; } }
      else res += c;
    }
    s = s.slice(0, idx) + res + s.slice(j);
  }
  s = s.replace(new RegExp(CTYPE + '\\s*(\\w+)\\s*\\[[^\\]]*\\]\\s*=', 'g'), 'let $1 =');
  s = s.replace(new RegExp(CTYPE + '\\s*(\\w+)\\s*\\[([^\\]]+)\\]\\s*\\[([^\\]]+)\\]\\s*;', 'g'), 'let $1 = Array.from({length: $2}, () => new Array($3).fill(0));');
  s = s.replace(new RegExp(CTYPE + '\\s*(\\w+)\\s*\\[([^\\]]+)\\]\\s*;', 'g'), 'let $1 = new Array($2).fill(0);');
  // 8) casts and declarations
  s = s.replace(/\(\s*(?:unsigned\s+)?(?:int|long|byte|float|double|char|uint8_t|uint16_t|word)\s*\)/g, '');
  s = s.replace(/\bString\s+(\w+)\s*;/g, 'let $1 = "";');
  const EXPR = '((?:[^;,{()]|\\((?:[^()]|\\([^()]*\\))*\\))+)';
  s = s.replace(new RegExp('\\b' + INT_T + '\\s+(\\w+)\\s*=\\s*' + EXPR + ';', 'g'), (m, n, e) => `let ${n} = __i(${e.trim()});`);
  s = s.replace(new RegExp('\\b' + CTYPE + '\\s*(?=[A-Za-z_]\\w*\\s*(?:[=;,)\\[]|$))', 'gm'), 'let ');
  s = s.replace(/\blet\s+(\w+)\s*;/g, 'let $1 = 0;');
  if (intNames.size) {
    const names = [...intNames].join('|');
    s = s.replace(new RegExp('(?<![\\w.$])(' + names + ')\\s*\\/=\\s*' + EXPR + ';', 'g'), '$1 = __i($1 / ($2));');
    s = s.replace(new RegExp('(?<![\\w.$]|let\\s)(' + names + ')\\s*=(?!=)\\s*' + EXPR + ';', 'g'), '$1 = __i($2);');
  }
  // 9) misc C-isms
  s = s.replace(/sizeof\s*\(\s*(\w+)\s*\)\s*\/\s*sizeof\s*\(\s*\1\s*\[\s*0\s*\]\s*\)/g, '$1.length');
  s = s.replace(/sizeof\s*\(\s*(\w+)\s*\)/g, '$1.length');
  s = s.replace(/\.length\s*\(\s*\)/g, '.length');
  s = s.replace(/\bB([01]{1,8})\b/g, '0b$1');
  s = s.replace(/\b(millis|micros)\(\)\s*\/\s*(\d+)(?![.\d])/g, '__i($1() / $2)'); // unsigned long math
  // 10) await for delays and user functions
  const asyncNames = ['delay', 'delayMicroseconds', ...fnNames];
  s = s.replace(new RegExp('(?<![\\w.$])(?<!function\\s+)(' + asyncNames.join('|') + ')\\s*\\(', 'g'), 'await $1(');
  s = s.replace(/(?<![\w.$])(\w+)\.handleClient\s*\(/g, 'await $1.handleClient(');
  // 11) let long loops breathe (prevents the browser from freezing)
  const PAR = '(\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*\\))';
  s = s.replace(new RegExp('(?<!\\}\\s*)\\bwhile\\s*' + PAR + '\\s*\\{', 'g'), 'while $1 { await __y();');
  s = s.replace(new RegExp('(?<!\\}\\s*)\\bwhile\\s*' + PAR + '\\s*;', 'g'), 'while $1 { await __y(); }');
  s = s.replace(new RegExp('\\bfor\\s*' + PAR + '\\s*\\{', 'g'), 'for $1 { await __y();');
  s = s.replace(/\bdo\s*\{/g, 'do { await __y();');
  // 12) restore literals
  s = s.replace(/__L(\d+)__/g, (m, k) => lits[+k]);
  return s;
}

// Arduino-ish String helpers
if (!String.prototype.toInt) {
  String.prototype.toInt = function () { return parseInt(this, 10) || 0; };
  String.prototype.toFloat = function () { return parseFloat(this) || 0; };
  String.prototype.equals = function (o) { return String(this) === String(o); };
  String.prototype.equalsIgnoreCase = function (o) { return String(this).toLowerCase() === String(o).toLowerCase(); };
  String.prototype.c_str = function () { return String(this); };
}

const STOP = { stop: true };
const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;

function fmtNum(x, f) {
  if (typeof x === 'boolean') return x ? '1' : '0';
  if (typeof x !== 'number') return String(x);
  if (Number.isInteger(x)) {
    if (f === 16 || f === 2 || f === 8) return (x >>> 0).toString(f).toUpperCase();
    return String(x);
  }
  return x.toFixed(typeof f === 'number' && f < 8 ? f : 2);
}

class MCU {
  constructor(app, comp) {
    this.app = app; this.c = comp; this.alive = false; this.pending = new Set();
    this.isESP = comp.type === 'esp8266';
    this.serialIn = ''; this.server = null; this.warned = new Set();
  }
  log(s) { this.app.serialWrite(this.c, s); this.c.st.tx = true; clearTimeout(this._txT); this._txT = setTimeout(() => { this.c.st.tx = false; this.app.markDirty(); }, 80); this.app.markDirty(); }
  warn(s) { if (this.warned.has(s)) return; this.warned.add(s); this.app.serialWrite(this.c, '⚠ ' + s + '\n', 'warn'); }
  sleep(ms) {
    return new Promise((res, rej) => {
      if (!this.alive) return rej(STOP);
      const h = { rej };
      h.t = setTimeout(() => { this.pending.delete(h); this.alive ? res() : rej(STOP); }, Math.max(0, ms));
      this.pending.add(h);
    });
  }
  stop() {
    this.alive = false;
    for (const h of this.pending) { clearTimeout(h.t); h.rej(STOP); }
    this.pending.clear();
    this.c.st.io = {}; this.c.st.running = false; this.c.st.wifi = false;
    if (this.server) this.app.browserServer(this, null);
    this.server = null;
    this.app.markDirty();
  }
  gpio(p) {
    if (typeof p === 'string') { const m = /^([AD])(\d+)$/.exec(p); if (m) p = this.isESP ? ESP_GPIO[p] : (m[1] === 'A' ? 14 + +m[2] : +m[2]); }
    return Number(p);
  }
  readNet(gpio) {
    const n = mcuPinName(this.c, gpio); if (!n) return { v: null, lvl: 0 };
    this.app.ensureSolved();
    const S = this.app.solver, net = S.net(this.c, n);
    return net ? { v: net.v, lvl: net.lvl } : { v: null, lvl: 0 };
  }

  api() {
    const self = this, c = this.c, app = this.app;
    const io = () => c.st.io || (c.st.io = {});
    const t0 = performance.now();
    let lastYield = performance.now();
    const A = {
      HIGH: 1, LOW: 0, INPUT: 'INPUT', OUTPUT: 'OUTPUT', INPUT_PULLUP: 'INPUT_PULLUP',
      LED_BUILTIN: this.isESP ? 2 : 13, HEX: 16, BIN: 2, OCT: 8, DEC: 10, PI: Math.PI, NULL: null,
      CHANGE: 1, RISING: 3, FALLING: 2,
      pinMode(p, m) { p = self.gpio(p); io()[p] = { mode: m, val: 0, lvl: null }; app.markDirty(); },
      digitalWrite(p, v) {
        p = self.gpio(p);
        let e = io()[p];
        if (!e) { e = io()[p] = { mode: 'INPUT', val: 0 }; }
        const old = e.val;
        if (e.mode === 'OUTPUT') { e.val = v ? 1 : 0; e.lvl = null; }
        else { e.mode = v ? 'INPUT_PULLUP' : 'INPUT'; self.warn(`digitalWrite(${p}) used before pinMode(${p}, OUTPUT) — the pin is still an INPUT, so the LED will not light. Add pinMode in setup().`); }
        app.markDirty();
        if (old !== e.val && app.hasEdgeParts && app.hasEdgeParts()) app.ensureSolved(); // let clocked chips see every pulse
      },
      digitalRead(p) {
        p = self.gpio(p);
        const e = io()[p];
        if (e && e.mode === 'OUTPUT') return e.val;
        const r = self.readNet(p);
        return r.v === 1 ? 1 : 0;
      },
      analogRead(p) {
        p = self.gpio(p);
        if (!self.isESP && p < 6) p += 14;
        if (self.isESP && p === 0) p = 17;
        const r = self.readNet(p);
        if (r.v === 'X') return 0;
        const n = mcuPinName(c, p); app.ensureSolved();
        const V = n ? app.solver.volts(c, n) : 0, vref = self.isESP ? 3.3 : 5;
        if (r.v === null && !V) return Math.floor(Math.random() * 40);
        return Math.max(0, Math.min(1023, Math.round(V / vref * 1023)));
      },
      analogWrite(p, v) {
        p = self.gpio(p);
        v = Math.max(0, Math.min(255, Math.round(v)));
        if (!self.isESP && !UNO_PWM.includes(p)) { self.warn(`Pin ${p} has no PWM (~). On the UNO use 3, 5, 6, 9, 10 or 11.`); io()[p] = { mode: 'OUTPUT', val: v >= 128 ? 1 : 0, lvl: null }; }
        else io()[p] = { mode: 'OUTPUT', val: v > 0 ? 1 : 0, lvl: v / 255 };
        app.markDirty();
      },
      MSBFIRST: 1, LSBFIRST: 0,
      shiftOut(dp, cp, order, val) {
        for (let i = 0; i < 8; i++) {
          const bitv = order ? (val >> (7 - i)) & 1 : (val >> i) & 1;
          A.digitalWrite(dp, bitv); app.ensureSolved();
          A.digitalWrite(cp, 1); app.ensureSolved();
          A.digitalWrite(cp, 0); app.ensureSolved();
        }
      },
      tone(p, f, d) {
        A.pinMode(p, 'OUTPUT'); A.digitalWrite(p, 1);
        if (typeof Sound !== 'undefined') { Sound.mcuHz = Math.max(31, Math.min(8000, +f || 1000)); Sound.mcuOwner = self; }
        if (d) setTimeout(() => { if (self.alive) { A.digitalWrite(p, 0); if (typeof Sound !== 'undefined') Sound.mcuHz = null; } }, d);
      },
      noTone(p) { A.digitalWrite(p, 0); if (typeof Sound !== 'undefined') Sound.mcuHz = null; },
      delay: ms => self.sleep(ms),
      delayMicroseconds: us => self.sleep(us / 1000),
      millis: () => Math.floor(performance.now() - t0),
      micros: () => Math.floor((performance.now() - t0) * 1000),
      random: (a, b) => b === undefined ? Math.floor(Math.random() * a) : Math.floor(a + Math.random() * (b - a)),
      randomSeed() { },
      map: (x, a, b, c2, d) => Math.trunc((x - a) * (d - c2) / (b - a) + c2),
      constrain: (x, a, b) => Math.min(b, Math.max(a, x)),
      min: Math.min, max: Math.max, abs: Math.abs, pow: Math.pow, sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan,
      floor: Math.floor, ceil: Math.ceil, round: Math.round, int: x => Math.trunc(Number(x)), float: x => Number(x),
      bitRead: (x, n) => (x >> n) & 1, bit: n => 1 << n, lowByte: x => x & 255, highByte: x => (x >> 8) & 255,
      F: s => s,
      String: (x, f) => (typeof x === 'number' && f !== undefined) ? fmtNum(x, f) : (x === undefined ? '' : (typeof x === 'number' && !Number.isInteger(x) ? x.toFixed(2) : String(x))),
      attachInterrupt() { self.warn('attachInterrupt is not simulated — poll the pin in loop() instead.'); }, digitalPinToInterrupt: p => p,
      __i: x => typeof x === 'number' ? Math.trunc(x) : x,
      __y: async () => { if (!self.alive) throw STOP; const n = performance.now(); if (n - lastYield > 12) { lastYield = n; await self.sleep(0); } },
      Serial: {
        begin() { }, end() { }, flush() { },
        print: (x, f) => self.log(fmtNum(x === undefined ? '' : x, f)),
        println: (x, f) => self.log(fmtNum(x === undefined ? '' : x, f) + '\n'),
        write: x => self.log(typeof x === 'number' ? String.fromCharCode(x) : String(x)),
        available: () => self.serialIn.length,
        read: () => { if (!self.serialIn.length) return -1; const ch = self.serialIn[0]; self.serialIn = self.serialIn.slice(1); return ch; },
        peek: () => self.serialIn.length ? self.serialIn[0] : -1,
        readString: () => { const s = self.serialIn; self.serialIn = ''; return s; },
        readStringUntil: ch => { const k = self.serialIn.indexOf(ch); let s; if (k < 0) { s = self.serialIn; self.serialIn = ''; } else { s = self.serialIn.slice(0, k); self.serialIn = self.serialIn.slice(k + 1); } return s; },
        parseInt: () => { const m = /-?\d+/.exec(self.serialIn); if (!m) { self.serialIn = ''; return 0; } self.serialIn = self.serialIn.slice(m.index + m[0].length); return parseInt(m[0], 10); },
        parseFloat: () => { const m = /-?\d+(\.\d+)?/.exec(self.serialIn); if (!m) { self.serialIn = ''; return 0; } self.serialIn = self.serialIn.slice(m.index + m[0].length); return parseFloat(m[0]); },
      },
      Wire: { begin() { }, beginTransmission() { }, endTransmission: () => 0, write() { } },
    };
    A.LiquidCrystal_I2C = class {
      constructor(addr, cols, rows) { this.addr = addr; this.cx = 0; this.cy = 0; }
      _dev() {
        const d = app.findI2CLcd(c);
        if (!d) self.warn('No I2C LCD found. Wire LCD SDA → ' + (self.isESP ? 'D2' : 'A4') + ' and SCL → ' + (self.isESP ? 'D1' : 'A5') + ' (plus VCC and GND).');
        return d;
      }
      init() { const d = this._dev(); if (!d) return; d.st.ready = true; d.st.buf = ['                ', '                ']; this.cx = this.cy = 0; app.markDirty(); }
      begin() { this.init(); }
      backlight() { const d = this._dev(); if (d) { d.st.bl = true; app.markDirty(); } }
      noBacklight() { const d = this._dev(); if (d) { d.st.bl = false; app.markDirty(); } }
      clear() { const d = this._dev(); if (d) { d.st.buf = ['                ', '                ']; app.markDirty(); } this.cx = this.cy = 0; }
      home() { this.cx = this.cy = 0; }
      setCursor(col, row) { this.cx = col; this.cy = row; }
      print(x, f) {
        const d = this._dev(); const s = fmtNum(x === undefined ? '' : x, f);
        for (const ch of s) {
          if (ch === '\n' || ch === '\r') continue;
          if (d &&this.cy >= 0 && this.cy < 2 && this.cx >= 0 && this.cx < 16) { const l = d.st.buf[this.cy]; d.st.buf[this.cy] = l.slice(0, this.cx) + ch + l.slice(this.cx + 1); }
          this.cx++;
        }
        app.markDirty();
      }
      write(ch) { this.print(typeof ch === 'number' ? String.fromCharCode(ch) : ch); }
      display() { } noDisplay() { } cursor() { } noCursor() { } blink() { } noBlink() { }
      scrollDisplayLeft() { const d = this._dev(); if (d) { d.st.buf = d.st.buf.map(l => l.slice(1) + ' '); app.markDirty(); } }
      scrollDisplayRight() { const d = this._dev(); if (d) { d.st.buf = d.st.buf.map(l => ' ' + l.slice(0, 15)); app.markDirty(); } }
    };
    A.Servo = class { attach() { self.warn('Servo is not simulated in this version.'); } write() { } read() { return 0; } };
    if (!this.isESP) Object.assign(A, { A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19, SDA: 18, SCL: 19 });
    if (this.isESP) {
      Object.assign(A, ESP_GPIO, { WL_IDLE_STATUS: 0, WL_NO_SSID_AVAIL: 1, WL_CONNECTED: 3, WL_CONNECT_FAILED: 4, WL_DISCONNECTED: 6, WIFI_STA: 1, WIFI_AP: 2, WIFI_AP_STA: 3, HTTP_GET: 1, HTTP_POST: 3 });
      const ip = { toString: () => '192.168.1.' + (40 + (parseInt(c.id.slice(1)) % 50)) };
      const apIp = { toString: () => '192.168.4.1' };
      A.WiFi = {
        _t: 0, ssid: '',
        mode() { }, hostname() { }, setAutoReconnect() { }, persistent() { },
        begin(ssid) { this.ssid = String(ssid || ''); this._t = performance.now() + 1200; self.app.serialWrite(c, '', null); },
        status() { const ok = this._t && performance.now() >= this._t; if (ok && !c.st.wifi) { c.st.wifi = true; app.markDirty(); app.browserServer(self, self.server); } return ok ? 3 : 6; },
        isConnected() { return this.status() === 3; },
        localIP: () => ip, softAP(ssid) { this.ssid = ssid; c.st.wifi = true; app.markDirty(); return true; }, softAPIP: () => apIp,
        SSID() { return this.ssid; }, RSSI: () => -48 - Math.floor(Math.random() * 6), macAddress: () => '5C:CF:7F:12:34:56', disconnect() { c.st.wifi = false; app.markDirty(); },
        _ip: () => ip.toString(),
      };
      const Server = class {
        constructor(port) { this.port = port || 80; this.routes = {}; this.q = []; this.cur = null; self.server = this; }
        on(path, a, b) { this.routes[path] = typeof a === 'function' ? a : b; }
        onNotFound(h) { this.nf = h; }
        begin() { this.started = true; app.browserServer(self, this); }
        close() { this.started = false; }
        async handleClient() {
          const r = this.q.shift();
          if (!r) return;
          this.cur = r;
          try {
            const h = this.routes[r.path];
            if (h) await h(); else if (this.nf) await this.nf(); else this.send(404, 'text/plain', 'Not found: ' + r.path);
          } finally {
            if (!r.done) this.send(500, 'text/plain', 'The handler for ' + r.path + ' did not call server.send()');
            this.cur = null;
          }
        }
        send(code, type, body) { if (!this.cur || this.cur.done) return; this.cur.done = true; this.cur.resolve({ code, type, body: body === undefined ? '' : String(body) }); }
        sendHeader() { }
        arg(n) { return this.cur && this.cur.args[n] !== undefined ? this.cur.args[n] : ''; }
        hasArg(n) { return !!(this.cur && this.cur.args[n] !== undefined); }
        args() { return this.cur ? Object.keys(this.cur.args).length : 0; }
        uri() { return this.cur ? this.cur.path : ''; }
        method() { return 1; }
      };
      A.ESP8266WebServer = Server; A.WebServer = Server;
      A.ESP = { restart() { }, getChipId: () => 0x123456, getFreeHeap: () => 41234 };
    }
    return A;
  }

  request(pathQ) { // called by the virtual browser
    return new Promise((resolve) => {
      if (!this.server || !this.server.started) return resolve({ code: 0, body: 'Server not started' });
      const [p, q] = pathQ.split('?');
      const args = {};
      if (q) for (const [k, v] of new URLSearchParams(q)) args[k] = v;
      const r = { path: p || '/', args, resolve, done: false };
      this.server.q.push(r);
      setTimeout(() => { if (!r.done) { r.done = true; resolve({ code: 0, body: 'Timed out — is server.handleClient() called inside loop()?' }); } }, 4000);
    });
  }

  async start() {
    this.stop();
    this.alive = true; this.warned = new Set();
    this.c.st.io = {}; this.c.st.running = true; this.c.st.wifi = false;
    this.app.markDirty();
    let js;
    try { js = transpileArduino(this.c.props.code || ''); }
    catch (e) { this.app.serialWrite(this.c, 'Compile error: ' + e.message + '\n', 'err'); this.stop(); return; }
    const A = this.api();
    const names = Object.keys(A);
    let fn;
    try {
      fn = new AsyncFn(...names, js + '\n;return [typeof setup === "function" ? setup : null, typeof loop === "function" ? loop : null];');
    } catch (e) {
      this.app.serialWrite(this.c, 'Compile error: ' + e.message + '\n(check brackets, semicolons and spelling)\n', 'err');
      this.stop(); return;
    }
    this.app.serialWrite(this.c, `— ${PARTS[this.c.type].name}: upload OK, running —\n`, 'sys');
    try {
      const [setup, loop] = await fn(...names.map(n => A[n]));
      if (!setup && !loop) this.app.serialWrite(this.c, 'No setup() or loop() found.\n', 'warn');
      if (setup) await setup();
      let last = performance.now();
      while (this.alive && loop) {
        await loop();
        const n = performance.now();
        if (n - last > 8) { last = n; await this.sleep(0); } else await Promise.resolve();
        if (!this.alive) break;
        await this.sleep(1);
      }
    } catch (e) {
      if (e !== STOP) { this.app.serialWrite(this.c, 'Runtime error: ' + (e && e.message ? e.message : e) + '\n', 'err'); this.stop(); }
    }
  }
}

if (typeof module !== 'undefined') module.exports = Object.assign(module.exports || {}, { transpileArduino, MCU });
