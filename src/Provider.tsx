// @flow

import * as React from "react";

import Context from "./Context";
import { I18nContextValue } from "./Context";
import { SourceResponseType } from "./tools/sourceFactory";

// -------------------------------------------------------------------------------------------------

export interface ProviderProps {
  resolver: (locale: string) => Promise<SourceResponseType>;
  setLocale?: (locale: string) => void;
  watchRegister?: ({}) => void;
  children: React.ReactNode;
  defaultLocale?: string;
}

interface KeyRegister {
  [key: string]: string;
}

// -------------------------------------------------------------------------------------------------

export default class Provider extends React.PureComponent<
  ProviderProps,
  I18nContextValue
> {
  register: KeyRegister = {};
  mounted: boolean = false;

  // // --------------------------------------------------------------------------------------------

  constructor(props: ProviderProps) {
    super(props);

    this.state = {
      locale: props.defaultLocale || "en",
      setLocale: props.setLocale || this.setLocale,
      get: () => ""
    };
  }

  setLocale = (locale: string) => {
    this.mounted && this.setState({ locale });
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
    if (
      this.props.defaultLocale &&
      this.props.defaultLocale !== this.state.locale
    ) {
      this.loadSource(this.props.defaultLocale);
    }
  }

  // // --------------------------------------------------------------------------------------------

  loadSource = (locale: string): void => {
    this.props.resolver &&
      this.props
        .resolver(locale)
        .then(({ get }) => {
          this.mounted && this.setState({ locale, get });
        })
        .catch(e => {
          console.error(new Error("I18n: Error loading locale source"));
          console.error(e);
        });
  };

  // // --------------------------------------------------------------------------------------------

  render(): React.ReactNode {
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }
}
