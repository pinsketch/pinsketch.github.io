# PinSketch

A breadboard circuit simulator for teaching electronics and digital logic. It runs entirely in the browser: open `index.html` by double-clicking it. No server, build step or internet connection is needed.

| Page | What it is |
|---|---|
| `index.html` | Landing page |
| `beginner.html` | Beginner level: battery, bulbs, LEDs, switches, buttons, buzzer, motor, logic gates (AND/OR/NOT/NAND/NOR/XOR/XNOR), 16×2 LCD, 7-segment display, truth tables, 14 lessons |
| `advanced.html` | Advanced level: breadboard, 74HC00/02/04/08/32/86/283 and CD4511 chips, DIP switches, potentiometer, I2C LCD, Arduino UNO and ESP8266 programmed in C++, Serial Monitor, virtual Wi-Fi browser, 21 lessons (2-bit and 4-bit adders, BCD decoder, SR latch, Arduino and ESP8266 projects) |

## Files
- `js/core.js`: circuit engine. Grid points are joined into nets, each net gets a logic level, and lamps light when there is a current path from + to −.
- `js/parts.js`: every component (pins, drawing and behaviour). Add a new part with `defPart(...)`, or a new chip with `defIC(...)`.
- `js/mcu.js`: Arduino C++ → JavaScript translator, plus the Arduino and ESP8266 runtime (pins, PWM, Serial, LiquidCrystal_I2C, WiFi, ESP8266WebServer).
- `js/demos.js`: lessons and demo circuits. Add one with `demo({...})`.
- `js/app.js`: editor UI (drag and drop, wiring, undo, panels, autosave to localStorage).
- `css/style.css`: all styles.

## Simulation model (simplified, for teaching)
- Signals are HIGH (1), LOW (0), floating, or short-circuit.
- Unconnected inputs read LOW.
- Animated yellow dots show current flowing from + to −, and white dashes show logic signals.
- Bulbs in series share brightness, LEDs conduct one way only, and resistors pass a "weak" level (for pull-ups and pull-downs).
- 74HC chips need VCC and GND connected before they work.

## Video tutorials
- `tutorials.html` lists all 32 videos (12 beginner, 20 advanced). Each lesson's video also appears at the top of its Lesson panel.
- The videos are in `videos/` (`<lesson-id>.mp4` plus a `.jpg` poster) and listed in `js/videos.js`.
- `tools/video-maker/` regenerates them. You don't need to upload it to the web server.
