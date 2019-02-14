import * as React from 'react';

import I18n from './I18n';

export interface TranslationSource {
  [key: string]: string;
}

export interface I18nContextValue {
  toString: (component: React.ReactElement<typeof I18n>) => string;
  match: (search: string) => null | TranslationSource;
  registerKey?: (key: string, value: any) => void;
  unregisterKey?: (key: string) => void;
  get: (key: string) => null | string;
  locale: string;
}

// -------------------------------------------------------------------------------------------------

const defaultContext: I18nContextValue = {
  unregisterKey: undefined,
  registerKey: undefined,
  toString: () => '',
  match: () => null,
  get: () => null,
  locale: 'en'
};

// -------------------------------------------------------------------------------------------------

const Context: React.Context<I18nContextValue> = React.createContext(defaultContext);
const Consumer = Context.Consumer;

export { Consumer };
export default Context;
