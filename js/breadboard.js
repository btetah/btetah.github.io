/* ============================================
   Breadboard - Breadboard & Wiring Logic
   ============================================ */

// eslint-disable-next-line no-unused-vars
var Breadboard = (function() {
    'use strict';

    var ROWS = 63;       // Number of rows per side (630 tie points)
    var COLS = 5;        // 5 columns per side (a-e, f-j)
    var RAIL_HOLES = 50; // Power rail holes (100 tie points per distribution strip)

    var wires = [];          // Array of wire connections
    var placedICs = [];      // Array of placed ICs
    var selectedPoint = null; // Currently selected connection point
    var wireMode = false;
    var deleteWireMode = false;
    var wireColorIndex = 0;
    var wireColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
                      '#1abc9c', '#e67e22', '#2980b9', '#27ae60', '#8e44ad'];

    /**
     * Initialize the breadboard grid
     */
    function init(gridEl, topVccRail, topGndRail, bottomVccRail, bottomGndRail) {
        // Create column labels
        var colLabelRow = document.createElement('div');
        colLabelRow.className = 'bb-col-labels';
        var labels = ['a', 'b', 'c', 'd', 'e', '', 'f', 'g', 'h', 'i', 'j'];
        for (var c = 0; c < labels.length; c++) {
            var colLabel = document.createElement('span');
            colLabel.className = 'bb-col-label';
            colLabel.textContent = labels[c];
            colLabelRow.appendChild(colLabel);
        }
        gridEl.appendChild(colLabelRow);

        // Create breadboard rows
        for (var r = 1; r <= ROWS; r++) {
            var rowDiv = document.createElement('div');
            rowDiv.className = 'bb-row';

            var rowLabel = document.createElement('span');
            rowLabel.className = 'bb-row-label';
            rowLabel.textContent = r;
            rowDiv.appendChild(rowLabel);

            // Left columns (a-e)
            for (var cl = 0; cl < COLS; cl++) {
                var hole = createHole('bb', r, String.fromCharCode(97 + cl));
                rowDiv.appendChild(hole);
            }

            // Center gap
            var gap = document.createElement('span');
            gap.className = 'bb-center-gap';
            rowDiv.appendChild(gap);

            // Right columns (f-j)
            for (var cr = 0; cr < COLS; cr++) {
                var holeR = createHole('bb', r, String.fromCharCode(102 + cr));
                rowDiv.appendChild(holeR);
            }

            gridEl.appendChild(rowDiv);
        }

        // Create power rails
        createRailHoles(topVccRail, 'top-vcc');
        createRailHoles(topGndRail, 'top-gnd');
        createRailHoles(bottomVccRail, 'bottom-vcc');
        createRailHoles(bottomGndRail, 'bottom-gnd');
    }

    function createHole(type, row, col) {
        var hole = document.createElement('div');
        hole.className = 'bb-hole';
        hole.setAttribute('data-conn', type + '-' + row + '-' + col);
        hole.setAttribute('data-row', row);
        hole.setAttribute('data-col', col);
        hole.title = col.toUpperCase() + row;

        hole.addEventListener('click', function(e) {
            e.stopPropagation();
            handleHoleClick(hole);
        });

        return hole;
    }

    function createRailHoles(container, railId) {
        container.innerHTML = '';
        for (var i = 1; i <= RAIL_HOLES; i++) {
            var hole = document.createElement('div');
            hole.className = 'rail-hole';
            hole.setAttribute('data-conn', 'rail-' + railId + '-' + i);
            hole.title = railId.toUpperCase() + ' ' + i;

            if (railId.indexOf('vcc') !== -1) {
                hole.classList.add('vcc');
            } else {
                hole.classList.add('gnd');
            }

            hole.addEventListener('click', function(e) {
                e.stopPropagation();
                handleHoleClick(this);
            });

            container.appendChild(hole);
        }
    }

    function handleHoleClick(hole) {
        if (!wireMode && !deleteWireMode) return;

        var connId = hole.getAttribute('data-conn');

        if (deleteWireMode) {
            deleteWiresAt(connId);
            return;
        }

        if (!selectedPoint) {
            // First point
            selectedPoint = hole;
            hole.classList.add('selected');
            setStatus('Select second connection point...');
        } else {
            // Second point - create wire
            var fromConn = selectedPoint.getAttribute('data-conn');
            var toConn = connId;

            if (fromConn !== toConn) {
                addWire(fromConn, toConn);
            }

            selectedPoint.classList.remove('selected');
            selectedPoint = null;
            setStatus('Wire connected. Click another pair to continue wiring.');
        }
    }

    /**
     * Also handle clicks on switch/LED connection points
     */
    function initExternalPoints() {
        var points = document.querySelectorAll('.switch-output-point, .led-input-point');
        for (var i = 0; i < points.length; i++) {
            points[i].addEventListener('click', function(e) {
                e.stopPropagation();
                handleHoleClick(this);
            });
        }
    }

    function addWire(fromConn, toConn) {
        var color = wireColors[wireColorIndex % wireColors.length];
        wireColorIndex++;

        var wire = {
            id: 'wire-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            from: fromConn,
            to: toConn,
            color: color
        };
        wires.push(wire);
        drawWire(wire);

        // Mark holes as connected
        var fromEl = document.querySelector('[data-conn="' + fromConn + '"]');
        var toEl = document.querySelector('[data-conn="' + toConn + '"]');
        if (fromEl) fromEl.classList.add('connected');
        if (toEl) toEl.classList.add('connected');

        return wire;
    }

    function drawWire(wire) {
        var svg = document.getElementById('wire-overlay');
        if (!svg) return;

        var fromEl = document.querySelector('[data-conn="' + wire.from + '"]');
        var toEl = document.querySelector('[data-conn="' + wire.to + '"]');
        if (!fromEl || !toEl) return;

        var svgRect = svg.getBoundingClientRect();
        var fromRect = fromEl.getBoundingClientRect();
        var toRect = toEl.getBoundingClientRect();

        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromRect.left - svgRect.left + fromRect.width / 2);
        line.setAttribute('y1', fromRect.top - svgRect.top + fromRect.height / 2);
        line.setAttribute('x2', toRect.left - svgRect.left + toRect.width / 2);
        line.setAttribute('y2', toRect.top - svgRect.top + toRect.height / 2);
        line.setAttribute('stroke', wire.color);
        line.setAttribute('data-wire-id', wire.id);
        line.style.pointerEvents = 'stroke';
        line.style.cursor = 'pointer';

        line.addEventListener('click', function() {
            if (deleteWireMode) {
                removeWire(wire.id);
            }
        });

        svg.appendChild(line);
    }

    function redrawAllWires() {
        var svg = document.getElementById('wire-overlay');
        if (svg) svg.innerHTML = '';
        for (var i = 0; i < wires.length; i++) {
            drawWire(wires[i]);
        }
    }

    function removeWire(wireId) {
        var wireIndex = -1;
        for (var i = 0; i < wires.length; i++) {
            if (wires[i].id === wireId) {
                wireIndex = i;
                break;
            }
        }
        if (wireIndex === -1) return;

        var wire = wires[wireIndex];
        wires.splice(wireIndex, 1);

        // Remove SVG line
        var lineEl = document.querySelector('[data-wire-id="' + wireId + '"]');
        if (lineEl) lineEl.remove();

        // Check if points still have other wires
        updateConnectionState(wire.from);
        updateConnectionState(wire.to);
    }

    function deleteWiresAt(connId) {
        var toRemove = [];
        for (var i = 0; i < wires.length; i++) {
            if (wires[i].from === connId || wires[i].to === connId) {
                toRemove.push(wires[i].id);
            }
        }
        for (var j = 0; j < toRemove.length; j++) {
            removeWire(toRemove[j]);
        }
    }

    function updateConnectionState(connId) {
        var hasWire = false;
        for (var i = 0; i < wires.length; i++) {
            if (wires[i].from === connId || wires[i].to === connId) {
                hasWire = true;
                break;
            }
        }
        var el = document.querySelector('[data-conn="' + connId + '"]');
        if (el) {
            if (hasWire) {
                el.classList.add('connected');
            } else {
                el.classList.remove('connected');
            }
        }
    }

    function clearAllWires() {
        wires = [];
        var svg = document.getElementById('wire-overlay');
        if (svg) svg.innerHTML = '';

        // Remove connected class from all holes
        var connected = document.querySelectorAll('.connected');
        for (var i = 0; i < connected.length; i++) {
            connected[i].classList.remove('connected');
        }
    }

    /**
     * Place an IC on the breadboard
     */
    function placeIC(icName, startRow) {
        var icDef = ICLibrary[icName];
        if (!icDef) return null;

        var numPins = icDef.pins;
        var pinsPerSide = numPins / 2;

        // Check if startRow is valid
        if (startRow + pinsPerSide - 1 > ROWS) {
            setStatus('Not enough space on breadboard for this IC at row ' + startRow);
            return null;
        }

        // Check for overlap
        for (var p = 0; p < placedICs.length; p++) {
            var existing = placedICs[p];
            var existingEnd = existing.startRow + existing.pinsPerSide - 1;
            var newEnd = startRow + pinsPerSide - 1;
            if (!(newEnd < existing.startRow || startRow > existingEnd)) {
                setStatus('IC overlaps with existing IC ' + existing.icName);
                return null;
            }
        }

        // Create IC placement
        var placement = {
            id: 'ic-' + Date.now(),
            icName: icName,
            startRow: startRow,
            pinsPerSide: pinsPerSide,
            pins: {},         // pin number -> connection point ID
            pinValues: {},    // pin number -> value (0 or 1)
            icDef: icDef,
            _state: null      // For sequential ICs
        };

        // Copy IC state if it has one
        if (icDef._state) {
            placement._state = JSON.parse(JSON.stringify(icDef._state));
        }

        // Map pins to breadboard holes
        // Left side pins (1 to pinsPerSide): column 'e', rows startRow to startRow+pinsPerSide-1
        // Right side pins (pinsPerSide+1 to numPins): column 'f', rows startRow+pinsPerSide-1 down to startRow
        for (var lp = 0; lp < pinsPerSide; lp++) {
            var pinNum = lp + 1;
            var row = startRow + lp;
            var connId = 'bb-' + row + '-e';
            placement.pins[pinNum] = connId;
            placement.pinValues[pinNum] = 0;

            // Mark hole as occupied
            var holeEl = document.querySelector('[data-conn="' + connId + '"]');
            if (holeEl) holeEl.classList.add('occupied');
        }

        for (var rp = 0; rp < pinsPerSide; rp++) {
            var pinNumR = numPins - rp;
            var rowR = startRow + rp;
            var connIdR = 'bb-' + rowR + '-f';
            placement.pins[pinNumR] = connIdR;
            placement.pinValues[pinNumR] = 0;

            var holeElR = document.querySelector('[data-conn="' + connIdR + '"]');
            if (holeElR) holeElR.classList.add('occupied');
        }

        placedICs.push(placement);

        // Render IC visual on breadboard
        renderIC(placement);

        setStatus('Placed ' + icName + ' (' + icDef.description + ') at row ' + startRow);
        return placement;
    }

    function renderIC(placement) {
        var breadboardArea = document.querySelector('.breadboard-area');
        if (!breadboardArea) return;

        var firstHole = document.querySelector('[data-conn="bb-' + placement.startRow + '-e"]');
        var lastHole = document.querySelector('[data-conn="bb-' + (placement.startRow + placement.pinsPerSide - 1) + '-f"]');

        if (!firstHole || !lastHole) return;

        var areaRect = breadboardArea.getBoundingClientRect();
        var firstRect = firstHole.getBoundingClientRect();
        var lastRect = lastHole.getBoundingClientRect();

        var icEl = document.createElement('div');
        icEl.className = 'ic-on-board';
        icEl.setAttribute('data-ic-id', placement.id);
        icEl.style.position = 'absolute';
        icEl.style.left = (firstRect.left - areaRect.left - 2) + 'px';
        icEl.style.top = (firstRect.top - areaRect.top - 2) + 'px';
        icEl.style.width = (lastRect.right - firstRect.left + 4) + 'px';
        icEl.style.height = (lastRect.bottom - firstRect.top + 4) + 'px';
        icEl.innerHTML = '<div class="ic-notch"></div>' + placement.icName;

        breadboardArea.appendChild(icEl);
    }

    function removeIC(icId) {
        var index = -1;
        for (var i = 0; i < placedICs.length; i++) {
            if (placedICs[i].id === icId) {
                index = i;
                break;
            }
        }
        if (index === -1) return;

        var ic = placedICs[index];

        // Remove occupied markers
        var pinNums = Object.keys(ic.pins);
        for (var p = 0; p < pinNums.length; p++) {
            var connId = ic.pins[pinNums[p]];
            var holeEl = document.querySelector('[data-conn="' + connId + '"]');
            if (holeEl) holeEl.classList.remove('occupied');

            // Remove wires connected to IC pins
            deleteWiresAt(connId);
        }

        // Remove visual
        var icEl = document.querySelector('[data-ic-id="' + icId + '"]');
        if (icEl) icEl.remove();

        placedICs.splice(index, 1);
        setStatus('Removed IC');
    }

    function removeLastIC() {
        if (placedICs.length === 0) {
            setStatus('No ICs to remove');
            return;
        }
        removeIC(placedICs[placedICs.length - 1].id);
    }

    /**
     * Find the next available row for placing an IC
     */
    function findNextAvailableRow(pinsPerSide) {
        var row = 1;
        while (row + pinsPerSide - 1 <= ROWS) {
            var overlap = false;
            for (var i = 0; i < placedICs.length; i++) {
                var ic = placedICs[i];
                var icEnd = ic.startRow + ic.pinsPerSide - 1;
                var newEnd = row + pinsPerSide - 1;
                if (!(newEnd < ic.startRow || row > icEnd)) {
                    overlap = true;
                    row = icEnd + 1;
                    break;
                }
            }
            if (!overlap) return row;
        }
        return -1;
    }

    /**
     * Get net connections: find all points connected together through wires
     */
    function getNet(connId, visited) {
        if (!visited) visited = {};
        if (visited[connId]) return [];
        visited[connId] = true;

        var net = [connId];
        for (var i = 0; i < wires.length; i++) {
            var wire = wires[i];
            if (wire.from === connId) {
                net = net.concat(getNet(wire.to, visited));
            } else if (wire.to === connId) {
                net = net.concat(getNet(wire.from, visited));
            }
        }

        // Also add breadboard internal connections (same row, same side)
        var match = connId.match(/^bb-(\d+)-([a-j])$/);
        if (match) {
            var row = match[1];
            var col = match[2];
            var leftCols = ['a', 'b', 'c', 'd', 'e'];
            var rightCols = ['f', 'g', 'h', 'i', 'j'];
            var sameSide = leftCols.indexOf(col) !== -1 ? leftCols : rightCols;
            for (var s = 0; s < sameSide.length; s++) {
                var sameConn = 'bb-' + row + '-' + sameSide[s];
                if (!visited[sameConn]) {
                    net = net.concat(getNet(sameConn, visited));
                }
            }
        }

        // Power rail connections (all holes in same rail are connected)
        var railMatch = connId.match(/^rail-(top|bottom)-(vcc|gnd)-(\d+)$/);
        if (railMatch) {
            var position = railMatch[1];
            var railType = railMatch[2];
            for (var rh = 1; rh <= RAIL_HOLES; rh++) {
                var railConn = 'rail-' + position + '-' + railType + '-' + rh;
                if (!visited[railConn]) {
                    net = net.concat(getNet(railConn, visited));
                }
            }
        }

        return net;
    }

    function getWires() { return wires; }
    function getPlacedICs() { return placedICs; }

    function setWireMode(enabled) {
        wireMode = enabled;
        deleteWireMode = false;
        if (selectedPoint) {
            selectedPoint.classList.remove('selected');
            selectedPoint = null;
        }
    }

    function setDeleteWireMode(enabled) {
        deleteWireMode = enabled;
        wireMode = false;
        if (selectedPoint) {
            selectedPoint.classList.remove('selected');
            selectedPoint = null;
        }
    }

    function isWireMode() { return wireMode; }
    function isDeleteWireMode() { return deleteWireMode; }

    function resetAll() {
        clearAllWires();
        // Remove all ICs
        while (placedICs.length > 0) {
            removeIC(placedICs[0].id);
        }
        wireColorIndex = 0;
    }

    function setStatus(msg) {
        var el = document.getElementById('status-msg');
        if (el) el.textContent = msg;
    }

    return {
        ROWS: ROWS,
        COLS: COLS,
        init: init,
        initExternalPoints: initExternalPoints,
        placeIC: placeIC,
        removeIC: removeIC,
        removeLastIC: removeLastIC,
        findNextAvailableRow: findNextAvailableRow,
        getNet: getNet,
        getWires: getWires,
        getPlacedICs: getPlacedICs,
        addWire: addWire,
        clearAllWires: clearAllWires,
        redrawAllWires: redrawAllWires,
        setWireMode: setWireMode,
        setDeleteWireMode: setDeleteWireMode,
        isWireMode: isWireMode,
        isDeleteWireMode: isDeleteWireMode,
        resetAll: resetAll
    };
})();
