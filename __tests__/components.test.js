/**
 * Tests for Components module - UI components for the DTK02 simulator
 */

const fs = require('fs');
const path = require('path');

// Load IC library first (dependency)
const icLibSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'ic-library.js'), 'utf8');
eval(icLibSrc);

// Load Components
const componentsSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'components.js'), 'utf8');
eval(componentsSrc);

describe('Components', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="switches-container"></div>
            <div id="leds-container"></div>
            <div id="ic-library"></div>
            <div class="seven-seg-display" id="seg-display-0">
                <svg viewBox="0 0 60 100" class="seg-svg">
                    <polygon data-seg="a" class="segment"/>
                    <polygon data-seg="b" class="segment"/>
                    <polygon data-seg="c" class="segment"/>
                    <polygon data-seg="d" class="segment"/>
                    <polygon data-seg="e" class="segment"/>
                    <polygon data-seg="f" class="segment"/>
                    <polygon data-seg="g" class="segment"/>
                    <circle data-seg="dp" class="segment"/>
                </svg>
            </div>
            <div class="seven-seg-display" id="seg-display-1">
                <svg viewBox="0 0 60 100" class="seg-svg">
                    <polygon data-seg="a" class="segment"/>
                    <polygon data-seg="b" class="segment"/>
                    <polygon data-seg="c" class="segment"/>
                    <polygon data-seg="d" class="segment"/>
                    <polygon data-seg="e" class="segment"/>
                    <polygon data-seg="f" class="segment"/>
                    <polygon data-seg="g" class="segment"/>
                    <circle data-seg="dp" class="segment"/>
                </svg>
            </div>
            <div class="seven-seg-display" id="seg-display-2">
                <svg viewBox="0 0 60 100" class="seg-svg">
                    <polygon data-seg="a" class="segment"/>
                    <polygon data-seg="b" class="segment"/>
                    <polygon data-seg="c" class="segment"/>
                    <polygon data-seg="d" class="segment"/>
                    <polygon data-seg="e" class="segment"/>
                    <polygon data-seg="f" class="segment"/>
                    <polygon data-seg="g" class="segment"/>
                    <circle data-seg="dp" class="segment"/>
                </svg>
            </div>
        `;
    });

    describe('initSwitches', () => {
        test('should create 10 logic switches', () => {
            const container = document.getElementById('switches-container');
            Components.initSwitches(container, function() {});
            const switches = container.querySelectorAll('.logic-switch');
            expect(switches.length).toBe(10);
        });

        test('switches should start in OFF state', () => {
            const container = document.getElementById('switches-container');
            Components.initSwitches(container, function() {});
            for (let i = 0; i < 10; i++) {
                expect(Components.getSwitchState(i)).toBe(0);
            }
        });

        test('should toggle switch on click', () => {
            const container = document.getElementById('switches-container');
            let lastToggle = null;
            Components.initSwitches(container, function(index, value) {
                lastToggle = { index, value };
            });

            const toggle = document.querySelector('[data-switch="0"]');
            toggle.click();
            expect(Components.getSwitchState(0)).toBe(1);
            expect(lastToggle).toEqual({ index: 0, value: 1 });

            toggle.click();
            expect(Components.getSwitchState(0)).toBe(0);
            expect(lastToggle).toEqual({ index: 0, value: 0 });
        });

        test('should show HIGH LED when switch is ON', () => {
            const container = document.getElementById('switches-container');
            Components.initSwitches(container, function() {});
            const toggle = document.querySelector('[data-switch="0"]');
            toggle.click();
            const ledHigh = document.querySelector('[data-switch-led-high="0"]');
            const ledLow = document.querySelector('[data-switch-led-low="0"]');
            expect(ledHigh.classList.contains('on')).toBe(true);
            expect(ledLow.classList.contains('on')).toBe(false);
        });

        test('should show LOW LED when switch is OFF', () => {
            const container = document.getElementById('switches-container');
            Components.initSwitches(container, function() {});
            const ledLow = document.querySelector('[data-switch-led-low="0"]');
            expect(ledLow.classList.contains('on')).toBe(true);
        });
    });

    describe('initLEDs', () => {
        test('should create 10 LEDs', () => {
            const container = document.getElementById('leds-container');
            Components.initLEDs(container);
            const leds = container.querySelectorAll('.logic-led');
            expect(leds.length).toBe(10);
        });

        test('should set LED on and off', () => {
            const container = document.getElementById('leds-container');
            Components.initLEDs(container);

            Components.setLED(0, 1);
            expect(document.getElementById('led-0').classList.contains('on')).toBe(true);
            expect(document.getElementById('led-state-0').textContent).toBe('1');

            Components.setLED(0, 0);
            expect(document.getElementById('led-0').classList.contains('on')).toBe(false);
            expect(document.getElementById('led-state-0').textContent).toBe('0');
        });
    });

    describe('getAllSwitchStates', () => {
        test('should return array of 10 values', () => {
            const container = document.getElementById('switches-container');
            Components.initSwitches(container, function() {});
            const states = Components.getAllSwitchStates();
            expect(states.length).toBe(10);
            expect(states.every(s => s === 0)).toBe(true);
        });
    });

    describe('resetSwitches', () => {
        test('should reset all switches to OFF', () => {
            const container = document.getElementById('switches-container');
            Components.initSwitches(container, function() {});

            // Turn on some switches
            document.querySelector('[data-switch="0"]').click();
            document.querySelector('[data-switch="3"]').click();
            expect(Components.getSwitchState(0)).toBe(1);
            expect(Components.getSwitchState(3)).toBe(1);

            Components.resetSwitches();
            expect(Components.getSwitchState(0)).toBe(0);
            expect(Components.getSwitchState(3)).toBe(0);
        });
    });

    describe('resetLEDs', () => {
        test('should turn off all LEDs', () => {
            const container = document.getElementById('leds-container');
            Components.initLEDs(container);

            Components.setLED(0, 1);
            Components.setLED(5, 1);
            Components.resetLEDs();

            expect(document.getElementById('led-0').classList.contains('on')).toBe(false);
            expect(document.getElementById('led-5').classList.contains('on')).toBe(false);
        });
    });

    describe('setSevenSegment', () => {
        test('should turn on segments', () => {
            // Display digit 1 (segments b, c ON)
            Components.setSevenSegment(0, {a:0, b:1, c:1, d:0, e:0, f:0, g:0, dp:0});
            const display = document.getElementById('seg-display-0');
            expect(display.querySelector('[data-seg="b"]').classList.contains('on')).toBe(true);
            expect(display.querySelector('[data-seg="c"]').classList.contains('on')).toBe(true);
            expect(display.querySelector('[data-seg="a"]').classList.contains('on')).toBe(false);
        });

        test('should clear all segments', () => {
            Components.setSevenSegment(0, {a:1, b:1, c:1, d:1, e:1, f:1, g:1, dp:1});
            Components.clearSevenSegments();
            const display = document.getElementById('seg-display-0');
            expect(display.querySelector('[data-seg="a"]').classList.contains('on')).toBe(false);
            expect(display.querySelector('[data-seg="g"]').classList.contains('on')).toBe(false);
        });
    });

    describe('initICLibrary', () => {
        test('should create buttons for all ICs', () => {
            const container = document.getElementById('ic-library');
            Components.initICLibrary(container, function() {});
            const buttons = container.querySelectorAll('.ic-chip-btn');
            expect(buttons.length).toBe(Object.keys(ICLibrary).length);
        });

        test('should call onSelect when IC button clicked', () => {
            const container = document.getElementById('ic-library');
            let selectedIC = null;
            Components.initICLibrary(container, function(icName) {
                selectedIC = icName;
            });

            const firstBtn = container.querySelector('.ic-chip-btn');
            firstBtn.click();
            expect(selectedIC).toBeTruthy();
        });
    });
});
