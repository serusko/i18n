/**
 * @class I18En
 */

import * as React from 'react';

import Context from './Context';

// -------------------------------------------------------------------------------------------------

export type EnumValueType = { [key: string]: string };

export interface I18EnRenderComponentProps {
  setLocale: (locale: string) => void;
  value: null | string;
  map: EnumValueType;
  locale: string;
  v: string;
}

declare const RenderComponent: React.ComponentType<I18EnRenderComponentProps>;

export interface I18EnProps {
  render?: (props: I18EnRenderComponentProps) => JSX.Element;
  children?: (props: I18EnRenderComponentProps) => JSX.Element;
  component?: string | typeof RenderComponent;
  v: number | string;
  d: EnumValueType;
  id: string;
}

// -------------------------------------------------------------------------------------------------

export default class I18En extends React.PureComponent<I18EnProps> {
  static contextType = Context;

  render() {
    const { id, d, v, component, render, children, ...rest } = this.props;

    if (!id) {
      throw new Error(`I18n: Missing id for message: "${d}"`);
    }

    const Component: undefined | string | typeof RenderComponent = component;
    const fn: undefined | ((props: I18EnRenderComponentProps) => JSX.Element) =
      render || children || undefined;

    if (typeof v !== 'undefined' && typeof v === 'number' && typeof v !== 'string') {
      throw new Error(`I18n: Invalid enum value for key "${id}"`);
    }

    if (!d || typeof d !== 'object') {
      throw new Error(`I18n: Missing default for key "${id}"`);
    }

    const { getEnum, locale, setLocale } = this.context;

    const map: EnumValueType = getEnum(id, d, rest) || d || {};

    const value = map[v] || null;

    if (Component) {
      return typeof Component === 'string' ? (
        // @ts-ignore
        <Component>{value || d}</Component>
      ) : (
        <Component {...rest} setLocale={setLocale} locale={locale} value={value} v={v} map={map}>
          {value}
        </Component>
      );
    }

    if (typeof fn === 'function') {
      return fn({ ...rest, map, locale, value, v, setLocale });
    }

    return <>{value}</>;
  }
}
