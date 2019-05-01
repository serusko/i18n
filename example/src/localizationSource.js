import IntlMessageFormat from 'intl-messageformat';

const sources = {
  en: {},
  sk: {
    usage1: 'Najbeznejsie pouzitie - vypisanie statickeho textu',
    locale: { en: 'Anglický', sk: 'Slovenský', cy: 'Velština' },
    usage5: '{locale} - {count} = {count, plural, one {žena} few {ženy} other {žien}}'
  },
  cy: {}
};

window.IntlMessageFormat = IntlMessageFormat;

export default function factory(locale) {
  return getLocale(locale).then(_ => ({
    get: (id, defaultMessage, options) => {
      let message = sources[locale][id] || defaultMessage;
      const msg = new IntlMessageFormat(message, `${locale}-${locale.toUpperCase()}`);

      return msg.format({
        locale,
        ...options
      });
    },
    getEnum: (id, defaultEnum, options) => {
      const messages = (sources[locale] && sources[locale][id]) || defaultEnum;
      return messages
        ? Object.keys(messages).reduce((obj, key) => {
            let message = messages[key];
            obj[key] = new IntlMessageFormat(message, locale).format({ locale, ...options });
            return obj;
          }, {})
        : null;
    }
  }));
}

function getLocale(locale) {
  const msg = new IntlMessageFormat('', `${locale}-${locale.toUpperCase()}`);

  if (msg.resolvedOptions().locale !== locale) {
    return import(`intl-messageformat/dist/locale-data/${locale}`);
  }
  return Promise.resolve();
}
