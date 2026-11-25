const fs = require('fs'), path = require('path');
const { LESSONS } = require('./lessons.js');
const DESC = {
  'b-simple': 'Drag a battery, switch and bulb onto the canvas, wire a closed loop and switch the light on.',
  'b-series': 'Compare bulbs in series and in parallel, and see what happens when one bulb is removed.',
  'b-and': 'Wire an AND gate to two inputs and a lamp, then generate its truth table automatically.',
  'b-half': 'Add two bits with an XOR and an AND gate: the Sum and Carry outputs explained.',
  'b-lcd': 'Show a 4-bit binary number on a 7-segment display and a powered 16×2 LCD.',
  'a-bb': 'Strips, power rails and connected holes. Build a button + LED + resistor circuit on a breadboard.',
  'a-and': 'Place a 74HC08 across the gap, power it (pins 14 and 7), add DIP switch inputs and an LED output.',
  'a-half': 'A half adder from two chips: 74HC86 (XOR) for the sum and 74HC08 (AND) for the carry.',
  'a-add2': 'Build a 2-bit binary adder from XOR, AND and OR chips, and add 3 + 2 and 3 + 3.',
  'a-add4': 'Use the 74HC283 4-bit adder: 7 + 5 = 12 and 15 + 1 with carry-out.',
  'a-bcd': 'Drive a 7-segment display with the CD4511 BCD decoder chip and DIP switches.',
  'u-blink': 'Wire an LED to pin 13, read setup() and loop(), upload, run and change the blink speed.',
  'u-7seg': 'Count 0 to 9 on a 7-segment display with an Arduino, an array and a function.',
  'u-counter': 'Make a button counter: I2C LCD (SDA/SCL), INPUT_PULLUP buttons and edge detection.',
  'e-web': 'An ESP8266 web server: control two LEDs from a phone over Wi-Fi.',
  'b-or': 'Wire an OR gate and see that just one input at 1 is enough to light the lamp.',
  'b-not': 'The inverter: one input, and an output that is always the opposite.',
  'b-xor': 'Exclusive OR lights only when the inputs are different, the key to binary addition.',
  'b-nand': 'NAND and NOR, the inverted AND and OR, and how the output bubble works.',
  'b-universal': 'Build NOT, AND and OR using only NAND gates (De Morgan\'s law in action).',
  'b-all': 'Seven gates fed by the same two inputs, compared side by side.',
  'b-full': 'Add A + B + carry-in with two XOR, two AND and one OR gate.',
  'u-button': 'Read a push button with digitalRead and INPUT_PULLUP, and light an LED while it is pressed.',
  'u-traffic': 'Red, yellow and green LEDs in sequence, using a helper function.',
  'u-binary': 'Count 0 to 15 in binary on four LEDs with bitRead().',
  'u-serial': 'Type commands in the Serial Monitor to switch LEDs on and off.',
  'u-pot': 'Read a potentiometer with analogRead and dim an LED with PWM (analogWrite).',
  'u-dice': 'Press a button to roll a random number from 1 to 6 on a 7-segment display.',
  'u-lcd': 'Wire an I2C LCD with four wires and print text and uptime with LiquidCrystal_I2C.',
  'e-blink': 'Meet the NodeMCU: D-pin labels vs GPIO numbers, and the active-LOW built-in LED.',
  'e-sensor': 'Show a live analog reading (A0) as a number and a bar on a web page.',
  'e-lcd': 'Send a message from a phone web form to an I2C LCD over Wi-Fi.',
};
const VDIR = process.env.VDIR || path.join(__dirname, '..', '..', 'videos');
const FF = process.env.FFMPEG || 'ffmpeg';
const fmt = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
const out = [];
for (const L of LESSONS) {
  const mp4 = path.join(VDIR, L.id + '.mp4');
  if (!fs.existsSync(mp4)) continue;
  let info = ''; try { require('child_process').execFileSync(FF, ['-i', mp4], { stdio: 'pipe' }); } catch (e) { info = String(e.stderr); }
  const mm = /Duration: (\d+):(\d+):([\d.]+)/.exec(info); if (!mm) continue;
  const end = (+mm[1]) * 3600 + (+mm[2]) * 60 + parseFloat(mm[3]);
  out.push({ id: L.id, level: L.level, num: L.num, title: L.title, sub: L.sub, desc: DESC[L.id] || '', dur: fmt(end) });
}
fs.writeFileSync(path.join(VDIR, '..', 'js', 'videos.js'), '/* PinSketch video tutorials (files in /videos) */\nconst VIDEOS = ' + JSON.stringify(out, null, 1) + ';\n');
console.log('videos.js:', out.length, 'videos');
