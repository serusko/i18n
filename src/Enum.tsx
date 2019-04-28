/**
 * @class I18n
 */

import * as React from "react";

import Context from "./Context";
import format from "./_helpers/format";

type EnumDefault = { [key: string]: string };

export interface RenderComponentProps {
  setLocale: (locale: string) => void;
  value: null | string;
  locale: string;
  d: EnumDefault;
  v: string;
}

declare const RenderComponent: React.ComponentType<RenderComponentProps>;

export interface EnumProps {
  render?: (value: null | string, d: string) => any;
  component?: typeof RenderComponent;
  children?: typeof RenderComponent;
  v: number | string;
  id: string;
  d: string;
}

export default class EnumComponent extends React.Component<EnumProps> {
  static contextType = Context;

  render() {
    const { id, children, d, v, component, ...options } = this.props;

    if (!id) {
      throw new Error(`I18n: Missing id for message: "${d}"`);
    }

    const Component: undefined | typeof RenderComponent = component || children;

    if (
      typeof v !== "undefined" &&
      typeof v === "number" &&
      typeof v !== "string"
    ) {
      throw new Error(`I18n: Invalid enum value for key "${id}"`);
    }

    if (!d || typeof d !== "object") {
      throw new Error(`I18n: Missing default for key "${id}"`);
    }

    const { get, locale, setLocale } = this.context;

    let value: null | string =
      d !== null && typeof d === "object" ? d[v] : null;

    value = get(id + v) || value || "";

    value = (value && format(value, locale, options)) || "";

    if (Component) {
      return (
        <Component
          setLocale={setLocale}
          locale={locale}
          value={value}
          v={v}
          d={d}
          {...options}
        />
      );
    }

    return value;
  }
}
