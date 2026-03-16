// Global states mapped seamlessly into the legacy simulator logic
const UIState = { switches: Array(10).fill(0) };

const Components = {
    NUM_LEDS: 10,
    NUM_SWITCHES: 10,
    getAllSwitchStates: () => UIState.switches,
    setLED: (l, val) => {
        let led = document.getElementById('led-glow-' + l);
        if(led) {
            if(val) led.classList.add('on');
            else led.classList.remove('on');
        }
    },
    setSevenSegment: (d, segs) => {
        let svg = document.getElementById('seg-display-' + d);
        if(!svg) return;
        Object.keys(segs).forEach(s => {
            let el = svg.querySelector(`[data-seg="${s}"]`);
            if(el) {
                if(segs[s]) el.classList.add('on');
                else el.classList.remove('on');
            }
        });
    },
    clearSevenSegments: () => {
        [0,1,2].forEach(d => Components.setSevenSegment(d, {a:0,b:0,c:0,d:0,e:0,f:0,g:0,dp:0}));
    },
    resetLEDs: () => {
        for(let i=0; i<10; i++) Components.setLED(i, 0);
    }
};

const Breadboard = (function() {
    let wires = [];
    let placedICs = [];
    let colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
    let colorIdx = 0;
    let history = [];
    let redoHistory = [];

    function hashString(v) {
        let h = 0;
        const s = String(v || '');
        for (let i = 0; i < s.length; i++) {
            h = ((h << 5) - h) + s.charCodeAt(i);
            h |= 0;
        }
        return Math.abs(h);
    }

    function addWire(fromX, toX, opts) {
        opts = opts || {};
        if (!fromX || !toX || fromX === toX) return;
        if (wires.find(w => (w.from === fromX && w.to === toX) || (w.from === toX && w.to === fromX))) return;

        let wire = {
            id: opts.id || ('w'+Date.now() + Math.floor(Math.random()*1000)),
            from: fromX,
            to: toX,
            color: opts.color || colors[colorIdx++%colors.length]
        };
        wires.push(wire);
        drawWire(wire);
        if (!opts.skipHistory) {
            history.push({ type: 'add', wire: { id: wire.id, from: wire.from, to: wire.to, color: wire.color } });
            redoHistory = [];
        }
        Simulator.simulate();
    }

    function drawWire(wire) {
        let svg = document.getElementById('wire-layer');
        let fromEl = document.querySelector(`[data-conn="${wire.from}"]`);
        let toEl = document.querySelector(`[data-conn="${wire.to}"]`);
        if(!fromEl || !toEl) return;
        
        let svgRect = svg.getBoundingClientRect();
        let fR = fromEl.getBoundingClientRect();
        let tR = toEl.getBoundingClientRect();
        
        // Path commands use unitless user coordinates, so draw in SVG pixel space.
        let x1 = (fR.left - svgRect.left + fR.width/2);
        let y1 = (fR.top - svgRect.top + fR.height/2);
        let x2 = (tR.left - svgRect.left + tR.width/2);
        let y2 = (tR.top - svgRect.top + tR.height/2);

        svg.setAttribute('viewBox', `0 0 ${svgRect.width} ${svgRect.height}`);
        svg.setAttribute('preserveAspectRatio', 'none');

        const dx = x2 - x1;
        const dy = y2 - y1;
        const span = Math.hypot(dx, dy);
        const curveStrength = Math.min(36, Math.max(8, span * 0.18));
        const bendDir = (hashString(wire.id) % 2 === 0) ? 1 : -1;
        const isMostlyVertical = Math.abs(dy) > Math.abs(dx);

        let c1x = x1 + dx * 0.25;
        let c2x = x1 + dx * 0.75;
        let c1y = y1 + dy * 0.25;
        let c2y = y1 + dy * 0.75;

        if (isMostlyVertical) {
            const xBend = curveStrength * 0.55 * bendDir;
            c1x += xBend;
            c2x += xBend;
        } else {
            const yBend = curveStrength * bendDir;
            c1y += yBend;
            c2y += yBend;
        }

        const d = `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;

        let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'wire-drawn');
        group.dataset.wireId = wire.id;

        let sleeve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        sleeve.setAttribute('d', d);
        sleeve.setAttribute('class', 'wire-sleeve');
        sleeve.setAttribute('fill', 'none');
        sleeve.setAttribute('vector-effect', 'non-scaling-stroke');

        let main = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        main.setAttribute('d', d);
        main.setAttribute('class', 'wire-main');
        main.setAttribute('stroke', wire.color);
        main.setAttribute('fill', 'none');
        main.setAttribute('vector-effect', 'non-scaling-stroke');

        let spec = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        spec.setAttribute('d', d);
        spec.setAttribute('class', 'wire-spec');
        spec.setAttribute('fill', 'none');
        spec.setAttribute('vector-effect', 'non-scaling-stroke');

        let capStart = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        capStart.setAttribute('cx', String(x1));
        capStart.setAttribute('cy', String(y1));
        capStart.setAttribute('r', '2.1');
        capStart.setAttribute('class', 'wire-cap');
        capStart.setAttribute('fill', wire.color);
        capStart.setAttribute('vector-effect', 'non-scaling-stroke');

        let capEnd = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        capEnd.setAttribute('cx', String(x2));
        capEnd.setAttribute('cy', String(y2));
        capEnd.setAttribute('r', '2.1');
        capEnd.setAttribute('class', 'wire-cap');
        capEnd.setAttribute('fill', wire.color);
        capEnd.setAttribute('vector-effect', 'non-scaling-stroke');

        group.appendChild(sleeve);
        group.appendChild(main);
        group.appendChild(spec);
        group.appendChild(capStart);
        group.appendChild(capEnd);

        group.addEventListener('click', () => {
            if(window.appState && window.appState.deleteMode) removeWire(wire.id);
        });

        svg.appendChild(group);
        fromEl.classList.add('connected');
        toEl.classList.add('connected');
    }

    function removeWire(id, opts) {
        opts = opts || {};
        let idx = wires.findIndex(w => w.id === id);
        if(idx < 0) return;
        let wire = wires[idx];
        wires.splice(idx, 1);
        
        let el = document.querySelector(`.wire-drawn[data-wire-id="${id}"]`);
        if(el) el.remove();
        
        if(!wires.find(w => w.from===wire.from || w.to===wire.from)) 
             document.querySelector(`[data-conn="${wire.from}"]`)?.classList.remove('connected');
             
        if(!wires.find(w => w.from===wire.to || w.to===wire.to)) 
             document.querySelector(`[data-conn="${wire.to}"]`)?.classList.remove('connected');

        if (!opts.skipHistory) {
            history.push({ type: 'remove', wire: { id: wire.id, from: wire.from, to: wire.to, color: wire.color } });
            redoHistory = [];
        }
             
        Simulator.simulate();
    }

    function deleteWiresAt(conn) {
        let toDrop = wires.filter(w => w.from === conn || w.to === conn).map(w=>w.id);
        toDrop.forEach(removeWire);
    }
    
    function redrawAllWires() {
        document.getElementById('wire-layer').innerHTML = '';
        wires.forEach(drawWire);
    }

    function clearHighlights() {
        document.querySelectorAll('.hole.net-highlight').forEach(el => el.classList.remove('net-highlight'));
        document.querySelectorAll('.wire-drawn.wire-highlight').forEach(el => el.classList.remove('wire-highlight'));
    }

    function getRowSideNeighbors(connId) {
        const m = /^bb-(\d+)-([a-j])$/.exec(connId || '');
        if (!m) return [];
        const row = m[1];
        const col = m[2];
        const group = ['a','b','c','d','e'].includes(col) ? ['a','b','c','d','e'] : ['f','g','h','i','j'];
        return group.filter(c => c !== col).map(c => `bb-${row}-${c}`);
    }

    function getRailNeighbors(connId) {
        const m = /^rail-(top|bottom)-(vcc|gnd)-\d+$/.exec(connId || '');
        if (!m) return [];
        const prefix = `rail-${m[1]}-${m[2]}-`;
        return Array.from(document.querySelectorAll('[data-conn]'))
            .map(el => el.dataset.conn)
            .filter(Boolean)
            .filter(c => c.startsWith(prefix) && c !== connId);
    }

    function getConnectedNet(connId) {
        const visited = new Set();
        const q = [connId];
        while (q.length) {
            const cur = q.shift();
            if (!cur || visited.has(cur)) continue;
            visited.add(cur);

            wires.forEach(w => {
                if (w.from === cur && !visited.has(w.to)) q.push(w.to);
                else if (w.to === cur && !visited.has(w.from)) q.push(w.from);
            });

            getRowSideNeighbors(cur).forEach(n => { if (!visited.has(n)) q.push(n); });
            getRailNeighbors(cur).forEach(n => { if (!visited.has(n)) q.push(n); });
        }
        return visited;
    }

    function highlightNet(connId) {
        clearHighlights();
        const net = getConnectedNet(connId);
        net.forEach(conn => {
            document.querySelector(`[data-conn="${conn}"]`)?.classList.add('net-highlight');
        });
        wires.forEach(w => {
            if (net.has(w.from) || net.has(w.to)) {
                document.querySelector(`.wire-drawn[data-wire-id="${w.id}"]`)?.classList.add('wire-highlight');
            }
        });
    }

    function undo() {
        const action = history.pop();
        if (!action) return false;
        if (action.type === 'add') {
            removeWire(action.wire.id, { skipHistory: true });
        } else if (action.type === 'remove') {
            addWire(action.wire.from, action.wire.to, {
                skipHistory: true,
                id: action.wire.id,
                color: action.wire.color
            });
        }
        redoHistory.push(action);
        return true;
    }

    function redo() {
        const action = redoHistory.pop();
        if (!action) return false;
        if (action.type === 'add') {
            addWire(action.wire.from, action.wire.to, {
                skipHistory: true,
                id: action.wire.id,
                color: action.wire.color
            });
        } else if (action.type === 'remove') {
            removeWire(action.wire.id, { skipHistory: true });
        }
        history.push(action);
        return true;
    }

    function placeIC(icName, slotId) {
        let icDef = ICLibrary[icName];
        if(!icDef) return null;
        let p = {
            id: 'ic-placed-' + slotId,
            icName: icName,
            icDef: icDef,
            pinsPerSide: icDef.pins/2,
            pins: {},
            pinValues: {},
            _state: icDef._state ? JSON.parse(JSON.stringify(icDef._state)) : null
        };
        for(let i=1; i<=icDef.pins; i++) {
            const singleId = `ic-${slotId}-pin-${i}`;
            const legacyA = `ic-${slotId}-pin-${i}-a`;
            const legacyB = `ic-${slotId}-pin-${i}-b`;
            if (document.querySelector(`[data-conn="${singleId}"]`)) {
                p.pins[i] = singleId;
            } else if (document.querySelector(`[data-conn="${legacyA}"]`)) {
                p.pins[i] = legacyA;
            } else {
                p.pins[i] = legacyB;
            }
        }
        placedICs.push(p);

        // Render IC visually
        let hitbox = document.getElementById('ic-socket-' + slotId);
        if(hitbox) {
            let vis = document.createElement('div');
            vis.className = 'ic-placed';
            vis.style.left = hitbox.style.left;
            vis.style.top = hitbox.style.top;
            vis.style.width = hitbox.style.width;
            vis.style.height = hitbox.style.height;
            vis.id = 'ic-visual-' + slotId;
            vis.innerHTML = `<div class="notch"></div>${icName}`;
            vis.style.transform = hitbox.style.transform;
            vis.addEventListener('click', () => {
                if(confirm(`Remove ${icName}?`)) removeICBySlot(slotId);
            });
            document.getElementById('ui-overlay').appendChild(vis);
        }

        Simulator.simulate();
        return p;
    }

    function removeICBySlot(slotId) {
        let idStr = 'ic-placed-' + slotId;
        placedICs = placedICs.filter(ic => ic.id !== idStr);
        let vis = document.getElementById('ic-visual-' + slotId);
        if(vis) vis.remove();
        Simulator.simulate();
    }

    return { 
        ROWS: 63, COLS: 5,
        getWires: () => wires, getPlacedICs: () => placedICs, 
        addWire, deleteWiresAt, redrawAllWires, placeIC, removeICBySlot,
        highlightNet, clearHighlights, undo, redo,
        clearAllWires: () => { wires = []; history = []; redoHistory = []; redrawAllWires(); clearHighlights(); Simulator.simulate(); } 
    };
})();
