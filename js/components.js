/* ============================================
   Components - UI Components for the Simulator
   ============================================ */

// eslint-disable-next-line no-unused-vars
var Components = (function() {
    'use strict';

    var NUM_SWITCHES = 10;
    var NUM_LEDS = 10;

    /**
     * Initialize logic input switches (S0-S9)
     * Each switch has LED indication for both logic high and low
     */
    function initSwitches(container, onToggle) {
        container.innerHTML = '';
        for (var i = 0; i < NUM_SWITCHES; i++) {
            var switchDiv = document.createElement('div');
            switchDiv.className = 'logic-switch';
            switchDiv.innerHTML =
                '<span class="switch-label">S' + i + '</span>' +
                '<div class="switch-led-low on" data-switch-led-low="' + i + '" title="LOW"></div>' +
                '<div class="toggle-switch" data-switch="' + i + '" data-state="off">' +
                    '<div class="toggle-track"><div class="toggle-thumb"></div></div>' +
                '</div>' +
                '<div class="switch-led-high" data-switch-led-high="' + i + '" title="HIGH"></div>' +
                '<span class="switch-state low" data-switch-state="' + i + '">0</span>' +
                '<div class="switch-output-point" data-conn="switch-' + i + '" title="S' + i + ' output"></div>';
            container.appendChild(switchDiv);

            (function(index) {
                var toggle = switchDiv.querySelector('.toggle-switch');
                toggle.addEventListener('click', function() {
                    var newState = toggle.getAttribute('data-state') === 'off' ? 'on' : 'off';
                    toggle.setAttribute('data-state', newState);
                    var stateSpan = document.querySelector('[data-switch-state="' + index + '"]');
                    var outputPoint = switchDiv.querySelector('.switch-output-point');
                    var ledLow = document.querySelector('[data-switch-led-low="' + index + '"]');
                    var ledHigh = document.querySelector('[data-switch-led-high="' + index + '"]');
                    if (newState === 'on') {
                        stateSpan.textContent = '1';
                        stateSpan.className = 'switch-state high';
                        outputPoint.classList.add('high');
                        if (ledHigh) ledHigh.classList.add('on');
                        if (ledLow) ledLow.classList.remove('on');
                    } else {
                        stateSpan.textContent = '0';
                        stateSpan.className = 'switch-state low';
                        outputPoint.classList.remove('high');
                        if (ledHigh) ledHigh.classList.remove('on');
                        if (ledLow) ledLow.classList.add('on');
                    }
                    if (onToggle) {
                        onToggle(index, newState === 'on' ? 1 : 0);
                    }
                });
            })(i);
        }
    }

    /**
     * Initialize logic output LEDs (L0-L7)
     */
    function initLEDs(container) {
        container.innerHTML = '';
        for (var i = 0; i < NUM_LEDS; i++) {
            var ledDiv = document.createElement('div');
            ledDiv.className = 'logic-led';
            ledDiv.innerHTML =
                '<div class="led-input-point" data-conn="led-' + i + '" title="L' + i + ' input"></div>' +
                '<div class="led-indicator" id="led-' + i + '"></div>' +
                '<span class="led-label">L' + i + '</span>' +
                '<span class="led-state low" id="led-state-' + i + '">0</span>';
            container.appendChild(ledDiv);
        }
    }

    /**
     * Set LED state
     */
    function setLED(index, value) {
        var led = document.getElementById('led-' + index);
        var stateEl = document.getElementById('led-state-' + index);
        if (!led || !stateEl) return;

        if (value) {
            led.classList.add('on');
            stateEl.textContent = '1';
            stateEl.className = 'led-state high';
        } else {
            led.classList.remove('on');
            stateEl.textContent = '0';
            stateEl.className = 'led-state low';
        }
    }

    /**
     * Get switch state
     */
    function getSwitchState(index) {
        var toggle = document.querySelector('[data-switch="' + index + '"]');
        if (!toggle) return 0;
        return toggle.getAttribute('data-state') === 'on' ? 1 : 0;
    }

    /**
     * Get all switch states as array
     */
    function getAllSwitchStates() {
        var states = [];
        for (var i = 0; i < NUM_SWITCHES; i++) {
            states.push(getSwitchState(i));
        }
        return states;
    }

    /**
     * Reset all switches to OFF
     */
    function resetSwitches() {
        for (var i = 0; i < NUM_SWITCHES; i++) {
            var toggle = document.querySelector('[data-switch="' + i + '"]');
            if (toggle) {
                toggle.setAttribute('data-state', 'off');
                var stateSpan = document.querySelector('[data-switch-state="' + i + '"]');
                if (stateSpan) {
                    stateSpan.textContent = '0';
                    stateSpan.className = 'switch-state low';
                }
                var outputPoint = toggle.parentElement.querySelector('.switch-output-point');
                if (outputPoint) {
                    outputPoint.classList.remove('high');
                }
            }
        }
    }

    /**
     * Reset all LEDs to OFF
     */
    function resetLEDs() {
        for (var i = 0; i < NUM_LEDS; i++) {
            setLED(i, 0);
        }
    }

    /**
     * Update seven-segment display
     * @param {number} displayIndex - 0 or 1
     * @param {Object} segments - {a,b,c,d,e,f,g,dp} each 0 or 1
     */
    function setSevenSegment(displayIndex, segments) {
        var display = document.getElementById('seg-display-' + displayIndex);
        if (!display) return;

        var segNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
        for (var i = 0; i < segNames.length; i++) {
            var segEl = display.querySelector('[data-seg="' + segNames[i] + '"]');
            if (segEl) {
                if (segments[segNames[i]]) {
                    segEl.classList.add('on');
                } else {
                    segEl.classList.remove('on');
                }
            }
        }
    }

    /**
     * Clear seven-segment displays
     */
    function clearSevenSegments() {
        var blank = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, dp: 0 };
        setSevenSegment(0, blank);
        setSevenSegment(1, blank);
        setSevenSegment(2, blank);
    }

    /**
     * Populate IC library panel
     */
    function initICLibrary(container, onSelect) {
        container.innerHTML = '';
        var icNames = Object.keys(ICLibrary);
        for (var i = 0; i < icNames.length; i++) {
            var ic = ICLibrary[icNames[i]];
            var btn = document.createElement('button');
            btn.className = 'ic-chip-btn';
            btn.setAttribute('data-ic', ic.name);
            btn.innerHTML =
                '<span class="ic-name">' + ic.name + '</span>' +
                '<span class="ic-desc">' + ic.description + '</span>' +
                '<span class="ic-desc">' + ic.pins + '-pin</span>';

            (function(icName) {
                btn.addEventListener('click', function() {
                    if (onSelect) onSelect(icName);
                });
            })(ic.name);

            container.appendChild(btn);
        }
    }

    return {
        NUM_SWITCHES: NUM_SWITCHES,
        NUM_LEDS: NUM_LEDS,
        initSwitches: initSwitches,
        initLEDs: initLEDs,
        setLED: setLED,
        getSwitchState: getSwitchState,
        getAllSwitchStates: getAllSwitchStates,
        resetSwitches: resetSwitches,
        resetLEDs: resetLEDs,
        setSevenSegment: setSevenSegment,
        clearSevenSegments: clearSevenSegments,
        initICLibrary: initICLibrary
    };
})();
