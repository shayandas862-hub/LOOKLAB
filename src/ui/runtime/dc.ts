// The base class for ported screens: logic computes `renderVals()`, the generated view renders it (D-LL-014).
import React from 'react';

type View = (vals: unknown) => React.ReactElement;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DCLogic<P = any, S = any> extends React.Component<P, S> {
  static view: View;

  renderVals(): unknown {
    return {};
  }

  render(): React.ReactElement {
    const view = (this.constructor as typeof DCLogic).view;
    return view(this.renderVals());
  }
}
