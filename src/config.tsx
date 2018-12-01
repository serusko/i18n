
const SUPPORTED_LOCALES: Array<string> = (
  (process.env.REACT_APP_DEFAULT_LANGUAGE || 'en') +
  ',' +
  (process.env.REACT_APP_SUPPORTED_LANGUAGES || '')
)
  .toLowerCase()
  .split(',')
  .filter((l, k, a) => a.indexOf(l) === k);

const LOCALES_MAP = { en: 'en' };

SUPPORTED_LOCALES.forEach(locale => {
  LOCALES_MAP[locale] = locale;
});

export enum Locale {
  sk = 'sk',
  en = 'en'  
};

const DEFAULT_LOCALE: Locale = process.env.REACT_APP_DEFAULT_LANGUAGE
  ? LOCALES_MAP[process.env.REACT_APP_DEFAULT_LANGUAGE] || LOCALES_MAP.en
  : LOCALES_MAP.en;

export default {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALES_MAP
};
