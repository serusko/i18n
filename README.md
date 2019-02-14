# i18n

> Internationalization helper

![](https://img.shields.io/npm/v/@serus/i18n.svg?style=flat)

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[![Build Status](https://travis-ci.com/serus22/i18n.svg?branch=master)](https://travis-ci.com/serus22/i18n)

## Install

```bash
npm install --save i18n
yarn add i18n
```

## Common use

```tsx
import * as React from 'react';

import I18n from 'i18n';

class Example extends React.Component {
  render() {
    return <I18n id="id1" d="Hello World!" />;
  }
}
```

## Lang Provider

```tsx
import * as React from 'react';

import I18n, { Provider as I18nProvider } from 'i18n';

class Example extends React.Component {
  render() {
    return (
      <I18nProvider locale="en">
        <I18n id="id1" d="Hello World!" />
      </I18nProvider>
    );
  }
}
```

## License

MIT © [serus22](https://github.com/serus22)
