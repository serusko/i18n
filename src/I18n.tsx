/**
 * @class I18n
 */

import * as React from 'react';
// @ts-ignore
import formatMessage from 'format-message';

import Context from './Context';

// -------------------------------------------------------------------------------------------------

export interface I18nRenderComponentProps {
  setLocale: (locale: string) => void;
  defaultMessage: string;
  children: string;
  locale: string;
  value: string;
}

export interface I18nProps {
  render?: (value: string, d: string) => JSX.Element;
  component?: string | typeof RenderComponent;
  children?: typeof RenderComponent;
  id: string;
  d: string; // default message
}

declare const RenderComponent: React.ComponentType<I18nRenderComponentProps>;

// -------------------------------------------------------------------------------------------------

export default class I18n extends React.PureComponent<I18nProps> {
  static contextType = Context;

  render(): JSX.Element {
    const { id, children, d, component, ...rest } = this.props;
    const Component: undefined | string | typeof RenderComponent = component || children;

    const { get, locale, setLocale } = this.context;

    if (!id) {
      throw new Error(`I18n: Missing id`);
    }

    if (!d) {
      throw new Error(`I18n: Missing default for key "${id}"`);
    }

    const value = get(id, d, rest);

    if (Component) {
      return typeof component === 'string' ? (
        // @ts-ignore
        <Component>{value}</Component>
      ) : (
        <Component {...rest} value={value} defaultMessage={d} locale={locale} setLocale={setLocale}>
          {value}
        </Component>
      );
    }

    return value;
  }
}
