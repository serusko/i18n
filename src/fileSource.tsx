import Logger from './Logger';
import { Locale } from './config';

const MAP = {};

// -------------------------------------------------------------------------------------------------

const get = (locale: Locale) => {
  function getTranslation(key: string): null | string {
    try {
      return MAP[locale] && MAP[locale].hasOwnProperty(key) ? MAP[locale][key] : null;
    } catch (e) {
      Logger.notify(new Error(`Translation GET failed for ${locale}:${key}`));
      return null;
    }
  }

  return getTranslation;
};

// -----------------------------------------------------------------------------------------------
export interface TranslationMap {
  [key: string]: string
}

const match = (locale: Locale) => {
  function searchTranslation(search: string): null | TranslationMap {
    let keys = {};
    Object.keys(MAP[locale]).forEach(key => {
      if (key.startsWith(search)) {
        keys[key] = MAP[locale][key];
      }
    });
    return keys;
  }

  return searchTranslation;
};

// -------------------------------------------------------------------------------------------------

// type MatchFn = (search: string) => TranslationMap;

export interface FileResponse {
  match: (search: string) => null | TranslationMap,
  get: (key: string) => null | string
}

export default function fileSourceFactory(locale: Locale): Promise<FileResponse> {
  return new Promise(resolve => {
    resolve({
      match: match(locale),
      get: get(locale)
    });
  });
}
