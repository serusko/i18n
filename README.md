# i18n

> Internationalization helper

![](https://img.shields.io/npm/v/@serus/i18n.svg?style=flat)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.com/serus22/i18n.svg?branch=master)](https://travis-ci.com/serus22/i18n)
![](https://img.shields.io/npm/dt/@serus/i18n.svg?style=flat)

## Install

```bash
yarn add @serus/i18n
```

## Overview

- [Roadmap](#Roadmap)
- [Usage](#Usage)
  - [Common](#Common-usage)
  - [Render props](#Render-props)
  - [toString](<#I18n.toString()>)
- [Provider](#Context-provider)
- [Translation source](#Translation-source)
- [Enum keys](#Enums)
- [License](#License)

## Roadmap

- initialLocale helper
- todo optimise default translations
- docs
- i18next plugin
- WTI plugin
- PhraseApp plugin
- enable use key context !!TBD

## Usage

This library supports only JSX format (because of context). If you need to have access to string typed value, use `Render props` or `I18n.toString(<I18n ... />)`

### Common usage

```jsx
import * as React from 'react';
import I18n from '@serus/i18n';

class Example extends React.Component {
  render() {
    return <I18n id="id1" d="Hello World!" />;
  }
}
```

### Render props

```jsx
<I18n id="id1" d="Hello World!">
  {placeholder => <input placeholder={placeholder} />}
</I18n>
```

### I18n.toString()

this helper using ReactDOM to stringify component, but for consistent translation we need to have I18nContext available, so:

```jsx
const placeholder = I18n.toString(<I18n id="key1" d="Defaut message" />);
console.log(typeof placeholder); // string
```

## Context provider

Simple react context provider which enables you modularize your translations for each part separately (you neet to keep your current locale on your own, just pass `locale` property to provider)

```jsx
import * as React from 'react';
import I18n, { Provider as I18nProvider } from 'i18n';

class App extends React.Component {
  render() {
    return (
      <I18nProvider locale="en">
        <I18n id="id1" d="Hello World!" />
      </I18nProvider>
    );
  }
}
```

## Translation source

Best practice for internationationalization SPA is to serve translated app (per domain / per client locale accept-language header / ip pool / country / brand / etc. )

This lib supports production build with custom translation replaced right in js files (default localization is available instantly). Babel plugin will replace "default" messages and if user dont change his lang, app is delivered in right language as fast as possible.

In other case, we need to load translation, mostly in async mode because if server dont know which lang shoud be serverd, it will serve all supported languages and this behavior have negative inpact for page load speed.

So as a result internationalization provider expects Promise as source input (dynamic) dependency / code split / using cloud language tool wtc.)

### Common usage

```jsx
  import { Provider, sourceFactory } from 'i18n';

  const sourceMap = {
    // static json
    en: () => Promise.resolve({ key1: 'Val 1' }),
    // use dynamic import a.k.a code split
    sk: () => import('../i18n/sk.json').then(module => module.default)
  }

  const translationSource = sourceFactory(sourceMap);

  <Provider locale="en" source={translationSource}>
```

Each promise will be fired once, and in time when needed.

### Custom

You can implement your own localization resolver, expected interface is map of resolvers for each locale, `get` & `match` so:

```javascript
const enSource = { ke1: 'Translated text' };
const skSource = { key1: 'Prelozeny text' };

{
  en: {
    get: (key: string) => enSource[key];
    match: (search: string) => enSource; // *
  },
  sk: {
    get: (key: string) => skSource[key];
    match: (search: string) => skSource; // *
  }
}
```

\* match exists for [ENUM](#Enums) keys

## Enums

custom feature of this lib is enum key handling. Imagine, if you have some dynamic context like response message which depends on Promise response value, so you can put

```jsx
const result = 'err1'
<I18n
  d={{ done: "Wohoo!", err1: "Oops!", err2: "Yayy!" }}
  id="enumMsg$"
  v={result}
  />
```

those keys `must endsWith $` & `have d defined as object` & `must pass v parameter`

if you use enum keys, `match` resolver will be applied, so you can search any keys by your own rules, or by default,
in case of render props usage, all keys which starts with `%d%$` will be computed into single object by default match handler and passed as second parameter of render props

### Render props

```jsx
<I18n
  d={{ done: "Wohoo!", err1: "Oops!", err2: "Yayy!" }}
  id="enumMsg$"
  v={result}
>
  {(value, object) => <>
    value: {value}
    all values:
    <pre>{JSON.stringify(object, null, 2)}</pre>
  </>}
</i18n>
```

## License

MIT © [serus22](https://github.com/serus22)
