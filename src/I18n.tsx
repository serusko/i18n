import * as React from 'react';

import format from './_helpers/format';
import Context, { I18nContextValue, TranslationSource } from './Context';

// -------------------------------------------------------------------------------------------------

export interface RenderComponentProps {
  value: string;
  d: any;
}

declare const RenderComponent: React.ComponentType<RenderComponentProps>;

export interface I18nProps {
  component?: typeof RenderComponent;
  children?: typeof RenderComponent;
  d: string | TranslationSource;
  id: string;
  v?: string;
}

// -------------------------------------------------------------------------------------------------

class I18n extends React.PureComponent<I18nProps> {
  context: I18nContextValue;
  static contextType = Context;

  render(): React.ReactNode {
    const { id, children, d, v, component, ...options } = this.props;
    const Component: undefined | typeof RenderComponent = component || children;
    const more = options || {};
    const isEnum = id.endsWith('$');

    const { get, locale } = this.context;

    let initial = d;
    let value: string = typeof initial === 'string' ? initial : '';

    if (!id) {
      throw new Error(`I18n: Missing id`);
    }

    if (!initial) {
      throw new Error(`I18n: Missing default for key "${id}"`);
    }

    // Enum
    if (isEnum) {
      const enumObj = this.getEnum();
      if (enumObj) {
        value = enumObj.template;
        initial = enumObj.initial;
      }
    } else {
      value = get(id) || value || '';
    }

    value = (value && format(value, locale, more)) || '';

    if (Component) {
      return <Component {...this.props} value={value} d={initial} />;
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

    const found = this.context.match(id) || {};
    const initial: TranslationSource = {
      ...(d !== null && typeof d === 'object' ? d : {}),
      ...found
    };

    if (v !== null && typeof v !== 'undefined') {
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
