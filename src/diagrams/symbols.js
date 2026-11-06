// Engineering symbol library. Every symbol is drawn in its own small coordinate space:
// two-terminal parts run from pin (0,0) to pin (80,0), so they can be rotated and placed anywhere.
// paths: SVG path data (fill: true = solid). circles: [cx, cy, r, fill]. texts: upright letters inside the symbol.
export const L = 80;

const two = (name, group, paths, extra = {}) => ({
  name, group, paths, pins: [[0, 0], [L, 0]], box: [-2, -22, L + 2, 22], labelAt: [L / 2, -28], ...extra,
});
const RING = 'M22 0a18 18 0 1 0 36 0a18 18 0 1 0-36 0';
const meter = (name, letter) => two(name, 'Electrical', [{ d: 'M0 0H22M58 0H80' + RING }], { texts: [[40, 0, letter]] });

const GATE_IN2 = { pins: [[-20, -10], [-20, 10], [70, 0]], box: [-20, -22, 70, 22], labelAt: [25, -32], group: 'Logic' };
const GATE_IN1 = { pins: [[-20, 0], [70, 0]], box: [-20, -18, 70, 18], labelAt: [16, -28], group: 'Logic' };
const AND = 'M0-20H25A20 20 0 0 1 25 20H0Z';
const OR = 'M0-20Q30-20 45 0Q30 20 0 20Q9 0 0-20Z';
const XOR_EXTRA = 'M-8-20Q1 0-8 20';

export const SYMBOLS = {
  // ---------- electrical ----------
  resistor: two('Resistor', 'Electrical', [{ d: 'M0 0H20l3.33-8 6.67 16 6.67-16 6.67 16 6.67-16 6.67 16 3.33-8H80' }]),
  capacitor: two('Capacitor', 'Electrical', [{ d: 'M0 0H36M36-16V16M44-16V16M44 0H80' }]),
  inductor: two('Inductor', 'Electrical', [{ d: 'M0 0H16a6 6 0 0 1 12 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0a6 6 0 0 1 12 0H80' }]),
  battery: two('Battery / DC', 'Electrical', [{ d: 'M0 0H34M34-18V18M46-9V9M46 0H80' }], { texts: [[26, -16, '+', 13]] }),
  dcsource: two('DC source', 'Electrical', [{ d: 'M0 0H22M58 0H80' + RING }], { texts: [[30, 0, '+', 14], [50, 0, '−', 14]] }),
  acsource: two('AC source', 'Electrical', [{ d: 'M0 0H22M58 0H80' + RING + 'M29 0q5.5-12 11 0t11 0' }]),
  isource: two('Current source', 'Electrical', [{ d: 'M0 0H22M58 0H80' + RING + 'M30 0H50' }, { d: 'M51 0 44-5V5Z', fill: true }]),
  diode: two('Diode', 'Electrical', [{ d: 'M0 0H28M52 0H80M52-12V12' }, { d: 'M28-12 52 0 28 12Z', fill: true }]),
  zener: two('Zener diode', 'Electrical', [{ d: 'M0 0H28M52 0H80M46-16 52-12V12 58 16' }, { d: 'M28-12 52 0 28 12Z', fill: true }]),
  led: two('LED', 'Electrical', [{ d: 'M0 0H28M52 0H80M52-12V12M44-16 52-26M56-16 64-26' }, { d: 'M28-12 52 0 28 12Z M54-28 50-22 47-25Z M66-28 62-22 59-25Z', fill: true }]),
  switch: two('Switch', 'Electrical', [{ d: 'M0 0H25M27-1 53-16M55 0H80' }], { circles: [[25, 0, 2.5, true], [55, 0, 2.5, true]] }),
  fuse: two('Fuse', 'Electrical', [{ d: 'M0 0H80M24-7H56V7H24Z' }]),
  lamp: two('Lamp', 'Electrical', [{ d: 'M0 0H24M56 0H80M24 0a16 16 0 1 0 32 0a16 16 0 1 0-32 0M28.7-11.3 51.3 11.3M28.7 11.3 51.3-11.3' }]),
  ammeter: meter('Ammeter', 'A'),
  voltmeter: meter('Voltmeter', 'V'),
  galvanometer: meter('Galvanometer', 'G'),
  motor: meter('Motor', 'M'),
  npn: { name: 'NPN transistor', group: 'Electrical', pins: [[0, 0], [40, -40], [40, 40]], box: [-2, -42, 44, 42], labelAt: [50, 0],
    paths: [{ d: 'M0 0H20M20-18V18M20-8 40-24V-40M20 8 40 24V40' }, { d: 'M36 21 27 19 31.5 13.5Z', fill: true }] },
  opamp: { name: 'Op-amp', group: 'Electrical', pins: [[-20, -20], [-20, 20], [120, 0]], box: [-20, -52, 120, 52], labelAt: [50, -62],
    paths: [{ d: 'M0-50V50L100 0Z M-20-20H0M-20 20H0M100 0H120' }], texts: [[12, -20, '−', 16], [12, 20, '+', 16]] },
  ground: { name: 'Ground', group: 'Electrical', pins: [[0, 0]], box: [-16, -2, 16, 28], labelAt: [20, 16], paths: [{ d: 'M0 0V12M-14 12H14M-9 18H9M-4 24H4' }] },
  terminal: { name: 'Terminal', group: 'Electrical', pins: [[0, 0]], box: [-6, -6, 6, 6], labelAt: [12, 0], paths: [], circles: [[0, 0, 4, 'bg']] },
  junction: { name: 'Junction dot', group: 'Electrical', pins: [[0, 0]], box: [-5, -5, 5, 5], labelAt: [10, -10], paths: [], circles: [[0, 0, 3.5, true]] },

  // ---------- mechanical ----------
  pin: { name: 'Pin support', group: 'Mechanical', pins: [[0, 0]], box: [-24, -4, 22, 32], labelAt: [0, 44],
    paths: [{ d: 'M0 0-14 24H14Z M-20 24H20M-16 24l-6 7M-8 24l-6 7M0 24l-6 7M8 24l-6 7M16 24l-6 7' }], circles: [[0, 0, 3, 'bg']] },
  roller: { name: 'Roller support', group: 'Mechanical', pins: [[0, 0]], box: [-24, -4, 22, 38], labelAt: [0, 50],
    paths: [{ d: 'M0 0-14 19H14Z M-20 30H20M-16 30l-6 7M-8 30l-6 7M0 30l-6 7M8 30l-6 7M16 30l-6 7' }], circles: [[-7, 24.5, 4.5, false], [7, 24.5, 4.5, false], [0, 0, 3, 'bg']] },
  fixed: { name: 'Fixed support', group: 'Mechanical', pins: [[0, 0]], box: [-10, -32, 2, 32], labelAt: [-14, -42],
    paths: [{ d: 'M0-30V30M0-30l-8 8M0-20l-8 8M0-10l-8 8M0 0l-8 8M0 10l-8 8M0 20l-8 8' }] },
  hinge: { name: 'Hinge', group: 'Mechanical', pins: [[0, 0]], box: [-6, -6, 6, 6], labelAt: [10, -12], paths: [], circles: [[0, 0, 5, 'bg']] },
  spring: two('Spring', 'Mechanical', [{ d: 'M0 0H15l5-10 10 20 10-20 10 20 10-20 10 20 5-10H80' }]),
  damper: two('Damper', 'Mechanical', [{ d: 'M0 0H34M34-10V10M26-14H54V14H26M54 0H80' }]),
  pulley: { name: 'Pulley', group: 'Mechanical', pins: [[0, 0]], box: [-24, -24, 24, 24], labelAt: [30, -24],
    paths: [{ d: 'M-22 0a22 22 0 1 0 44 0a22 22 0 1 0-44 0' }], circles: [[0, 0, 3, true]] },
  block: { name: 'Block / mass', group: 'Mechanical', pins: [[0, 0]], box: [-30, -20, 30, 20], labelAt: [0, 0], labelInside: true,
    paths: [{ d: 'M-30-20H30V20H-30Z' }] },
  moment: { name: 'Moment (clockwise)', group: 'Mechanical', pins: [[0, 0]], box: [-20, -26, 20, 20], labelAt: [26, -22],
    paths: [{ d: 'M18 0A18 18 0 1 1 0-18' }, { d: 'M7-18-2-24V-12Z', fill: true }], circles: [[0, 0, 2.5, true]] },
  wall: { name: 'Wall / ground', group: 'Mechanical', pins: [[0, 0]], box: [-40, -2, 40, 10], labelAt: [0, 22],
    paths: [{ d: 'M-40 0H40M-36 0l-6 8M-26 0l-6 8M-16 0l-6 8M-6 0l-6 8M4 0l-6 8M14 0l-6 8M24 0l-6 8M34 0l-6 8' }] },

  // ---------- logic ----------
  and: { name: 'AND', ...GATE_IN2, paths: [{ d: 'M-20-10H0M-20 10H0' + AND + 'M45 0H70' }] },
  or: { name: 'OR', ...GATE_IN2, paths: [{ d: 'M-20-10H3M-20 10H3' + OR + 'M45 0H70' }] },
  not: { name: 'NOT', ...GATE_IN1, paths: [{ d: 'M-20 0H0M0-16V16L32 0Z M40 0H70' }], circles: [[36, 0, 4, 'bg']] },
  nand: { name: 'NAND', ...GATE_IN2, paths: [{ d: 'M-20-10H0M-20 10H0' + AND + 'M53 0H70' }], circles: [[49, 0, 4, 'bg']] },
  nor: { name: 'NOR', ...GATE_IN2, paths: [{ d: 'M-20-10H3M-20 10H3' + OR + 'M53 0H70' }], circles: [[49, 0, 4, 'bg']] },
  xor: { name: 'XOR', ...GATE_IN2, paths: [{ d: 'M-20-10H-5M-20 10H-5' + XOR_EXTRA + OR + 'M45 0H70' }] },
  xnor: { name: 'XNOR', ...GATE_IN2, paths: [{ d: 'M-20-10H-5M-20 10H-5' + XOR_EXTRA + OR + 'M53 0H70' }], circles: [[49, 0, 4, 'bg']] },
  buffer: { name: 'Buffer', ...GATE_IN1, paths: [{ d: 'M-20 0H0M0-16V16L32 0Z M32 0H70' }] },
};

export const SYMBOL_GROUPS = ['Electrical', 'Mechanical', 'Logic'];

/** Rotates (and optionally mirrors) a point the same way the symbol is drawn. */
export function transformPt([x, y], rot = 0, mirror = false) {
  const yy = mirror ? -y : y;
  const r = (rot * Math.PI) / 180;
  return [x * Math.cos(r) - yy * Math.sin(r), x * Math.sin(r) + yy * Math.cos(r)];
}

/** World position of pin n of a placed symbol element. */
export function pinPos(el, n) {
  const s = SYMBOLS[el.s];
  const [x, y] = transformPt(s.pins[n], el.rot, el.mirror);
  return [el.x + x, el.y + y];
}
