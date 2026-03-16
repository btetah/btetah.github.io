// Central application hub tying logic to interface
window.appState = { wireMode: true, deleteMode: false, probeMode: false };

document.addEventListener('DOMContentLoaded', () => {
    buildOverlay();
    
    // Bind Image Aspect Ratio
    let imgEl = document.getElementById('board-img');
    let wrapEl = document.getElementById('board-wrapper');
    if(imgEl.complete && imgEl.naturalWidth) {
        wrapEl.style.aspectRatio = imgEl.naturalWidth + ' / ' + imgEl.naturalHeight;
    }
    imgEl.addEventListener('load', function() {
        wrapEl.style.aspectRatio = this.naturalWidth + ' / ' + this.naturalHeight;
        if(Breadboard.redrawAllWires) Breadboard.redrawAllWires();
    });

    const uiOverlay = document.getElementById('ui-overlay');
    const statusMsg = document.getElementById('status-msg');
    let selectedHole = null;
    const switchLastToggleAt = {};
    const SWITCH_DEBOUNCE_MS = 35;

    // File input to let the user override the image at runtime
    document.getElementById('board-upload').addEventListener('change', function(e){
        if(e.target.files && e.target.files[0]){
            const reader = new FileReader();
            reader.onload = function(evt){
                document.getElementById('board-img').src = evt.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Handle Wiring interactions universally
    uiOverlay.addEventListener('click', (e) => {
        const h = e.target.closest('.hole');
        if(!h) return;

        const connX = h.dataset.conn;

        if(window.appState.probeMode) {
            const val = Simulator.probeValue(connX);
            Breadboard.highlightNet(connX);
            statusMsg.innerText = `Probe ${connX}: ${val === 1 ? 'HIGH' : (val === 0 ? 'LOW' : 'FLOAT')}`;
            return;
        }

        if(!window.appState.wireMode && !window.appState.deleteMode) return;
        Breadboard.clearHighlights();
        
        if(window.appState.deleteMode) {
            Breadboard.deleteWiresAt(connX);
            return;
        }

        if(!selectedHole) {
            selectedHole = h;
            h.classList.add('selected');
        } else {
            if(selectedHole !== h) {
                Breadboard.addWire(selectedHole.dataset.conn, connX);
            }
            selectedHole.classList.remove('selected');
            selectedHole = null;
        }
    });

    // Switches Toggle
    document.querySelectorAll('.switch-hitbox').forEach(sw => {
        sw.addEventListener('click', () => {
            const id = sw.dataset.switchId;
            const now = Date.now();
            const last = switchLastToggleAt[id] || 0;
            if ((now - last) < SWITCH_DEBOUNCE_MS) return;
            switchLastToggleAt[id] = now;

            let state = sw.dataset.state === '0' ? '1' : '0';
            sw.dataset.state = state;
            let led = document.getElementById('switch-led-' + id);
            if(state === '1') led.classList.add('on');
            else led.classList.remove('on');
            
            UIState.switches[id] = parseInt(state);
            Simulator.simulate();
        });
    });

    // IC Socket Interaction
    document.querySelectorAll('.ic-hitbox').forEach(sock => {
        sock.addEventListener('click', () => {
            if(!Simulator.isPowerOn()) { alert("Please turn power on."); return; }
            let id = sock.dataset.socketId;
            if(!document.getElementById('ic-visual-' + id)) {
                let icName = prompt(`Enter IC name (e.g. 7400, 7404) for ${sock.dataset.pins}-pin socket:`);
                if(icName && ICLibrary[icName]) {
                    if(ICLibrary[icName].pins !== parseInt(sock.dataset.pins)) {
                       alert("Pin mismatch!"); return;
                    }
                    Breadboard.placeIC(icName, id);
                } else if(icName) { alert("IC not found in library."); }
            }
        });
    });

    // Clock Selection
    document.querySelectorAll('.freq-hole').forEach(clk => {
        clk.addEventListener('click', () => {
            document.querySelectorAll('.freq-hole').forEach(c => c.classList.remove('selected'));
            clk.classList.add('selected');
            Simulator.setClockFrequency(parseInt(clk.dataset.freq));
            Simulator.startClock();
            statusMsg.innerText = `Clock Running: ${clk.dataset.freq} Hz`;
        });
    });

    // Manual Pulser
    let pbtn = document.getElementById('pulser-main-btn');
    if(pbtn) {
        pbtn.addEventListener('mousedown', () => Simulator.pulse());
        pbtn.addEventListener('mouseup', () => Simulator.pulseHigh());
    }

    // ------------------------------------
    // Toolbar Tools
    // ------------------------------------
    const btns = ['btn-wire', 'btn-delete', 'btn-probe'];
    const activateTool = (id) => {
        btns.forEach(b => document.getElementById(b).classList.remove('active'));
        document.getElementById(id).classList.add('active');
        if(selectedHole) selectedHole.classList.remove('selected');
        selectedHole = null;
        Breadboard.clearHighlights();
    };

    document.getElementById('btn-wire').addEventListener('click', () => {
        appState.wireMode = true; appState.deleteMode = false; appState.probeMode = false;
        activateTool('btn-wire');
        statusMsg.innerText = "Wire Mode ACTIVE";
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        appState.wireMode = false; appState.deleteMode = true; appState.probeMode = false;
        activateTool('btn-delete');
        statusMsg.innerText = "Delete Wire Mode ACTIVE";
    });

    document.getElementById('btn-probe').addEventListener('click', () => {
        appState.wireMode = false; appState.deleteMode = false; appState.probeMode = true;
        activateTool('btn-probe');
        statusMsg.innerText = "Probe Mode ACTIVE";
    });

    document.getElementById('btn-undo').addEventListener('click', () => {
        const ok = Breadboard.undo();
        statusMsg.innerText = ok ? "Undo complete" : "Nothing to undo";
    });

    document.getElementById('btn-redo').addEventListener('click', () => {
        const ok = Breadboard.redo();
        statusMsg.innerText = ok ? "Redo complete" : "Nothing to redo";
    });

    document.getElementById('btn-clear').addEventListener('click', () => Breadboard.clearAllWires());

    document.getElementById('btn-reset').addEventListener('click', () => {
        Breadboard.clearAllWires();
        document.querySelectorAll('.ic-placed').forEach(ic => ic.remove());
        Breadboard.getPlacedICs().length = 0; // flush
        Components.resetLEDs();
        UIState.switches.fill(0);
        document.querySelectorAll('.switch-hitbox').forEach(sw => { sw.dataset.state = '0'; });
        Simulator.simulate();
    });

    // Enable Simulator Engine
    Simulator.setPower(true); 
    
    // Wire rendering resilience
    window.addEventListener('resize', Breadboard.redrawAllWires);
    setInterval(() => { if(Simulator.isPowerOn()) Simulator.simulate(); }, 150);
});
