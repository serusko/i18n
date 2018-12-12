// @flow

import * as React from 'react';
import * as ReactDOMServer from "react-dom/server";

import config from './config';
import Logger from './Logger';
import { Locale } from './config';
import I18n, { I18nContext } from './I18n';
import { TranslationMap, FileResponse } from './fileSource';

// -------------------------------------------------------------------------------------------------

export type I18nProviderProps = {
  source: (locale: Locale) => Promise<FileResponse>,
  watchRegister?: ({}) => void,
  children: React.ReactNode,
  locale?: Locale
};

interface KeyRegister {
  [key: string]: string
}

// -------------------------------------------------------------------------------------------------

const defaultMatch = (search: string) => {
  return search ? {} : null;
}

const defaultGet = (key: string) => {
  return key ? null : '';
}


export interface I18nContextValue {
  toString: (component: React.ReactElement<typeof I18n>) => string,
  match: (search: string) => null | TranslationMap,
  registerKey: (key: string, value: any) => void,
  unregisterKey: (key: string) => void,
  get: (key: string) => null | string,
  locale: Locale
};

// -------------------------------------------------------------------------------------------------ya

export default class I18nProvider extends React.PureComponent<
  I18nProviderProps,
  I18nContextValue
> {
  register: KeyRegister = {};
  mounted: boolean = false;

  // // --------------------------------------------------------------------------------------------

  constructor(props: I18nProviderProps) {
    super(props);
    this.state = {
      locale: props.locale || config.DEFAULT_LOCALE,
      unregisterKey: this.unregisterKey.bind(this),
      registerKey: this.registerKey.bind(this),
      toString: this.renderToString.bind(this),
      match: defaultMatch,
      get: defaultGet
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

  renderToString = (component: React.ReactElement<typeof I18n>): string => {
    try {
      return ReactDOMServer.renderToString(
        <I18nContext.Provider value={this.state}>{component}</I18nContext.Provider>
      );
    } catch (e) {
      Logger.notify(e);
      return '';
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

  componentDidUpdate(): void {
    if (this.props.locale && this.props.locale !== this.state.locale) {
      this.loadSource(this.props.locale);
    }
  }

  // // --------------------------------------------------------------------------------------------

  loadSource = (locale: Locale): void => {
    this.props.source && 
    this.props.source(locale)
      .then(({ get, match }) => {
        this.mounted && this.setState({ locale, get, match });
      })
      .catch(() => {
        Logger.notify(new Error('Error loading locale source'));
      });
  };

  // // --------------------------------------------------------------------------------------------

  render(): React.ReactNode {
    return <I18nContext.Provider value={this.state}>{this.props.children}</I18nContext.Provider>;
  }
}

export { I18nContext };
