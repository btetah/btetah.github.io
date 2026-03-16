// لا تلعب بالسورس ياحيبي

var Simulator = (function() {
    'use strict';

    var clockEnabled = false;
    var clockFrequency = 10; // Hz
    var clockState = 0;
    var clockTimerId = null;
    var clockOutputConn = 'clock-output-10';

    var pulserLState = 0;
    var pulserHState = 1;
    var pulserTimerId = null;

    var powerOn = false;


    function simulate() {
        if (!powerOn) return;

        var ics = Breadboard.getPlacedICs();

        var signals = {};

        var switchStates = Components.getAllSwitchStates();
        for (var s = 0; s < switchStates.length; s++) {
            signals['switch-' + s] = switchStates[s];
        }

        applyFixedPowerSources(signals);

        // Set clock output
        if (clockEnabled) {
            signals[clockOutputConn] = clockState;
            // Backward compatibility for older saved wires.
            signals['clock-output'] = clockState;
        }

        // Manual pulser dedicated outputs
        signals['pulser-l'] = pulserLState;
        signals['pulser-h'] = pulserHState;

        // Propagate signals through wires to IC inputs (multiple passes for cascaded ICs)
        var maxPasses = ics.length + 2;
        for (var pass = 0; pass < maxPasses; pass++) {
            // Propagate all known signals through wire nets
            propagateSignals(signals);

            // Simulate each IC
            for (var i = 0; i < ics.length; i++) {
                simulateIC(ics[i], signals);
            }
        }

        // Final propagation
        propagateSignals(signals);

        // Update LED outputs
        for (var l = 0; l < Components.NUM_LEDS; l++) {
            var ledConn = 'led-' + l;
            var ledValue = signals[ledConn] !== undefined ? signals[ledConn] : 0;
            Components.setLED(l, ledValue);
        }

        // Update seven-segment displays from signals
        updateSevenSegments(signals);

        // L12/L13 reflect actual pulser node values after propagation.
        updatePulserLEDs(signals);
    }

    function setPulserState(lowNode, highNode) {
        pulserLState = lowNode ? 1 : 0;
        pulserHState = highNode ? 1 : 0;
    }

    function updatePulserLEDs(signals) {
        var lVal = (signals['pulser-l'] !== undefined) ? signals['pulser-l'] : pulserLState;
        var hVal = (signals['pulser-h'] !== undefined) ? signals['pulser-h'] : pulserHState;

        var ledL = document.getElementById('pulser-led-l');
        if (ledL) {
            if (lVal) ledL.classList.add('on');
            else ledL.classList.remove('on');
        }

        var ledH = document.getElementById('pulser-led-h');
        if (ledH) {
            if (hVal) ledH.classList.add('on');
            else ledH.classList.remove('on');
        }
    }

    function applyFixedPowerSources(signals) {
        // Rails are not energized directly; these are the only fixed sources.
        signals['vcc-5'] = 1;
        signals['vcc-5-2'] = 1;
        signals['vcc-gnd'] = 0;
        signals['vcc-gnd-2'] = 0;
        signals['vcc-12'] = 1;
        signals['vcc-12-2'] = 1;
        signals['vcc--12'] = 0;
        signals['vcc--12-2'] = 0;
    }

    /**
     * Propagate signals through wire networks
     */
    function propagateSignals(signals) {
        var wires = Breadboard.getWires();
        var graph = buildConnectivityGraph(wires);
        var q = Object.keys(signals);

        while (q.length) {
            var cur = q.shift();
            var curVal = signals[cur];
            var neighbors = graph[cur] || [];

            for (var i = 0; i < neighbors.length; i++) {
                var n = neighbors[i];
                if (signals[n] === undefined) {
                    signals[n] = curVal;
                    q.push(n);
                }
            }
        }
    }

    function buildConnectivityGraph(wires) {
        var graph = Object.create(null);

        function addEdge(a, b) {
            if (!a || !b || a === b) return;
            if (!graph[a]) graph[a] = [];
            if (!graph[b]) graph[b] = [];
            if (graph[a].indexOf(b) === -1) graph[a].push(b);
            if (graph[b].indexOf(a) === -1) graph[b].push(a);
        }

        // Wires are explicit user connections.
        for (var w = 0; w < wires.length; w++) {
            addEdge(wires[w].from, wires[w].to);
        }

        // Breadboard rows: each side is a shared bus (a-e and f-j).
        var leftCols = ['a', 'b', 'c', 'd', 'e'];
        var rightCols = ['f', 'g', 'h', 'i', 'j'];
        for (var r = 1; r <= Breadboard.ROWS; r++) {
            for (var lc = 1; lc < leftCols.length; lc++) {
                addEdge('bb-' + r + '-' + leftCols[lc - 1], 'bb-' + r + '-' + leftCols[lc]);
            }
            for (var rc = 1; rc < rightCols.length; rc++) {
                addEdge('bb-' + r + '-' + rightCols[rc - 1], 'bb-' + r + '-' + rightCols[rc]);
            }
        }

        // Rails: connected by physical segment only (breaks stay isolated).
        var railSegments = getRailSegmentsById();
        var rails = ['top-vcc', 'top-gnd', 'bottom-vcc', 'bottom-gnd'];
        for (var ridx = 0; ridx < rails.length; ridx++) {
            var railId = rails[ridx];
            var segments = railSegments[railId] || [];
            for (var s = 0; s < segments.length; s++) {
                var seg = segments[s];
                for (var k = 1; k < seg.length; k++) {
                    addEdge(seg[k - 1], seg[k]);
                }
            }
        }

        return graph;
    }

    function getRailSegmentsById() {
        var byRail = {
            'top-vcc': [],
            'top-gnd': [],
            'bottom-vcc': [],
            'bottom-gnd': []
        };

        if (typeof document === 'undefined' || !document.querySelectorAll) {
            return byRail;
        }

        var rails = Object.keys(byRail);
        for (var r = 0; r < rails.length; r++) {
            var railId = rails[r];
            var prefix = 'rail-' + railId + '-';
            var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-conn^="' + prefix + '"]'));
            var points = nodes.map(function(el) {
                var rect = el.getBoundingClientRect();
                return {
                    conn: el.dataset.conn,
                    x: rect.left + (rect.width / 2)
                };
            }).sort(function(a, b) { return a.x - b.x; });

            if (!points.length) continue;

            var diffs = [];
            for (var i = 1; i < points.length; i++) {
                diffs.push(points[i].x - points[i - 1].x);
            }
            var baseStep = 0;
            if (diffs.length) {
                var sorted = diffs.slice().sort(function(a, b) { return a - b; });
                baseStep = sorted[Math.floor(sorted.length / 2)];
            }
            var splitThreshold = baseStep > 0 ? (baseStep * 2.6) : Number.POSITIVE_INFINITY;

            var current = [points[0].conn];
            for (var j = 1; j < points.length; j++) {
                var gap = points[j].x - points[j - 1].x;
                if (gap > splitThreshold) {
                    byRail[railId].push(current);
                    current = [];
                }
                current.push(points[j].conn);
            }
            byRail[railId].push(current);
        }

        return byRail;
    }

    /**
     * Breadboard internal connections: holes in same row, same side are connected
     */
    function propagateBreadboardRows(signals) {
        var leftCols = ['a', 'b', 'c', 'd', 'e'];
        var rightCols = ['f', 'g', 'h', 'i', 'j'];

        for (var r = 1; r <= Breadboard.ROWS; r++) {
            // Left side
            propagateRowSide(signals, r, leftCols);
            // Right side
            propagateRowSide(signals, r, rightCols);
        }
    }

    function propagateRowSide(signals, row, cols) {
        var knownValue;
        // Find if any hole in this row-side has a known value
        for (var c = 0; c < cols.length; c++) {
            var conn = 'bb-' + row + '-' + cols[c];
            if (signals[conn] !== undefined) {
                knownValue = signals[conn];
                break;
            }
        }
        // If found, propagate to all holes in this row-side
        if (knownValue !== undefined) {
            for (var c2 = 0; c2 < cols.length; c2++) {
                var conn2 = 'bb-' + row + '-' + cols[c2];
                if (signals[conn2] === undefined) {
                    signals[conn2] = knownValue;
                }
            }
        }
    }

    function propagateRails(signals) {
        var rails = ['top-vcc', 'top-gnd', 'bottom-vcc', 'bottom-gnd'];
        for (var r = 0; r < rails.length; r++) {
            var railId = rails[r];
            var knownValue;

            for (var i = 1; i <= Breadboard.ROWS; i++) {
                var conn = 'rail-' + railId + '-' + i;
                if (signals[conn] !== undefined) {
                    knownValue = signals[conn];
                    break;
                }
            }

            if (knownValue !== undefined) {
                for (var j = 1; j <= Breadboard.ROWS; j++) {
                    var railConn = 'rail-' + railId + '-' + j;
                    if (signals[railConn] === undefined) {
                        signals[railConn] = knownValue;
                    }
                }
            }
        }
    }

    function getSignalValue(signals, connId) {
        return signals[connId];
    }

    function setSignalInNet(signals, connId, value) {
        signals[connId] = value;
    }

    /**
     * Simulate a single IC
     */
    function simulateIC(icPlacement, signals) {
        var icDef = icPlacement.icDef;
        var pinValues = {};

        // Read input pin values from signals
        var pinout = icDef.pinout;
        for (var p = 0; p < pinout.length; p++) {
            var pinInfo = pinout[p];
            var pinNum = pinInfo.pin;
            var connId = icPlacement.pins[pinNum];

            if (pinInfo.type === 'input') {
                var val = signals[connId];
                pinValues[pinNum] = val !== undefined ? val : 0;
            } else if (pinInfo.type === 'power') {
                // VCC should be 1, GND should be 0
                if (pinInfo.name === 'VCC') {
                    pinValues[pinNum] = 1;
                } else {
                    pinValues[pinNum] = 0;
                }
            }
        }

        // Run IC simulation
        var simFn = icDef.simulate;
        if (icPlacement._state) {
            // For sequential ICs, bind state
            var boundSimulate = function(pv) {
                var originalState = icDef._state;
                icDef._state = icPlacement._state;
                var result = simFn.call(icDef, pv);
                icPlacement._state = icDef._state;
                icDef._state = originalState;
                return result;
            };
            pinValues = boundSimulate(pinValues);
        } else {
            pinValues = simFn.call(icDef, pinValues);
        }

        // Write output pin values to signals
        for (var p2 = 0; p2 < pinout.length; p2++) {
            var pinInfo2 = pinout[p2];
            if (pinInfo2.type === 'output') {
                var pinNum2 = pinInfo2.pin;
                var connId2 = icPlacement.pins[pinNum2];
                var outputVal = pinValues[pinNum2] !== undefined ? pinValues[pinNum2] : 0;
                signals[connId2] = outputVal;
                icPlacement.pinValues[pinNum2] = outputVal;
            }
        }
    }

    /**
     * Update seven-segment displays
     * Checks if any IC outputs are connected to the display pins
     */
    function updateSevenSegments(signals) {
        // Seven-segment displays can be driven directly by signals named
        // 'seg-0-a' through 'seg-0-g' etc, or by connecting IC outputs
        for (var d = 0; d < 3; d++) {
            var segs = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, dp: 0 };
            var segNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
            for (var s = 0; s < segNames.length; s++) {
                var segConn = 'seg-' + d + '-' + segNames[s];
                if (signals[segConn] !== undefined) {
                    segs[segNames[s]] = signals[segConn];
                }
            }
            // The physical board labels the decimal-point terminal as H.
            var hConn = 'seg-' + d + '-h';
            if (signals[hConn] !== undefined) {
                segs.dp = signals[hConn];
            }
            Components.setSevenSegment(d, segs);
        }
    }

    /**
     * Clock generator
     */
    function startClock() {
        if (clockTimerId) return;
        clockEnabled = true;
        var interval = 1000 / (clockFrequency * 2); // Toggle at 2x frequency
        clockTimerId = setInterval(function() {
            clockState = clockState ? 0 : 1;
            updateClockLED();
            simulate();
        }, interval);
    }

    function stopClock() {
        clockEnabled = false;
        if (clockTimerId) {
            clearInterval(clockTimerId);
            clockTimerId = null;
        }
        clockState = 0;
        updateClockLED();
    }

    function setClockFrequency(freq) {
        clockFrequency = freq;
        clockOutputConn = 'clock-output-' + freq;
        if (clockEnabled) {
            stopClock();
            startClock();
        }
    }

    function updateClockLED() {
        var led = document.getElementById('clock-led');
        if (led) {
            if (clockState) {
                led.classList.add('on');
            } else {
                led.classList.remove('on');
            }
        }
    }

    /**
     * Pulse generator - Low to High transition (bounceless)
     */
    function pulse() {
        if (!powerOn) return;
        if (pulserTimerId) {
            clearTimeout(pulserTimerId);
            pulserTimerId = null;
        }

        // LHL: low->high->low, HLH is complementary high->low->high.
        setPulserState(1, 0);
        clockState = 0;
        updateClockLED();
        simulate();

        pulserTimerId = setTimeout(function() {
            setPulserState(0, 1);
            clockState = 1;
            updateClockLED();
            simulate();
            pulserTimerId = null;
        }, 50);
    }

    /**
     * Pulse generator - High to Low transition (bounceless)
     */
    function pulseHigh() {
        if (!powerOn) return;
        if (pulserTimerId) {
            clearTimeout(pulserTimerId);
            pulserTimerId = null;
        }

        // HLH edge on release.
        setPulserState(0, 1);
        clockState = 1;
        updateClockLED();
        simulate();

        pulserTimerId = setTimeout(function() {
            setPulserState(1, 0);
            clockState = 0;
            updateClockLED();
            simulate();
            pulserTimerId = null;
        }, 50);
    }

    /**
     * Logic probe - read value of a connection point
     */
    function probeValue(connId) {
        if (!powerOn) return -1; // tri-state when off
        var ics = Breadboard.getPlacedICs();
        var signals = {};
        applyFixedPowerSources(signals);

        var switchStates = Components.getAllSwitchStates();
        for (var s = 0; s < switchStates.length; s++) {
            signals['switch-' + s] = switchStates[s];
        }

        if (clockEnabled) {
            signals[clockOutputConn] = clockState;
            signals['clock-output'] = clockState;
        }

        var maxPasses = ics.length + 2;
        for (var pass = 0; pass < maxPasses; pass++) {
            propagateSignals(signals);
            for (var i = 0; i < ics.length; i++) {
                simulateIC(ics[i], signals);
            }
        }
        propagateSignals(signals);

        if (signals[connId] !== undefined) {
            return signals[connId]; // 0 or 1
        }
        return -1; // tri-state (not connected)
    }

    /**
     * Power control
     */
    function setPower(on) {
        powerOn = on;
        if (!on) {
            stopClock();
            if (pulserTimerId) {
                clearTimeout(pulserTimerId);
                pulserTimerId = null;
            }
            setPulserState(0, 1);
            Components.resetLEDs();
            Components.clearSevenSegments();
        } else {
            simulate();
        }
    }

    function isPowerOn() { return powerOn; }

    return {
        simulate: simulate,
        startClock: startClock,
        stopClock: stopClock,
        setClockFrequency: setClockFrequency,
        pulse: pulse,
        pulseHigh: pulseHigh,
        probeValue: probeValue,
        setPower: setPower,
        isPowerOn: isPowerOn
    };
})();
