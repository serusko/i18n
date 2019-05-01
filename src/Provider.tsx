// @flow

import * as React from 'react';

import { EnumValueType } from './I18En';
import Context, { I18nContextValueType, MessageOptionsType } from './Context';

// -------------------------------------------------------------------------------------------------

export interface SourceResponseType {
  get: (id: string, defaultMessage: string, options: MessageOptionsType) => null | string;
  getEnum: (
    id: string,
    defaultMessage: EnumValueType,
    options: MessageOptionsType
  ) => null | EnumValueType;
}

export interface ProviderProps {
  resolver: (locale: string) => Promise<SourceResponseType>;
  children: React.ReactNode;
  defaultLocale?: string;
}

// -------------------------------------------------------------------------------------------------

export default class Provider extends React.PureComponent<ProviderProps, I18nContextValueType> {
  mounted: boolean = false;

  // // --------------------------------------------------------------------------------------------

  constructor(props: ProviderProps) {
    super(props);

    this.state = {
      locale: props.defaultLocale || 'en',
      setLocale: this.setLocale,
      getEnum: (_, d) => d,
      get: (_, d) => d
    };
  }

  // // --------------------------------------------------------------------------------------------

  render(): JSX.Element {
    const { children } = this.props;
    return <Context.Provider value={this.state}>{children}</Context.Provider>;
  }

  // // --------------------------------------------------------------------------------------------

  setLocale = (locale: string) => {
    if (this.mounted && this.state.locale !== locale) {
      this.loadSource(locale);
    }
  };

  // // --------------------------------------------------------------------------------------------

  componentDidMount(): void {
    this.mounted = true;
    this.loadSource(this.state.locale);
  }

  // // --------------------------------------------------------------------------------------------

  componentWillUnmount(): void {
    this.mounted = false;
  }

  // // --------------------------------------------------------------------------------------------

  loadSource = (locale: string): void => {
    this.props.resolver &&
      this.props
        .resolver(locale)
        .then(({ get, getEnum }) => {
          this.mounted && this.setState({ locale, get, getEnum });
        })
        .catch(e => {
          console.error(new Error('I18n: Error loading locale source'));
          console.error(e);
        });
  };
}
