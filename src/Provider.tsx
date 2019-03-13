// @flow

import * as React from 'react';

import Context from './Context';
import { I18nContextValue } from './Context';
import { SourceResponseType } from './tools/sourceFactory';

// -------------------------------------------------------------------------------------------------

export type ProviderProps = {
  source: (locale: string) => Promise<SourceResponseType>;
  watchRegister?: ({}) => void;
  children: React.ReactNode;
  locale?: string;
};

interface KeyRegister {
  [key: string]: string;
}

// -------------------------------------------------------------------------------------------------

export default class Provider extends React.PureComponent<ProviderProps, I18nContextValue> {
  register: KeyRegister = {};
  mounted: boolean = false;

  // // --------------------------------------------------------------------------------------------

  constructor(props: ProviderProps) {
    super(props);
    const isProd = process.env.NODE_ENV === 'production';
    this.state = {
      unregisterKey: isProd ? null : this.unregisterKey.bind(this),
      registerKey: isProd ? null : this.registerKey.bind(this),
      locale: props.locale || 'en',
      match: () => ({}),
      get: () => ''
    };
  }

  // // --------------------------------------------------------------------------------------------

  registerKey = (key: string, def: any): void => {
    this.register[key] = def;
    this.props.watchRegister && this.props.watchRegister({ ...this.register });
  };

  // // --------------------------------------------------------------------------------------------

  unregisterKey = (key: string): void => {
    delete this.register[key];
    this.props.watchRegister && this.props.watchRegister({ ...this.register });
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

  componentDidUpdate(): void {
    if (this.props.locale && this.props.locale !== this.state.locale) {
      this.loadSource(this.props.locale);
    }
  }

  // // --------------------------------------------------------------------------------------------

  loadSource = (locale: string): void => {
    this.props.source &&
      this.props
        .source(locale)
        .then(({ get, match }) => {
          this.mounted && this.setState({ locale, get, match });
        })
        .catch(e => {
          console.error(new Error('I18n: Error loading locale source'));
          console.error(e);
        });
  };

  // // --------------------------------------------------------------------------------------------

  render(): React.ReactNode {
    return <Context.Provider value={this.state}>{this.props.children}</Context.Provider>;
  }
}
