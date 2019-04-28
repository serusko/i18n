import { TranslationSource } from "../Context";

// -------------------------------------------------------------------------------------------------

const get = (source: TranslationSource, locale: string, debug?: boolean) => (
  key: string
): null | string => {
  let v: null | string = "";
  try {
    v = source && source.hasOwnProperty(key) ? source[key] : null;
  } catch (e) {
    debug &&
      console.error(
        new Error(`I18n: Translation GET failed for ${locale}:${key}`)
      );
    return null;
  }
  debug && console.log(`call translate for: ${key} = "${v}"`);
  return v;
};

// -------------------------------------------------------------------------------------------------

export interface SourceResponseType {
  get: (key: string) => null | string;
}

export interface ResolversType {
  [s: string]: () => Promise<TranslationSource>;
}

export default function sourceFactory(
  resolvers: ResolversType,
  debug?: boolean
): (locale: string) => Promise<SourceResponseType> {
  const sources: { [locale: string]: TranslationSource } = {};

  return function getSource(locale: string): Promise<SourceResponseType> {
    return new Promise((resolve, reject) => {
      if (sources && sources[locale]) {
        resolve({
          get: get(sources[locale], locale, debug)
        });
      } else if (resolvers && resolvers[locale]) {
        resolvers[locale]().then(data => {
          sources[locale] = data;
          debug && console.log(sources);
          resolve({
            get: get(sources[locale], locale, debug)
          });
        });
      } else {
        if (debug) {
          reject(new Error(`Cannot get resolver for ${locale}`));
        }
        resolve({
          get: get(sources[locale], locale)
        });
      }
    });
  };
}
