import * as React from 'react';

import format from './_helpers/format';
import Context, { TranslationSource } from './Context';

// -----------------------------------------------------------------------------

export interface I18nProps {
  children?: (val: string, map: null | TranslationSource) => React.ReactNode;
  component?: typeof React.Component;
  d: string | TranslationSource;
  id: string;
  v?: string;
}

// -------------------------------------------------------------------------------------------------

class I18n extends React.PureComponent<I18nProps> {
  static contextType = Context;

  // // --------------------------------------------------------------------------------------------

  render(): React.ReactNode {
    const { id, children, d, v, component, ...options } = this.props;
    const more = options || {};
    const isRenderProps = typeof children === 'function';

    const { get, locale } = this.context;

    const C: undefined | typeof React.Component = component;
    let initial = d;
    let template: string = typeof initial === 'string' ? initial : '';

    if (!id) {
      throw new Error(`I18n: Missing id`);
    }

    if (!initial) {
      throw new Error(`I18n: Missing default for key "${id}"`);
    }

    // Enum
    if (id.endsWith('$')) {
      const enumObj = this.getEnum();
      if (enumObj) {
        template = enumObj.template;
        initial = enumObj.initial;
      }
    } else {
      // Common
      template = get(id) || template || '';
    }

    let value: any = (template && format(template, locale, more)) || '';

    // Render props
    if (isRenderProps && children) {
      return children(value, typeof initial === 'object' ? initial : null);
    }

    // Custom component
    if (C) {
      return <C {...this.props}>{value}</C>;
    }

    return value;
  }

  // // --------------------------------------------------------------------------------------------

  getEnum = (): null | { template: string; initial: TranslationSource } => {
    let { id, d, v } = this.props;

    if (!this.props.id.startsWith('$') && typeof d !== 'object') {
      throw new Error(`I18n: Missing default for Enum key "${id}"`);
    }

    const children = this.props.children;

    if (typeof children !== 'function' && (typeof v === 'undefined' || v === null || v === '')) {
      throw new Error(`I18n: Missing value for Enum key "${id}"`);
    }

    const initial: null | TranslationSource =
      this.context.match(id) || (typeof d === 'object' ? d : null) || null;

    if (initial && v !== null && typeof v !== 'undefined' && initial[v]) {
      return {
        template: initial[v],
        initial
      };
    }
    return null;
  };

  // // --------------------------------------------------------------------------------------------

  componentDidMount(): void {
    const register = this.context.registerKey;
    register && register(this.props.id, this.props.d);
  }

  // // --------------------------------------------------------------------------------------------

  componentWillUnmount(): void {
    const unregister = this.context.unregisterKey;
    unregister && unregister(this.props.id);
  }
}

export default I18n;
