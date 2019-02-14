# i18n

> Internationalization helper

[![NPM](https://img.shields.io/npm/v/i18n.svg)](https://www.npmjs.com/package/matushruz/i18n) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

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

import I18n, { Provider } from 'i18n';

class Example extends React.Component {
  render() {
    return <I18n id="id1" d="Hello World!" />;
  }
}
```

## License

MIT © [serus22](https://github.com/serus22)
