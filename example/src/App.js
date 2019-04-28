import * as React from "react";

import I18n, { Provider, Enum } from "@serus/i18n";

export default function App(): JSX.Element {
  return (
    <Provider defaultLocale="sk" source>
      <div>
        <I18n id="usage1" d="Common usage - print basic text" />

        <I18n
          d="Using 'component' property = 'h5'"
          component="h5"
          id="usage2"
        />

        <I18n
          d="Using custom 'component' property = {CustomComponent}"
          component={CustomComponent}
          id="usage3"
        />

        <p>
          {
            "You can use variables using curly braces {count} (to print Curly use escape \\),"
          }
          <br />
          <I18n
            count={(Math.random() * 10) | 0}
            d="count = {count}"
            id="usage4"
          />
        </p>
        <p>
          <I18n
            d="Locale is pre-filled intl format variable: {locale} - {locale, select, sk {Slovak} en {English} other{Unknown}}"
            id="usage5"
          />
        </p>

        <Enum
          d={{ en: "English", sk: "Slovak" }}
          component={Select}
          id="locale"
          v="foo"
        />
      </div>
    </Provider>
  );
}

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
  return (
    <select
      value={props.locale}
      onChange={e => props.setLocale(e.currentTarget.value)}
    >
      {Object.keys(props.d).map(key => (
        <option key={key} value={key}>
          {props.d[key]}
        </option>
      ))}
    </select>
  );
}
