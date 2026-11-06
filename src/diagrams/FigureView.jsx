// Shows any saved figure: an uploaded image or a drawn diagram.
import { Component } from 'react';
import { TYPE_MAP, figData, figType } from './registry';

class Boundary extends Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  componentDidUpdate(prev) { if (prev.fig !== this.props.fig && this.state.err) this.setState({ err: false }); }
  render() { return this.state.err ? <div className="dg-error">This diagram could not be drawn.</div> : this.props.children; }
}

export default function FigureView({ fig }) {
  if (!fig) return null;
  const type = figType(fig);
  const { View } = TYPE_MAP[type];
  return (
    <Boundary fig={fig}>
      <div className={'figv figv-' + type}><View data={figData(fig)} /></div>
    </Boundary>
  );
}
