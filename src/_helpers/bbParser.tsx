import * as React from 'react';
import parser, { Tag } from 'bbcode-to-react';

// -----------------------------------------------------------------------------

class BrTag extends Tag {

  SELF_CLOSE: boolean;
  STRIP_OUTER: boolean;

  constructor(renderer: any, settings = {}) {
    super(renderer, settings);
    this.SELF_CLOSE = true;
    this.STRIP_OUTER = true;
  }

  toHTML(): string {
    return '<br />';
  }

  toReact(): React.ReactNode {
    return <br />;
  }
}

parser.registerTag('br', BrTag);

export default parser;