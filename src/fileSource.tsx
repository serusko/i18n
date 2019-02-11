import Logger from './Logger';

const MAP = {};

// -------------------------------------------------------------------------------------------------

const get = (locale: string) => {
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
  [key: string]: string;
}

const match = (locale: string) => {
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
  match: (search: string) => null | TranslationMap;
  get: (key: string) => null | string;
}

export default function fileSourceFactory(locale: string): Promise<FileResponse> {
  return new Promise(resolve => {
    resolve({
      match: match(locale),
      get: get(locale)
    });
  });
}
