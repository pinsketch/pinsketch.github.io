/* PinSketch video tutorials (files in /videos) */
const VIDEOS = [
 {
  "id": "b-simple",
  "level": "beginner",
  "num": 1,
  "title": "Your First Circuit",
  "sub": "Battery · Switch · Light bulb",
  "desc": "Drag a battery, switch and bulb onto the canvas, wire a closed loop and switch the light on.",
  "dur": "0:51"
 },
 {
  "id": "b-series",
  "level": "beginner",
  "num": 2,
  "title": "Series & Parallel Circuits",
  "sub": "Why some bulbs glow brighter",
  "desc": "Compare bulbs in series and in parallel, and see what happens when one bulb is removed.",
  "dur": "0:44"
 },
 {
  "id": "b-and",
  "level": "beginner",
  "num": 3,
  "title": "Logic Gates & Truth Tables",
  "sub": "The AND gate",
  "desc": "Wire an AND gate to two inputs and a lamp, then generate its truth table automatically.",
  "dur": "0:45"
 },
 {
  "id": "b-or",
  "level": "beginner",
  "num": 4,
  "title": "The OR Gate",
  "sub": "One input is enough",
  "desc": "Wire an OR gate and see that just one input at 1 is enough to light the lamp.",
  "dur": "0:35"
 },
 {
  "id": "b-not",
  "level": "beginner",
  "num": 5,
  "title": "The NOT Gate",
  "sub": "The inverter",
  "desc": "The inverter: one input, and an output that is always the opposite.",
  "dur": "0:35"
 },
 {
  "id": "b-xor",
  "level": "beginner",
  "num": 6,
  "title": "The XOR Gate",
  "sub": "Exclusive OR: are the inputs different?",
  "desc": "Exclusive OR lights only when the inputs are different, the key to binary addition.",
  "dur": "0:31"
 },
 {
  "id": "b-nand",
  "level": "beginner",
  "num": 7,
  "title": "NAND & NOR Gates",
  "sub": "NOT AND, NOT OR",
  "desc": "NAND and NOR, the inverted AND and OR, and how the output bubble works.",
  "dur": "0:33"
 },
 {
  "id": "b-universal",
  "level": "beginner",
  "num": 8,
  "title": "NAND Builds Every Gate",
  "sub": "NOT, AND and OR from NAND only",
  "desc": "Build NOT, AND and OR using only NAND gates (De Morgan's law in action).",
  "dur": "0:33"
 },
 {
  "id": "b-all",
  "level": "beginner",
  "num": 9,
  "title": "All Gates Side by Side",
  "sub": "AND, OR, NAND, NOR, XOR, XNOR, NOT",
  "desc": "Seven gates fed by the same two inputs, compared side by side.",
  "dur": "0:33"
 },
 {
  "id": "b-half",
  "level": "beginner",
  "num": 10,
  "title": "The Half Adder",
  "sub": "Adding two bits with XOR and AND",
  "desc": "Add two bits with an XOR and an AND gate: the Sum and Carry outputs explained.",
  "dur": "0:35"
 },
 {
  "id": "b-full",
  "level": "beginner",
  "num": 11,
  "title": "The Full Adder",
  "sub": "A + B + carry in",
  "desc": "Add A + B + carry-in with two XOR, two AND and one OR gate.",
  "dur": "0:35"
 },
 {
  "id": "b-lcd",
  "level": "beginner",
  "num": 12,
  "title": "LCD & 7-Segment Display",
  "sub": "Showing binary numbers",
  "desc": "Show a 4-bit binary number on a 7-segment display and a powered 16×2 LCD.",
  "dur": "0:38"
 },
 {
  "id": "b-volts",
  "level": "beginner",
  "num": 13,
  "title": "Voltage: 3.3 V, 5 V, 12 V",
  "sub": "Too little, just right, too much",
  "desc": "The same 5 V bulb on 3.3 V, 5 V and 12 V: dim, bright and burnt out. Change battery voltage in Properties.",
  "dur": "0:35"
 },
 {
  "id": "b-cap",
  "level": "beginner",
  "num": 14,
  "title": "The Capacitor",
  "sub": "Storing energy",
  "desc": "Charge a capacitor with a button, then watch it keep an LED lit as it slowly empties.",
  "dur": "0:40"
 },
 {
  "id": "b-rc",
  "level": "beginner",
  "num": 15,
  "title": "RC Timer: Making a Delay",
  "sub": "Resistor + capacitor = time",
  "desc": "A resistor and a capacitor make a delay: the lamp turns on about 3 seconds after the switch.",
  "dur": "0:41"
 },
 {
  "id": "b-555",
  "level": "beginner",
  "num": 16,
  "title": "The 555 Timer",
  "sub": "A blinking LED",
  "desc": "Build the famous NE555 blinker on a 9 V battery and change its speed with the capacitor.",
  "dur": "0:41"
 },
 {
  "id": "b-latch",
  "level": "beginner",
  "num": 17,
  "title": "SR Latch: Memory",
  "sub": "Two NOR gates that remember",
  "desc": "Two NOR gates that remember: set and reset a 1-bit memory.",
  "dur": "0:35"
 },
 {
  "id": "a-bb",
  "level": "advanced",
  "num": 1,
  "title": "How a Breadboard Works",
  "sub": "Strips, rails and your first LED circuit",
  "desc": "Strips, power rails and connected holes. Build a button + LED + resistor circuit on a breadboard.",
  "dur": "0:48"
 },
 {
  "id": "a-and",
  "level": "advanced",
  "num": 2,
  "title": "Using a Logic IC",
  "sub": "The 74HC08 AND chip on a breadboard",
  "desc": "Place a 74HC08 across the gap, power it (pins 14 and 7), add DIP switch inputs and an LED output.",
  "dur": "0:52"
 },
 {
  "id": "a-half",
  "level": "advanced",
  "num": 3,
  "title": "Half Adder with Two Chips",
  "sub": "74HC86 XOR + 74HC08 AND",
  "desc": "A half adder from two chips: 74HC86 (XOR) for the sum and 74HC08 (AND) for the carry.",
  "dur": "0:40"
 },
 {
  "id": "a-add2",
  "level": "advanced",
  "num": 4,
  "title": "2-Bit Adder from Logic Gates",
  "sub": "74HC86 + 74HC08 + 74HC32",
  "desc": "Build a 2-bit binary adder from XOR, AND and OR chips, and add 3 + 2 and 3 + 3.",
  "dur": "0:41"
 },
 {
  "id": "a-add4",
  "level": "advanced",
  "num": 5,
  "title": "4-Bit Adder IC",
  "sub": "The 74HC283",
  "desc": "Use the 74HC283 4-bit adder: 7 + 5 = 12 and 15 + 1 with carry-out.",
  "dur": "0:42"
 },
 {
  "id": "a-bcd",
  "level": "advanced",
  "num": 6,
  "title": "BCD to 7-Segment Decoder",
  "sub": "The CD4511 chip",
  "desc": "Drive a 7-segment display with the CD4511 BCD decoder chip and DIP switches.",
  "dur": "0:38"
 },
 {
  "id": "u-blink",
  "level": "advanced",
  "num": 7,
  "title": "Arduino: Blink an LED",
  "sub": "Your first Arduino program",
  "desc": "Wire an LED to pin 13, read setup() and loop(), upload, run and change the blink speed.",
  "dur": "0:45"
 },
 {
  "id": "u-button",
  "level": "advanced",
  "num": 8,
  "title": "Arduino: Reading a Button",
  "sub": "digitalRead and INPUT_PULLUP",
  "desc": "Read a push button with digitalRead and INPUT_PULLUP, and light an LED while it is pressed.",
  "dur": "0:37"
 },
 {
  "id": "u-traffic",
  "level": "advanced",
  "num": 9,
  "title": "Arduino: Traffic Light",
  "sub": "Three LEDs and a helper function",
  "desc": "Red, yellow and green LEDs in sequence, using a helper function.",
  "dur": "0:33"
 },
 {
  "id": "u-binary",
  "level": "advanced",
  "num": 10,
  "title": "Arduino: Binary LED Counter",
  "sub": "Counting 0–15 with bitRead",
  "desc": "Count 0 to 15 in binary on four LEDs with bitRead().",
  "dur": "0:36"
 },
 {
  "id": "u-serial",
  "level": "advanced",
  "num": 11,
  "title": "Arduino: Serial Commands",
  "sub": "Type words to control LEDs",
  "desc": "Type commands in the Serial Monitor to switch LEDs on and off.",
  "dur": "0:33"
 },
 {
  "id": "u-pot",
  "level": "advanced",
  "num": 12,
  "title": "Arduino: Potentiometer & PWM",
  "sub": "analogRead, map and analogWrite",
  "desc": "Read a potentiometer with analogRead and dim an LED with PWM (analogWrite).",
  "dur": "0:36"
 },
 {
  "id": "u-7seg",
  "level": "advanced",
  "num": 13,
  "title": "Arduino: 7-Segment Counter",
  "sub": "Counting from 0 to 9",
  "desc": "Count 0 to 9 on a 7-segment display with an Arduino, an array and a function.",
  "dur": "0:34"
 },
 {
  "id": "u-dice",
  "level": "advanced",
  "num": 14,
  "title": "Arduino: Electronic Dice",
  "sub": "Button + random() + 7-segment",
  "desc": "Press a button to roll a random number from 1 to 6 on a 7-segment display.",
  "dur": "0:32"
 },
 {
  "id": "u-lcd",
  "level": "advanced",
  "num": 15,
  "title": "Arduino: I2C LCD Display",
  "sub": "LiquidCrystal_I2C with 4 wires",
  "desc": "Wire an I2C LCD with four wires and print text and uptime with LiquidCrystal_I2C.",
  "dur": "0:33"
 },
 {
  "id": "u-counter",
  "level": "advanced",
  "num": 16,
  "title": "Arduino: LCD Button Counter",
  "sub": "I2C LCD + push buttons",
  "desc": "Make a button counter: I2C LCD (SDA/SCL), INPUT_PULLUP buttons and edge detection.",
  "dur": "0:38"
 },
 {
  "id": "e-blink",
  "level": "advanced",
  "num": 17,
  "title": "ESP8266: Getting Started",
  "sub": "NodeMCU pins and the built-in LED",
  "desc": "Meet the NodeMCU: D-pin labels vs GPIO numbers, and the active-LOW built-in LED.",
  "dur": "0:34"
 },
 {
  "id": "e-web",
  "level": "advanced",
  "num": 18,
  "title": "ESP8266: Wi-Fi Web Server",
  "sub": "Control LEDs from a phone",
  "desc": "An ESP8266 web server: control two LEDs from a phone over Wi-Fi.",
  "dur": "0:39"
 },
 {
  "id": "e-sensor",
  "level": "advanced",
  "num": 19,
  "title": "ESP8266: Web Sensor Page",
  "sub": "analogRead(A0) in a browser",
  "desc": "Show a live analog reading (A0) as a number and a bar on a web page.",
  "dur": "0:34"
 },
 {
  "id": "e-lcd",
  "level": "advanced",
  "num": 20,
  "title": "ESP8266: Wi-Fi Message Board",
  "sub": "Web form → I2C LCD",
  "desc": "Send a message from a phone web form to an I2C LCD over Wi-Fi.",
  "dur": "0:35"
 },
 {
  "id": "a-555",
  "level": "advanced",
  "num": 21,
  "title": "NE555 Astable Blinker",
  "sub": "The classic 555 oscillator",
  "desc": "The NE555 astable oscillator on a breadboard: wiring, ⅓ and ⅔ thresholds and the frequency formula.",
  "dur": "0:42"
 },
 {
  "id": "a-555mono",
  "level": "advanced",
  "num": 22,
  "title": "NE555 One-Shot Timer",
  "sub": "Monostable mode",
  "desc": "A one-shot timer: one button press keeps the LED on for 1.1 × R × C seconds.",
  "dur": "0:33"
 },
 {
  "id": "a-4017",
  "level": "advanced",
  "num": 23,
  "title": "555 + CD4017 LED Chaser",
  "sub": "A running light",
  "desc": "A 555 clock drives a CD4017 decade counter for a running LED light.",
  "dur": "0:31"
 },
 {
  "id": "a-counter",
  "level": "advanced",
  "num": 24,
  "title": "74HC393 Binary Counter",
  "sub": "A hardware counter",
  "desc": "A 74HC393 counts 555 clock pulses in binary on four LEDs.",
  "dur": "0:31"
 },
 {
  "id": "a-crystal",
  "level": "advanced",
  "num": 25,
  "title": "Crystal Timer: Exactly 1 Hz",
  "sub": "32.768 kHz crystal + CD4060 + 74HC74",
  "desc": "A 32.768 kHz watch crystal, a CD4060 and a 74HC74 make an exact 1 Hz timer.",
  "dur": "0:42"
 },
 {
  "id": "a-dff",
  "level": "advanced",
  "num": 26,
  "title": "D Flip-Flop (74HC74)",
  "sub": "Toggle with a button",
  "desc": "The 74HC74 D flip-flop wired as a toggle: every clock press flips the LED.",
  "dur": "0:34"
 },
 {
  "id": "a-decoder",
  "level": "advanced",
  "num": 27,
  "title": "74HC138 3-to-8 Decoder",
  "sub": "Choose one of eight outputs",
  "desc": "The 74HC138 picks one of eight active-LOW outputs from a 3-bit number.",
  "dur": "0:36"
 },
 {
  "id": "u-595",
  "level": "advanced",
  "num": 28,
  "title": "Arduino + 74HC595 Shift Register",
  "sub": "8 LEDs from 3 pins",
  "desc": "Drive 8 LEDs from 3 Arduino pins with a 74HC595 and shiftOut().",
  "dur": "0:34"
 },
 {
  "id": "u-cap",
  "level": "advanced",
  "num": 29,
  "title": "Arduino: Measuring a Capacitor",
  "sub": "RC time constant with analogRead",
  "desc": "Charge a capacitor from an Arduino pin and measure its time constant with analogRead.",
  "dur": "0:35"
 }
];
