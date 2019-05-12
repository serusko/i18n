import * as React from 'react';

import I18n, { Provider, I18En } from '@serus/i18n';

import localizationSource from './localizationSource';

// -------------------------------------------------------------------------------------------------

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <Provider defaultLocale="cy" resolver={localizationSource}>
      <div>
        <I18n id="usage1" d="Common usage - print basic text" />
        <I18n d="Using 'component' property = 'h5'" component="h5" id="usage2" />
        <I18n
          d="Using custom 'component' property = \{CustomComponent\}"
          component={CustomComponent}
          id="usage3"
        />
        <p>
          {'You can use variables using curly braces {count} (to print Curly use escape \\),'}
          <br />
          <I18n count={count} d="count = {count}" id="usage4" />
        </p>
        <p>
          <button onClick={dec(setCount)}>-</button> {count}{' '}
          <button onClick={inc(setCount)}>+</button>
        </p>
        <p>
          Intl plural format{' '}
          <a
            href="http://userguide.icu-project.org/formatparse/messages"
            rel="noopener noreferrer"
            target="_blank"
          >
            more...
          </a>
          <br />
          <I18n
            d="{locale} - {count} = {count, plural, zero {no sheeps} one {only one sheep} other {# sheeps}}"
            count={count}
            id="usage5"
          />
        </p>
        <p>
          <I18n
            d="Locale is pre-filled intl format variable: {locale} - {locale, select, sk {Slovak} en {English} cy {Welsh} other{Unknown}}"
            id="usage6"
          />
        </p>
        <I18En d={{ en: 'English', sk: 'Slovak', cy: 'Welsh' }} component={Select} id="locale" />
      </div>
    </Provider>
  );
}

// -------------------------------------------------------------------------------------------------
// Count helpers

function dec(setter) {
  return function() {
    setter(v => Math.max(0, v - 1));
  };
}

function inc(setter) {
  return function() {
    setter(v => v + 1);
  };
}
// -------------------------------------------------------------------------------------------------
// Custom components

function CustomComponent(props) {
  const { d, value } = props;
  return (
    <p>
      {value}
      <br />
      <i>default: {d}</i>
    </p>
  );
}

function Select(props) {
  const { map, locale, setLocale } = props;
  return (
    <select value={locale} onChange={e => setLocale(e.currentTarget.value)}>
      {Object.keys(map).map(key => (
        <option key={key} value={key}>
          {map[key]}
        </option>
      ))}
    </select>
  );
}
