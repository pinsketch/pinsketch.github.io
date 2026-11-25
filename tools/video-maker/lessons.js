/* PinSketch video lessons: narration ("say" is spoken, "cap" is the on-screen caption) + actions */
'use strict';
const HB = (r, c) => [c + 1, { a: 4, b: 5, c: 6, d: 7, e: 8, f: 11, g: 12, h: 13, i: 14, j: 15 }[r]]; // hole on a breadboard at 0,0
const byX = (T, type) => T.comps(type).sort((a, b) => a.x - b.x || a.y - b.y);

const LESSONS = [
  /* ============================ BEGINNER ============================ */
  {
    id: 'b-simple', level: 'beginner', num: 1, title: 'Your First Circuit', sub: 'Battery · Switch · Light bulb',
    steps: [
      { intro: true, say: 'Welcome to Pin Sketch! In this lesson, you will build your first electric circuit, with a battery, a switch, and a light bulb.' },
      { say: 'First, drag a battery from the parts panel onto the canvas. It has a plus terminal and a minus terminal.', do: (T, D) => T.next(1, D * 0.8) },
      { say: 'Next, add a toggle switch and a light bulb.', do: (T, D) => T.next(2, D) },
      { say: 'Now connect them with wires. Press on a pin and drag to another pin. The wires make a loop: from plus, through the switch and the bulb, and back to minus.', do: (T, D) => T.next(4, D) },
      { say: 'Click the switch to turn it on. The loop is closed, and the bulb lights up! The moving yellow dots show the current, flowing from plus, around the loop, and back to minus.', cap: 'Switch ON: the loop is closed and the bulb lights. The moving yellow dots show the current flowing from + around the loop to −.', do: async (T, D) => { await T.wait(D * 0.25); await T.toggle('switch'); } },
      { say: 'Wire colors show the signal. Red means high, connected to plus. Blue means low, connected to minus.', cap: 'Wire colors show the signal: red = HIGH (connected to +), blue = LOW (connected to −).',
        do: async (T, D) => { await T.hover(14, 2, D * 0.25); await T.wait(D * 0.3); await T.hover(16, 2, D * 0.2); await T.wait(D * 0.2); T.unhover(); } },
      { say: 'Click the switch again to open the circuit, and the bulb goes dark. Congratulations, you built your first circuit!', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('switch'); } },
    ],
  },
  {
    id: 'b-series', level: 'beginner', num: 2, title: 'Series & Parallel Circuits', sub: 'Why some bulbs glow brighter',
    steps: [
      { intro: true, say: 'Lesson two: series and parallel circuits. Let us compare two ways of connecting light bulbs.' },
      { say: 'On the left, two bulbs are connected in series, one after the other. On the right, two bulbs are connected in parallel, side by side.',
        do: async (T, D) => { await T.all(D * 0.45); T.highlight(1, -3.5, 22, 10, 'SERIES'); await T.wait(D * 0.25); T.highlight(24, -3.5, 41.5, 10, 'PARALLEL'); await T.wait(D * 0.25); T.clearHighlights(); } },
      { say: 'Turn on the series circuit. The two bulbs share the battery voltage, so each one glows dimly, and the current dots move slowly.', do: async (T) => { await T.toggle(byX(T, 'switch')[0]); } },
      { say: 'Now turn on the parallel circuit. Each bulb gets the full voltage, so both glow brightly. The current splits into two paths, one through each bulb.', do: async (T) => { await T.toggle(byX(T, 'switch')[1]); } },
      { say: 'What happens if one bulb is removed? In series, the loop is broken, so the other bulb goes out too.',
        do: async (T, D) => { await T.wait(D * 0.3); await T.select(byX(T, 'bulb')[1]); await T.wait(300); T.app.deleteSel(); } },
      { say: 'In parallel, the other bulb keeps shining. That is why the lights in your home are wired in parallel.',
        do: async (T) => { const b = T.comps('bulb').filter(c => c.x > 30).sort((a, c) => c.y - a.y)[0]; await T.select(b); await T.wait(300); T.app.deleteSel(); } },
    ],
  },
  {
    id: 'b-and', level: 'beginner', num: 3, title: 'Logic Gates & Truth Tables', sub: 'The AND gate',
    steps: [
      { intro: true, say: 'Lesson three: logic gates and truth tables. Digital circuits work with just two values: zero and one.' },
      { say: 'Add two logic inputs, named A and B. You can click them to switch between zero and one.', do: (T, D) => T.next(2, D * 0.9) },
      { say: 'Then add an AND gate and an output lamp, and wire them together.', do: (T, D) => T.next(5, D) },
      { say: 'Set A to one. The white dashes show the signal travelling into the gate. The lamp stays off, because an AND gate needs all of its inputs to be one.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Now set B to one as well. Both inputs are one, so the output is one, and the signal flows out to the lamp.', do: async (T, D) => { await T.wait(D * 0.3); await T.toggle('B'); } },
      { say: 'Open the truth table tab and press generate. Pin Sketch tries every combination of inputs for you.',
        do: async (T, D) => { await T.tab('truth', D * 0.2); await T.wait(D * 0.15); await T.click('#btnTruth', D * 0.2); } },
      { say: 'Open the demos tab to explore the OR, NOT, X OR, NAND and NOR gates.', cap: 'Open the Demos tab to explore the OR, NOT, XOR, NAND and NOR gates.',
        do: async (T, D) => { await T.click('[data-ltab="demos"]', D * 0.3); } },
    ],
  },
  {
    id: 'b-or', level: 'beginner', num: 4, title: 'The OR Gate', sub: 'One input is enough',
    steps: [
      { intro: true, say: 'Lesson four: the OR gate.' },
      { say: 'Add two logic inputs, an OR gate, and an output lamp, then wire them together.', do: (T, D) => T.next(7, D) },
      { say: 'Set A to one. An OR gate needs just one input to be one, so the lamp turns on.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Set A back to zero, and set B to one. The lamp is still on.', do: async (T, D) => { await T.toggle('A'); await T.wait(D * 0.2); await T.toggle('B'); } },
      { say: 'Now turn both inputs on. The output is still one. An OR gate gives zero only when every input is zero.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Open the truth table tab, and press generate to see all four rows.', do: async (T, D) => { await T.tab('truth', D * 0.25); await T.wait(D * 0.1); await T.click('#btnTruth', D * 0.25); } },
    ],
  },
  {
    id: 'b-not', level: 'beginner', num: 5, title: 'The NOT Gate', sub: 'The inverter',
    steps: [
      { intro: true, say: 'Lesson five: the NOT gate, also called an inverter.' },
      { say: 'A NOT gate has only one input. Add a logic input, a NOT gate, and a lamp, and wire them up.', do: (T, D) => T.next(5, D) },
      { say: 'With the input at zero, the output is one. The lamp is on, and the white dashes show the output signal.', do: async (T, D) => { T.highlightComp(T.comp('g_not'), 'NOT'); await T.wait(D * 0.8); T.clearHighlights(); } },
      { say: 'Set the input to one, and the output flips to zero. The small circle on the output means invert.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Click again, and it flips back. The output of a NOT gate is always the opposite of its input.', do: async (T, D) => { await T.wait(D * 0.2); await T.toggle('A'); } },
    ],
  },
  {
    id: 'b-xor', level: 'beginner', num: 6, title: 'The XOR Gate', sub: 'Exclusive OR: are the inputs different?',
    steps: [
      { intro: true, say: 'Lesson six: the X OR gate, short for exclusive OR.', cap: 'Lesson 6: the XOR gate (exclusive OR).' },
      { say: 'Add inputs A and B, an X OR gate with its double curved back, and a lamp.', cap: 'Add inputs A and B, an XOR gate (note the double curved back) and a lamp.', do: (T, D) => T.next(7, D) },
      { say: 'Set A to one. The inputs are different, so the lamp turns on.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Now set B to one as well. The inputs are the same, so the output is zero.', do: async (T, D) => { await T.wait(D * 0.2); await T.toggle('B'); } },
      { say: 'X OR answers the question: are the inputs different? That makes it perfect for adding binary numbers.', cap: 'XOR asks: are the inputs different? That makes it perfect for adding binary numbers.', do: async (T, D) => { await T.tab('truth', D * 0.25); await T.wait(D * 0.1); await T.click('#btnTruth', D * 0.25); } },
    ],
  },
  {
    id: 'b-nand', level: 'beginner', num: 7, title: 'NAND & NOR Gates', sub: 'NOT AND, NOT OR',
    steps: [
      { intro: true, say: 'Lesson seven: the NAND and NOR gates.' },
      { say: 'NAND means not AND, and NOR means not OR. The little circle at each output inverts the result.', do: async (T, D) => { await T.next(4, D * 0.7); T.highlightComp(T.comps('g_nand')[0], 'NAND'); T.highlightComp(T.comps('g_nor')[0], 'NOR'); await T.wait(D * 0.25); T.clearHighlights(); } },
      { say: 'Wire both inputs to both gates, and add two lamps.', do: (T, D) => T.next(8, D) },
      { say: 'With both inputs at zero, NAND is one, and NOR is also one.', do: (T, D) => T.wait(D * 0.5) },
      { say: 'Set A to one. NAND stays one, but NOR drops to zero.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Set B to one. Now NAND finally becomes zero. It is the exact opposite of AND.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('B'); } },
    ],
  },
  {
    id: 'b-universal', level: 'beginner', num: 8, title: 'NAND Builds Every Gate', sub: 'NOT, AND and OR from NAND only',
    steps: [
      { intro: true, say: 'Lesson eight: the NAND gate can build every other gate.' },
      { say: 'First, NOT. Join both inputs of one NAND gate to A. The output is always the opposite of A.', do: (T, D) => T.next(7, D) },
      { say: 'Next, AND. A NAND gate followed by a second NAND, used as a NOT, gives AND.', do: (T, D) => T.next(8, D) },
      { say: 'Finally, OR. Invert both inputs with two NAND gates, then NAND them together. This is called De Morgan\'s law.', cap: 'Finally, OR: invert both inputs with two NANDs, then NAND them together (De Morgan\'s law).', do: (T, D) => T.next(14, D) },
      { say: 'Set A to one. NOT A turns off, and A OR B turns on.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Set B to one too, and A AND B lights up. Three different gates, built only from NAND!', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('B'); } },
    ],
  },
  {
    id: 'b-all', level: 'beginner', num: 9, title: 'All Gates Side by Side', sub: 'AND, OR, NAND, NOR, XOR, XNOR, NOT',
    steps: [
      { intro: true, say: 'Lesson nine: all the logic gates, side by side.' },
      { say: 'The same two inputs, A and B, feed seven different gates, each with its own lamp.', do: (T, D) => T.all(D * 0.95) },
      { say: 'With A and B both zero, only NAND, NOR, X NOR and NOT light up.', cap: 'A = 0, B = 0: only NAND, NOR, XNOR and NOT A are 1.', do: (T, D) => T.wait(D * 0.5) },
      { say: 'Set A to one. Now OR, NAND and X OR are on.', cap: 'A = 1, B = 0: OR, NAND and XOR are 1.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Set B to one as well. AND, OR and X NOR are on, and NAND turns off.', cap: 'A = 1, B = 1: AND, OR and XNOR are 1. NAND turns off.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('B'); } },
      { say: 'Compare each lamp with the truth tables from the earlier lessons.', do: async (T, D) => { await T.tab('truth', D * 0.25); await T.wait(D * 0.1); await T.click('#btnTruth', D * 0.25); } },
    ],
  },
  {
    id: 'b-half', level: 'beginner', num: 10, title: 'The Half Adder', sub: 'Adding two bits with XOR and AND',
    steps: [
      { intro: true, say: 'Lesson ten: the half adder. This circuit adds two binary digits together.' },
      { say: 'Start with two inputs, A and B, an X OR gate, and an AND gate.', cap: 'Start with two inputs, A and B, an XOR gate and an AND gate.', do: (T, D) => T.next(4, D) },
      { say: 'Wire each input to both gates. The X OR output is the sum, and the AND output is the carry.', cap: 'Wire each input to both gates. The XOR output is the Sum, the AND output is the Carry.', do: (T, D) => T.next(8, D) },
      { say: 'Set A to one. One plus zero equals one, so the sum lamp lights.', cap: 'A = 1:  1 + 0 = 1, so the Sum lamp lights.', do: async (T, D) => { await T.wait(D * 0.1); await T.toggle('A'); } },
      { say: 'Now set B to one. One plus one equals two, which is one zero in binary. So the sum is zero, and the carry is one.', cap: 'B = 1:  1 + 1 = 2, which is 10 in binary. Sum = 0, Carry = 1.',
        do: async (T, D) => { await T.wait(D * 0.15); await T.toggle('B'); } },
      { say: 'Chain adders like this together, and you get the arithmetic unit inside every computer processor.',
        do: async (T, D) => { T.highlightComp(T.comp('g_xor'), 'SUM'); T.highlightComp(T.comp('g_and'), 'CARRY'); await T.wait(D * 0.8); T.clearHighlights(); } },
    ],
  },
  {
    id: 'b-full', level: 'beginner', num: 11, title: 'The Full Adder', sub: 'A + B + carry in',
    steps: [
      { intro: true, say: 'Lesson eleven: the full adder, which adds three bits.' },
      { say: 'A full adder adds A, B, and a carry in from the previous column.', do: (T, D) => T.next(8, D) },
      { say: 'Two X OR gates make the sum. Two AND gates and an OR gate make the carry out.', cap: 'Two XOR gates make the Sum. Two AND gates and an OR gate make the Carry out.', do: (T, D) => T.next(14, D) },
      { say: 'Set A and B to one. One plus one is two: sum zero, carry one.', cap: 'A = 1, B = 1:  1 + 1 = 10 → Sum 0, Carry 1', do: async (T, D) => { await T.toggle('A'); await T.wait(D * 0.1); await T.toggle('B'); } },
      { say: 'Turn on carry in as well. One plus one plus one is three, binary one one, so both lamps light.', cap: 'Cin = 1 too:  1 + 1 + 1 = 11 → both lamps light.', do: async (T, D) => { await T.wait(D * 0.15); await T.toggle('Cin'); } },
      { say: 'Chain full adders together, and you can add numbers of any size.', do: async (T, D) => { await T.tab('truth', D * 0.25); await T.wait(D * 0.1); await T.click('#btnTruth', D * 0.25); } },
    ],
  },
  {
    id: 'b-lcd', level: 'beginner', num: 12, title: 'LCD & 7-Segment Display', sub: 'Showing binary numbers',
    steps: [
      { intro: true, say: 'Lesson twelve: showing numbers on an LCD and a seven segment display.', cap: '' },
      { say: 'Four logic inputs make a four bit binary number. The bits are worth one, two, four, and eight.', cap: 'Four logic inputs make a 4-bit binary number. The bits are worth 1, 2, 4 and 8.',
        do: async (T, D) => { await T.parts('logicin', D * 0.85, { pop: true }); } },
      { say: 'Add a seven segment display, and wire each bit to it.', cap: 'Add a 7-segment display and wire each bit to it.',
        do: async (T, D) => { await T.parts('hex7', D * 0.3); await T.wires(D * 0.6, w => w.pts[w.pts.length - 1][0] === 16); } },
      { say: 'The LCD needs power, so we connect its V C C and ground pins to a battery.', cap: 'The LCD needs power: connect its VCC and GND pins to a battery.',
        do: async (T, D) => { await T.parts(['battery', 'lcd'], D * 0.5); await T.wires(D * 0.45); } },
      { say: 'Turn on D zero and D two. One plus four equals five, so both displays show five.', cap: 'Turn on D0 and D2:  1 + 4 = 5.',
        do: async (T, D) => { await T.toggle('D0'); await T.wait(D * 0.15); await T.toggle('D2'); } },
      { say: 'Now turn on all four bits. Eight plus four plus two plus one is fifteen, which is F in hexadecimal.', cap: 'All four bits:  8 + 4 + 2 + 1 = 15, which is F in hexadecimal.',
        do: async (T, D) => { await T.toggle('D1'); await T.wait(D * 0.1); await T.toggle('D3'); } },
      { say: 'Select the LCD, and change its message in the properties tab.', cap: 'Select the LCD and change its message in the Properties tab.',
        do: async (T, D) => {
          await T.select('lcd', D * 0.15); await T.tab('props', D * 0.15);
          const inp = $('#props input[data-prop="text"]'); if (!inp) return;
          await T.clickEl(inp, D * 0.12); inp.value = '';
          for (const ch of 'I love PinSketch!') { inp.value += ch; inp.dispatchEvent(new Event('input')); await T.wait(D * 0.35 / 17); }
          inp.blur();
        } },
    ],
  },

  /* ============================ ADVANCED ============================ */
  {
    id: 'a-bb', level: 'advanced', num: 1, title: 'How a Breadboard Works', sub: 'Strips, rails and your first LED circuit',
    steps: [
      { intro: true, say: 'Advanced lesson one: how a breadboard works.' },
      { say: 'This is a breadboard. Inside, each column of five holes is connected. Hover over a hole, and every connected hole lights up green.',
        do: async (T, D) => { await T.next(1, D * 0.3); await T.hover(...HB('a', 9), D * 0.15); await T.wait(D * 0.2); await T.hover(...HB('h', 16), D * 0.15); await T.wait(D * 0.15); } },
      { say: 'The long rows at the top and bottom are the power rails, for plus and minus.',
        do: async (T, D) => { await T.hover(16, 2, D * 0.25); await T.wait(D * 0.3); await T.hover(20, 18, D * 0.2); await T.wait(D * 0.15); T.unhover(); } },
      { say: 'Connect a battery to the top rails.', do: (T, D) => T.next(3, D) },
      { say: 'Plug in a jumper wire, a push button, an LED, and a two hundred twenty ohm resistor. Each part bridges two different columns.',
        cap: 'Add a jumper, a push button, an LED and a 220 Ω resistor. Each part bridges two different columns.', do: (T, D) => T.next(4, D) },
      { say: 'One more wire completes the loop, from plus, through the parts, back to minus.', do: (T, D) => T.next(1, D * 0.6) },
      { say: 'Now hold the button. Watch the yellow dots: current flows from the plus rail, down the column, through the button, the LED and the resistor, and back to minus.', cap: 'Hold the button: current flows from the + rail, down the column, through the button, LED and resistor, back to −.', do: async (T, D) => { await T.press('button', D * 0.6); } },
      { say: 'Remember: the long leg of the LED, the anode, must face the positive side.', cap: 'Remember: the LED\'s long leg (anode, +) must face the positive side.',
        do: async (T, D) => { await T.hover(...HB('c', 5), D * 0.3); await T.wait(D * 0.5); T.unhover(); } },
    ],
  },
  {
    id: 'a-and', level: 'advanced', num: 2, title: 'Using a Logic IC', sub: 'The 74HC08 AND chip on a breadboard',
    steps: [
      { intro: true, say: 'Advanced lesson two: how to use a logic chip on a breadboard.' },
      { say: 'Start with a breadboard and a power module. It supplies five volts to the power rails on both sides.', do: (T, D) => T.next(2, D * 0.8) },
      { say: 'Place the seventy four H C zero eight chip across the middle gap, so that every pin gets its own column. Pin one is next to the notch.',
        cap: 'Place the 74HC08 across the middle gap, so every pin gets its own column. Pin 1 is next to the notch.',
        do: async (T, D) => { T.reorder([0, 1, 5, 6, 7, 2, 3, 4, 8, 9, 10, 11, 12, 13]); await T.next(1, D * 0.45); await T.hover(13, 11, D * 0.2); await T.wait(D * 0.25); T.unhover(); } },
      { say: 'Every chip needs power. Connect pin fourteen to plus, and pin seven to ground.', cap: 'Every chip needs power: pin 14 → + (VCC) and pin 7 → − (GND).', do: (T, D) => T.next(2, D * 0.9) },
      { say: 'Add a DIP switch for the two inputs, A and B, and connect it to the plus rail.', cap: 'Add a DIP switch for inputs A and B, connected to the + rail.', do: (T, D) => T.next(3, D) },
      { say: 'Wire the switches to pins one and two. Pin three is the output, and it drives an LED.', cap: 'Wire the switches to pins 1 and 2. Pin 3 is the output, driving an LED.', do: (T, D) => T.next(6, D) },
      { say: 'Switch on A, and then B. The LED lights only when both inputs are on. The current comes from the V C C pin, through the chip, out of pin three, and through the LED.', cap: 'A and B ON → LED ON. Current flows from VCC (pin 14), through the chip, out of pin 3 and through the LED.',
        do: async (T, D) => { await T.dip('dip4', 0); await T.wait(D * 0.3); await T.dip('dip4', 1); } },
      { say: 'If a power wire is removed, the chip stops working. Always check V C C and ground first!', cap: 'Remove a power wire and the chip stops working. Always check VCC and GND first!',
        do: async (T, D) => {
          const w = T.app.circ.wires.find(x => x.pts[0][0] === 13 && x.pts[0][1] === 4);
          const [sx, sy] = T.w2s(13, 3); await T.move(sx, sy, D * 0.2); T.down(); T.app.select({ wire: w }); T.up();
          await T.wait(D * 0.1); T.app.deleteSel(); await T.wait(D * 0.4); T.app.doUndo();
        } },
    ],
  },
  {
    id: 'a-half', level: 'advanced', num: 3, title: 'Half Adder with Two Chips', sub: '74HC86 XOR + 74HC08 AND',
    opts: { prebuilt: false },
    steps: [
      { intro: true, say: 'Advanced lesson three: building a half adder with two logic chips.' },
      { say: 'This half adder uses two chips: the seventy four H C eighty six, with X OR gates, and the seventy four H C zero eight, with AND gates.',
        cap: 'Two chips: the 74HC86 (XOR gates) and the 74HC08 (AND gates).',
        do: async (T, D) => { await T.next(11, D * 0.6, true); T.highlightComp(T.comp('ic7486'), 'XOR → SUM'); T.highlightComp(T.comp('ic7408'), 'AND → CARRY'); await T.wait(D * 0.3); T.clearHighlights(); } },
      { say: 'Switch one is input A, and switch two is input B. Each input is wired to both chips.', cap: 'DIP switch 1 = A, switch 2 = B. Each input goes to both chips.', do: (T, D) => T.next(4, D * 0.8) },
      { say: 'The outputs drive two LEDs: carry on the left, and sum on the right.', cap: 'The outputs drive two LEDs: Carry (left) and Sum (right).', do: (T, D) => T.all(D * 0.85) },
      { say: 'Turn on A. One plus zero is one, so the sum LED lights. Follow the yellow dots from the X OR chip to the sum LED.', cap: 'A = 1:  1 + 0 = 1 → Sum lights. Follow the current from the XOR chip to the Sum LED.', do: async (T, D) => { await T.wait(D * 0.2); await T.dip('dip4', 0); } },
      { say: 'Turn on B as well. One plus one is two, binary one zero. The carry LED lights, and the sum turns off.', cap: 'A = 1, B = 1:  1 + 1 = 10 in binary → Carry lights, Sum turns off.',
        do: async (T, D) => { await T.wait(D * 0.25); await T.dip('dip4', 1); } },
    ],
  },
  {
    id: 'a-add2', level: 'advanced', num: 4, title: '2-Bit Adder from Logic Gates', sub: '74HC86 + 74HC08 + 74HC32',
    steps: [
      { intro: true, say: 'Advanced lesson four: a two bit adder, built from basic logic gates.', cap: '' },
      { say: 'We use three chips: X OR, AND, and OR. Each chip gets power from the rails.', cap: 'Three chips: 74HC86 (XOR), 74HC08 (AND) and 74HC32 (OR), each powered from the rails.', do: (T, D) => T.next(16, D * 0.95, true) },
      { say: 'Next come the input wires and the internal connections. Bit zero is a half adder, and bit one is a full adder.', cap: 'Bit 0 is a half adder, bit 1 is a full adder.', do: (T, D) => T.next(14, D * 0.95, true) },
      { say: 'Three LEDs show the answer: carry, S one, and S zero. The DIP switches are A one, A zero, B one, and B zero.', cap: 'LEDs: C, S1, S0.   DIP switches: A1, A0, B1, B0.',
        do: async (T, D) => { await T.all(D * 0.55); T.highlightComp(T.comp('dip4'), 'A1 A0 B1 B0', 14); T.highlight(52.5, 2.5, 62, 9.5, 'C  S1  S0'); await T.wait(D * 0.35); T.clearHighlights(); } },
      { say: 'Set A to one one, which is three. Then set B to one zero, which is two. The LEDs show one zero one. That is five!', cap: 'A = 11 (3),  B = 10 (2)  →  101 = 5',
        do: async (T, D) => { await T.wide(true, D * 0.15); const d = T.comp('dip4'); await T.dip(d, 0); await T.dip(d, 1); await T.wait(D * 0.1); await T.dip(d, 2); } },
      { say: 'Now set B to three as well. Three plus three is six: one one zero.', cap: '3 + 3 = 6  →  110', do: async (T, D) => { await T.wait(D * 0.15); await T.dip('dip4', 3); } },
    ],
  },
  {
    id: 'a-add4', level: 'advanced', num: 5, title: '4-Bit Adder IC', sub: 'The 74HC283',
    steps: [
      { intro: true, say: 'Advanced lesson five: adding four bit numbers with the seventy four H C two eighty three.', cap: '' },
      { say: 'Two DIP switches give us two four bit numbers, A and B. Their top pins connect to the plus rail.', cap: 'Two DIP switches give two 4-bit numbers, A and B.', do: (T, D) => T.next(12, D * 0.95, true) },
      { say: 'The seventy four H C two eighty three contains four full adders in one chip. Power it, and tie the carry input to ground.', cap: 'The 74HC283 contains four full adders. Power it, and tie carry-in (C0) to GND.', do: (T, D) => T.next(4, D * 0.9) },
      { say: 'Eight wires bring A and B into the chip, and five LEDs show the result.', cap: '8 wires bring A and B into the chip, and 5 LEDs show the result.', do: (T, D) => T.all(D * 0.95) },
      { say: 'Let us add seven and five. A is zero one one one, and B is zero one zero one.', cap: 'A = 0111 (7),  B = 0101 (5)',
        do: async (T, D) => { await T.wide(true, D * 0.15); const [a, b] = byX(T, 'dip4'); await T.setDip(a, '0111'); await T.setDip(b, '0101'); } },
      { say: 'The answer is zero one one zero zero: eight plus four, which is twelve.', cap: 'Result: 01100 = 8 + 4 = 12',
        do: async (T, D) => { T.highlight(40, 2.5, 55, 9.5, 'C4  Σ4  Σ3  Σ2  Σ1'); await T.wait(D * 0.85); T.clearHighlights(); } },
      { say: 'Now try fifteen plus one. The result is too big for four bits, so the carry out LED lights, for sixteen.', cap: '15 + 1 = 16 → the carry-out LED (C4) lights.',
        do: async (T) => { const [a, b] = byX(T, 'dip4'); await T.setDip(a, '1111'); await T.setDip(b, '0001'); } },
    ],
  },
  {
    id: 'a-bcd', level: 'advanced', num: 6, title: 'BCD to 7-Segment Decoder', sub: 'The CD4511 chip',
    steps: [
      { intro: true, say: 'Advanced lesson six: driving a seven segment display with the C D forty five eleven decoder chip.', cap: '' },
      { say: 'Four DIP switches make a binary coded decimal number, D C B A, worth eight, four, two and one.', cap: 'Four DIP switches make a BCD number: D C B A (8 4 2 1).', do: (T, D) => T.next(7, D * 0.9) },
      { say: 'Place the forty five eleven and power it. Lamp test and blanking go high. The latch enable pin goes low.', cap: 'Power the CD4511. LT and BI → HIGH, LE → LOW.', do: (T, D) => T.next(10, D * 0.95) },
      { say: 'Add a common cathode display. Each decoder output, a to g, drives one segment.', cap: 'Add a common-cathode display. Outputs a–g each drive one segment.', do: (T, D) => T.all(D * 0.95) },
      { say: 'Switch on A. The display shows one. Add C: four plus one is five.', cap: 'A → 1.   C + A → 4 + 1 = 5',
        do: async (T, D) => { const d = T.comp('dip4'); await T.dip(d, 3); await T.wait(D * 0.25); await T.dip(d, 1); } },
      { say: 'Switch on D as well, for thirteen. That is not a valid decimal digit, so the decoder blanks the display.', cap: 'D + C + A = 13: not a decimal digit, so the display goes blank.',
        do: async (T, D) => { await T.wait(D * 0.15); await T.dip('dip4', 0); } },
    ],
  },
  {
    id: 'u-blink', level: 'advanced', num: 7, title: 'Arduino: Blink an LED', sub: 'Your first Arduino program',
    steps: [
      { intro: true, say: 'Advanced lesson seven: programming an Arduino to blink an LED.' },
      { say: 'Add an Arduino UNO and a breadboard. Then add an LED, with a resistor to the ground rail.', cap: 'Add an Arduino UNO, a breadboard, an LED and a resistor to the ground rail.', do: (T, D) => T.next(4, D) },
      { say: 'Pin thirteen connects to the LED, and the Arduino ground connects to the minus rail.', cap: 'Pin 13 → LED.   Arduino GND → − rail.', do: (T, D) => T.next(2, D * 0.85) },
      { say: 'Open the code tab. Setup runs once, and makes pin thirteen an output. Loop runs forever: LED on, wait half a second, LED off, wait again.',
        cap: 'setup() runs once: pin 13 = OUTPUT.  loop() runs forever: ON, wait 500 ms, OFF, wait.',
        do: async (T, D) => { await T.tab('code', D * 0.15); await T.wait(D * 0.15); T.markCode('void setup()', '}'); await T.wait(D * 0.3); T.markCode('void loop()', 'delay(500);\n}'); await T.wait(D * 0.2); } },
      { say: 'Press upload and run. The LED starts blinking. Each time pin thirteen goes high, current flows through the LED and resistor to ground.', cap: 'Press ▶ Upload & Run: the LED blinks. When pin 13 is HIGH, current flows through the LED to GND.',
        do: async (T, D) => { await T.click('#btnRun', D * 0.2); } },
      { say: 'Change both delays to one hundred milliseconds, and run again. Now it blinks five times faster.', cap: 'Change both delays to 100 ms and run again: it blinks faster.',
        do: async (T, D) => { await T.typeReplace('delay(500)', 'delay(100)', D * 0.25, true); await T.click('#btnRun', D * 0.15); } },
      { say: 'Messages from Serial dot print line appear in the serial tab.', cap: 'Serial.println() messages appear in the Serial tab.', do: async (T, D) => { await T.tab('serial', D * 0.3); } },
    ],
  },
  {
    id: 'u-button', level: 'advanced', num: 8, title: 'Arduino: Reading a Button', sub: 'digitalRead and INPUT_PULLUP',
    steps: [
      { intro: true, say: 'Advanced lesson eight: reading a push button with an Arduino.' },
      { say: 'Start with an Arduino, a breadboard, and an LED with its resistor.', do: (T, D) => T.next(4, D) },
      { say: 'Add a push button. Wire pin thirteen to the LED, pin two to the button, and the other side of the button to ground.', cap: 'Add a push button. Pin 13 → LED, pin 2 → button, other side of the button → GND.', do: (T, D) => T.next(5, D) },
      { say: 'The code uses input pull up. The pin reads high normally, and low when the button is pressed.', cap: 'INPUT_PULLUP: the pin reads HIGH normally, and LOW when the button is pressed.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('pinMode(buttonPin, INPUT_PULLUP);'); await T.wait(D * 0.3); T.markCode('if (state == LOW) {', '}'); } },
      { say: 'Run the code, and hold the button. The LED lights while the button is pressed.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); await T.wait(D * 0.15); await T.press('Pin 2', D * 0.4); } },
      { say: 'Each press is also counted in the serial tab.', do: async (T, D) => { await T.tab('serial', D * 0.2); await T.press('Pin 2', D * 0.2); await T.wait(D * 0.1); await T.press('Pin 2', D * 0.2); } },
    ],
  },
  {
    id: 'u-traffic', level: 'advanced', num: 9, title: 'Arduino: Traffic Light', sub: 'Three LEDs and a helper function',
    steps: [
      { intro: true, say: 'Advanced lesson nine: an Arduino traffic light.' },
      { say: 'Three LEDs, red, yellow and green, each have their own resistor to the ground rail.', do: (T, D) => T.next(8, D) },
      { say: 'Pins twelve, eleven and ten drive the three LEDs.', cap: 'Pins 12, 11 and 10 drive the red, yellow and green LEDs.', do: (T, D) => T.next(4, D * 0.9) },
      { say: 'A helper function, set lights, switches all three LEDs in one line. The loop runs green, yellow, then red.', cap: 'The helper setLights(r, y, g) switches all three LEDs. loop() runs green → yellow → red.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('void setLights', '}'); await T.wait(D * 0.3); T.markCode('void loop()', 'delay(3000);\n}'); } },
      { say: 'Run it, and watch the lights change, just like a real traffic light. The serial tab names each phase.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); await T.wait(D * 0.3); await T.tab('serial', D * 0.2); } },
    ],
  },
  {
    id: 'u-binary', level: 'advanced', num: 10, title: 'Arduino: Binary LED Counter', sub: 'Counting 0–15 with bitRead',
    steps: [
      { intro: true, say: 'Advanced lesson ten: a binary counter with four LEDs.' },
      { say: 'Four LEDs with resistors sit on the breadboard. From left to right, they are worth eight, four, two, and one.', cap: 'Four LEDs, worth 8, 4, 2 and 1 from left to right.', do: (T, D) => T.next(10, D) },
      { say: 'Pins thirteen, twelve, eleven and ten drive them, most significant bit first.', cap: 'Pins 13, 12, 11 and 10 drive them, most significant bit first.', do: (T, D) => T.next(5, D * 0.9) },
      { say: 'The loop counts from zero to fifteen. For each number, bit read picks out each bit, and digital write shows it on an LED.', cap: 'loop() counts 0 → 15. bitRead(n, b) picks out each bit, and digitalWrite shows it on an LED.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('for (int n', 'delay(800);'); } },
      { say: 'Run it, and the LEDs count up in binary: one, one zero, one one, one zero zero, and so on.', cap: 'Run it: the LEDs count in binary: 1, 10, 11, 100…', do: async (T, D) => { await T.click('#btnRun', D * 0.2); } },
      { say: 'The serial tab prints each number in decimal and in binary.', do: async (T, D) => { await T.tab('serial', D * 0.3); } },
    ],
  },
  {
    id: 'u-serial', level: 'advanced', num: 11, title: 'Arduino: Serial Commands', sub: 'Type words to control LEDs',
    steps: [
      { intro: true, say: 'Advanced lesson eleven: controlling the Arduino with serial commands.' },
      { say: 'Two LEDs are connected to pins thirteen and twelve.', cap: 'Two LEDs on pins 13 and 12.', do: (T, D) => T.all(D * 0.9) },
      { say: 'The sketch checks serial available for new text, reads one line, and compares it with each command.', cap: 'Serial.available() checks for new text. readStringUntil() reads one line, and it is compared with each command.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('if (Serial.available() > 0) {', '} else if (cmd == "green")'); await T.showCodeLine(20, D * 0.3); } },
      { say: 'Run it, and open the serial tab. Type red, and press send. The red LED turns on.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); await T.tab('serial', D * 0.15); await T.serialType('red', D * 0.45); } },
      { say: 'Now try both, and then green.', do: async (T, D) => { await T.serialType('both', D * 0.45); await T.serialType('green', D * 0.45); } },
      { say: 'Words the sketch does not know get a helpful error message.', do: async (T, D) => { await T.serialType('hello', D * 0.6); } },
    ],
  },
  {
    id: 'u-pot', level: 'advanced', num: 12, title: 'Arduino: Potentiometer & PWM', sub: 'analogRead, map and analogWrite',
    steps: [
      { intro: true, say: 'Advanced lesson twelve: analog input and P W M output.', cap: 'Advanced lesson 12: analog input and PWM output.' },
      { say: 'A potentiometer is a voltage divider. Its ends go to five volts and ground, and the middle pin goes to analog pin A zero.', cap: 'A potentiometer: ends → 5V and GND, middle pin (wiper) → A0.', do: (T, D) => T.next(8, D) },
      { say: 'An LED on pin nine, a P W M pin, will show the brightness.', cap: 'An LED on pin 9 (a PWM ~ pin) shows the brightness.', do: (T, D) => T.next(3, D * 0.9) },
      { say: 'Analog read gives a number from zero to ten twenty three. Map scales it to zero to two fifty five, and analog write sets the brightness.', cap: 'analogRead → 0…1023.  map() → 0…255.  analogWrite sets the brightness.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('int value', 'analogWrite(ledPin, brightness);'); } },
      { say: 'Run it, then drag the knob. Turn it down, and the LED dims. Turn it up, and it glows brighter.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); await T.knob('pot', 60, D * 0.3); await T.wait(D * 0.1); await T.knob('pot', -110, D * 0.3); } },
      { say: 'The serial tab shows the values as you turn the knob.', do: async (T, D) => { await T.tab('serial', D * 0.25); await T.knob('pot', 50, D * 0.5); } },
    ],
  },
  {
    id: 'u-7seg', level: 'advanced', num: 13, title: 'Arduino: 7-Segment Counter', sub: 'Counting from 0 to 9',
    steps: [
      { intro: true, say: 'Advanced lesson thirteen: building a counter on a seven segment display.', cap: '' },
      { say: 'A common cathode display sits across the middle gap of the breadboard, next to an Arduino.', cap: 'A common-cathode 7-segment display sits across the middle gap.', do: (T, D) => T.next(3, D) },
      { say: 'Segments a to g connect to pins two to eight. The common pin goes to ground.', cap: 'Segments a–g → pins 2–8.   COM → GND.', do: (T, D) => T.all(D * 0.95) },
      { say: 'In the code, a two dimensional array stores which segments to light for each digit, from zero to nine.', cap: 'A 2-D array stores which segments to light for each digit 0–9.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('const byte digits', '};'); await T.wait(D * 0.4); } },
      { say: 'The show digit function writes one row of the array to the seven pins.', cap: 'showDigit(n) writes one row of the array to the 7 pins.',
        do: async (T, D) => { T.markCode('void showDigit', '}\n}'); await T.showCodeLine(17, D * 0.3); } },
      { say: 'Press run. The display counts from zero to nine, over and over.', cap: 'Press ▶ Run: the display counts 0 to 9, over and over.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); } },
      { say: 'The serial tab shows each number as it counts.', do: async (T, D) => { await T.tab('serial', D * 0.3); } },
    ],
  },
  {
    id: 'u-dice', level: 'advanced', num: 14, title: 'Arduino: Electronic Dice', sub: 'Button + random() + 7-segment',
    steps: [
      { intro: true, say: 'Advanced lesson fourteen: an electronic dice.' },
      { say: 'A seven segment display is wired to pins two to eight, just like in the counter lesson.', cap: 'A 7-segment display on pins 2–8, as in the counter lesson.', do: (T, D) => T.next(12, D) },
      { say: 'A push button on pin ten will roll the dice.', cap: 'A push button on pin 10 rolls the dice.', do: (T, D) => T.next(3, D * 0.9) },
      { say: 'When the button is pressed, the code flashes ten random numbers, then stops on random one to seven, which gives one to six.', cap: 'On a press: flash 10 random numbers, then stop on random(1, 7), which gives 1 to 6.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('if (digitalRead(button) == LOW)', 'delay(300);'); await T.showCodeLine(32, D * 0.3); } },
      { say: 'Run it, and press roll.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); await T.wait(D * 0.1); await T.act('ROLL', 'press', { hold: 250, move: 400 }); } },
      { say: 'Press again for another roll. Each result also appears in the serial tab.', do: async (T, D) => { await T.act('ROLL', 'press', { hold: 250, move: 300 }); await T.wait(D * 0.3); await T.tab('serial', D * 0.2); } },
    ],
  },
  {
    id: 'u-lcd', level: 'advanced', num: 15, title: 'Arduino: I2C LCD Display', sub: 'LiquidCrystal_I2C with 4 wires',
    steps: [
      { intro: true, say: 'Advanced lesson fifteen: an I squared C LCD display.', cap: 'Advanced lesson 15: an I2C LCD display.' },
      { say: 'Connect the LCD with just four wires: ground, five volts, S D A to A four, and S C L to A five.', cap: 'Only 4 wires: GND, 5V, SDA → A4, SCL → A5.', do: (T, D) => T.next(6, D) },
      { say: 'In the code, create the lcd object. Then init, backlight, set cursor and print.', cap: 'Create the lcd object, then lcd.init(), lcd.backlight(), lcd.setCursor() and lcd.print().',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('LiquidCrystal_I2C lcd', ';'); await T.wait(D * 0.25); T.markCode('lcd.init();', 'lcd.print("Hello, Arduino!");'); } },
      { say: 'Run it. Line one says hello, and line two shows the uptime in seconds.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); } },
      { say: 'Type a message in the serial tab and send it, and it appears on the LCD.', do: async (T, D) => { await T.tab('serial', D * 0.15); await T.serialType('PinSketch rocks!', D * 0.6); } },
    ],
  },
  {
    id: 'u-counter', level: 'advanced', num: 16, title: 'Arduino: LCD Button Counter', sub: 'I2C LCD + push buttons',
    steps: [
      { intro: true, say: 'Advanced lesson sixteen: an LCD counter, controlled by push buttons.', cap: '' },
      { say: 'Add an Arduino, a breadboard, and an I squared C LCD.', cap: 'Add an Arduino, a breadboard and an I2C LCD.', do: (T, D) => T.next(3, D * 0.9) },
      { say: 'The LCD needs only four wires: ground, five volts, S D A to A four, and S C L to A five.', cap: 'Only 4 wires: GND, 5V, SDA → A4, SCL → A5.', do: (T, D) => T.next(4, D * 0.95) },
      { say: 'Two push buttons connect pins two and three to ground. The code turns on the internal pull up resistors.', cap: 'Two buttons connect pins 2 and 3 to GND, using INPUT_PULLUP.', do: (T, D) => T.all(D * 0.95) },
      { say: 'In the loop, when the count button goes from high to low, the counter adds one and prints it on the LCD.', cap: 'When the COUNT button goes HIGH → LOW, count++ and the LCD updates.',
        do: async (T, D) => { await T.tab('code', D * 0.15); await T.wait(D * 0.1); T.markCode('int state', 'lastState = state;'); await T.showCodeLine(31, D * 0.25); } },
      { say: 'Press run, then press the count button a few times. One, two, three!', cap: 'Press ▶ Run, then press COUNT: 1, 2, 3!',
        do: async (T, D) => { await T.click('#btnRun', D * 0.12); await T.wait(D * 0.12); for (let i = 0; i < 3; i++) await T.act('COUNT', 'press', { hold: 250, after: D * 0.1, move: 300 }); } },
      { say: 'The reset button sets the counter back to zero.', cap: 'RESET sets the counter back to 0.', do: async (T, D) => { await T.act('RESET', 'press', { hold: 400, move: 400 }); } },
    ],
  },
  {
    id: 'e-blink', level: 'advanced', num: 17, title: 'ESP8266: Getting Started', sub: 'NodeMCU pins and the built-in LED',
    steps: [
      { intro: true, say: 'Advanced lesson seventeen: getting started with the E S P eighty two sixty six.', cap: 'Advanced lesson 17: getting started with the ESP8266.' },
      { say: 'The NodeMCU board is an E S P eighty two sixty six chip with Wi-Fi, USB, and pins labelled D zero to D eight.', cap: 'NodeMCU = ESP8266 chip + Wi-Fi + USB, with pins labelled D0 to D8.', do: async (T, D) => { await T.next(1, D * 0.4); await T.zoomTo(1, -1.5, 19, 9, D * 0.4); } },
      { say: 'The labels are not the GPIO numbers. D four is GPIO two, which also has a blue built in LED.', cap: 'Labels ≠ GPIO numbers: D4 is GPIO 2, which also has the blue built-in LED.', do: async (T, D) => { await T.hover(7, 2, D * 0.3); await T.wait(D * 0.5); T.unhover(); } },
      { say: 'The built in LED is active low. Writing low turns it on, and writing high turns it off.', cap: 'The built-in LED is active LOW: LOW = on, HIGH = off.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('digitalWrite(LED_BUILTIN, LOW);'); await T.wait(D * 0.3); T.markCode('digitalWrite(LED_BUILTIN, HIGH);'); } },
      { say: 'Press run, and the blue LED starts blinking.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); } },
      { say: 'Next, let us use the Wi-Fi to control things from a phone!', do: async (T, D) => { await T.tab('serial', D * 0.3); } },
    ],
  },
  {
    id: 'e-web', level: 'advanced', num: 18, title: 'ESP8266: Wi-Fi Web Server', sub: 'Control LEDs from a phone',
    steps: [
      { intro: true, say: 'Advanced lesson eighteen: controlling LEDs over Wi-Fi with the E S P eighty two sixty six.', cap: '' },
      { say: 'The E S P eighty two sixty six NodeMCU board drives two LEDs, from pins D one and D two.', cap: 'The ESP8266 NodeMCU drives two LEDs, from pins D1 and D2.', do: (T, D) => T.all(D * 0.95) },
      { say: 'The sketch connects to Wi-Fi and starts a web server. Each web address has a handler function that switches an LED.', cap: 'The sketch joins Wi-Fi and starts a web server. Each URL has a handler that switches an LED.',
        do: async (T, D) => { await T.tab('code', D * 0.15); await T.wait(D * 0.1); T.markCode('server.on("/", handleRoot);', 'server.begin();'); await T.showCodeLine(48, D * 0.3); } },
      { say: 'Press run. The serial tab shows the Wi-Fi connection, and the IP address.', cap: 'Press ▶ Run: the Serial tab shows the Wi-Fi connection and IP address.',
        do: async (T, D) => { await T.click('#btnRun', D * 0.15); await T.tab('serial', D * 0.15); } },
      { say: 'Open the Wi-Fi tab. It is a phone on the same network. Tap red on, then green on, and current flows from the E S P pins through the LEDs.', cap: 'The Wi-Fi tab is a phone on the same network. Tap Red ON, then Green ON.',
        do: async (T, D) => { await T.tab('wifi', D * 0.12); await T.wait(D * 0.15); await T.espTap([0.32, 155], '/led1/on', D * 0.15); await T.wait(D * 0.15); await T.espTap([0.31, 272], '/led2/on', D * 0.15); } },
      { say: 'That is the start of your own Internet of Things project!', cap: 'That\'s the start of your own Internet of Things project!',
        do: async (T, D) => { await T.espTap([0.70, 155], '/led1/off', D * 0.3); } },
    ],
  },
  {
    id: 'e-sensor', level: 'advanced', num: 19, title: 'ESP8266: Web Sensor Page', sub: 'analogRead(A0) in a browser',
    steps: [
      { intro: true, say: 'Advanced lesson nineteen: showing a sensor reading on a web page.' },
      { say: 'A potentiometer stands in for a sensor. Its ends go to three point three volts and ground.', cap: 'A potentiometer stands in for a sensor. Its ends go to 3.3V and GND.', do: (T, D) => T.next(7, D) },
      { say: 'Its middle pin connects to A zero, the only analog input on the E S P eighty two sixty six.', cap: 'Its middle pin → A0, the ESP8266\'s only analog input.', do: (T, D) => T.next(1, D * 0.6) },
      { say: 'Every time the page loads, handle root reads A zero, and builds a page with the number and a bar.', cap: 'Each page load: handleRoot() reads A0 and builds HTML with the value and a bar.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('void handleRoot()', 'server.send(200, "text/html", html);'); } },
      { say: 'Run it, wait for Wi-Fi, and open the Wi-Fi tab. The page shows the current value.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); await T.wait(D * 0.35); await T.tab('wifi', D * 0.2); } },
      { say: 'Turn the knob up, and tap refresh. The new value appears on the phone.', do: async (T, D) => { await T.knob('pot', -90, D * 0.4); await T.espTap([0.5, 262], '/', D * 0.25); } },
    ],
  },
  {
    id: 'e-lcd', level: 'advanced', num: 20, title: 'ESP8266: Wi-Fi Message Board', sub: 'Web form → I2C LCD',
    steps: [
      { intro: true, say: 'Advanced lesson twenty: a Wi-Fi message board.' },
      { say: 'Wire an I squared C LCD to the E S P. S D A goes to D two, S C L to D one, plus three point three volts and ground.', cap: 'I2C LCD on the ESP8266: SDA → D2, SCL → D1, plus 3V3 and GND.', do: (T, D) => T.next(6, D) },
      { say: 'A web form sends your text to the send address. Server dot arg reads it, and the LCD prints it.', cap: 'A web form sends text to /send. server.arg("msg") reads it, and the LCD prints it.',
        do: async (T, D) => { await T.tab('code', D * 0.2); await T.wait(D * 0.1); T.markCode('void handleSend()', 'handleRoot();\n}'); } },
      { say: 'Run it. Once Wi-Fi connects, the LCD shows the IP address.', do: async (T, D) => { await T.click('#btnRun', D * 0.2); } },
      { say: 'Open the Wi-Fi tab, type a message, and press send. Your message appears on the LCD!', do: async (T, D) => { await T.tab('wifi', D * 0.2); await T.wait(D * 0.1); await T.espTap([0.35, 108], '/send?msg=Hello+PinSketch', D * 0.3); } },
    ],
  },
];

// a short closing line for the shorter lessons (keeps every video over 30 seconds)
for (const L of LESSONS) {
  if (['b-or', 'b-not', 'b-xor', 'b-nand', 'b-all', 'b-full', 'u-button', 'u-traffic', 'u-serial', 'u-dice', 'u-lcd', 'e-lcd'].includes(L.id))
    L.steps.push({ say: 'Now it is your turn. Open this lesson in Pin Sketch, and try it yourself!', cap: 'Now it\'s your turn: open this lesson in PinSketch and try it yourself!', do: (T, D) => T.wait(D * 0.5) });
}

if (typeof module !== 'undefined') module.exports = { LESSONS };
else window.LESSONS = LESSONS;
