import * as React from 'react';

import { EnumValueType } from './I18En';

export interface TranslationSource {
  [key: string]: string;
}

export type MessageOptionsType = { [key: string]: string | number | boolean | null | undefined };

export interface I18nContextValueType {
  get: (id: string, defaultMessage: string, options: MessageOptionsType) => null | string;
  getEnum: (
    id: string,
    defaultEnum: { [key: string]: string },
    options: MessageOptionsType
  ) => EnumValueType | null;
  setLocale: (locale: string) => void;
  locale: string;
}

// -------------------------------------------------------------------------------------------------

const defaultContext: I18nContextValueType = {
  setLocale: () => {},
  getEnum: (_, d) => d,
  get: (_, d) => d,
  locale: 'en'
};

// -------------------------------------------------------------------------------------------------

const Context: React.Context<I18nContextValueType> = React.createContext(defaultContext);

export default Context;
