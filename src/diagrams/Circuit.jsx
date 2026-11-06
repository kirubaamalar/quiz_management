// Circuit templates: staff choose a standard circuit and type the values; it is drawn automatically.
// Saved data: { template, p: { R: '10 kΩ', ... } }
import { L } from './symbols';
import { DrawingView } from './Drawing';
import { uid } from '../lib/utils';

const lab = (name, val) => (val && String(val).trim() ? `${name} = ${val}` : name);
const W = (...pts) => ({ id: uid(), t: 'wire', pts });
const S = (s, x, y, label = '', extra = {}) => ({ id: uid(), t: 'sym', s, x, y, rot: 0, label, ...extra });
const dot = (x, y) => S('junction', x, y);
const term = (x, y, label, flip) => S('terminal', x, y, label, flip ? { flip: false, rot: 180 } : {});

/** Places a two-terminal part centred between points a and b, with wires filling the gaps. */
function comp(s, a, b, label = '', extra = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const d = Math.hypot(dx, dy);
  const ux = dx / d, uy = dy / d;
  const gap = Math.max(0, (d - L) / 2);
  const p0 = [Math.round(a[0] + ux * gap), Math.round(a[1] + uy * gap)];
  const p1 = [Math.round(p0[0] + ux * L), Math.round(p0[1] + uy * L)];
  const rot = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
  const out = [];
  if (gap > 0) out.push(W(a, p0));
  out.push(S(s, p0[0], p0[1], label, { rot, ...extra }));
  if (gap > 0) out.push(W(p1, b));
  return out;
}
const src = (kind) => (kind === 'AC' ? 'acsource' : 'battery');

export const CIRCUITS = {
  seriesR: {
    name: 'Resistors in series',
    params: [['V', 'Supply', '12 V'], ['R1', 'R1', '2 Ω'], ['R2', 'R2', '4 Ω'], ['R3', 'R3', '6 Ω']],
    build: (p) => [
      ...comp('battery', [0, 0], [0, 180], lab('V', p.V), { flip: true }),
      ...comp('resistor', [0, 0], [180, 0], lab('R₁', p.R1)),
      ...comp('resistor', [180, 0], [360, 0], lab('R₂', p.R2)),
      ...comp('resistor', [360, 0], [360, 180], lab('R₃', p.R3)),
      W([360, 180], [0, 180]),
    ],
  },
  parallelR: {
    name: 'Resistors in parallel',
    params: [['V', 'Supply', '12 V'], ['R1', 'R1', '6 Ω'], ['R2', 'R2', '3 Ω'], ['R3', 'R3', '2 Ω']],
    build: (p) => [
      ...comp('battery', [0, 0], [0, 160], lab('V', p.V), { flip: true }),
      W([0, 0], [360, 0]), W([0, 160], [360, 160]),
      ...comp('resistor', [120, 0], [120, 160], lab('R₁', p.R1)),
      ...comp('resistor', [240, 0], [240, 160], lab('R₂', p.R2)),
      ...comp('resistor', [360, 0], [360, 160], lab('R₃', p.R3)),
      dot(120, 0), dot(240, 0), dot(120, 160), dot(240, 160),
    ],
  },
  seriesRC: {
    name: 'Series RC circuit',
    params: [['V', 'Supply', '12 V'], ['R', 'R', '10 kΩ'], ['C', 'C', '100 μF'], ['sw', 'Switch', 'yes', ['yes', 'no']]],
    build: (p) => [
      ...comp('battery', [0, 0], [0, 180], lab('Vₛ', p.V), { flip: true }),
      ...(p.sw === 'yes'
        ? [...comp('switch', [0, 0], [120, 0], 'S'), ...comp('resistor', [120, 0], [280, 0], lab('R', p.R))]
        : comp('resistor', [0, 0], [280, 0], lab('R', p.R))),
      ...comp('capacitor', [280, 0], [280, 180], lab('C', p.C)),
      W([280, 180], [0, 180]),
    ],
  },
  seriesRL: {
    name: 'Series RL circuit',
    params: [['V', 'Supply', '24 V'], ['R', 'R', '8 Ω'], ['L', 'L', '0.4 H'], ['sw', 'Switch', 'yes', ['yes', 'no']]],
    build: (p) => [
      ...comp('battery', [0, 0], [0, 180], lab('Vₛ', p.V), { flip: true }),
      ...(p.sw === 'yes'
        ? [...comp('switch', [0, 0], [120, 0], 'S'), ...comp('resistor', [120, 0], [280, 0], lab('R', p.R))]
        : comp('resistor', [0, 0], [280, 0], lab('R', p.R))),
      ...comp('inductor', [280, 0], [280, 180], lab('L', p.L)),
      W([280, 180], [0, 180]),
    ],
  },
  seriesRLC: {
    name: 'Series RLC circuit',
    params: [['src', 'Source', 'AC', ['AC', 'DC']], ['V', 'Supply', '230 V, 50 Hz'], ['R', 'R', '10 Ω'], ['L', 'L', '0.1 H'], ['C', 'C', '100 μF']],
    build: (p) => [
      ...comp(src(p.src), [0, 0], [0, 180], lab('V', p.V), { flip: true }),
      ...comp('resistor', [0, 0], [180, 0], lab('R', p.R)),
      ...comp('inductor', [180, 0], [360, 0], lab('L', p.L)),
      ...comp('capacitor', [360, 0], [360, 180], lab('C', p.C)),
      W([360, 180], [0, 180]),
    ],
  },
  parallelRLC: {
    name: 'Parallel RLC circuit',
    params: [['src', 'Source', 'AC', ['AC', 'DC']], ['V', 'Supply', '230 V'], ['R', 'R', '50 Ω'], ['L', 'L', '0.2 H'], ['C', 'C', '50 μF']],
    build: (p) => [
      ...comp(src(p.src), [0, 0], [0, 160], lab('V', p.V), { flip: true }),
      W([0, 0], [360, 0]), W([0, 160], [360, 160]),
      ...comp('resistor', [120, 0], [120, 160], lab('R', p.R)),
      ...comp('inductor', [240, 0], [240, 160], lab('L', p.L)),
      ...comp('capacitor', [360, 0], [360, 160], lab('C', p.C)),
      dot(120, 0), dot(240, 0), dot(120, 160), dot(240, 160),
    ],
  },
  divider: {
    name: 'Voltage divider',
    params: [['V', 'Vin', '10 V'], ['R1', 'R1', '6 kΩ'], ['R2', 'R2', '4 kΩ']],
    build: (p) => [
      ...comp('battery', [0, 0], [0, 220], lab('Vᵢₙ', p.V), { flip: true }),
      W([0, 0], [180, 0]),
      ...comp('resistor', [180, 0], [180, 110], lab('R₁', p.R1)),
      ...comp('resistor', [180, 110], [180, 220], lab('R₂', p.R2)),
      W([180, 220], [0, 220]), W([180, 110], [300, 110]), W([180, 220], [300, 220]),
      dot(180, 110), dot(180, 220), term(300, 110, 'Vₒᵤₜ'), term(300, 220, ''),
    ],
  },
  wheatstone: {
    name: 'Wheatstone bridge',
    params: [['V', 'Supply', '6 V'], ['P', 'P', '10 Ω'], ['Q', 'Q', '20 Ω'], ['R', 'R', '30 Ω'], ['S', 'S', 'X']],
    build: (p) => [
      ...comp('resistor', [0, 160], [160, 0], lab('P', p.P)),
      ...comp('resistor', [160, 0], [320, 160], lab('Q', p.Q)),
      ...comp('resistor', [0, 160], [160, 320], lab('R', p.R), { flip: true }),
      ...comp('resistor', [160, 320], [320, 160], lab('S', p.S), { flip: true }),
      ...comp('galvanometer', [160, 0], [160, 320]),
      W([0, 160], [0, 400]), W([320, 400], [320, 160]),
      ...comp('battery', [0, 400], [320, 400], lab('V', p.V), { flip: true }),
      dot(160, 0), dot(0, 160), dot(160, 320), dot(320, 160),
    ],
  },
  invertingAmp: {
    name: 'Inverting op-amp amplifier',
    params: [['Rin', 'Rin', '10 kΩ'], ['Rf', 'Rf', '100 kΩ']],
    build: (p) => [
      S('opamp', 0, 0),
      term(-240, -20, 'Vᵢₙ', true),
      ...comp('resistor', [-240, -20], [-80, -20], lab('Rᵢₙ', p.Rin)),
      W([-80, -20], [-20, -20]), W([-80, -20], [-80, -110]),
      ...comp('resistor', [-80, -110], [160, -110], lab('Rf', p.Rf)),
      W([160, -110], [160, 0]), W([120, 0], [240, 0]),
      dot(-80, -20), dot(160, 0), term(240, 0, 'Vₒᵤₜ'),
      W([-20, 20], [-50, 20], [-50, 40]), S('ground', -50, 40),
    ],
  },
  nonInvertingAmp: {
    name: 'Non-inverting op-amp amplifier',
    params: [['R1', 'R1', '10 kΩ'], ['Rf', 'Rf', '40 kΩ']],
    build: (p) => [
      S('opamp', 0, 0, '', { mirror: true }),
      term(-200, -20, 'Vᵢₙ', true), W([-200, -20], [-20, -20]),
      W([-20, 20], [-60, 20], [-60, 90]),
      ...comp('resistor', [-60, 90], [160, 90], lab('Rf', p.Rf), { flip: true }),
      W([160, 90], [160, 0]), W([120, 0], [240, 0]),
      ...comp('resistor', [-60, 90], [-60, 220], lab('R₁', p.R1), { flip: true }),
      S('ground', -60, 220), dot(-60, 90), dot(160, 0), term(240, 0, 'Vₒᵤₜ'),
    ],
  },
  halfWave: {
    name: 'Half-wave rectifier',
    params: [['V', 'Supply', '12 V, 50 Hz'], ['RL', 'Load', '1 kΩ']],
    build: (p) => [
      ...comp('acsource', [0, 0], [0, 180], lab('Vₛ', p.V), { flip: true }),
      ...comp('diode', [0, 0], [220, 0], 'D'),
      ...comp('resistor', [220, 0], [220, 180], lab('Rʟ', p.RL)),
      W([220, 180], [0, 180]),
    ],
  },
  lowPass: {
    name: 'RC low-pass filter',
    params: [['R', 'R', '1 kΩ'], ['C', 'C', '0.1 μF']],
    build: (p) => [
      term(0, 0, 'Vᵢₙ', true), term(0, 160, '', true),
      ...comp('resistor', [0, 0], [180, 0], lab('R', p.R)),
      W([180, 0], [300, 0]), ...comp('capacitor', [180, 0], [180, 160], lab('C', p.C)),
      W([0, 160], [300, 160]), dot(180, 0), dot(180, 160), term(300, 0, 'Vₒᵤₜ'), term(300, 160, ''),
    ],
  },
  highPass: {
    name: 'RC high-pass filter',
    params: [['C', 'C', '0.1 μF'], ['R', 'R', '1 kΩ']],
    build: (p) => [
      term(0, 0, 'Vᵢₙ', true), term(0, 160, '', true),
      ...comp('capacitor', [0, 0], [180, 0], lab('C', p.C)),
      W([180, 0], [300, 0]), ...comp('resistor', [180, 0], [180, 160], lab('R', p.R)),
      W([0, 160], [300, 160]), dot(180, 0), dot(180, 160), term(300, 0, 'Vₒᵤₜ'), term(300, 160, ''),
    ],
  },
};

const defaultsFor = (key) => Object.fromEntries(CIRCUITS[key].params.map(([k, , d]) => [k, d]));
export const circuitDefaults = () => ({ template: 'seriesRC', p: defaultsFor('seriesRC') });
export const buildCircuit = (data) => {
  const t = CIRCUITS[data.template] || CIRCUITS.seriesRC;
  return t.build({ ...defaultsFor(data.template in CIRCUITS ? data.template : 'seriesRC'), ...(data.p || {}) });
};

export function CircuitView({ data }) {
  return <DrawingView data={{ elements: buildCircuit(data) }} />;
}

export function CircuitEditor({ value, onChange, onConvert }) {
  const t = CIRCUITS[value.template] || CIRCUITS.seriesRC;
  const p = { ...defaultsFor(value.template in CIRCUITS ? value.template : 'seriesRC'), ...value.p };
  return (
    <div className="dg-form">
      <div className="field">
        <span className="lbl">Circuit</span>
        <div className="tpl-grid">
          {Object.entries(CIRCUITS).map(([k, c]) => (
            <button key={k} type="button" className={'tpl-btn' + (k === value.template ? ' on' : '')}
              onClick={() => onChange({ template: k, p: defaultsFor(k) })}>{c.name}</button>
          ))}
        </div>
      </div>
      <div className="form-grid">
        {t.params.map(([k, label, , options]) => (
          <div className="field" key={k}>
            <label htmlFor={'cp-' + k}>{label}</label>
            {options ? (
              <select id={'cp-' + k} className="sel" value={p[k]} onChange={(e) => onChange({ ...value, p: { ...p, [k]: e.target.value } })}>
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input id={'cp-' + k} className="inp" value={p[k]} placeholder="Leave empty to show the name only"
                onChange={(e) => onChange({ ...value, p: { ...p, [k]: e.target.value } })} />
            )}
          </div>
        ))}
      </div>
      <p className="hint">Type values with units, for example 10 kΩ or 100 μF. Leave a value empty to show just the name.</p>
      <button type="button" className="btn sm" onClick={() => onConvert('drawing', { elements: buildCircuit(value) })}>
        Customize in the drawing board
      </button>
    </div>
  );
}
