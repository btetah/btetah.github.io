/**
 * Simulator integration: ensure power rails are energized when power is on.
 */

const fs = require('fs');
const path = require('path');

describe('Simulator power rails', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        global.Components = {
            NUM_LEDS: 0,
            getAllSwitchStates: () => [],
            setLED: () => {},
            setSevenSegment: () => {},
            clearSevenSegments: () => {},
            resetLEDs: () => {}
        };
        global.Breadboard = {
            ROWS: 4,
            getPlacedICs: () => [],
            getWires: () => []
        };
    });

    test('rails default to +5V and GND when power is on', () => {
        const simSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'simulator.js'), 'utf8');
        eval(simSrc);

        Simulator.setPower(true);

        expect(Simulator.probeValue('rail-top-vcc-1')).toBe(1);
        expect(Simulator.probeValue('rail-bottom-vcc-4')).toBe(1);
        expect(Simulator.probeValue('rail-top-gnd-2')).toBe(0);
        expect(Simulator.probeValue('rail-bottom-gnd-3')).toBe(0);
    });
});
