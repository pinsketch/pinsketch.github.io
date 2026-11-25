// Record one lesson: node rec.js <lessonId> <level>  -> frames/<id>/*.jpg + frames/<id>/meta.json
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const [id, level] = process.argv.slice(2);
const W = 1366, H = 768, PORT = 9300 + Math.floor(Math.random() * 500);
const dir = path.join(__dirname, 'frames', id); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const durs = JSON.parse(fs.readFileSync(path.join(__dirname, 'audio', id + '.json'))).durs;
const prof = path.join(__dirname, 'chrome-prof-' + PORT);
const chrome = spawn('google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let ws;
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); const l = await r.json(); const p = l.find(t => t.type === 'page'); if (p) { ws = p.webSocketDebuggerUrl; break; } } catch (e) { } await sleep(200); }
  const sock = new WebSocket(ws); await new Promise(r => sock.onopen = r);
  let seq = 0; const pend = new Map(); const frames = [];
  const send = (method, params) => new Promise(res => { const i = ++seq; pend.set(i, res); sock.send(JSON.stringify({ id: i, method, params })); });
  sock.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result || m); pend.delete(m.id); }
    else if (m.method === 'Page.screencastFrame') {
      const f = `${String(frames.length).padStart(5, '0')}.jpg`;
      fs.writeFileSync(path.join(dir, f), Buffer.from(m.params.data, 'base64'));
      frames.push({ f, t: m.params.metadata.timestamp });
      send('Page.screencastFrameAck', { sessionId: m.params.sessionId });
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') console.error('PAGE:', m.params.args.map(a => a.value || a.description).join(' '));
    else if (m.method === 'Runtime.exceptionThrown') console.error('EXC:', JSON.stringify(m.params.exceptionDetails).slice(0, 400));
  };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `file://${__dirname}/tutor.html?level=${level}` });
  await sleep(2500);
  await send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await sleep(300);
  const r = await send('Runtime.evaluate', { expression: `runTutorial(${JSON.stringify(id)}, ${JSON.stringify(durs)})`, awaitPromise: true, returnByValue: true });
  await sleep(300);
  await send('Page.stopScreencast');
  const res = r.result && r.result.value;
  if (!res) { console.error('runTutorial failed', JSON.stringify(r).slice(0, 600)); }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ res, frames }));
  console.log(id, 'frames', frames.length, 'duration', res && res.end.toFixed(1), 'starts', res && res.starts.map(s => s.toFixed(1)).join(','));
  sock.close(); chrome.kill(); await sleep(500); fs.rmSync(prof, { recursive: true, force: true });
  process.exit(0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
