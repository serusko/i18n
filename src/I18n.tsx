/**
 * @class I18n
 */

import * as React from "react";

import Context from "./Context";
import format from "./_helpers/format";

export interface RenderComponentProps {
  children: string;
  value: string;
  d: string;
}

declare const RenderComponent: React.ComponentType<RenderComponentProps>;

export interface I18nProps {
  render?: (value: string, d: string) => JSX.Element;
  component?: string | typeof RenderComponent;
  children?: typeof RenderComponent;
  id: string;
  d: string;
}

export default class I18n extends React.Component<I18nProps> {
  static contextType = Context;

  render() {
    const { id, children, d, component, ...options } = this.props;
    const Component: undefined | string | typeof RenderComponent =
      component || children;

    const { get, locale } = this.context;

    if (!id) {
      throw new Error(`I18n: Missing id`);
    }

    if (!d) {
      throw new Error(`I18n: Missing default for key "${id}"`);
    }

    let value: string = typeof d === "string" ? d : "";

    value = get(id) || value || "";

    value = (value && format(value, locale, { locale, ...options })) || "";

    if (Component) {
      return typeof component === "string" ? (
        // @ts-ignore
        <Component>{value}</Component>
      ) : (
        <Component {...this.props} value={value} d={d}>
          {value}
        </Component>
      );
    }

    return value;
  }
}
