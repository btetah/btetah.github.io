// لا تلعب بالسورس ياحيبي


// eslint-disable-next-line no-unused-vars
var ICLibrary = {

    /* 7400 - Quad 2-Input NAND Gate */
    '7400': {
        name: '7400',
        description: 'Quad 2-Input NAND',
        pins: 14,
        pinout: [
            { pin: 1,  name: '1A',  type: 'input' },
            { pin: 2,  name: '1B',  type: 'input' },
            { pin: 3,  name: '1Y',  type: 'output' },
            { pin: 4,  name: '2A',  type: 'input' },
            { pin: 5,  name: '2B',  type: 'input' },
            { pin: 6,  name: '2Y',  type: 'output' },
            { pin: 7,  name: 'GND', type: 'power' },
            { pin: 8,  name: '3Y',  type: 'output' },
            { pin: 9,  name: '3A',  type: 'input' },
            { pin: 10, name: '3B',  type: 'input' },
            { pin: 11, name: '4Y',  type: 'output' },
            { pin: 12, name: '4A',  type: 'input' },
            { pin: 13, name: '4B',  type: 'input' },
            { pin: 14, name: 'VCC', type: 'power' }
        ],
        simulate: function(pins) {
            pins[3]  = (pins[1] && pins[2]) ? 0 : 1;   // 1Y = NAND(1A,1B)
            pins[6]  = (pins[4] && pins[5]) ? 0 : 1;   // 2Y = NAND(2A,2B)
            pins[8]  = (pins[9] && pins[10]) ? 0 : 1;  // 3Y = NAND(3A,3B)
            pins[11] = (pins[12] && pins[13]) ? 0 : 1;  // 4Y = NAND(4A,4B)
            return pins;
        }
    },

    /* 7402 - Quad 2-Input NOR Gate */
    '7402': {
        name: '7402',
        description: 'Quad 2-Input NOR',
        pins: 14,
        pinout: [
            { pin: 1,  name: '1Y',  type: 'output' },
            { pin: 2,  name: '1A',  type: 'input' },
            { pin: 3,  name: '1B',  type: 'input' },
            { pin: 4,  name: '2Y',  type: 'output' },
            { pin: 5,  name: '2A',  type: 'input' },
            { pin: 6,  name: '2B',  type: 'input' },
            { pin: 7,  name: 'GND', type: 'power' },
            { pin: 8,  name: '3A',  type: 'input' },
            { pin: 9,  name: '3B',  type: 'input' },
            { pin: 10, name: '3Y',  type: 'output' },
            { pin: 11, name: '4A',  type: 'input' },
            { pin: 12, name: '4B',  type: 'input' },
            { pin: 13, name: '4Y',  type: 'output' },
            { pin: 14, name: 'VCC', type: 'power' }
        ],
        simulate: function(pins) {
            pins[1]  = (pins[2] || pins[3]) ? 0 : 1;    // 1Y = NOR(1A,1B)
            pins[4]  = (pins[5] || pins[6]) ? 0 : 1;    // 2Y = NOR(2A,2B)
            pins[10] = (pins[8] || pins[9]) ? 0 : 1;    // 3Y = NOR(3A,3B)
            pins[13] = (pins[11] || pins[12]) ? 0 : 1;  // 4Y = NOR(4A,4B)
            return pins;
        }
    },

    /* 7404 - Hex Inverter (NOT) */
    '7404': {
        name: '7404',
        description: 'Hex Inverter (NOT)',
        pins: 14,
        pinout: [
            { pin: 1,  name: '1A',  type: 'input' },
            { pin: 2,  name: '1Y',  type: 'output' },
            { pin: 3,  name: '2A',  type: 'input' },
            { pin: 4,  name: '2Y',  type: 'output' },
            { pin: 5,  name: '3A',  type: 'input' },
            { pin: 6,  name: '3Y',  type: 'output' },
            { pin: 7,  name: 'GND', type: 'power' },
            { pin: 8,  name: '4Y',  type: 'output' },
            { pin: 9,  name: '4A',  type: 'input' },
            { pin: 10, name: '5Y',  type: 'output' },
            { pin: 11, name: '5A',  type: 'input' },
            { pin: 12, name: '6Y',  type: 'output' },
            { pin: 13, name: '6A',  type: 'input' },
            { pin: 14, name: 'VCC', type: 'power' }
        ],
        simulate: function(pins) {
            pins[2]  = pins[1] ? 0 : 1;    // 1Y = NOT(1A)
            pins[4]  = pins[3] ? 0 : 1;    // 2Y = NOT(2A)
            pins[6]  = pins[5] ? 0 : 1;    // 3Y = NOT(3A)
            pins[8]  = pins[9] ? 0 : 1;    // 4Y = NOT(4A)
            pins[10] = pins[11] ? 0 : 1;   // 5Y = NOT(5A)
            pins[12] = pins[13] ? 0 : 1;   // 6Y = NOT(6A)
            return pins;
        }
    },

    /* 7408 - Quad 2-Input AND Gate */
    '7408': {
        name: '7408',
        description: 'Quad 2-Input AND',
        pins: 14,
        pinout: [
            { pin: 1,  name: '1A',  type: 'input' },
            { pin: 2,  name: '1B',  type: 'input' },
            { pin: 3,  name: '1Y',  type: 'output' },
            { pin: 4,  name: '2A',  type: 'input' },
            { pin: 5,  name: '2B',  type: 'input' },
            { pin: 6,  name: '2Y',  type: 'output' },
            { pin: 7,  name: 'GND', type: 'power' },
            { pin: 8,  name: '3Y',  type: 'output' },
            { pin: 9,  name: '3A',  type: 'input' },
            { pin: 10, name: '3B',  type: 'input' },
            { pin: 11, name: '4Y',  type: 'output' },
            { pin: 12, name: '4A',  type: 'input' },
            { pin: 13, name: '4B',  type: 'input' },
            { pin: 14, name: 'VCC', type: 'power' }
        ],
        simulate: function(pins) {
            pins[3]  = (pins[1] && pins[2]) ? 1 : 0;   // 1Y = AND(1A,1B)
            pins[6]  = (pins[4] && pins[5]) ? 1 : 0;   // 2Y = AND(2A,2B)
            pins[8]  = (pins[9] && pins[10]) ? 1 : 0;  // 3Y = AND(3A,3B)
            pins[11] = (pins[12] && pins[13]) ? 1 : 0;  // 4Y = AND(4A,4B)
            return pins;
        }
    },

    /* 7432 - Quad 2-Input OR Gate */
    '7432': {
        name: '7432',
        description: 'Quad 2-Input OR',
        pins: 14,
        pinout: [
            { pin: 1,  name: '1A',  type: 'input' },
            { pin: 2,  name: '1B',  type: 'input' },
            { pin: 3,  name: '1Y',  type: 'output' },
            { pin: 4,  name: '2A',  type: 'input' },
            { pin: 5,  name: '2B',  type: 'input' },
            { pin: 6,  name: '2Y',  type: 'output' },
            { pin: 7,  name: 'GND', type: 'power' },
            { pin: 8,  name: '3Y',  type: 'output' },
            { pin: 9,  name: '3A',  type: 'input' },
            { pin: 10, name: '3B',  type: 'input' },
            { pin: 11, name: '4Y',  type: 'output' },
            { pin: 12, name: '4A',  type: 'input' },
            { pin: 13, name: '4B',  type: 'input' },
            { pin: 14, name: 'VCC', type: 'power' }
        ],
        simulate: function(pins) {
            pins[3]  = (pins[1] || pins[2]) ? 1 : 0;   // 1Y = OR(1A,1B)
            pins[6]  = (pins[4] || pins[5]) ? 1 : 0;   // 2Y = OR(2A,2B)
            pins[8]  = (pins[9] || pins[10]) ? 1 : 0;  // 3Y = OR(3A,3B)
            pins[11] = (pins[12] || pins[13]) ? 1 : 0;  // 4Y = OR(4A,4B)
            return pins;
        }
    },

    /* 7486 - Quad 2-Input XOR Gate */
    '7486': {
        name: '7486',
        description: 'Quad 2-Input XOR',
        pins: 14,
        pinout: [
            { pin: 1,  name: '1A',  type: 'input' },
            { pin: 2,  name: '1B',  type: 'input' },
            { pin: 3,  name: '1Y',  type: 'output' },
            { pin: 4,  name: '2A',  type: 'input' },
            { pin: 5,  name: '2B',  type: 'input' },
            { pin: 6,  name: '2Y',  type: 'output' },
            { pin: 7,  name: 'GND', type: 'power' },
            { pin: 8,  name: '3Y',  type: 'output' },
            { pin: 9,  name: '3A',  type: 'input' },
            { pin: 10, name: '3B',  type: 'input' },
            { pin: 11, name: '4Y',  type: 'output' },
            { pin: 12, name: '4A',  type: 'input' },
            { pin: 13, name: '4B',  type: 'input' },
            { pin: 14, name: 'VCC', type: 'power' }
        ],
        simulate: function(pins) {
            pins[3]  = (pins[1] ^ pins[2]) ? 1 : 0;    // 1Y = XOR(1A,1B)
            pins[6]  = (pins[4] ^ pins[5]) ? 1 : 0;    // 2Y = XOR(2A,2B)
            pins[8]  = (pins[9] ^ pins[10]) ? 1 : 0;   // 3Y = XOR(3A,3B)
            pins[11] = (pins[12] ^ pins[13]) ? 1 : 0;   // 4Y = XOR(4A,4B)
            return pins;
        }
    },

    /* 7447 - BCD to 7-Segment Decoder */
    '7447': {
        name: '7447',
        description: 'BCD to 7-Seg Decoder',
        pins: 16,
        pinout: [
            { pin: 1,  name: 'B',     type: 'input' },
            { pin: 2,  name: 'C',     type: 'input' },
            { pin: 3,  name: 'LT',    type: 'input' },
            { pin: 4,  name: 'BI/RBO',type: 'input' },
            { pin: 5,  name: 'RBI',   type: 'input' },
            { pin: 6,  name: 'D',     type: 'input' },
            { pin: 7,  name: 'A',     type: 'input' },
            { pin: 8,  name: 'GND',   type: 'power' },
            { pin: 9,  name: 'e',     type: 'output' },
            { pin: 10, name: 'd',     type: 'output' },
            { pin: 11, name: 'c',     type: 'output' },
            { pin: 12, name: 'b',     type: 'output' },
            { pin: 13, name: 'a',     type: 'output' },
            { pin: 14, name: 'g',     type: 'output' },
            { pin: 15, name: 'f',     type: 'output' },
            { pin: 16, name: 'VCC',   type: 'power' }
        ],
        simulate: function(pins) {
            // BCD inputs: A(pin7), B(pin1), C(pin2), D(pin6)
            var bcd = (pins[7] ? 1 : 0) |
                      ((pins[1] ? 1 : 0) << 1) |
                      ((pins[2] ? 1 : 0) << 2) |
                      ((pins[6] ? 1 : 0) << 3);

            // 7447 outputs are active LOW (0 = segment ON)
            // segments: a(13), b(12), c(11), d(10), e(9), f(15), g(14)
            var segTable = [
                // a  b  c  d  e  f  g   for digits 0-9
                [0, 0, 0, 0, 0, 0, 1],  // 0
                [1, 0, 0, 1, 1, 1, 1],  // 1
                [0, 0, 1, 0, 0, 1, 0],  // 2
                [0, 0, 0, 0, 1, 1, 0],  // 3
                [1, 0, 0, 1, 1, 0, 0],  // 4
                [0, 1, 0, 0, 1, 0, 0],  // 5
                [0, 1, 0, 0, 0, 0, 0],  // 6
                [0, 0, 0, 1, 1, 1, 1],  // 7
                [0, 0, 0, 0, 0, 0, 0],  // 8
                [0, 0, 0, 0, 1, 0, 0],  // 9
                [1, 1, 1, 0, 0, 1, 0],  // 10 (invalid)
                [1, 1, 0, 0, 1, 1, 0],  // 11 (invalid)
                [1, 0, 1, 1, 1, 0, 0],  // 12 (invalid)
                [0, 1, 1, 0, 1, 0, 0],  // 13 (invalid)
                [1, 1, 1, 0, 0, 0, 0],  // 14 (invalid)
                [1, 1, 1, 1, 1, 1, 1]   // 15 (blank)
            ];

            var seg = segTable[bcd] || segTable[15];

            // Active LOW: 0 means segment on, we invert for our simulation (1=on)
            pins[13] = seg[0] ? 0 : 1;  // a
            pins[12] = seg[1] ? 0 : 1;  // b
            pins[11] = seg[2] ? 0 : 1;  // c
            pins[10] = seg[3] ? 0 : 1;  // d
            pins[9]  = seg[4] ? 0 : 1;  // e
            pins[15] = seg[5] ? 0 : 1;  // f
            pins[14] = seg[6] ? 0 : 1;  // g

            return pins;
        }
    },

    /* 7490 - Decade Counter (BCD) */
    '7490': {
        name: '7490',
        description: 'Decade Counter',
        pins: 14,
        pinout: [
            { pin: 1,  name: 'CKB',  type: 'input' },
            { pin: 2,  name: 'R0(1)',type: 'input' },
            { pin: 3,  name: 'R0(2)',type: 'input' },
            { pin: 4,  name: 'NC',   type: 'nc' },
            { pin: 5,  name: 'VCC',  type: 'power' },
            { pin: 6,  name: 'R9(1)',type: 'input' },
            { pin: 7,  name: 'R9(2)',type: 'input' },
            { pin: 8,  name: 'QC',   type: 'output' },
            { pin: 9,  name: 'QB',   type: 'output' },
            { pin: 10, name: 'GND',  type: 'power' },
            { pin: 11, name: 'QD',   type: 'output' },
            { pin: 12, name: 'QA',   type: 'output' },
            { pin: 13, name: 'NC',   type: 'nc' },
            { pin: 14, name: 'CKA',  type: 'input' }
        ],
        _state: { count: 0, prevCkA: 0, prevCkB: 0 },
        simulate: function(pins) {
            var state = this._state;

            // Reset logic
            if (pins[2] && pins[3]) {
                state.count = 0;  // R0 reset
            } else if (pins[6] && pins[7]) {
                state.count = 9;  // R9 set to 9
            } else {
                // CKA (pin 14) drives QA (divide by 2)
                // CKB (pin 1) drives QB,QC,QD (divide by 5)
                // For BCD counting: connect QA to CKB
                var ckaEdge = !pins[14] && state.prevCkA;  // falling edge
                var ckbEdge = !pins[1] && state.prevCkB;   // falling edge

                if (ckaEdge || ckbEdge) {
                    state.count = (state.count + 1) % 10;
                }
            }

            state.prevCkA = pins[14];
            state.prevCkB = pins[1];

            // Outputs
            pins[12] = (state.count & 1) ? 1 : 0;  // QA
            pins[9]  = (state.count & 2) ? 1 : 0;  // QB
            pins[8]  = (state.count & 4) ? 1 : 0;  // QC
            pins[11] = (state.count & 8) ? 1 : 0;  // QD

            return pins;
        }
    },

    /* 7495 - 4-bit Parallel-Access Shift Register */
    '7495': {
        name: '7495',
        description: '4-bit Shift Register',
        pins: 14,
        pinout: [
            { pin: 1,  name: 'SER',   type: 'input' },
            { pin: 2,  name: 'A',     type: 'input' },
            { pin: 3,  name: 'B',     type: 'input' },
            { pin: 4,  name: 'C',     type: 'input' },
            { pin: 5,  name: 'D',     type: 'input' },
            { pin: 6,  name: 'MODE',  type: 'input' },
            { pin: 7,  name: 'GND',   type: 'power' },
            { pin: 8,  name: 'CLK2',  type: 'input' },
            { pin: 9,  name: 'CLK1',  type: 'input' },
            { pin: 10, name: 'QD',    type: 'output' },
            { pin: 11, name: 'QC',    type: 'output' },
            { pin: 12, name: 'QB',    type: 'output' },
            { pin: 13, name: 'QA',    type: 'output' },
            { pin: 14, name: 'VCC',   type: 'power' }
        ],
        _state: { qa: 0, qb: 0, qc: 0, qd: 0, prevClk1: 0, prevClk2: 0 },
        simulate: function(pins) {
            var state = this._state;
            var mode = pins[6] ? 1 : 0; // MODE: 0=shift right, 1=parallel load

            if (mode === 0) {
                // Shift right mode - clocked by CLK1 (pin 9)
                var clk1Edge = pins[9] && !state.prevClk1; // rising edge
                if (clk1Edge) {
                    state.qd = state.qc;
                    state.qc = state.qb;
                    state.qb = state.qa;
                    state.qa = pins[1] ? 1 : 0; // Serial input
                }
            } else {
                // Parallel load mode - clocked by CLK2 (pin 8)
                var clk2Edge = pins[8] && !state.prevClk2; // rising edge
                if (clk2Edge) {
                    state.qa = pins[2] ? 1 : 0; // A
                    state.qb = pins[3] ? 1 : 0; // B
                    state.qc = pins[4] ? 1 : 0; // C
                    state.qd = pins[5] ? 1 : 0; // D
                }
            }

            state.prevClk1 = pins[9];
            state.prevClk2 = pins[8];

            pins[13] = state.qa;
            pins[12] = state.qb;
            pins[11] = state.qc;
            pins[10] = state.qd;

            return pins;
        }
    },

    /* 74107 - Dual J-K Flip-Flop with Clear */
    '74107': {
        name: '74107',
        description: 'Dual J-K Flip-Flop',
        pins: 14,
        pinout: [
            { pin: 1,  name: '1J',   type: 'input' },
            { pin: 2,  name: '1Q\'', type: 'output' },
            { pin: 3,  name: '1Q',   type: 'output' },
            { pin: 4,  name: '1K',   type: 'input' },
            { pin: 5,  name: '2Q',   type: 'output' },
            { pin: 6,  name: '2Q\'', type: 'output' },
            { pin: 7,  name: 'GND',  type: 'power' },
            { pin: 8,  name: '2J',   type: 'input' },
            { pin: 9,  name: '2CLK', type: 'input' },
            { pin: 10, name: '2CLR', type: 'input' },
            { pin: 11, name: '2K',   type: 'input' },
            { pin: 12, name: '1CLK', type: 'input' },
            { pin: 13, name: '1CLR', type: 'input' },
            { pin: 14, name: 'VCC',  type: 'power' }
        ],
        _state: { q1: 0, q2: 0, prevClk1: 0, prevClk2: 0 },
        simulate: function(pins) {
            var state = this._state;

            // Flip-flop 1: J(1), K(4), CLK(12), CLR(13), Q(3), Q'(2)
            // CLR is active LOW
            if (!pins[13]) {
                state.q1 = 0; // Clear
            } else if (!pins[12] && state.prevClk1) {
                // Falling edge of clock (74107 triggers on falling edge)
                var j1 = pins[1] ? 1 : 0;
                var k1 = pins[4] ? 1 : 0;
                if (j1 && !k1) {
                    state.q1 = 1;        // Set
                } else if (!j1 && k1) {
                    state.q1 = 0;        // Reset
                } else if (j1 && k1) {
                    state.q1 = state.q1 ? 0 : 1; // Toggle
                }
                // J=0, K=0: hold (no change)
            }
            state.prevClk1 = pins[12];
            pins[3] = state.q1;
            pins[2] = state.q1 ? 0 : 1;

            // Flip-flop 2: J(8), K(11), CLK(9), CLR(10), Q(5), Q'(6)
            if (!pins[10]) {
                state.q2 = 0; // Clear
            } else if (!pins[9] && state.prevClk2) {
                // Falling edge
                var j2 = pins[8] ? 1 : 0;
                var k2 = pins[11] ? 1 : 0;
                if (j2 && !k2) {
                    state.q2 = 1;
                } else if (!j2 && k2) {
                    state.q2 = 0;
                } else if (j2 && k2) {
                    state.q2 = state.q2 ? 0 : 1;
                }
            }
            state.prevClk2 = pins[9];
            pins[5] = state.q2;
            pins[6] = state.q2 ? 0 : 1;

            return pins;
        }
    },

    /* 74244 - Octal Buffer/Line Driver (3-state, active-low enable) */
    '74244': {
        name: '74244',
        description: 'Octal Buffer/Line Driver',
        pins: 20,
        pinout: [
            { pin: 1,  name: '1OE',  type: 'input' },
            { pin: 2,  name: '1Y1',  type: 'output' },
            { pin: 3,  name: '2A1',  type: 'input' },
            { pin: 4,  name: '1Y2',  type: 'output' },
            { pin: 5,  name: '2A2',  type: 'input' },
            { pin: 6,  name: '1Y3',  type: 'output' },
            { pin: 7,  name: '2A3',  type: 'input' },
            { pin: 8,  name: '1Y4',  type: 'output' },
            { pin: 9,  name: '2A4',  type: 'input' },
            { pin: 10, name: 'GND',  type: 'power' },
            { pin: 11, name: '2Y4',  type: 'output' },
            { pin: 12, name: '1A4',  type: 'input' },
            { pin: 13, name: '2Y3',  type: 'output' },
            { pin: 14, name: '1A3',  type: 'input' },
            { pin: 15, name: '2Y2',  type: 'output' },
            { pin: 16, name: '1A2',  type: 'input' },
            { pin: 17, name: '2Y1',  type: 'output' },
            { pin: 18, name: '1A1',  type: 'input' },
            { pin: 19, name: '2OE',  type: 'input' },
            { pin: 20, name: 'VCC',  type: 'power' }
        ],
        simulate: function(pins) {
            var oe1Enabled = !pins[1];   // active low
            var oe2Enabled = !pins[19];  // active low

            if (oe1Enabled) {
                pins[2] = pins[18] ? 1 : 0;
                pins[4] = pins[16] ? 1 : 0;
                pins[6] = pins[14] ? 1 : 0;
                pins[8] = pins[12] ? 1 : 0;
            } else {
                delete pins[2];
                delete pins[4];
                delete pins[6];
                delete pins[8];
            }

            if (oe2Enabled) {
                pins[11] = pins[9] ? 1 : 0;
                pins[13] = pins[7] ? 1 : 0;
                pins[15] = pins[5] ? 1 : 0;
                pins[17] = pins[3] ? 1 : 0;
            } else {
                delete pins[11];
                delete pins[13];
                delete pins[15];
                delete pins[17];
            }

            return pins;
        }
    }
};
