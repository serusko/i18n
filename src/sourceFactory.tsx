import { TranslationSource } from './Context';

// -------------------------------------------------------------------------------------------------

const get = (MAP: TranslationSource, locale: string) => (key: string): null | string => {
  try {
    return MAP[locale] && MAP[locale].hasOwnProperty(key) ? MAP[locale][key] : null;
  } catch (e) {
    console.error(new Error(`I18n: Translation GET failed for ${locale}:${key}`));
    return null;
  }
};

const match = (MAP: TranslationSource, locale: string) => (
  search: string
): null | TranslationSource => {
  let keys = {};
  Object.keys(MAP[locale]).forEach(key => {
    if (key.startsWith(search)) {
      keys[key] = MAP[locale][key];
    }
  });
  return keys;
};

// -------------------------------------------------------------------------------------------------

export interface SourceResponseType {
  match: (search: string) => null | TranslationSource;
  get: (key: string) => null | string;
}

export interface ResolversType {
  [s: string]: () => Promise<TranslationSource>;
}

export default function sourceFactory(
  resolvers: ResolversType
): (locale: string) => Promise<SourceResponseType> {
  const sources: { [locale: string]: TranslationSource } = {};

  return function getSource(locale: string): Promise<SourceResponseType> {
    return new Promise((resolve, reject) => {
      if (sources && sources[locale]) {
        resolve({
          match: match(sources[locale], locale),
          get: get(sources[locale], locale)
        });
      } else if (resolvers && resolvers[locale]) {
        resolvers[locale]().then(data => {
          sources[locale] = data;
          resolve({
            match: match(sources[locale], locale),
            get: get(sources[locale], locale)
          });
        });
      } else {
        reject(new Error(`Cannot get resolver for ${locale}`));
      }
    });
  };
}
