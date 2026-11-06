// All diagram types, in the order they appear in the Diagram Studio tabs.
import { DrawingEditor, DrawingView, drawingDefaults } from './Drawing';
import { CircuitEditor, CircuitView, circuitDefaults } from './Circuit';
import { BeamEditor, BeamView, beamDefaults } from './Beam';
import { TrussEditor, TrussView, trussDefaults } from './Truss';
import { FbdEditor, FbdView, fbdDefaults } from './Fbd';
import { GraphEditor, GraphView, graphDefaults } from './Graph';
import { TableEditor, TableView, tableDefaults } from './Table';
import { FlowEditor, FlowView, flowDefaults } from './Flow';
import { LogicEditor, LogicView, logicDefaults } from './Logic';
import { TimingEditor, TimingView, timingDefaults } from './Timing';
import { ImageEditor, ImageView } from './ImageTab';

export const DIAGRAM_TYPES = [
  { key: 'circuit', label: 'Circuit', icon: '⚡', Editor: CircuitEditor, View: CircuitView, defaults: circuitDefaults, about: 'Pick a standard circuit and type the values.' },
  { key: 'drawing', label: 'Drawing board', icon: '✎', Editor: DrawingEditor, View: DrawingView, defaults: drawingDefaults, about: 'Draw anything with electrical, mechanical and logic symbols.', wide: true },
  { key: 'beam', size: 'l', label: 'Beam', icon: '▬', Editor: BeamEditor, View: BeamView, defaults: beamDefaults, about: 'Supports and loads, drawn to scale with dimensions.' },
  { key: 'truss', size: 'l', label: 'Truss', icon: '△', Editor: TrussEditor, View: TrussView, defaults: trussDefaults, about: 'Generate a truss, then set supports and joint loads.' },
  { key: 'fbd', label: 'Free body', icon: '↘', Editor: FbdEditor, View: FbdView, defaults: fbdDefaults, about: 'Blocks on inclines and floors, hanging masses, with forces.' },
  { key: 'graph', size: 'l', label: 'Graph', icon: '📈', Editor: GraphEditor, View: GraphView, defaults: graphDefaults, about: 'Plot equations and readings.' },
  { key: 'table', label: 'Table', icon: '▦', Editor: TableEditor, View: TableView, defaults: tableDefaults, about: 'Data tables and automatic truth tables.' },
  { key: 'flow', size: 'l', label: 'Flowchart', icon: '⬦', Editor: FlowEditor, View: FlowView, defaults: flowDefaults, about: 'Flowcharts and block diagrams from steps.' },
  { key: 'logic', label: 'Logic gates', icon: '⊃', Editor: LogicEditor, View: LogicView, defaults: logicDefaults, about: 'Type a Boolean expression and the gate circuit is drawn.' },
  { key: 'timing', size: 'l', label: 'Timing', icon: '⎍', Editor: TimingEditor, View: TimingView, defaults: timingDefaults, about: 'Clock and signal timing diagrams.' },
  { key: 'image', label: 'Image', icon: '🖼', Editor: ImageEditor, View: ImageView, defaults: () => ({ src: '' }), about: 'Upload a photo or scan (compressed automatically).' },
];

export const TYPE_MAP = Object.fromEntries(DIAGRAM_TYPES.map((t) => [t.key, t]));

/** Old saved images are { src, size, caption } with no type. */
export const figType = (fig) => (fig && fig.type && TYPE_MAP[fig.type] ? fig.type : 'image');
export const figData = (fig) => (figType(fig) === 'image' ? { src: fig?.src || fig?.data?.src || '' } : fig.data);
