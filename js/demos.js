/* PinSketch — demo circuits & lessons */
'use strict';

const WC = { red: '#dc2626', blk: '#3f3f46', org: '#f97316', yel: '#eab308', grn: '#16a34a', blu: '#2563eb', pur: '#9333ea', wht: '#e5e7eb', cyn: '#0891b2', pnk: '#db2777', brn: '#92400e' };

function builder() {
  const circ = new Circuit();
  const b = {
    circ,
    add: (t, x, y, p, r) => circ.addComp(t, x, y, p, r),
    w: (...a) => { let col; if (typeof a[a.length - 1] === 'string') col = a.pop(); return circ.addWire(a, col); },
    pin: (c, n) => pinWorld(c, pinByName(c, n)),
    H: (bb, r, col) => [bb.x + col + 1, bb.y + BB_ROWS[r]],
    R: (bb, rail, col) => [bb.x + col + 1, bb.y + BB_RAILS[rail]],
    note: (x, y, text, color) => circ.addComp('note', x, y, { text, color: color || '#fbbf24' }),
  };
  return b;
}
function tt(head, rows) {
  return `<table class="tt"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(v => `<td class="v${v}">${v}</td>`).join('')}</tr>`).join('')}</table>`;
}

/* ============================== BEGINNER ============================== */
const DEMOS = [];
function demo(d) { DEMOS.push(d); }

demo({
  id: 'b-simple', level: 'beginner', title: '1. Simple circuit', desc: 'Battery + switch + bulb',
  info: `<h3>Your first circuit</h3>
  <p>Electricity flows in a <b>closed loop</b>: from the battery's <b>+</b> terminal, through the switch and the bulb, and back to the <b>−</b> terminal.</p>
  <ol><li>Click the <b>switch</b> to turn it ON. The loop is closed and the bulb lights up.</li>
  <li>Turn it OFF. The loop is broken (an <i>open circuit</i>), so no current flows.</li>
  <li>Hover over any pin to see whether it is HIGH (+5V) or LOW (0V).</li></ol>
  <p class="tip">Wire colors show the signal: <span class="hi">red = HIGH</span>, <span class="lo">blue = LOW</span>, grey = not connected.</p>
  <p class="tip"><b style="color:#fde047">Moving yellow dots</b> show the current flowing from + through the circuit to −. Faster dots mean more current.</p>`,
  build: b => {
    b.add('battery', 4, 4); b.add('switch', 8, 2, { label: 'Switch' }); b.add('bulb', 14, 2);
    b.w([4, 4], [4, 2], [8, 2], WC.red); b.w([10, 2], [14, 2], WC.red);
    b.w([16, 2], [18, 2], [18, 8], [4, 8], [4, 6], WC.blk);
    b.note(2, -3, 'Click the switch to close the circuit');
  },
});

demo({
  id: 'b-series', level: 'beginner', title: '2. Series vs parallel', desc: 'Two ways to connect bulbs',
  info: `<h3>Series and parallel</h3>
  <p><b>Series (left):</b> the bulbs are connected one after another, so they <i>share</i> the battery voltage and each one glows <b>dimmer</b>.</p>
  <p><b>Parallel (right):</b> each bulb gets its own path to the battery, so each gets the full voltage and glows <b>bright</b>.</p>
  <ol><li>Turn both switches ON and compare the brightness.</li>
  <li>Try deleting one bulb in each circuit (select it and press <kbd>Delete</kbd>). In series, the other bulb goes out. In parallel, it stays on.</li></ol>
  <p class="tip">This is why the lights in your house are wired in parallel.</p>`,
  build: b => {
    b.note(6, -2, 'SERIES'); b.note(30, -2, 'PARALLEL');
    b.add('battery', 4, 5); b.add('switch', 7, 2); b.add('bulb', 12, 2); b.add('bulb', 17, 2);
    b.w([4, 5], [4, 2], [7, 2], WC.red); b.w([9, 2], [12, 2], WC.red); b.w([14, 2], [17, 2], WC.org);
    b.w([19, 2], [21, 2], [21, 9], [4, 9], [4, 7], WC.blk);
    b.add('battery', 28, 5); b.add('switch', 31, 2); b.add('bulb', 36, 2); b.add('bulb', 36, 6);
    b.w([28, 5], [28, 2], [31, 2], WC.red); b.w([33, 2], [36, 2], WC.red); b.w([33, 2], [34, 2], [34, 6], [36, 6], WC.red);
    b.w([38, 2], [40, 2], [40, 6], WC.blk); b.w([38, 6], [40, 6], WC.blk); b.w([40, 6], [40, 9], [28, 9], [28, 7], WC.blk);
  },
});

demo({
  id: 'b-bell', level: 'beginner', title: '3. Doorbell & fan', desc: 'Push button, buzzer and motor',
  info: `<h3>Push button vs. toggle switch</h3>
  <p>A <b>push button</b> only connects while you hold it down, like a doorbell. A <b>toggle switch</b> stays where you leave it, like a light switch.</p>
  <ol><li>Press and hold the red button: the buzzer beeps.</li>
  <li>Flip the switch: the fan motor spins.</li></ol>
  <p class="tip">The battery, button and buzzer still form one closed loop.</p>`,
  build: b => {
    b.add('battery', 4, 5); b.add('button', 8, 2, { label: 'Press me' }); b.add('buzzer', 14, 2);
    b.w([4, 5], [4, 2], [8, 2], WC.red); b.w([10, 2], [14, 2], WC.red); b.w([15, 2], [17, 2], [17, 8], [4, 8], [4, 7], WC.blk);
    b.add('battery', 24, 5); b.add('switch', 28, 2, { label: 'Fan' }); b.add('motor', 34, 2);
    b.w([24, 5], [24, 2], [28, 2], WC.red); b.w([30, 2], [34, 2], WC.red); b.w([36, 2], [38, 2], [38, 8], [24, 8], [24, 7], WC.blk);
  },
});

demo({
  id: 'b-swlogic', level: 'beginner', title: '4. Switches as logic', desc: 'Series = AND, parallel = OR',
  info: `<h3>Logic made from switches</h3>
  <p>Before chips existed, logic was built from switches and relays.</p>
  <p><b>Top: two switches in series.</b> The bulb lights only if A <b>AND</b> B are both ON.</p>
  <p><b>Bottom: two switches in parallel.</b> The bulb lights if C <b>OR</b> D (or both) are ON.</p>
  <p>Open the <b>Truth Table</b> tab and click <i>Generate</i> to see every combination.</p>`,
  build: b => {
    b.note(8, -2, 'SERIES  →  AND');
    b.add('battery', 4, 4); b.add('switch', 8, 2, { label: 'A' }); b.add('switch', 12, 2, { label: 'B' }); b.add('bulb', 17, 2, { label: 'A AND B' });
    b.w([4, 4], [4, 2], [8, 2], WC.red); b.w([10, 2], [12, 2], WC.red); b.w([14, 2], [17, 2], WC.red);
    b.w([19, 2], [21, 2], [21, 7], [4, 7], [4, 6], WC.blk);
    b.note(8, 9, 'PARALLEL  →  OR');
    b.add('battery', 4, 13); b.add('switch', 8, 11, { label: 'C' }); b.add('switch', 8, 14, { label: 'D' }); b.add('bulb', 14, 11, { label: 'C OR D' });
    b.w([4, 13], [6, 13], [6, 11], [8, 11], WC.red); b.w([4, 13], [6, 13], [6, 14], [8, 14], WC.red);
    b.w([10, 11], [14, 11], WC.red); b.w([10, 14], [12, 14], [12, 11], [14, 11], WC.red);
    b.w([16, 11], [18, 11], [18, 17], [4, 17], [4, 15], WC.blk);
  },
});

function gateDemo(id, n, gate, title, text, table) {
  demo({
    id, level: 'beginner', title: n + '. ' + title, desc: title.replace(' gate', '') + ' truth table',
    info: `<h3>${title}</h3>${text}${table}<p class="tip">Click the <b>0/1</b> toggles on the inputs. The lamp shows the output: red = 1 (HIGH).</p>`,
    build: b => {
      if (gate === 'not') {
        b.add('logicin', 4, 3, { label: 'A' }); b.add('g_not', 8, 2); b.add('probe', 16, 3, { label: 'Y = NOT A' });
        b.w([4, 3], [8, 3], WC.org); b.w([13, 3], [16, 3], WC.org);
      } else {
        b.add('logicin', 4, 2, { label: 'A' }); b.add('logicin', 4, 4, { label: 'B' }); b.add('g_' + gate, 8, 2);
        b.add('probe', 16, 3, { label: 'Y' });
        b.w([4, 2], [8, 2], WC.org); b.w([4, 4], [8, 4], WC.org); b.w([13, 3], [16, 3], WC.org);
      }
    },
  });
}
gateDemo('b-and', 5, 'and', 'AND gate', '<p>The output is <b>1 only when ALL inputs are 1</b>. Symbol: Y = A · B.</p>', tt(['A', 'B', 'Y'], [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]]));
gateDemo('b-or', 6, 'or', 'OR gate', '<p>The output is <b>1 when ANY input is 1</b>. Symbol: Y = A + B.</p>', tt(['A', 'B', 'Y'], [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]]));
gateDemo('b-not', 7, 'not', 'NOT gate', '<p>An <b>inverter</b> flips its input: 0 becomes 1, and 1 becomes 0. Symbol: Y = A̅.</p>', tt(['A', 'Y'], [[0, 1], [1, 0]]));
gateDemo('b-xor', 8, 'xor', 'XOR gate', '<p><b>Exclusive OR</b>: the output is 1 when the inputs are <b>different</b>. Symbol: Y = A ⊕ B. XOR is the heart of every adder.</p>', tt(['A', 'B', 'Y'], [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]]));

demo({
  id: 'b-nand', level: 'beginner', title: '9. NAND & NOR', desc: 'The universal gates',
  info: `<h3>NAND and NOR: the universal gates</h3>
  <p><b>NAND</b> = NOT AND, and <b>NOR</b> = NOT OR. The small circle (bubble) on the output means <i>invert</i>.</p>
  ${tt(['A', 'B', 'NAND', 'NOR'], [[0, 0, 1, 1], [0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 0]])}
  <p class="tip">You can build <i>any</i> other gate using only NAND gates (or only NOR gates). That is why chips like the 74HC00 are so common.</p>`,
  build: b => {
    b.add('logicin', 4, 2, { label: 'A' }); b.add('logicin', 4, 6, { label: 'B' });
    b.add('g_nand', 9, 2); b.add('g_nor', 9, 8);
    b.w([4, 2], [9, 2], WC.org); b.w([4, 2], [6, 2], [6, 8], [9, 8], WC.org);
    b.w([4, 6], [7, 6], [7, 4], [9, 4], WC.cyn); b.w([4, 6], [7, 6], [7, 10], [9, 10], WC.cyn);
    b.add('probe', 17, 3, { label: 'NAND' }); b.add('probe', 17, 9, { label: 'NOR' });
    b.w([14, 3], [17, 3], WC.org); b.w([14, 9], [17, 9], WC.org);
  },
});

demo({
  id: 'b-universal', level: 'beginner', title: '10. NAND builds every gate', desc: 'NOT, AND and OR from NAND only',
  info: `<h3>NAND is a universal gate</h3>
  <p>Every other gate can be built from NAND gates alone. That is why chip factories love NAND.</p>
  <ul><li><b>NOT</b> = one NAND with both inputs joined: NAND(A, A) = NOT A</li>
  <li><b>AND</b> = NAND followed by a NOT-NAND: NOT(NAND(A, B))</li>
  <li><b>OR</b> = NAND of the inverted inputs: NAND(NOT A, NOT B) = A + B (De Morgan's law)</li></ul>
  ${tt(['A', 'B', 'NOT A', 'A AND B', 'A OR B'], [[0, 0, 1, 0, 0], [0, 1, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 0, 1, 1]])}
  <p class="tip">Count the gates: NOT uses 1 NAND, AND uses 2 and OR uses 3.</p>`,
  build: b => {
    b.add('logicin', 3, 2, { label: 'A' }); b.add('logicin', 3, 22, { label: 'B' });
    b.add('g_nand', 9, 1);
    b.w([3, 2], [7, 2], [7, 1], [9, 1], WC.org); b.w([3, 2], [7, 2], [7, 3], [9, 3], WC.org);
    b.add('probe', 27, 2, { label: 'NOT A' }); b.w([14, 2], [27, 2], WC.grn);
    b.add('g_nand', 9, 7); b.add('g_nand', 18, 7);
    b.w([3, 2], [5, 2], [5, 7], [9, 7], WC.org); b.w([3, 22], [7, 22], [7, 9], [9, 9], WC.cyn);
    b.w([14, 8], [16, 8], [16, 7], [18, 7], WC.yel); b.w([14, 8], [16, 8], [16, 9], [18, 9], WC.yel);
    b.add('probe', 27, 8, { label: 'A AND B' }); b.w([23, 8], [27, 8], WC.grn);
    b.add('g_nand', 9, 13); b.add('g_nand', 9, 18); b.add('g_nand', 18, 14);
    b.w([3, 2], [5, 2], [5, 13], [9, 13], WC.org); b.w([3, 2], [5, 2], [5, 15], [9, 15], WC.org);
    b.w([3, 22], [6, 22], [6, 18], [9, 18], WC.cyn); b.w([3, 22], [6, 22], [6, 20], [9, 20], WC.cyn);
    b.w([14, 14], [18, 14], WC.pur); b.w([14, 19], [16, 19], [16, 16], [18, 16], WC.pur);
    b.add('probe', 27, 15, { label: 'A OR B' }); b.w([23, 15], [27, 15], WC.grn);
    b.note(11, -1, 'NOT = 1 NAND'); b.note(11, 5, 'AND = 2 NANDs'); b.note(11, 11, 'OR = 3 NANDs');
  },
});

demo({
  id: 'b-all', level: 'beginner', title: '11. All gates playground', desc: 'Compare all 7 gates at once',
  info: `<h3>All gates side by side</h3><p>The same inputs <b>A</b> and <b>B</b> feed every gate. Flip them and compare the outputs.</p>
  ${tt(['A', 'B', 'AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR', 'NOT A'], [[0, 0, 0, 0, 1, 1, 0, 1, 1], [0, 1, 0, 1, 1, 0, 1, 0, 1], [1, 0, 0, 1, 1, 0, 1, 0, 0], [1, 1, 1, 1, 0, 0, 0, 1, 0]])}`,
  build: b => {
    b.add('logicin', 3, 2, { label: 'A' }); b.add('logicin', 3, 5, { label: 'B' });
    ['and', 'or', 'nand', 'nor', 'xor', 'xnor', 'not'].forEach((g, i) => {
      const y = 2 + i * 4;
      b.add('g_' + g, 10, y);
      if (g === 'not') b.w([3, 2], [6, 2], [6, y + 1], [10, y + 1], WC.org);
      else { b.w([3, 2], [6, 2], [6, y], [10, y], WC.org); b.w([3, 5], [7, 5], [7, y + 2], [10, y + 2], WC.cyn); }
      b.add('probe', 18, y + 1, { label: g === 'not' ? 'NOT A' : g.toUpperCase() });
      b.w([15, y + 1], [18, y + 1], WC.grn);
    });
  },
});

demo({
  id: 'b-half', level: 'beginner', title: '12. Half adder', desc: 'Add two bits: XOR + AND',
  info: `<h3>Half adder: adding two bits</h3>
  <p>Binary addition of one bit: 0+0=0, 0+1=1, 1+0=1, and <b>1+1=10</b> (that is 2 in binary).</p>
  <ul><li><b>Sum</b> = A XOR B</li><li><b>Carry</b> = A AND B</li></ul>
  ${tt(['A', 'B', 'Carry', 'Sum'], [[0, 0, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1], [1, 1, 1, 0]])}
  <p class="tip">It is called "half" because it cannot accept a carry coming in from a previous column. See the full adder next.</p>`,
  build: b => {
    b.add('logicin', 4, 2, { label: 'A' }); b.add('logicin', 4, 6, { label: 'B' });
    b.add('g_xor', 9, 2); b.add('g_and', 9, 7);
    b.w([4, 2], [9, 2], WC.org); b.w([4, 2], [6, 2], [6, 7], [9, 7], WC.org);
    b.w([4, 6], [7, 6], [7, 4], [9, 4], WC.cyn); b.w([4, 6], [7, 6], [7, 9], [9, 9], WC.cyn);
    b.add('probe', 17, 3, { label: 'Sum' }); b.add('probe', 17, 8, { label: 'Carry' });
    b.w([14, 3], [17, 3], WC.grn); b.w([14, 8], [17, 8], WC.grn);
  },
});

demo({
  id: 'b-full', level: 'beginner', title: '13. Full adder', desc: 'A + B + Carry-in',
  info: `<h3>Full adder</h3>
  <p>A full adder adds <b>three</b> bits: A, B and a <b>carry in</b> from the previous column. Chaining full adders gives 2-bit, 4-bit and 8-bit adders (see the Advanced level).</p>
  <ul><li>Sum = A ⊕ B ⊕ Cin</li><li>Cout = A·B + Cin·(A ⊕ B)</li></ul>
  ${tt(['A', 'B', 'Cin', 'Cout', 'Sum'], [[0, 0, 0, 0, 0], [0, 0, 1, 0, 1], [0, 1, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 1, 1, 0], [1, 1, 0, 1, 0], [1, 1, 1, 1, 1]])}`,
  build: b => {
    b.add('logicin', 3, 2, { label: 'A' }); b.add('logicin', 3, 6, { label: 'B' }); b.add('logicin', 3, 13, { label: 'Cin' });
    b.add('g_xor', 9, 2); b.add('g_xor', 19, 4); b.add('g_and', 9, 8); b.add('g_and', 19, 10); b.add('g_or', 28, 9);
    b.w([3, 2], [9, 2], WC.org); b.w([3, 2], [5, 2], [5, 8], [9, 8], WC.org);
    b.w([3, 6], [7, 6], [7, 4], [9, 4], WC.cyn); b.w([3, 6], [7, 6], [7, 10], [9, 10], WC.cyn);
    b.w([14, 3], [16, 3], [16, 4], [19, 4], WC.yel); b.w([14, 3], [16, 3], [16, 10], [19, 10], WC.yel);
    b.w([3, 13], [17, 13], [17, 6], [19, 6], WC.pur); b.w([3, 13], [18, 13], [18, 12], [19, 12], WC.pur);
    b.w([14, 9], [26, 9], [28, 9], WC.grn); b.w([24, 11], [28, 11], WC.grn);
    b.add('probe', 37, 5, { label: 'Sum' }); b.add('probe', 37, 10, { label: 'Cout' });
    b.w([24, 5], [37, 5], WC.red); b.w([33, 10], [37, 10], WC.red);
  },
});

demo({
  id: 'b-lcd', level: 'beginner', title: '14. LCD & 7-segment', desc: 'Show a binary number',
  info: `<h3>Displays: LCD and 7-segment</h3>
  <p>Four switches make a <b>4-bit binary number</b>. Each bit has a value: D0=1, D1=2, D2=4, D3=8. Add the values of the bits that are ON.</p>
  <p>Example: <b>0101</b> = 4 + 1 = <b>5</b>.</p>
  <ul><li>The <b>7-segment display</b> shows the number in hexadecimal (0–9, then A–F for 10–15).</li>
  <li>The <b>LCD</b> needs power: its VCC and GND are wired to the battery. Delete one of those wires and it goes dark.</li></ul>
  <p class="tip">Select the LCD and change its text in the <b>Properties</b> tab.</p>`,
  build: b => {
    for (let k = 0; k < 4; k++) {
      b.add('logicin', 4, 9 + k, { label: 'D' + k });
      b.w([4, 9 + k], [16, 9 + k], [WC.org, WC.yel, WC.grn, WC.cyn][k]);
      b.w([4, 9 + k], [8 + k, 9 + k], [8 + k, 4 + k], [24, 4 + k], [WC.org, WC.yel, WC.grn, WC.cyn][k]);
    }
    b.add('hex7', 16, 9);
    b.add('battery', 20, 0); b.add('lcd', 24, 1, { text: 'Hello, World!' });
    b.w([20, 0], [22, 0], [22, 1], [24, 1], WC.red); b.w([20, 2], [24, 2], WC.blk);
  },
});

demo({
  id: 'b-volts', level: 'beginner', title: '15. Voltage: 3.3 V, 5 V, 12 V', desc: 'Same bulb, three batteries',
  info: `<h3>Voltage: how hard electricity "pushes"</h3>
  <p>Voltage is measured in <b>volts (V)</b>. All three circuits use the same <b>5 V bulb</b> with a different battery:</p>
  <ul><li><b>3.3 V</b>: not enough push, so the bulb glows <b>dim</b>.</li>
  <li><b>5 V</b>: exactly what the bulb is rated for, so it shines <b>bright</b>.</li>
  <li><b>12 V</b>: far too much, so the bulb <b>burns out</b>! 💥</li></ul>
  <p>Select any battery and change its voltage (1.5, 3.3, 5, 9, 12 or 24 V) in the <b>Properties</b> tab. You can also change the bulb's rated voltage.</p>
  <p class="tip">Always match the supply voltage to the parts. Chips like the 74HC series also burn out above about 6 V.</p>`,
  build: b => {
    [[3.3, '3.3 V'], [5, '5 V'], [12, '12 V']].forEach(([v, t], k) => {
      const ox = k * 16;
      b.note(ox + 4, -2, t + ' battery');
      b.add('battery', ox + 3, 4, { v }); b.add('switch', ox + 5, 2); b.add('bulb', ox + 10, 2, { rated: 5, label: '5 V bulb' });
      b.w([ox + 3, 4], [ox + 3, 2], [ox + 5, 2], WC.red); b.w([ox + 7, 2], [ox + 10, 2], WC.red);
      b.w([ox + 12, 2], [ox + 13, 2], [ox + 13, 8], [ox + 3, 8], [ox + 3, 6], WC.blk);
    });
  },
});

demo({
  id: 'b-cap', level: 'beginner', title: '16. Capacitor: storing energy', desc: 'Charge it, then watch the LED fade',
  info: `<h3>The capacitor: a tiny rechargeable tank</h3>
  <p>A <b>capacitor</b> stores electric charge, a bit like a very small, very fast battery. Its size is measured in <b>microfarads (µF)</b>.</p>
  <ol><li>Press and hold the button. The capacitor charges to the battery voltage, and the LED lights.</li>
  <li>Release the button. The battery is disconnected, but the LED <b>stays on and slowly fades</b> because the capacitor now powers it.</li>
  <li>The blue bar inside the capacitor shows how much charge is left.</li></ol>
  <p class="tip">Try a bigger capacitor (2200 µF) or a bigger resistor (1k) in Properties: the LED fades more slowly. Electrolytic capacitors have a <b>+</b> and a <b>−</b> leg; the stripe marks the − side.</p>`,
  build: b => {
    b.add('battery', 2, 4); b.add('button', 6, 2, { label: 'Charge' });
    b.add('capacitor', 10, 6, { uf: 1000 }); b.add('resistor', 12, 2, { ohms: '470' }); b.add('led', 19, 2, { color: 'yellow' });
    b.w([2, 4], [2, 2], [6, 2], WC.red); b.w([8, 2], [12, 2], WC.red); b.w([8, 2], [10, 2], [10, 6], WC.red);
    b.w([16, 2], [19, 2], WC.org); b.w([20, 2], [22, 2], [22, 9], [2, 9], [2, 6], WC.blk); b.w([11, 6], [11, 8], [2, 8], [2, 6], WC.blk);
  },
});

demo({
  id: 'b-rc', level: 'beginner', title: '17. RC timer: a delay', desc: 'Resistor + capacitor = time',
  info: `<h3>RC timer: making a delay</h3>
  <p>A resistor slows down how fast a capacitor charges. Together they make a <b>timer</b>.</p>
  <ul><li>Turn on the switch. The capacitor voltage rises slowly (watch the number on it).</li>
  <li>The lamp reads the capacitor voltage. It switches on when the voltage passes about <b>half</b> of the supply (2.5 V), roughly <b>3 seconds</b> later.</li>
  <li>The time constant τ = R × C = 10 kΩ × 470 µF = <b>4.7 s</b>. After one τ the capacitor is 63% full.</li></ul>
  <p>Press <b>Discharge</b> to empty the capacitor and try again.</p>
  <p class="tip">Change R or C in Properties: a bigger value gives a longer delay. This is how the 555 timer measures time.</p>`,
  build: b => {
    b.add('battery', 2, 4); b.add('switch', 6, 2, { label: 'Start' }); b.add('resistor', 11, 2, { ohms: '10k' });
    b.add('capacitor', 18, 5, { uf: 470 }); b.add('probe', 22, 2, { label: 'Output' }); b.add('button', 24, 6, { label: 'Discharge' });
    b.w([2, 4], [2, 2], [6, 2], WC.red); b.w([8, 2], [11, 2], WC.red);
    b.w([15, 2], [18, 2], [18, 5], WC.org); b.w([15, 2], [22, 2], WC.org);
    b.w([19, 5], [19, 8], [2, 8], [2, 6], WC.blk);
    b.w([18, 5], [18, 6], [24, 6], WC.org); b.w([26, 6], [26, 7], [19, 7], [19, 5], WC.blk);
  },
});

demo({
  id: 'b-555', level: 'beginner', title: '18. 555 timer: blinking LED', desc: 'The most famous chip ever',
  info: `<h3>The 555 timer</h3>
  <p>The <b>NE555</b> is one of the most popular chips ever made. Here it is an <b>astable oscillator</b>: its output switches ON and OFF by itself, so the LED blinks.</p>
  <ul><li>The capacitor charges through <b>R1 + R2</b>. When it reaches ⅔ of the supply, the output goes LOW.</li>
  <li>Then it discharges through <b>R2</b> into pin 7. At ⅓ of the supply, the output goes HIGH again.</li>
  <li>Blink rate f ≈ 1.44 / ((R1 + 2·R2) × C) ≈ <b>1.4 times per second</b>.</li></ul>
  <p class="tip">Select the capacitor and change it to 47 µF: the LED blinks about 5 times slower. Watch the capacitor's voltage go up and down between 3 V and 6 V.</p>
  <pre class="pinout">     ┌──U──┐
 GND 1│     │8 VCC
TRIG 2│ 555 │7 DIS
 OUT 3│     │6 THR
 RST 4│     │5 CTRL
     └─────┘</pre>`,
  build: b => {
    b.add('battery', 2, 2, { v: 9 }); b.add('ne555', 12, 6);
    b.add('resistor', 8, 0, { ohms: '10k' }, 1); b.add('resistor', 8, 5, { ohms: '47k' }, 1);
    b.add('capacitor', 6, 13, { uf: 10 }); b.add('resistor', 14, 10, { ohms: '470' }, 1); b.add('led', 14, 16, { color: 'red' });
    b.w([2, 2], [2, 0], [8, 0], WC.red); b.w([8, 0], [12, 0], [12, 6], WC.red); b.w([8, 0], [18, 0], [18, 10], [15, 10], [15, 9], WC.red);
    b.w([8, 4], [8, 5], WC.org); b.w([8, 4], [13, 4], [13, 6], WC.org);
    b.w([8, 9], [8, 11], [13, 11], [13, 9], WC.yel); b.w([14, 6], [14, 3], [10, 3], [10, 9], [8, 9], WC.yel); b.w([8, 9], [6, 9], [6, 13], WC.yel);
    b.w([7, 13], [7, 15], [2, 15], [2, 4], WC.blk); b.w([12, 9], [12, 14], [7, 14], [7, 13], WC.blk);
    b.w([14, 9], [14, 10], WC.grn); b.w([14, 14], [14, 16], WC.grn); b.w([15, 16], [15, 17], [1, 17], [1, 4], [2, 4], WC.blk);
    b.note(3, -2, 'NE555 astable: R1 10k, R2 47k, C 10 µF');
  },
});

demo({
  id: 'b-latch', level: 'beginner', title: '19. SR latch: 1-bit memory', desc: 'Two NOR gates remember',
  info: `<h3>SR latch: a circuit that remembers</h3>
  <p>Two NOR gates, each feeding back into the other, make a <b>latch</b>: the simplest kind of memory.</p>
  <ul><li>Set <b>S</b> (set) to 1, then back to 0. <b>Q</b> turns on and <i>stays</i> on.</li>
  <li>Set <b>R</b> (reset) to 1, then back to 0. Q turns off and stays off.</li>
  <li>Q̅ is always the opposite of Q.</li></ul>
  ${tt(['S', 'R', 'Q'], [[0, 0, 'keep'], [1, 0, 1], [0, 1, 0], [1, 1, '✗']])}
  <p class="tip">S = R = 1 at the same time is "forbidden" because both outputs become 0. Computer memory (SRAM) is built from millions of latches like this.</p>`,
  build: b => {
    b.add('logicin', 4, 1, { label: 'S' }); b.add('logicin', 4, 10, { label: 'R' });
    b.add('g_nor', 10, 1); b.add('g_nor', 10, 8);
    b.w([4, 1], [10, 1], WC.org); b.w([4, 10], [10, 10], WC.cyn);
    b.w([15, 2], [17, 2], [17, 5], [8, 5], [8, 8], [10, 8], WC.pur);
    b.w([15, 9], [18, 9], [18, 6], [7, 6], [7, 3], [10, 3], WC.grn);
    b.add('probe', 22, 2, { label: 'Q̅' }); b.add('probe', 22, 9, { label: 'Q' });
    b.w([15, 2], [22, 2], WC.pur); b.w([15, 9], [22, 9], WC.grn);
  },
});

/* ============================== ADVANCED ============================== */
function bbPower(b, bb) { b.add('psu', bb.x + 2, bb.y + 1); }
function icVcc(b, bb, col, n) { b.w(b.H(bb, 'a', col), b.R(bb, 't+', col), WC.red); b.w(b.H(bb, 'j', col + n / 2 - 1), b.R(bb, 'b-', col + n / 2 - 1), WC.blk); }
function outLedTop(b, bb, col, color, lbl) { // LED anode e[col], cathode e[col+1], resistor b[col+1] -> top − rail
  b.add('led', ...b.H(bb, 'e', col), { color, label: lbl });
  b.add('resistor', ...b.H(bb, 'b', col + 1), { ohms: '330' }, 3);
}
function outLedBot(b, bb, col, color, lbl) { // LED anode f[col], cathode f[col+1], resistor i[col+1] -> bottom − rail
  b.add('led', ...b.H(bb, 'f', col), { color, label: lbl });
  b.add('resistor', ...b.H(bb, 'i', col + 1), { ohms: '220' }, 1);
}

demo({
  id: 'a-bb', level: 'advanced', title: 'Breadboard basics', desc: 'Battery, button, LED, resistor',
  info: `<h3>How a breadboard works</h3>
  <p>Hover over any hole: the holes that light up <b>green</b> are connected to it inside the board.</p>
  <ul><li>Each <b>column of 5 holes</b> (a–e, and f–j) is one connected strip.</li>
  <li>The long <b>rails</b> at the top and bottom carry power: <span class="hi">+</span> and <span class="lo">−</span>.</li>
  <li>The gap in the middle separates the top and bottom halves. Chips sit across it.</li></ul>
  <p>Circuit: <b>+ rail → button → LED → 220Ω resistor → − rail</b>. Press the button and follow the <b style="color:#fde047">yellow dots</b>: they show the current moving along the rail, down the column strips and through each part.</p>
  <p class="tip">An LED only conducts one way: the long leg (anode, +) must face the positive side. The resistor limits the current so the LED doesn't burn out.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    b.add('battery', 5, -1, {}, 1);
    b.w([5, -1], b.R(bb, 't+', 4), WC.red); b.w([3, -1], b.R(bb, 't-', 2), WC.blk);
    b.w(b.R(bb, 't+', 3), b.H(bb, 'a', 3), WC.red);
    b.add('button', ...b.H(bb, 'e', 3));
    b.add('led', ...b.H(bb, 'c', 5), { color: 'red' });
    b.add('resistor', ...b.H(bb, 'e', 6), { ohms: '220' });
    b.w(b.H(bb, 'a', 10), b.R(bb, 't-', 10), WC.blk);
  },
});

demo({
  id: 'a-and', level: 'advanced', title: '74HC08 AND gate IC', desc: 'Real logic chip with DIP switches',
  info: `<h3>Using a logic IC (74HC08)</h3>
  <p>The 74HC08 holds <b>four AND gates</b> in a 14-pin chip. Pin 1 is next to the notch/dot. Pins are numbered counter-clockwise.</p>
  <pre class="pinout">  14 13 12 11 10  9  8
  VCC 4B 4A 4Y 3B 3A 3Y
 ▐▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▌
 ◖  74HC08             ▌
 ▐▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▌
  1A 1B 1Y 2A 2B 2Y GND
   1  2  3  4  5  6  7</pre>
  <ul><li>A chip <b>must be powered</b>: pin 14 → +5V and pin 7 → GND.</li>
  <li>DIP switch 1 = <b>A</b> (pin 1), switch 2 = <b>B</b> (pin 2). The output is pin 3, which drives the LED.</li></ul>
  <p class="tip">Click the white sliders on the red DIP switch. Then try removing the VCC wire: the chip shows "no power".</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 }); bbPower(b, bb);
    b.add('dip4', ...b.H(bb, 'e', 4));
    b.w(b.H(bb, 'a', 4), b.R(bb, 't+', 4), WC.red); b.w(b.H(bb, 'a', 5), b.R(bb, 't+', 5), WC.red);
    b.add('ic7408', ...b.H(bb, 'e', 12)); icVcc(b, bb, 12, 14);
    b.w(b.H(bb, 'i', 4), b.H(bb, 'i', 12), WC.org); b.w(b.H(bb, 'j', 5), b.H(bb, 'j', 13), WC.yel);
    b.w(b.H(bb, 'h', 14), b.H(bb, 'h', 22), WC.grn);
    outLedBot(b, bb, 22, 'green', 'Y');
    b.note(4, 21, 'DIP 1 = A, DIP 2 = B   →   LED = A AND B');
  },
});

demo({
  id: 'a-half', level: 'advanced', title: 'Half adder (74HC86 + 74HC08)', desc: 'XOR + AND chips',
  info: `<h3>Half adder on a breadboard</h3>
  <p>Two chips: the <b>74HC86</b> (XOR) gives the <b>Sum</b> and the <b>74HC08</b> (AND) gives the <b>Carry</b>.</p>
  ${tt(['A', 'B', 'Carry', 'Sum'], [[0, 0, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1], [1, 1, 1, 0]])}
  <p>DIP switch 1 = A, switch 2 = B. Left LED = Carry, right LED = Sum.</p>
  <p class="tip">Each input wire goes to <i>both</i> chips: pin 1 (A) and pin 2 (B) of each.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 }); bbPower(b, bb);
    b.add('dip4', ...b.H(bb, 'e', 2));
    b.w(b.H(bb, 'a', 2), b.R(bb, 't+', 2), WC.red); b.w(b.H(bb, 'a', 3), b.R(bb, 't+', 3), WC.red);
    b.add('ic7486', ...b.H(bb, 'e', 8)); icVcc(b, bb, 8, 14);
    b.add('ic7408', ...b.H(bb, 'e', 17)); icVcc(b, bb, 17, 14);
    b.w(b.H(bb, 'g', 2), b.H(bb, 'g', 8), WC.org); b.w(b.H(bb, 'h', 2), b.H(bb, 'g', 17), WC.org);
    b.w(b.H(bb, 'i', 3), b.H(bb, 'i', 9), WC.yel); b.w(b.H(bb, 'j', 3), b.H(bb, 'i', 18), WC.yel);
    outLedTop(b, bb, 25, 'yellow', 'Carry'); outLedTop(b, bb, 28, 'green', 'Sum');
    b.w(b.H(bb, 'j', 10), b.H(bb, 'a', 28), WC.grn); b.w(b.H(bb, 'j', 19), b.H(bb, 'a', 25), WC.pur);
    b.note(2, 21, 'DIP1 = A   DIP2 = B     LEDs:  Carry | Sum');
  },
});

demo({
  id: 'a-add2', level: 'advanced', title: '2-bit adder (logic gates)', desc: '74HC86 + 74HC08 + 74HC32',
  info: `<h3>2-bit binary adder from basic gates</h3>
  <p>This adds two 2-bit numbers: <b>A1A0 + B1B0 = C S1 S0</b> (result 0 to 6).</p>
  <ul><li>Bit 0 is a <b>half adder</b>: S0 = A0⊕B0, C0 = A0·B0</li>
  <li>Bit 1 is a <b>full adder</b>: S1 = A1⊕B1⊕C0, C = A1·B1 + C0·(A1⊕B1)</li></ul>
  <p><b>DIP switches (left to right): A1, A0, B1, B0.</b> LEDs (right): <b>C, S1, S0</b>.</p>
  <p>Example: A = 11 (3) and B = 10 (2) → 3 + 2 = 5 = <b>101</b>: the C and S0 LEDs light.</p>
  ${tt(['A', 'B', 'C S1 S0', '='], [['01', '01', '010', 2], ['10', '01', '011', 3], ['11', '01', '100', 4], ['11', '11', '110', 6]])}
  <p class="tip">Chips used: U1 74HC86 (3 XOR gates), U2 74HC08 (3 AND gates), U3 74HC32 (1 OR gate).</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 60 }); bbPower(b, bb);
    const H = (r, c) => b.H(bb, r, c);
    b.add('dip4', ...H('e', 5));
    for (const c of [5, 6, 7, 8]) b.w(H('a', c), b.R(bb, 't+', c), WC.red);
    b.add('ic7486', ...H('e', 20)); icVcc(b, bb, 20, 14);
    b.add('ic7408', ...H('e', 32)); icVcc(b, bb, 32, 14);
    b.add('ic7432', ...H('e', 44)); icVcc(b, bb, 44, 14);
    // inputs: col5=A1, col6=A0, col7=B1, col8=B0
    b.w(H('g', 6), H('g', 20), WC.org); b.w(H('h', 6), H('g', 32), WC.org);       // A0 -> U1.1, U2.1
    b.w(H('g', 8), H('h', 21), WC.yel); b.w(H('h', 8), H('h', 33), WC.yel);       // B0 -> U1.2, U2.2
    b.w(H('i', 5), H('g', 23), WC.blu); b.w(H('j', 5), H('g', 35), WC.blu);       // A1 -> U1.4, U2.4
    b.w(H('i', 7), H('h', 24), WC.cyn); b.w(H('j', 7), H('h', 36), WC.cyn);       // B1 -> U1.5, U2.5
    b.w(H('h', 25), H('d', 24), WC.pur); b.w(H('i', 25), H('d', 37), WC.pur);     // P1 = U1.6 -> U1.10, U2.9
    b.w(H('i', 34), H('c', 25), WC.pnk); b.w(H('j', 34), H('c', 36), WC.pnk);     // C0 = U2.3 -> U1.9, U2.10
    b.w(H('i', 37), H('i', 44), WC.brn);                                          // G1 = U2.6 -> U3.1
    b.w(H('d', 38), H('h', 45), WC.brn);                                          // T  = U2.8 -> U3.2
    outLedTop(b, bb, 53, 'red', 'C'); outLedTop(b, bb, 56, 'yellow', 'S1'); outLedTop(b, bb, 59, 'green', 'S0');
    b.w(H('j', 46), H('a', 53), WC.grn); b.w(H('b', 26), H('a', 56), WC.grn); b.w(H('j', 22), H('a', 59), WC.grn);
    b.note(5, 21, 'DIP: A1  A0  B1  B0');
    b.note(20, 21, 'U1 74HC86 (XOR)       U2 74HC08 (AND)      U3 74HC32 (OR)');
    b.note(52, 21, 'C   S1   S0');
  },
});

demo({
  id: 'a-add4', level: 'advanced', title: '4-bit adder (74HC283)', desc: 'Add two 4-bit numbers (0–30)',
  info: `<h3>4-bit binary adder: 74HC283</h3>
  <p>The 74HC283 contains four full adders chained together. It adds <b>A (A4 A3 A2 A1)</b> + <b>B (B4 B3 B2 B1)</b> + C0 and outputs <b>C4 Σ4 Σ3 Σ2 Σ1</b>.</p>
  <ul><li>Left DIP = <b>A</b>, right DIP = <b>B</b> (switch 1 is the most significant bit, value 8).</li>
  <li>LEDs from left to right: <b>C4 (16), Σ4 (8), Σ3 (4), Σ2 (2), Σ1 (1)</b>.</li>
  <li>C0 (carry in, pin 7) is tied to GND.</li></ul>
  <p>Try 0111 (7) + 0101 (5) = <b>01100</b> (12).</p>
  <pre class="pinout"> 16  15  14  13  12  11  10   9
 VCC B3  A3  Σ3  A4  B4  Σ4  C4
 Σ2  B2  A2  Σ1  A1  B1  C0  GND
  1   2   3   4   5   6   7   8</pre>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 60 }); bbPower(b, bb);
    const H = (r, c) => b.H(bb, r, c);
    b.add('dip4', ...H('e', 4)); b.add('dip4', ...H('e', 10));
    for (const c of [4, 5, 6, 7, 10, 11, 12, 13]) b.w(H('a', c), b.R(bb, 't+', c), WC.red);
    b.add('ic74283', ...H('e', 25));
    b.w(H('a', 25), b.R(bb, 't+', 25), WC.red); b.w(H('j', 32), b.R(bb, 'b-', 32), WC.blk); b.w(H('j', 31), b.R(bb, 'b-', 31), WC.blk);
    // A: col4=A4 col5=A3 col6=A2 col7=A1
    b.w(H('g', 7), H('g', 29), WC.org); b.w(H('g', 6), H('g', 27), WC.org); b.w(H('g', 5), H('c', 27), WC.org); b.w(H('g', 4), H('c', 29), WC.org);
    // B: col10=B4 col11=B3 col12=B2 col13=B1
    b.w(H('h', 13), H('h', 30), WC.blu); b.w(H('h', 12), H('h', 26), WC.blu); b.w(H('h', 11), H('d', 26), WC.blu); b.w(H('h', 10), H('d', 30), WC.blu);
    outLedTop(b, bb, 40, 'red', 'C4'); outLedTop(b, bb, 43, 'yellow', 'Σ4'); outLedTop(b, bb, 46, 'yellow', 'Σ3'); outLedTop(b, bb, 49, 'yellow', 'Σ2'); outLedTop(b, bb, 52, 'yellow', 'Σ1');
    b.w(H('b', 32), H('a', 40), WC.grn); b.w(H('b', 31), H('a', 43), WC.grn); b.w(H('b', 28), H('a', 46), WC.grn);
    b.w(H('i', 25), H('a', 49), WC.grn); b.w(H('i', 28), H('a', 52), WC.grn);
    b.note(4, 21, 'A = A4 A3 A2 A1    B = B4 B3 B2 B1');
    b.note(24, 21, '74HC283');
    b.note(40, 21, 'C4   Σ4   Σ3   Σ2   Σ1');
  },
});

demo({
  id: 'a-bcd', level: 'advanced', title: 'BCD → 7-segment (CD4511)', desc: 'Decoder chip drives a display',
  info: `<h3>BCD to 7-segment decoder</h3>
  <p>The <b>CD4511</b> converts a 4-bit BCD number (0–9) into the 7 segment signals a–g.</p>
  <ul><li>DIP switches (left to right) = <b>D C B A</b> (values 8 4 2 1).</li>
  <li><b>LT</b> (lamp test) and <b>BI</b> (blanking) are active-LOW, so they are tied HIGH. <b>LE</b> (latch) is tied LOW.</li>
  <li>Values 10–15 are not valid BCD, so the 4511 blanks the display.</li></ul>
  <p class="tip">A real circuit needs a resistor on each segment. They are left out here to keep the wiring readable.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 }); bbPower(b, bb);
    const H = (r, c) => b.H(bb, r, c);
    b.add('dip4', ...H('e', 3));
    for (const c of [3, 4, 5, 6]) b.w(H('a', c), b.R(bb, 't+', c), WC.red);
    b.add('ic4511', ...H('e', 12));
    b.w(H('a', 12), b.R(bb, 't+', 12), WC.red); b.w(H('j', 19), b.R(bb, 'b-', 19), WC.blk);
    b.w(H('j', 14), b.R(bb, 'b+', 14), WC.red); b.w(H('j', 15), b.R(bb, 'b+', 15), WC.red); b.w(H('j', 16), b.R(bb, 'b-', 16), WC.blk);
    b.w(H('g', 6), H('g', 18), WC.org); b.w(H('g', 5), H('g', 12), WC.yel); b.w(H('h', 4), H('h', 13), WC.grn); b.w(H('i', 3), H('h', 17), WC.blu);
    b.add('seg7', ...H('e', 23));
    b.w(H('d', 13), H('a', 24), WC.pur); b.w(H('d', 14), H('b', 23), WC.pur); b.w(H('d', 15), H('a', 26), WC.pur); b.w(H('d', 16), H('b', 27), WC.pur);
    b.w(H('c', 17), H('j', 26), WC.cyn); b.w(H('c', 18), H('j', 24), WC.cyn); b.w(H('c', 19), H('i', 23), WC.cyn);
    b.w(H('j', 25), b.R(bb, 'b-', 25), WC.blk);
    b.note(3, 21, 'DIP = D C B A (8 4 2 1)');
  },
});

demo({
  id: 'a-latch', level: 'advanced', title: 'SR latch (74HC00 NAND)', desc: '1-bit memory',
  info: `<h3>SR latch: memory from two NAND gates</h3>
  <p>Two NAND gates feed back into each other, which lets the circuit <b>remember</b> one bit.</p>
  <ul><li>Press <b>SET</b> → Q = 1 (left LED on). Release it and Q <i>stays</i> 1.</li>
  <li>Press <b>RESET</b> → Q = 0. Q̅ (right LED) is always the opposite.</li></ul>
  <p>The inputs S̅ and R̅ are <b>active-LOW</b>: 10k pull-up resistors hold them HIGH, and the buttons pull them to GND.</p>
  <p class="tip">This is the basic building block of flip-flops, registers and RAM.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 }); bbPower(b, bb);
    const H = (r, c) => b.H(bb, r, c);
    b.add('ic7400', ...H('e', 12)); icVcc(b, bb, 12, 14);
    b.add('resistor', ...H('h', 12), { ohms: '10k' }, 1); b.add('resistor', ...H('h', 16), { ohms: '10k' }, 1);
    b.add('button', ...H('e', 3), { label: 'SET' }); b.add('button', ...H('e', 7), { label: 'RESET' });
    b.w(H('a', 3), b.R(bb, 't-', 3), WC.blk); b.w(H('a', 7), b.R(bb, 't-', 7), WC.blk);
    b.w(H('b', 5), H('g', 12), WC.org); b.w(H('b', 9), H('g', 16), WC.yel);
    b.w(H('i', 14), H('i', 15), WC.grn); b.w(H('j', 17), H('j', 13), WC.pur);
    outLedTop(b, bb, 24, 'green', 'Q'); outLedTop(b, bb, 27, 'red', 'Q̅');
    b.w(H('g', 14), H('a', 24), WC.grn); b.w(H('g', 17), H('a', 27), WC.pur);
  },
});

/* ----------------------- 555 / timers / sequential logic ----------------------- */
// NE555 pins at column c: bottom 1 GND(c) 2 TRIG(c+1) 3 OUT(c+2) 4 RESET(c+3); top 8 VCC(c) 7 DIS(c+1) 6 THR(c+2) 5 CTRL(c+3)
function astable555(b, bb, c, r2, cuf) { // 555 astable with R1 = 10k, returns nothing; OUT is column c+2 (bottom)
  const H = (r, k) => b.H(bb, r, k);
  b.add('ne555', ...H('e', c));
  b.w(H('a', c), b.R(bb, 't+', c), WC.red); b.w(H('j', c), b.R(bb, 'b-', c), WC.blk); b.w(H('j', c + 3), b.R(bb, 'b+', c + 3), WC.red);
  b.add('resistor', ...H('b', c - 3), { ohms: '10k' }); b.w(H('a', c - 3), b.R(bb, 't+', c - 3), WC.red);  // R1: + → DIS
  b.add('resistor', ...H('a', c + 1), { ohms: r2 }); b.w(H('c', c + 5), H('c', c + 2), WC.org);          // R2: DIS → THR
  b.w(H('d', c + 2), H('g', c + 1), WC.yel);                                                              // THR = TRIG
  b.add('capacitor', ...H('h', c - 3), { uf: cuf }); b.w(H('i', c + 1), H('i', c - 3), WC.yel); b.w(H('j', c - 2), b.R(bb, 'b-', c - 2), WC.blk);
}

demo({
  id: 'a-555', level: 'advanced', title: 'NE555 astable: LED blinker', desc: 'The classic 555 oscillator',
  info: `<h3>NE555 in astable mode</h3>
  <p>The 555 compares the capacitor voltage with <b>⅓</b> and <b>⅔</b> of VCC and switches its output, so the circuit oscillates by itself.</p>
  <ul><li><b>Charging</b> through R1 + R2: output <b>HIGH</b>, LED on, time ≈ 0.693 × (R1 + R2) × C.</li>
  <li><b>Discharging</b> through R2 into pin 7 (DIS): output <b>LOW</b>, time ≈ 0.693 × R2 × C.</li>
  <li>Frequency f ≈ 1.44 / ((R1 + 2·R2) × C) = 1.44 / ((10k + 94k) × 10 µF) ≈ <b>1.4 Hz</b>.</li></ul>
  <p>Hover over the capacitor's + leg to see its voltage swing between ⅓ and ⅔ of 5 V (1.7 V to 3.3 V).</p>
  <p class="tip">Change C to 47 µF or R2 to 100k in Properties to slow it down. Pin 4 (RESET) must be tied HIGH.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 }); bbPower(b, bb);
    astable555(b, bb, 10, '47k', 10);
    b.add('resistor', ...b.H(bb, 'h', 12), { ohms: '470' }); b.add('led', ...b.H(bb, 'f', 16), { color: 'red', label: 'OUT' });
    b.w(b.H(bb, 'j', 17), b.R(bb, 'b-', 17), WC.blk);
    b.note(4, 21, 'R1 = 10k   R2 = 47k   C = 10 µF   →  f ≈ 1.4 Hz');
  },
});

demo({
  id: 'a-555mono', level: 'advanced', title: 'NE555 monostable: one-shot timer', desc: 'Press once, LED on for 5 s',
  info: `<h3>NE555 monostable (one-shot)</h3>
  <p>Press the button once and the LED stays on for a fixed time, then turns itself off, like a staircase light timer.</p>
  <ul><li>The button pulls <b>TRIG</b> (pin 2) below ⅓ VCC. The output goes HIGH and pin 7 releases the capacitor.</li>
  <li>The capacitor charges through R. When it reaches ⅔ VCC, the output goes LOW and pin 7 empties the capacitor.</li>
  <li>On-time t = <b>1.1 × R × C</b> = 1.1 × 100 kΩ × 47 µF ≈ <b>5.2 seconds</b>.</li></ul>
  <p class="tip">The 10k pull-up keeps TRIG HIGH when the button is not pressed. Try C = 10 µF for about 1 second.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 }); bbPower(b, bb);
    const H = (r, k) => b.H(bb, r, k), c = 10;
    b.add('ne555', ...H('e', c));
    b.w(H('a', c), b.R(bb, 't+', c), WC.red); b.w(H('j', c), b.R(bb, 'b-', c), WC.blk); b.w(H('j', c + 3), b.R(bb, 'b+', c + 3), WC.red);
    b.w(H('b', c + 1), H('b', c + 2), WC.org);                                                   // DIS = THR
    b.add('resistor', ...H('a', c + 2), { ohms: '100k' }); b.w(H('b', c + 6), b.R(bb, 't+', c + 6), WC.red);
    b.add('capacitor', ...H('c', c + 8), { uf: 47 }); b.w(H('d', c + 2), H('d', c + 8), WC.yel); b.w(H('a', c + 9), b.R(bb, 't-', c + 9), WC.blk);
    b.add('resistor', ...H('h', c + 1), { ohms: '10k' }, 1);                                    // TRIG pull-up to + rail
    b.add('button', ...H('f', 5), { label: 'START' }); b.w(H('g', 7), H('g', c + 1), WC.pur); b.w(H('j', 5), b.R(bb, 'b-', 5), WC.blk);
    b.add('resistor', ...H('h', c + 2), { ohms: '470' }); b.add('led', ...H('f', c + 6), { color: 'green', label: 'ON' });
    b.w(H('j', c + 7), b.R(bb, 'b-', c + 7), WC.blk);
    b.note(4, 21, 'R = 100k, C = 47 µF  →  t = 1.1·R·C ≈ 5 s');
  },
});

demo({
  id: 'a-4017', level: 'advanced', title: '555 + CD4017 LED chaser', desc: 'A running light with two chips',
  info: `<h3>LED chaser: 555 clock + CD4017 decade counter</h3>
  <p>The <b>555</b> makes clock pulses. The <b>CD4017</b> moves a single HIGH output one step on every pulse: Q0 → Q1 → Q2 …</p>
  <ul><li>Five LEDs on Q0–Q4. <b>Q5</b> is wired back to <b>RESET</b> (pin 15), so the counter restarts after 5 steps.</li>
  <li>CLK INH (pin 13) is tied to GND to enable counting.</li></ul>
  <p class="tip">Move the reset wire from Q5 to another output to change the length of the chase. This is how the classic "Knight Rider" lights work.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 60 }); bbPower(b, bb);
    const H = (r, k) => b.H(bb, r, k);
    astable555(b, bb, 6, '22k', 10);
    b.add('ic4017', ...H('e', 20)); icVcc(b, bb, 20, 16);
    b.w(H('a', 23), b.R(bb, 't-', 23), WC.blk);                  // CLK INH → GND
    b.w(H('h', 8), H('c', 22), WC.wht);                          // 555 OUT → CLK
    b.w(H('g', 20), H('b', 21), WC.pnk);                         // Q5 → RESET
    [[34, 'Q0'], [37, 'Q1'], [40, 'Q2'], [43, 'Q3'], [46, 'Q4']].forEach(([col, l]) => outLedTop(b, bb, col, 'red', l));
    b.w(H('h', 22), H('a', 34), WC.grn); b.w(H('i', 21), H('a', 37), WC.grn); b.w(H('h', 23), H('a', 40), WC.grn);
    b.w(H('h', 26), H('a', 43), WC.grn); b.w(H('b', 26), H('a', 46), WC.grn);
    b.note(3, 21, '555 clock');  b.note(20, 21, 'CD4017 decade counter'); b.note(34, 21, 'Q0   Q1   Q2   Q3   Q4');
  },
});

demo({
  id: 'a-counter', level: 'advanced', title: '555 + 74HC393 binary counter', desc: 'A hardware counter counts pulses',
  info: `<h3>Binary counter: 555 clock + 74HC393</h3>
  <p>The <b>74HC393</b> holds two 4-bit counters. Each time its clock input <b>falls</b> (HIGH → LOW), the count goes up by one: 0000, 0001, 0010 … 1111, and then back to 0.</p>
  <ul><li>The 555 provides the clock pulses (about 2.7 Hz).</li>
  <li>The LEDs show Q3 Q2 Q1 Q0, worth 8 4 2 1.</li>
  <li>MR (reset) must be tied LOW for counting.</li></ul>
  <p class="tip">Each output runs at half the speed of the one before it. A counter is a chain of "divide by 2" flip-flops.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 60 }); bbPower(b, bb);
    const H = (r, k) => b.H(bb, r, k);
    astable555(b, bb, 6, '22k', 10);
    b.add('ic74393', ...H('e', 20)); icVcc(b, bb, 20, 14);
    b.w(H('j', 21), b.R(bb, 'b-', 21), WC.blk); b.w(H('a', 22), b.R(bb, 't-', 22), WC.blk);   // 1MR, 2MR → GND
    b.w(H('h', 8), H('h', 20), WC.wht);                                                        // clock
    [[34, '8'], [37, '4'], [40, '2'], [43, '1']].forEach(([col, l]) => outLedTop(b, bb, col, 'yellow', l));
    b.w(H('i', 25), H('a', 34), WC.grn); b.w(H('i', 24), H('a', 37), WC.grn); b.w(H('i', 23), H('a', 40), WC.grn); b.w(H('i', 22), H('a', 43), WC.grn);
    b.note(3, 21, '555 clock'); b.note(20, 21, '74HC393 counter'); b.note(34, 21, 'Q3 (8)  Q2 (4)  Q1 (2)  Q0 (1)');
  },
});

demo({
  id: 'a-crystal', level: 'advanced', title: 'Crystal timer: 32.768 kHz → 1 Hz', desc: 'CD4060 + crystal + 74HC74',
  info: `<h3>Crystal timer</h3>
  <p>A <b>32.768 kHz quartz crystal</b> vibrates exactly 32 768 times per second, the same crystal that is in every wristwatch. The <b>CD4060</b> makes it oscillate and halves the frequency 14 times:</p>
  <ul><li>Q12 = 32768 / 4096 = <b>8 Hz</b>, Q13 = <b>4 Hz</b>, Q14 = <b>2 Hz</b></li>
  <li>A <b>74HC74</b> flip-flop wired as a toggle (Q̅ → D) halves it once more: exactly <b>1 Hz</b>, one blink per second.</li></ul>
  <p>Because 32768 = 2<sup>15</sup>, dividing by two 15 times gives exactly one second. That is why watches use this crystal.</p>
  <p class="tip">A real circuit also needs a 10 MΩ resistor across the crystal (included here) and two small capacitors (about 22 pF) to GND.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 60 }); bbPower(b, bb);
    const H = (r, k) => b.H(bb, r, k);
    b.add('ic4060', ...H('e', 10)); icVcc(b, bb, 10, 16);
    b.w(H('a', 14), b.R(bb, 't-', 14), WC.blk);                                 // RESET → GND
    b.add('crystal', ...H('c', 15));
    b.add('resistor', ...H('a', 15), { ohms: '10M' }); b.w(H('b', 19), H('b', 16), WC.org);
    b.add('ic7474', ...H('e', 30)); icVcc(b, bb, 30, 14);
    b.w(H('j', 30), b.R(bb, 'b+', 30), WC.red); b.w(H('j', 33), b.R(bb, 'b+', 33), WC.red);   // 1CLR, 1PR → HIGH
    b.w(H('i', 31), H('i', 35), WC.pur);                                        // Q̅ → D (toggle)
    b.w(H('g', 12), H('g', 32), WC.wht);                                        // Q14 → CLK
    [[44, '8 Hz'], [47, '4 Hz'], [50, '2 Hz'], [53, '1 Hz']].forEach(([col, l], i) => outLedTop(b, bb, col, i === 3 ? 'green' : 'blue', l));
    b.w(H('h', 10), H('a', 44), WC.cyn); b.w(H('h', 11), H('a', 47), WC.cyn); b.w(H('h', 12), H('a', 50), WC.cyn); b.w(H('h', 34), H('a', 53), WC.grn);
    b.note(9, 21, 'CD4060 + 32.768 kHz crystal'); b.note(29, 21, '74HC74 (÷2)'); b.note(43, 21, 'Q12   Q13   Q14   1 Hz');
  },
});

demo({
  id: 'a-dff', level: 'advanced', title: '74HC74 D flip-flop: toggle', desc: 'Press to turn on, press to turn off',
  info: `<h3>D flip-flop (74HC74)</h3>
  <p>A flip-flop copies its <b>D</b> input to <b>Q</b> only at the moment the clock <b>rises</b> (LOW → HIGH). The rest of the time it remembers.</p>
  <ul><li>Here Q̅ is fed back into D, so every clock pulse <b>toggles</b> Q: ON, OFF, ON …</li>
  <li>The push button is the clock, with a 10k pull-down resistor so CLK is LOW when the button is released.</li>
  <li>CLR̅ and PR̅ are active-LOW, so they are tied HIGH.</li></ul>
  <p class="tip">The output changes at half the rate of the clock. Chain flip-flops to build counters and the crystal 1 Hz timer.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 }); bbPower(b, bb);
    const H = (r, k) => b.H(bb, r, k);
    b.add('ic7474', ...H('e', 12)); icVcc(b, bb, 12, 14);
    b.w(H('j', 12), b.R(bb, 'b+', 12), WC.red); b.w(H('j', 15), b.R(bb, 'b+', 15), WC.red);
    b.w(H('i', 13), H('i', 17), WC.pur);
    b.add('resistor', ...H('i', 14), { ohms: '10k' }, 1);
    b.add('button', ...H('f', 6), { label: 'CLOCK' }); b.w(H('j', 6), b.R(bb, 'b+', 6), WC.red); b.w(H('g', 8), H('g', 14), WC.wht);
    outLedBot(b, bb, 22, 'green', 'Q'); b.w(H('h', 16), H('h', 22), WC.grn);
  },
});

demo({
  id: 'a-decoder', level: 'advanced', title: '74HC138 3-to-8 decoder', desc: '3 switches choose 1 of 8 LEDs',
  info: `<h3>3-to-8 decoder (74HC138)</h3>
  <p>A 3-bit number (0–7) selects <b>exactly one</b> of eight outputs. Decoders pick which memory chip or display digit is active in a computer.</p>
  <ul><li>DIP switches = A2 A1 A0 (values 4 2 1).</li>
  <li>The outputs are <b>active LOW</b>: the selected output goes LOW. The LEDs are wired from + through a resistor <i>into</i> the output, so the selected LED lights.</li>
  <li>Enable: E1̅ and E2̅ to GND, E3 to +.</li></ul>
  <p class="tip">Follow the yellow dots: the current flows <i>into</i> the chip's output pin and out of its GND pin. That is called "sinking" current.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 60 }); bbPower(b, bb);
    const H = (r, k) => b.H(bb, r, k);
    b.add('dip4', ...H('e', 3)); for (const k of [3, 4, 5]) b.w(H('a', k), b.R(bb, 't+', k), WC.red);
    b.add('ic74138', ...H('e', 12)); icVcc(b, bb, 12, 16);
    b.w(H('j', 15), b.R(bb, 'b-', 15), WC.blk); b.w(H('j', 16), b.R(bb, 'b-', 16), WC.blk); b.w(H('j', 17), b.R(bb, 'b+', 17), WC.red);
    b.w(H('g', 5), H('g', 12), WC.org); b.w(H('g', 4), H('g', 13), WC.yel); b.w(H('h', 3), H('g', 14), WC.cyn);
    const ycols = [26, 29, 32, 35, 38, 41, 44, 47];
    ycols.forEach((col, i) => { b.add('led', ...H('e', col), { color: 'red', label: 'Y' + i }); b.add('resistor', ...H('c', col), { ohms: '330' }, 3); });
    [13, 14, 15, 16, 17, 18, 19].forEach((pc, i) => b.w(H('b', pc), H('a', ycols[i] + 1), WC.grn));
    b.w(H('h', 18), H('a', ycols[7] + 1), WC.grn);
    b.note(2, 21, 'DIP: A2 A1 A0 (4 2 1)'); b.note(12, 21, '74HC138'); b.note(26, 21, 'Y0 … Y7 (active LOW)');
  },
});

/* ----------------------- Arduino ----------------------- */

demo({
  id: 'u-blink', level: 'advanced', title: 'Arduino: Blink', desc: 'Your first sketch',
  info: `<h3>Arduino UNO: Blink</h3>
  <p>Pin <b>13</b> drives an LED through a 220Ω resistor to GND. The sketch switches it on and off every half second. The on-board "L" LED is also on pin 13, so it blinks too.</p>
  <ul><li><code>setup()</code> runs once at start. <code>loop()</code> runs forever.</li>
  <li><code>pinMode(13, OUTPUT)</code> makes the pin an output.</li>
  <li><code>digitalWrite(13, HIGH)</code> sets it to 5V. <code>delay(500)</code> waits 500 ms.</li></ul>
  <p class="tip">Open the <b>Code</b> tab, change <code>delay(500)</code> to <code>delay(100)</code>, then press <b>▶ Run</b>.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const u = b.add('uno', 4, 22, {
      code: `// Blink an LED on pin 13
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Blink started");
}

void loop() {
  digitalWrite(ledPin, HIGH);   // LED on
  delay(500);
  digitalWrite(ledPin, LOW);    // LED off
  delay(500);
}
` });
    outLedBot(b, bb, 10, 'red');
    b.w(b.pin(u, 'D13'), b.H(bb, 'j', 10), WC.org); b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 12), WC.blk);
  },
});

demo({
  id: 'u-button', level: 'advanced', title: 'Arduino: Button + LED', desc: 'digitalRead with INPUT_PULLUP',
  info: `<h3>Reading a button</h3>
  <p>The button connects pin <b>2</b> to <b>GND</b>. With <code>INPUT_PULLUP</code>, the Arduino's internal resistor keeps the pin HIGH, and pressing the button pulls it LOW.</p>
  <p>So <b>LOW means pressed</b>. The LED on pin 13 lights while the button is held. Each press is also printed in the <b>Serial</b> tab.</p>
  <p class="tip">Without a pull-up (or pull-down) resistor, an input "floats" and reads random values.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const u = b.add('uno', 4, 22, {
      code: `const int buttonPin = 2;
const int ledPin = 13;
int lastState = HIGH;
int presses = 0;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Press the button!");
}

void loop() {
  int state = digitalRead(buttonPin);
  if (state == LOW) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
  if (state == LOW && lastState == HIGH) {
    presses++;
    Serial.print("Pressed ");
    Serial.print(presses);
    Serial.println(" times");
  }
  lastState = state;
  delay(10);
}
` });
    outLedBot(b, bb, 10, 'green');
    b.add('button', ...b.H(bb, 'f', 20), { label: 'Pin 2' });
    b.w(b.pin(u, 'D13'), b.H(bb, 'j', 10), WC.org); b.w(b.pin(u, 'D2'), b.H(bb, 'j', 20), WC.yel);
    b.w(b.H(bb, 'j', 22), b.R(bb, 'b-', 22), WC.blk); b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 12), WC.blk);
  },
});

demo({
  id: 'u-traffic', level: 'advanced', title: 'Arduino: Traffic light', desc: '3 LEDs in sequence',
  info: `<h3>Traffic light</h3>
  <p>Three LEDs on pins <b>12 (red)</b>, <b>11 (yellow)</b> and <b>10 (green)</b>, each with its own resistor to GND.</p>
  <p>The sketch uses a helper function <code>setLights(r, y, g)</code> to keep <code>loop()</code> short and readable.</p>
  <p class="tip">Challenge: add a pedestrian button on pin 2 that starts the red phase early.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const u = b.add('uno', 4, 22, {
      code: `const int RED = 12;
const int YELLOW = 11;
const int GREEN = 10;

void setLights(int r, int y, int g) {
  digitalWrite(RED, r);
  digitalWrite(YELLOW, y);
  digitalWrite(GREEN, g);
}

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(GREEN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.println("GREEN - go");
  setLights(LOW, LOW, HIGH);
  delay(3000);
  Serial.println("YELLOW - slow down");
  setLights(LOW, HIGH, LOW);
  delay(1000);
  Serial.println("RED - stop");
  setLights(HIGH, LOW, LOW);
  delay(3000);
}
` });
    outLedBot(b, bb, 6, 'red'); outLedBot(b, bb, 10, 'yellow'); outLedBot(b, bb, 14, 'green');
    b.w(b.pin(u, 'D12'), b.H(bb, 'j', 6), WC.red); b.w(b.pin(u, 'D11'), b.H(bb, 'j', 10), WC.yel); b.w(b.pin(u, 'D10'), b.H(bb, 'j', 14), WC.grn);
    b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 20), WC.blk);
  },
});

demo({
  id: 'u-binary', level: 'advanced', title: 'Arduino: Binary LED counter', desc: 'Count 0–15 in binary on 4 LEDs',
  info: `<h3>Binary counter with 4 LEDs</h3>
  <p>Four LEDs show the bits of a number from <b>0 to 15</b>. From left to right they are worth <b>8, 4, 2 and 1</b>.</p>
  <ul><li>Pins <b>13, 12, 11, 10</b> drive the LEDs (most significant bit first).</li>
  <li><code>bitRead(n, b)</code> returns bit number <i>b</i> of <i>n</i> (0 or 1).</li>
  <li><code>Serial.println(n, BIN)</code> prints the number in binary.</li></ul>
  <p class="tip">Compare it with the hardware adders. This time the counting happens in software.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const u = b.add('uno', 4, 22, {
      code: `// 4-bit binary counter: LEDs worth 8 4 2 1
const int leds[] = {13, 12, 11, 10};   // bit 3 .. bit 0

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(leds[i], OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  for (int n = 0; n < 16; n++) {
    for (int b = 0; b < 4; b++) {
      digitalWrite(leds[b], bitRead(n, 3 - b));
    }
    Serial.print(n);
    Serial.print(" = ");
    Serial.println(n, BIN);
    delay(800);
  }
}
` });
    outLedBot(b, bb, 6, 'red', '8'); outLedBot(b, bb, 10, 'yellow', '4'); outLedBot(b, bb, 14, 'green', '2'); outLedBot(b, bb, 18, 'blue', '1');
    b.w(b.pin(u, 'D13'), b.H(bb, 'j', 6), WC.red); b.w(b.pin(u, 'D12'), b.H(bb, 'j', 10), WC.yel);
    b.w(b.pin(u, 'D11'), b.H(bb, 'j', 14), WC.grn); b.w(b.pin(u, 'D10'), b.H(bb, 'j', 18), WC.blu);
    b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 22), WC.blk);
  },
});

demo({
  id: 'u-serial', level: 'advanced', title: 'Arduino: Serial commands', desc: 'Control LEDs by typing',
  info: `<h3>Talking to the Arduino over Serial</h3>
  <p>The <b>Serial Monitor</b> works in both directions. The sketch reads the words you type and switches LEDs on and off.</p>
  <ul><li>Type <code>red</code>, <code>green</code>, <code>both</code> or <code>off</code> in the Serial tab and press <b>Send</b>.</li>
  <li><code>Serial.available()</code> tells you if text has arrived, and <code>Serial.readStringUntil('\\n')</code> reads one line.</li></ul>
  <p class="tip">Real projects use the same idea to control robots or read sensors from a PC.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const u = b.add('uno', 4, 22, {
      code: `// Type commands in the Serial tab: red, green, both, off
const int redLed = 13;
const int greenLed = 12;
String cmd = "";

void setLeds(int r, int g) {
  digitalWrite(redLed, r);
  digitalWrite(greenLed, g);
}

void setup() {
  pinMode(redLed, OUTPUT);
  pinMode(greenLed, OUTPUT);
  Serial.begin(9600);
  Serial.println("Commands: red, green, both, off");
}

void loop() {
  if (Serial.available() > 0) {
    cmd = Serial.readStringUntil('\\n');
    if (cmd == "red") {
      setLeds(HIGH, LOW);
    } else if (cmd == "green") {
      setLeds(LOW, HIGH);
    } else if (cmd == "both") {
      setLeds(HIGH, HIGH);
    } else if (cmd == "off") {
      setLeds(LOW, LOW);
    } else {
      Serial.print("Unknown command: ");
      Serial.println(cmd);
      return;
    }
    Serial.print("OK: ");
    Serial.println(cmd);
  }
}
` });
    outLedBot(b, bb, 10, 'red', 'pin 13'); outLedBot(b, bb, 16, 'green', 'pin 12');
    b.w(b.pin(u, 'D13'), b.H(bb, 'j', 10), WC.red); b.w(b.pin(u, 'D12'), b.H(bb, 'j', 16), WC.grn);
    b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 20), WC.blk);
  },
});

demo({
  id: 'u-pot', level: 'advanced', title: 'Arduino: Potentiometer → PWM', desc: 'analogRead + analogWrite',
  info: `<h3>Analog input and PWM output</h3>
  <p>A potentiometer is a voltage divider: its middle pin (the wiper) outputs between 0V and 5V. <code>analogRead(A0)</code> converts that to a number from <b>0 to 1023</b>.</p>
  <p><code>analogWrite(9, value)</code> outputs <b>PWM</b> (0–255) on pin 9 (marked <b>~</b>), which dims the LED.</p>
  <p><b>Drag the blue knob up or down</b>, or use the slider in Properties, and watch the LED and the Serial tab.</p>
  <p class="tip"><code>map(x, 0, 1023, 0, 255)</code> rescales one range to another.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const u = b.add('uno', 4, 22, {
      code: `const int potPin = A0;
const int ledPin = 9;    // PWM pin (~)

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(potPin);           // 0..1023
  int brightness = map(value, 0, 1023, 0, 255);
  analogWrite(ledPin, brightness);
  Serial.print("pot = ");
  Serial.print(value);
  Serial.print("  -> PWM = ");
  Serial.println(brightness);
  delay(250);
}
` });
    b.add('pot', ...b.H(bb, 'f', 20), { pos: 60 });
    b.w(b.H(bb, 'j', 20), b.R(bb, 'b-', 20), WC.blk); b.w(b.H(bb, 'j', 22), b.R(bb, 'b+', 22), WC.red);
    b.w(b.H(bb, 'i', 21), b.pin(u, 'A0'), WC.yel);
    b.w(b.pin(u, '5V'), b.R(bb, 'b+', 8), WC.red); b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 12), WC.blk);
    outLedBot(b, bb, 10, 'blue');
    b.w(b.pin(u, 'D9'), b.H(bb, 'j', 10), WC.org);
  },
});

demo({
  id: 'u-7seg', level: 'advanced', title: 'Arduino: 7-segment counter', desc: 'Count 0–9 with an array',
  info: `<h3>7-segment counter</h3>
  <p>A common-cathode display: segment pins <b>a–g</b> are on Arduino pins <b>2–8</b>, and COM goes to GND. A segment lights when its pin is HIGH.</p>
  <p>The patterns for the digits 0–9 are stored in a 2-D array <code>digits[10][7]</code>.</p>
  <pre class="pinout">   a
 f   b
   g
 e   c
   d</pre>
  <p class="tip">Challenge: make it count down, or count in hexadecimal (A–F).</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const H = (r, c) => b.H(bb, r, c);
    const u = b.add('uno', 4, 22, {
      code: `// segment pins:      a  b  c  d  e  f  g
const int segPins[] = {2, 3, 4, 5, 6, 7, 8};

const byte digits[10][7] = {
  {1,1,1,1,1,1,0},  // 0
  {0,1,1,0,0,0,0},  // 1
  {1,1,0,1,1,0,1},  // 2
  {1,1,1,1,0,0,1},  // 3
  {0,1,1,0,0,1,1},  // 4
  {1,0,1,1,0,1,1},  // 5
  {1,0,1,1,1,1,1},  // 6
  {1,1,1,0,0,0,0},  // 7
  {1,1,1,1,1,1,1},  // 8
  {1,1,1,1,0,1,1}   // 9
};

void showDigit(int n) {
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], digits[n][i]);
  }
}

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
  Serial.begin(9600);
}

void loop() {
  for (int n = 0; n <= 9; n++) {
    showDigit(n);
    Serial.println(n);
    delay(800);
  }
}
` });
    b.add('seg7', ...H('e', 12));
    b.w(b.pin(u, 'D2'), H('b', 15), WC.org); b.w(b.pin(u, 'D3'), H('b', 16), WC.yel);
    b.w(b.pin(u, 'D7'), H('b', 13), WC.pur); b.w(b.pin(u, 'D8'), H('b', 12), WC.pnk);
    b.w(b.pin(u, 'D4'), H('i', 15), WC.grn); b.w(b.pin(u, 'D5'), H('i', 13), WC.blu); b.w(b.pin(u, 'D6'), H('i', 12), WC.cyn);
    b.w(H('j', 14), b.R(bb, 'b-', 14), WC.blk); b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 9), WC.blk);
  },
});

demo({
  id: 'u-dice', level: 'advanced', title: 'Arduino: Electronic dice', desc: 'Button + random() + 7-segment',
  info: `<h3>Electronic dice</h3>
  <p>Press the button to roll. The display flickers through random numbers, then stops on a value from <b>1 to 6</b>.</p>
  <ul><li>Segments a–g → pins 2–8 (as in the 7-segment counter). Button → pin 10, with <code>INPUT_PULLUP</code>.</li>
  <li><code>random(1, 7)</code> returns 1, 2, 3, 4, 5 or 6. The upper limit is <i>not</i> included.</li></ul>
  <p class="tip">Challenge: make the roll slow down at the end like a real dice.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const H = (r, c) => b.H(bb, r, c);
    const u = b.add('uno', 4, 22, {
      code: `// Electronic dice: press the button to roll
const int segPins[] = {2, 3, 4, 5, 6, 7, 8};   // a b c d e f g
const int button = 10;

const byte digits[10][7] = {
  {1,1,1,1,1,1,0}, {0,1,1,0,0,0,0}, {1,1,0,1,1,0,1}, {1,1,1,1,0,0,1}, {0,1,1,0,0,1,1},
  {1,0,1,1,0,1,1}, {1,0,1,1,1,1,1}, {1,1,1,0,0,0,0}, {1,1,1,1,1,1,1}, {1,1,1,1,0,1,1}
};

void showDigit(int n) {
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], digits[n][i]);
  }
}

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
  pinMode(button, INPUT_PULLUP);
  Serial.begin(9600);
  showDigit(0);
}

void loop() {
  if (digitalRead(button) == LOW) {
    for (int k = 0; k < 10; k++) {    // rolling animation
      showDigit(random(1, 7));
      delay(70);
    }
    int result = random(1, 7);
    showDigit(result);
    Serial.print("You rolled ");
    Serial.println(result);
    delay(300);
  }
}
` });
    b.add('seg7', ...H('e', 12));
    b.w(b.pin(u, 'D2'), H('b', 15), WC.org); b.w(b.pin(u, 'D3'), H('b', 16), WC.yel);
    b.w(b.pin(u, 'D7'), H('b', 13), WC.pur); b.w(b.pin(u, 'D8'), H('b', 12), WC.pnk);
    b.w(b.pin(u, 'D4'), H('i', 15), WC.grn); b.w(b.pin(u, 'D5'), H('i', 13), WC.blu); b.w(b.pin(u, 'D6'), H('i', 12), WC.cyn);
    b.w(H('j', 14), b.R(bb, 'b-', 14), WC.blk); b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 9), WC.blk);
    b.add('button', ...H('f', 22), { label: 'ROLL' });
    b.w(b.pin(u, 'D10'), H('j', 22), WC.wht); b.w(H('j', 24), b.R(bb, 'b-', 24), WC.blk);
  },
});

demo({
  id: 'u-lcd', level: 'advanced', title: 'Arduino: I2C LCD', desc: 'LiquidCrystal_I2C hello world',
  info: `<h3>16×2 LCD over I2C</h3>
  <p>An I2C backpack lets the LCD work with only <b>4 wires</b>:</p>
  <ul><li>GND → GND, VCC → 5V</li><li><b>SDA → A4</b>, <b>SCL → A5</b> (the UNO's I2C pins)</li></ul>
  <p>The sketch prints a greeting and an uptime counter. Type in the <b>Serial</b> tab and press Send to show your own text on line 2.</p>
  <p class="tip">Library functions: <code>lcd.init()</code>, <code>lcd.backlight()</code>, <code>lcd.setCursor(col,row)</code>, <code>lcd.print()</code>, <code>lcd.clear()</code>.</p>`,
  build: b => {
    const u = b.add('uno', 0, 0, {
      code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
String message = "";

void setup() {
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello, Arduino!");
  Serial.println("Type a message and press Send");
}

void loop() {
  if (Serial.available() > 0) {
    message = Serial.readStringUntil('\\n');
    lcd.setCursor(0, 1);
    lcd.print("                ");
  }
  lcd.setCursor(0, 1);
  if (message.length() > 0) {
    lcd.print(message);
  } else {
    unsigned long secs = millis() / 1000;
    lcd.print("Uptime: ");
    lcd.print(secs);
    lcd.print("s");
  }
  delay(200);
}
` });
    const l = b.add('lcd_i2c', 30, 24);
    b.w(b.pin(u, 'GND2'), b.pin(l, 'GND'), WC.blk); b.w(b.pin(u, '5V'), b.pin(l, 'VCC'), WC.red);
    b.w(b.pin(u, 'A4'), b.pin(l, 'SDA'), WC.blu); b.w(b.pin(u, 'A5'), b.pin(l, 'SCL'), WC.yel);
  },
});

demo({
  id: 'u-595', level: 'advanced', title: 'Arduino + 74HC595 shift register', desc: '8 LEDs from only 3 pins',
  info: `<h3>Shift register: more outputs from fewer pins</h3>
  <p>The <b>74HC595</b> receives 8 bits one at a time (serial) and then sets 8 outputs at once (parallel). Three Arduino pins control eight LEDs.</p>
  <ul><li><b>SER</b> (pin 14) ← D11: the data bit. <b>SRCLK</b> (pin 11) ← D12: shift clock. <b>RCLK</b> (pin 12) ← D8: latch.</li>
  <li><code>shiftOut(dataPin, clockPin, MSBFIRST, value)</code> sends 8 bits. Raising the latch pin copies them to Q0–Q7.</li>
  <li>OE̅ goes to GND (outputs on) and SRCLR̅ to + (no clear).</li></ul>
  <p class="tip">You can chain several 595s through Q7' to get 16, 24 or more outputs from the same 3 pins.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 60 });
    const H = (r, k) => b.H(bb, r, k);
    const u = b.add('uno', 4, 22, {
      code: `// 8 LEDs through a 74HC595 shift register
const int dataPin = 11;    // SER
const int clockPin = 12;   // SRCLK
const int latchPin = 8;    // RCLK

void show(byte pattern) {
  digitalWrite(latchPin, LOW);
  shiftOut(dataPin, clockPin, MSBFIRST, pattern);
  digitalWrite(latchPin, HIGH);   // copy the 8 bits to the outputs
}

void setup() {
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(latchPin, OUTPUT);
}

void loop() {
  // running light
  for (int i = 0; i < 8; i++) {
    show(1 << i);
    delay(150);
  }
  // binary counter 0..31
  for (int n = 0; n < 32; n++) {
    show(n);
    delay(200);
  }
}
` });
    b.add('ic74595', ...H('e', 10)); icVcc(b, bb, 10, 16);
    b.w(H('a', 13), b.R(bb, 't-', 13), WC.blk); b.w(H('a', 16), b.R(bb, 't+', 16), WC.red);
    b.w(b.pin(u, '5V'), b.R(bb, 'b+', 8), WC.red); b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 9), WC.blk);
    b.w(b.R(bb, 'b+', 1), b.R(bb, 't+', 1), WC.red); b.w(b.R(bb, 'b-', 2), b.R(bb, 't-', 2), WC.blk);
    b.w(b.pin(u, 'D11'), H('b', 12), WC.yel); b.w(b.pin(u, 'D12'), H('b', 15), WC.org); b.w(b.pin(u, 'D8'), H('c', 14), WC.pur);
    const cols = [45, 42, 39, 36, 33, 30, 27, 24]; // Q0 … Q7 (Q7 on the left)
    cols.forEach((col, i) => outLedBot(b, bb, col, 'red', 'Q' + i));
    b.w(H('c', 11), H('j', cols[0]), WC.grn);
    [10, 11, 12, 13, 14, 15, 16].forEach((pc, i) => b.w(H(i % 2 ? 'g' : 'h', pc), H('j', cols[i + 1]), WC.grn));
  },
});

demo({
  id: 'u-cap', level: 'advanced', title: 'Arduino: measuring a capacitor', desc: 'RC charging with analogRead',
  info: `<h3>Watching a capacitor charge</h3>
  <p>Pin 7 charges a 100 µF capacitor through a 10 kΩ resistor, and <b>A0</b> measures the capacitor voltage every 100 ms.</p>
  <ul><li>The time constant τ = R × C = 10 kΩ × 100 µF = <b>1 second</b>.</li>
  <li>After 1 τ the capacitor reaches 63% (about 3.2 V = 647 on A0), and after 5 τ it is almost full.</li>
  <li>The sketch prints the time when the reading passes 63%: that is your measured τ.</li></ul>
  <p class="tip">Change the capacitor to 470 µF in Properties and run again: τ becomes 4.7 s. This is how some meters measure capacitance.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const H = (r, k) => b.H(bb, r, k);
    const u = b.add('uno', 4, 22, {
      code: `// Measure the RC time constant of a capacitor
const int chargePin = 7;
const int sensePin = A0;

void setup() {
  Serial.begin(9600);
  pinMode(chargePin, OUTPUT);
}

void loop() {
  digitalWrite(chargePin, LOW);           // empty the capacitor
  Serial.println("Discharging...");
  delay(1500);
  Serial.println("Charging:");
  unsigned long start = millis();
  bool found = false;
  digitalWrite(chargePin, HIGH);          // start charging through 10k
  for (int i = 0; i <= 30; i++) {
    int raw = analogRead(sensePin);
    float volts = raw * 5.0 / 1023.0;
    Serial.print(millis() - start);
    Serial.print(" ms  A0 = ");
    Serial.print(raw);
    Serial.print("  (");
    Serial.print(volts);
    Serial.println(" V)");
    if (!found && raw >= 647) {
      found = true;
      Serial.print(">>> 63% reached: tau = ");
      Serial.print(millis() - start);
      Serial.println(" ms");
    }
    delay(100);
  }
}
` });
    b.add('resistor', ...H('f', 10), { ohms: '10k' });
    b.add('capacitor', ...H('h', 14), { uf: 100 }); b.w(H('j', 15), b.R(bb, 'b-', 15), WC.blk);
    b.w(b.pin(u, 'D7'), H('j', 10), WC.org); b.w(H('i', 14), b.pin(u, 'A0'), WC.yel); b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 12), WC.blk);
  },
});

demo({
  id: 'u-counter', level: 'advanced', title: 'Arduino: LCD button counter', desc: 'Count button presses on an LCD',
  info: `<h3>Button counter on an LCD</h3>
  <p>Two push buttons and an I2C LCD make a simple <b>event counter</b>.</p>
  <ul><li><b>COUNT</b> button: pin 2 → GND. <b>RESET</b> button: pin 3 → GND. Both use <code>INPUT_PULLUP</code>, so a press reads <b>LOW</b>.</li>
  <li>LCD: GND, 5V, <b>SDA → A4</b>, <b>SCL → A5</b>.</li>
  <li>The sketch counts only the moment the button goes from HIGH to LOW (an <i>edge</i>), so holding the button down adds just 1.</li></ul>
  <p class="tip">Challenge: add a third button that counts down, or show the count in binary with <code>lcd.print(count, BIN)</code>.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const u = b.add('uno', 4, 22, {
      code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

const int countBtn = 2;
const int resetBtn = 3;
int count = 0;
int lastState = HIGH;

void showCount() {
  lcd.setCursor(0, 1);
  lcd.print("Count: ");
  lcd.print(count);
  lcd.print("        ");
}

void setup() {
  pinMode(countBtn, INPUT_PULLUP);
  pinMode(resetBtn, INPUT_PULLUP);
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Button counter");
  showCount();
}

void loop() {
  int state = digitalRead(countBtn);
  if (state == LOW && lastState == HIGH) {   // just pressed
    count++;
    showCount();
    Serial.print("count = ");
    Serial.println(count);
  }
  lastState = state;

  if (digitalRead(resetBtn) == LOW) {
    count = 0;
    showCount();
  }
  delay(20);
}
` });
    const l = b.add('lcd_i2c', 36, 24);
    b.w(b.pin(u, 'GND2'), b.pin(l, 'GND'), WC.blk); b.w(b.pin(u, '5V'), b.pin(l, 'VCC'), WC.red);
    b.w(b.pin(u, 'A4'), b.pin(l, 'SDA'), WC.blu); b.w(b.pin(u, 'A5'), b.pin(l, 'SCL'), WC.yel);
    b.add('button', ...b.H(bb, 'f', 18), { label: 'COUNT' }); b.add('button', ...b.H(bb, 'f', 24), { label: 'RESET' });
    b.w(b.pin(u, 'D2'), b.H(bb, 'j', 18), WC.org); b.w(b.H(bb, 'j', 20), b.R(bb, 'b-', 20), WC.blk);
    b.w(b.pin(u, 'D3'), b.H(bb, 'j', 24), WC.pur); b.w(b.H(bb, 'j', 26), b.R(bb, 'b-', 26), WC.blk);
    b.w(b.pin(u, 'GND'), b.R(bb, 'b-', 12), WC.blk);
  },
});

/* ----------------------- ESP8266 ----------------------- */
demo({
  id: 'e-blink', level: 'advanced', title: 'ESP8266: Blink', desc: 'NodeMCU built-in LED',
  info: `<h3>ESP8266 NodeMCU: Blink</h3>
  <p>The NodeMCU has a blue LED on <b>GPIO2 (D4)</b>, and it is <b>active-LOW</b>: writing <code>LOW</code> turns it <i>on</i>.</p>
  <p>On the ESP8266 the board labels (D1, D2…) are not the GPIO numbers. Use the <code>D1</code>…<code>D8</code> constants in your code.</p>
  ${tt(['Label', 'GPIO'], [['D0', 16], ['D1', 5], ['D2', 4], ['D3', 0], ['D4', 2], ['D5', 14], ['D6', 12], ['D7', 13], ['D8', 15]])}`,
  build: b => { b.add('esp8266', 2, 2); },
});

demo({
  id: 'e-web', level: 'advanced', title: 'ESP8266: Wi-Fi web server', desc: 'Control LEDs from a web page',
  info: `<h3>Wi-Fi web server</h3>
  <p>The ESP8266 connects to Wi-Fi and runs a small <b>web server</b>. Each URL (<code>/led1/on</code>, <code>/led2/off</code>…) has a handler function that switches an LED and sends back an HTML page.</p>
  <ol><li>Wait for "Connected!" in the <b>Serial</b> tab.</li>
  <li>Open the <b>Wi-Fi</b> tab: it is a phone browser connected to the ESP's IP address.</li>
  <li>Tap the buttons to switch the red LED (D1) and green LED (D2).</li></ol>
  <p class="tip"><code>server.handleClient()</code> must be called in <code>loop()</code>, or requests are never answered.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const e = b.add('esp8266', 6, 23, {
      code: `#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "MyHomeWiFi";
const char* password = "12345678";

ESP8266WebServer server(80);

const int led1 = D1;   // red
const int led2 = D2;   // green
bool led1On = false;
bool led2On = false;

String page() {
  String html = "<html><head><meta name='viewport' content='width=device-width'>";
  html += "<style>body{font-family:sans-serif;text-align:center;background:#0f172a;color:#e2e8f0;padding:10px}";
  html += "a{display:inline-block;margin:6px;padding:12px 20px;border-radius:10px;color:#fff;text-decoration:none;font-weight:bold}";
  html += ".on{background:#16a34a}.off{background:#475569}.st{font-size:20px}</style></head><body>";
  html += "<h2>ESP8266 LED Control</h2>";
  html += "<p class='st'>Red LED: <b>" + String(led1On ? "ON" : "OFF") + "</b></p>";
  html += "<a class='on' href='/led1/on'>Red ON</a><a class='off' href='/led1/off'>Red OFF</a>";
  html += "<p class='st'>Green LED: <b>" + String(led2On ? "ON" : "OFF") + "</b></p>";
  html += "<a class='on' href='/led2/on'>Green ON</a><a class='off' href='/led2/off'>Green OFF</a>";
  html += "<p style='opacity:.6'>Uptime: " + String(millis() / 1000) + " s</p>";
  html += "</body></html>";
  return html;
}

void handleRoot()  { server.send(200, "text/html", page()); }
void led1OnH()  { led1On = true;  digitalWrite(led1, HIGH); handleRoot(); }
void led1OffH() { led1On = false; digitalWrite(led1, LOW);  handleRoot(); }
void led2OnH()  { led2On = true;  digitalWrite(led2, HIGH); handleRoot(); }
void led2OffH() { led2On = false; digitalWrite(led2, LOW);  handleRoot(); }

void setup() {
  Serial.begin(115200);
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! Open http://");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/led1/on", led1OnH);
  server.on("/led1/off", led1OffH);
  server.on("/led2/on", led2OnH);
  server.on("/led2/off", led2OffH);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}
` });
    outLedBot(b, bb, 10, 'red'); outLedBot(b, bb, 16, 'green');
    b.w(b.pin(e, 'D1'), b.H(bb, 'j', 10), WC.org); b.w(b.pin(e, 'D2'), b.H(bb, 'j', 16), WC.grn);
    b.w(b.pin(e, 'GND'), b.R(bb, 'b-', 13), WC.blk);
  },
});

demo({
  id: 'e-sensor', level: 'advanced', title: 'ESP8266: Web sensor page', desc: 'Read A0 and show it in a browser',
  info: `<h3>A sensor on a web page</h3>
  <p>A potentiometer acts as a "sensor" on the ESP8266's analog pin <b>A0</b>. The web page shows the value (0–1023) and a bar.</p>
  <ul><li>Pot: ends to <b>3V3</b> and <b>GND</b>, middle pin (wiper) → <b>A0</b>.</li>
  <li>Every time the page loads, <code>handleRoot()</code> calls <code>analogRead(A0)</code> and builds fresh HTML.</li></ul>
  <p>Turn the knob (drag it up or down), then tap <b>Refresh</b> in the Wi-Fi tab.</p>
  <p class="tip">Swap the pot for a light or temperature sensor and you have an IoT weather station.</p>`,
  build: b => {
    const bb = b.add('breadboard', 0, 0, { cols: 30 });
    const e = b.add('esp8266', 6, 23, {
      code: `#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

ESP8266WebServer server(80);

void handleRoot() {
  int value = analogRead(A0);
  int percent = map(value, 0, 1023, 0, 100);
  String html = "<html><body style='font-family:sans-serif;text-align:center;background:#0f172a;color:#e2e8f0;padding:10px'>";
  html += "<h2>ESP8266 Sensor</h2>";
  html += "<p style='font-size:44px;margin:8px;color:#fde047'>" + String(value) + "</p>";
  html += "<div style='margin:auto;width:85%;height:24px;background:#334155;border-radius:12px'>";
  html += "<div style='height:24px;border-radius:12px;background:#22c55e;width:" + String(percent) + "%'></div></div>";
  html += "<p>" + String(percent) + " %</p>";
  html += "<a href='/' style='display:inline-block;padding:12px 22px;background:#2563eb;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold'>Refresh</a>";
  html += "</body></html>";
  server.send(200, "text/html", html);
  Serial.print("Page served, A0 = ");
  Serial.println(value);
}

void setup() {
  Serial.begin(115200);
  WiFi.begin("MyHomeWiFi", "12345678");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }
  Serial.print("Open http://");
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
}
` });
    b.add('pot', ...b.H(bb, 'f', 20), { pos: 35 });
    b.w(b.H(bb, 'j', 20), b.R(bb, 'b-', 20), WC.blk); b.w(b.H(bb, 'j', 22), b.R(bb, 'b+', 22), WC.red);
    b.w(b.pin(e, '3V3'), b.R(bb, 'b+', 11), WC.red); b.w(b.pin(e, 'GND'), b.R(bb, 'b-', 12), WC.blk);
    b.w(b.H(bb, 'i', 21), b.pin(e, 'A0'), WC.yel);
  },
});

demo({
  id: 'e-lcd', level: 'advanced', title: 'ESP8266: Web → LCD message', desc: 'Send text from a phone to an LCD',
  info: `<h3>Wi-Fi message board</h3>
  <p>A web form on the ESP8266 sends your text to an I2C LCD.</p>
  <ul><li>On the ESP8266, I2C uses <b>SDA = D2</b> and <b>SCL = D1</b>.</li>
  <li>The LCD is powered from 3V3 and GND.</li></ul>
  <p>Open the <b>Wi-Fi</b> tab, type a message and press <b>Send</b>. <code>server.arg("msg")</code> reads the form field.</p>`,
  build: b => {
    const e = b.add('esp8266', 2, 2, {
      code: `#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <LiquidCrystal_I2C.h>

ESP8266WebServer server(80);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void handleRoot() {
  String html = "<html><body style='font-family:sans-serif;background:#111827;color:#f9fafb;text-align:center'>";
  html += "<h2>LCD Message Board</h2>";
  html += "<form action='/send'><input name='msg' maxlength='16' placeholder='Your message' style='padding:10px;font-size:16px'>";
  html += "<button style='padding:10px 16px;font-size:16px;margin-left:6px'>Send</button></form>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleSend() {
  String msg = server.arg("msg");
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("New message:");
  lcd.setCursor(0, 1);
  lcd.print(msg);
  Serial.println("LCD <- " + msg);
  handleRoot();
}

void setup() {
  Serial.begin(115200);
  lcd.init();
  lcd.backlight();
  lcd.print("Connecting...");
  WiFi.begin("MyHomeWiFi", "12345678");
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
  }
  lcd.clear();
  lcd.print("IP address:");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  Serial.print("Open http://");
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.on("/send", handleSend);
  server.begin();
}

void loop() {
  server.handleClient();
}
` });
    const l = b.add('lcd_i2c', 22, -6);
    b.w(b.pin(e, 'GND'), b.pin(l, 'GND'), WC.blk); b.w(b.pin(e, '3V3'), b.pin(l, 'VCC'), WC.red);
    b.w(b.pin(e, 'D2'), b.pin(l, 'SDA'), WC.blu); b.w(b.pin(e, 'D1'), b.pin(l, 'SCL'), WC.yel);
  },
});

function buildDemo(d) { const b = builder(); d.build(b); return b.circ; }

if (typeof module !== 'undefined') module.exports = Object.assign(module.exports || {}, { DEMOS, buildDemo });
