import * as React from "react";

export interface TranslationSource {
  [key: string]: string;
}

export interface I18nContextValue {
  get: (key: string) => null | string;
  setLocale: (locale: string) => void;
  locale: string;
}

// -------------------------------------------------------------------------------------------------

const defaultContext: I18nContextValue = {
  setLocale: () => undefined,
  get: () => null,
  locale: "en"
};

// -------------------------------------------------------------------------------------------------

const Context: React.Context<I18nContextValue> = React.createContext(
  defaultContext
);
export default Context;
