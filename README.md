# btetah.github.io

# DTK02 Digital IC Trainer Kit - Web Simulator

A fully interactive web-based simulator for the **DTK02 Digital IC Trainer Kit**. This simulator replicates the physical device's design and functionality with 100% accuracy.

## Features

- **Power Supply Section**: +5V DC regulated power supply with ON/OFF switch and LED indicator
- **8 Logic Input Switches** (S0–S7): Toggle switches providing HIGH (+5V) or LOW (0V) outputs
- **8 Logic Output LEDs** (L0–L7): Display logic states with red/green indicators
- **Clock Generator**: Variable frequency pulse generator (1 Hz – 1 kHz) with adjustable duty cycle
- **Debounced Pulser**: Manual single-pulse button for step-by-step testing
- **Breadboard Area**: Interactive breadboard for inserting ICs and making wire connections
- **2× Seven-Segment Displays**: Common-cathode 7-segment displays
- **IC Chip Library**: Full support for common 74xx series digital ICs:
  - 7400 (Quad 2-input NAND)
  - 7402 (Quad 2-input NOR)
  - 7404 (Hex Inverter / NOT)
  - 7408 (Quad 2-input AND)
  - 7432 (Quad 2-input OR)
  - 7486 (Quad 2-input XOR)
  - 7447 (BCD to 7-Segment Decoder)
  - 7474 (Dual D Flip-Flop)
  - 7490 (Decade Counter)
  - 74138 (3-to-8 Line Decoder)
  - 74151 (8-to-1 Multiplexer)
  - 74161 (4-bit Binary Counter)
  - 74195 (4-bit Shift Register)

## How to Use

1. Open `index.html` in a modern web browser
2. Turn on the power switch (top-left corner)
3. Use the toggle switches to set logic inputs
4. Insert ICs from the chip library into the breadboard
5. Connect wires between components by clicking on connection points
6. Observe outputs on LEDs and 7-segment displays
7. Use the clock generator for sequential circuit testing

## Running Locally

```bash
# Simple - open directly in browser
open index.html

# Or serve with any static file server
npx serve .
```

## Project Structure

```
├── index.html          # Main application page
├── css/
│   └── style.css       # Device styling and layout
├── js/
│   ├── main.js         # Application entry point
│   ├── simulator.js    # Core simulation engine
│   ├── ic-library.js   # 74xx series IC definitions
│   ├── breadboard.js   # Breadboard and wiring logic
│   └── components.js   # UI components (switches, LEDs, displays)
├── package.json        # Project metadata
└── README.md           # This file
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ module support.

## License

MIT
