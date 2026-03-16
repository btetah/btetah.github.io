// Generates all interactive UI elements based on percentages
function buildOverlay() {
    const overlay = document.getElementById('ui-overlay');
    overlay.innerHTML = '';
    const ALIGN_STORAGE_KEY = 'dtk02-align-overrides-v1';

    const readAlignmentOverrides = () => {
        try {
            const raw = localStorage.getItem(ALIGN_STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    };

    const presetOverrides = UI_CONFIG.alignmentOverrides || {};
    const overrides = Object.assign({}, presetOverrides, readAlignmentOverrides());
    const align = UI_CONFIG.alignment || {};
    const geom = UI_CONFIG.geometry || {};
    const scaleX = typeof align.scaleX === 'number' ? align.scaleX : 1;
    const scaleY = typeof align.scaleY === 'number' ? align.scaleY : 1;
    const offsetX = typeof align.offsetX === 'number' ? align.offsetX : 0;
    const offsetY = typeof align.offsetY === 'number' ? align.offsetY : 0;
    const mapX = (x) => (x * scaleX) + offsetX;
    const mapY = (y) => (y * scaleY) + offsetY;
    
    // Helper to abstract element creation
    const getOverrideForKey = (alignKey) => {
        if (!alignKey) return null;
        let ov = overrides[alignKey] || null;
        if (!ov && /^conn:ic-\d+-pin-\d+$/.test(alignKey)) {
            ov = overrides[alignKey + '-a'] || overrides[alignKey + '-b'] || null;
        }
        if (!ov && /^conn:clock-output-/.test(alignKey)) {
            // Backward compatibility with old single-key clock calibration.
            ov = overrides['conn:clock-output'] || null;
        }
        return ov;
    };

    const create = (cla, x, y, id, conn, customAlignKey) => {
        let el = document.createElement('div');
        el.className = 'interactive ' + cla;
        const alignKey = customAlignKey || (id ? ('id:' + id) : (conn ? ('conn:' + conn) : null));
        const defaultX = mapX(x);
        const defaultY = mapY(y);
        let ov = getOverrideForKey(alignKey);
        const finalX = (ov && typeof ov.x === 'number') ? ov.x : defaultX;
        const finalY = (ov && typeof ov.y === 'number') ? ov.y : defaultY;

        el.style.left = finalX + '%';
        el.style.top = finalY + '%';
        if(id) el.id = id;
        if(conn) el.dataset.conn = conn;
        if (alignKey) el.dataset.alignKey = alignKey;
        if (cla.indexOf('hole') !== -1) {
            el.style.width = (geom.holeSizePercent || 1.2) + '%';
        }
        // Inject configuration path for the editor to update the JSON live
        if(id || conn) el.dataset.cfgpath = id || conn; 
        overlay.appendChild(el);
        return el;
    };
    
    // Probe
    create('hole', UI_CONFIG.probe.hole.x, UI_CONFIG.probe.hole.y, null, 'probe-in');
    UI_CONFIG.probe.leds.forEach(l => create(`led-glow ${l.color}`, l.x, l.y, l.id));
    
    // Clock
    UI_CONFIG.fixedClock.holes.forEach(c => {
        const clockAlignKey = 'conn:clock-output-' + c.freq;
        const connId = 'clock-output-' + c.freq;
        let h = create('hole freq-hole', c.x, c.y, null, connId, clockAlignKey);
        h.dataset.freq = c.freq;
    });

    // Indicators
    UI_CONFIG.indicators.forEach(i => {
        create('hole', i.holeX, i.holeY, null, 'led-' + i.id);
        create('led-glow red', i.ledX, i.ledY, 'led-glow-' + i.id);
    });

    // Seven Segments
    UI_CONFIG.sevenSegs.forEach(s => {
        ['e','f','g','h'].forEach((lbl, idx) => create('hole', s.topHolesX[idx], s.topHolesY, null, `seg-${s.id}-${lbl}`));
        ['a','b','c','d'].forEach((lbl, idx) => create('hole', s.botHolesX[idx], s.botHolesY, null, `seg-${s.id}-${lbl}`));
        
        let svgW = document.createElement('div');
        svgW.className = 'seven-seg interactive';
        svgW.id = 'seg-display-' + s.id;
        const segAlignKey = 'id:seg-display-' + s.id;
        const segDefaultX = mapX(s.svgX);
        const segDefaultY = mapY(s.svgY);
        const segOv = getOverrideForKey(segAlignKey);
        const segFinalX = (segOv && typeof segOv.x === 'number') ? segOv.x : segDefaultX;
        const segFinalY = (segOv && typeof segOv.y === 'number') ? segOv.y : segDefaultY;
        svgW.style.left = segFinalX + '%';
        svgW.style.top = segFinalY + '%';
        svgW.dataset.alignKey = segAlignKey;
        svgW.dataset.cfgpath = 'seg-display-' + s.id;
        svgW.style.width = (geom.sevenSegWidth || 2.5) + '%';
        svgW.style.height = (geom.sevenSegHeight || 4.5) + '%';
        svgW.innerHTML = `
            <svg viewBox="0 0 60 100" style="width:100%; height:100%;">
                <polygon data-seg="a" class="seg-line" points="16,14 44,14 48,8 12,8"/> 
                <polygon data-seg="b" class="seg-line" points="49,10 49,46 45,42 45,16"/>
                <polygon data-seg="c" class="seg-line" points="49,52 49,88 45,84 45,56"/> 
                <polygon data-seg="d" class="seg-line" points="16,84 44,84 48,90 12,90"/>
                <polygon data-seg="e" class="seg-line" points="11,52 11,88 15,84 15,56"/> 
                <polygon data-seg="f" class="seg-line" points="11,10 11,46 15,42 15,16"/>
                <polygon data-seg="g" class="seg-line" points="15,48 45,48 48,51 45,54 15,54 12,51"/> 
                <circle data-seg="dp" class="seg-line" cx="55" cy="90" r="4"/>
            </svg>`;
        overlay.appendChild(svgW);
    });

    // Logic Switches
    UI_CONFIG.switches.forEach(sw => {
        create('hole', sw.holeX, sw.holeY, null, 'switch-' + sw.id);
        create('led-glow red', sw.ledX, sw.ledY, 'switch-led-' + sw.id);
        let b = create('switch-hitbox', sw.btnX, sw.btnY, 'switch-btn-' + sw.id);
        b.dataset.switchId = sw.id; b.dataset.state = '0';
        b.style.width = (geom.switchHitboxWidth || 2.2) + '%';
        b.style.height = (geom.switchHitboxHeight || 3) + '%';
    });

    // Pulser
    create('hole', UI_CONFIG.pulser.holeLHL.x, UI_CONFIG.pulser.holeLHL.y, null, 'pulser-l');
    create('led-glow red', UI_CONFIG.pulser.ledL12.x, UI_CONFIG.pulser.ledL12.y, 'pulser-led-l');
    create('hole', UI_CONFIG.pulser.holeHLH.x, UI_CONFIG.pulser.holeHLH.y, null, 'pulser-h');
    create('led-glow red', UI_CONFIG.pulser.ledL13.x, UI_CONFIG.pulser.ledL13.y, 'pulser-led-h');
    let pb = create('btn-hitbox', UI_CONFIG.pulser.btnS10.x, UI_CONFIG.pulser.btnS10.y, 'pulser-main-btn');
    pb.style.width = (geom.pulserButtonWidth || 2.5) + '%';
    pb.style.height = (geom.pulserButtonHeight || 3.5) + '%';

    // Fixed DC
    UI_CONFIG.dc.holes.forEach(h => create('hole dc-hole', h.x, h.y, null, h.id));

    // IC Empty Sockets
    UI_CONFIG.ics.forEach(ic => {
        let pyS = geom.icPinPitchY || 1.35;
        let pxS = geom.icPinOffsetX || 2.4;
        let outerPxS = geom.icOuterPinOffsetX || 0.8;
        let pwrOffY = geom.icPowerOffsetY || 2;
        let pinsH = ic.pins / 2;
        if (ic.separatePowerHoles !== false) {
            create('hole', ic.x, ic.y - (pinsH / 2) * pyS - pwrOffY, null, `ic-${ic.id}-vcc`);
            create('hole', ic.x, ic.y + (pinsH / 2) * pyS + pwrOffY, null, `ic-${ic.id}-gnd`);
        }
        
        let startY = ic.y - (pinsH / 2) * pyS + pyS / 2;
        for(let i=1; i<=pinsH; i++) {
            let py = startY + (i-1)*pyS;
            if (ic.singleHolePins) {
                create('hole', ic.x - pxS, py, null, `ic-${ic.id}-pin-${i}`);
            } else {
                create('hole', ic.x - pxS, py, null, `ic-${ic.id}-pin-${i}-a`);
                create('hole', ic.x - pxS - outerPxS, py, null, `ic-${ic.id}-pin-${i}-b`);
            }
        }
        for(let i=ic.pins; i>pinsH; i--) {
            let py = startY + (ic.pins - i)*pyS;
            if (ic.singleHolePins) {
                create('hole', ic.x + pxS, py, null, `ic-${ic.id}-pin-${i}`);
            } else {
                create('hole', ic.x + pxS, py, null, `ic-${ic.id}-pin-${i}-a`);
                create('hole', ic.x + pxS + outerPxS, py, null, `ic-${ic.id}-pin-${i}-b`);
            }
        }
        
        let socket = create('ic-hitbox', ic.x, ic.y, `ic-socket-${ic.id}`);
        socket.dataset.socketId = ic.id; socket.dataset.pins = ic.pins;
        socket.style.width = (geom.icSocketWidth || 3.6) + '%';
        socket.style.height = (pinsH * pyS) + '%';
        socket.setAttribute('title', 'Click to add IC');
    });

    // Breadboard Matrix Generation
    let bb = UI_CONFIG.breadboard;
    let dx = (bb.endX - bb.startX) / (bb.cols - 1);
    let rowSteps = geom.breadboardRowSteps || 16;
    let dy = (bb.endY - bb.startY) / rowSteps;
    const topRailStartX = (typeof bb.topRailStartX === 'number') ? bb.topRailStartX : bb.startX;
    const topRailStartY = (typeof bb.topRailStartY === 'number') ? bb.topRailStartY : bb.startY;
    const topRailEndX = (typeof bb.topRailEndX === 'number') ? bb.topRailEndX : bb.endX;
    const topRailGroup = bb.topRailGroup || 5;
    const topRailBlocksPerSide = bb.topRailBlocksPerSide || 0;
    const topRailMiddleGapSlots = bb.topRailMiddleGapSlots || 2;
    const topRailBlockGapSlots = (typeof bb.topRailBlockGapSlots === 'number') ? bb.topRailBlockGapSlots : 1;

    const renderRailPair = (prefix, startX, startY, endX, group, blocksPerSide, middleGapSlots, blockGapSlots, fallbackHoles, fallbackSlots) => {
        if (blocksPerSide > 0) {
            const slots = (2 * blocksPerSide * group)
                + ((2 * (blocksPerSide - 1)) * blockGapSlots)
                + middleGapSlots;
            const railDx = (endX - startX) / Math.max(1, slots - 1);
            let railIndex = 1;
            let slot = 0;

            for (let side = 0; side < 2; side++) {
                for (let block = 0; block < blocksPerSide; block++) {
                    for (let i = 0; i < group; i++) {
                        const x = startX + slot * railDx;
                        create('hole', x, startY + 0 * dy, null, `rail-${prefix}-vcc-${railIndex}`);
                        create('hole', x, startY + 1 * dy, null, `rail-${prefix}-gnd-${railIndex}`);
                        railIndex++;
                        slot++;
                    }
                    if (block < blocksPerSide - 1) slot += blockGapSlots;
                }
                if (side === 0) slot += middleGapSlots;
            }
            return;
        }

        // Backward-compatible mode: repeating 5 holes then 1 gap pattern.
        const holes = fallbackHoles || 50;
        const slots = fallbackSlots || Math.ceil(holes * (group + 1) / group);
        const railDx = (endX - startX) / Math.max(1, slots - 1);
        let railIndex = 1;

        for (let slot = 0; slot < slots; slot++) {
            const inGap = ((slot + 1) % (group + 1) === 0);
            if (inGap || railIndex > holes) continue;
            const x = startX + slot * railDx;
            create('hole', x, startY + 0 * dy, null, `rail-${prefix}-vcc-${railIndex}`);
            create('hole', x, startY + 1 * dy, null, `rail-${prefix}-gnd-${railIndex}`);
            railIndex++;
        }
    };

    renderRailPair(
        'top',
        topRailStartX,
        topRailStartY,
        topRailEndX,
        topRailGroup,
        topRailBlocksPerSide,
        topRailMiddleGapSlots,
        topRailBlockGapSlots,
        bb.topRailHoles,
        bb.topRailSlots
    );

    const bottomRailStartX = (typeof bb.bottomRailStartX === 'number') ? bb.bottomRailStartX : topRailStartX;
    const bottomRailStartY = (typeof bb.bottomRailStartY === 'number') ? bb.bottomRailStartY : (bb.startY + 15 * dy);
    const bottomRailEndX = (typeof bb.bottomRailEndX === 'number') ? bb.bottomRailEndX : topRailEndX;
    const bottomRailGroup = bb.bottomRailGroup || topRailGroup;
    const bottomRailBlocksPerSide = (typeof bb.bottomRailBlocksPerSide === 'number') ? bb.bottomRailBlocksPerSide : topRailBlocksPerSide;
    const bottomRailMiddleGapSlots = (typeof bb.bottomRailMiddleGapSlots === 'number') ? bb.bottomRailMiddleGapSlots : topRailMiddleGapSlots;
    const bottomRailBlockGapSlots = (typeof bb.bottomRailBlockGapSlots === 'number') ? bb.bottomRailBlockGapSlots : topRailBlockGapSlots;

    renderRailPair(
        'bottom',
        bottomRailStartX,
        bottomRailStartY,
        bottomRailEndX,
        bottomRailGroup,
        bottomRailBlocksPerSide,
        bottomRailMiddleGapSlots,
        bottomRailBlockGapSlots,
        bb.bottomRailHoles || bb.topRailHoles,
        bb.bottomRailSlots || bb.topRailSlots
    );

    for(let col=0; col<bb.cols; col++) {
        let x = bb.startX + col*dx;
        for(let row=0; row<5; row++) create('hole', x, bb.startY + (3+row)*dy, null, `bb-${col+1}-${String.fromCharCode(97+row)}`);
        for(let row=0; row<5; row++) create('hole', x, bb.startY + (9+row)*dy, null, `bb-${col+1}-${String.fromCharCode(102+row)}`);
    }
}
