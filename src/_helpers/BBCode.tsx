import * as React from 'react';
import parser from './bbParser';

export type BBCodeProps = { value: string };

export default class BBCode extends React.PureComponent<BBCodeProps> {
  render(): React.ReactNode {
    return parser.toReact(this.props.value);
  }

  static parser = parser;
}
