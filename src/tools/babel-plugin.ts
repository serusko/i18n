const jsxPlugin = require('babel-plugin-syntax-jsx');
const fs = require('fs');

let KEYMAP = {};
let KEYS = {};
let count = 0;
let changed = false;
let replaceDefault: null | string | {} = null;

// -------------------------------------------------------------------------------------------------

export interface BabelPluginOptions {
  defaultMessages?: string | {}; // replace defaults
  outputFile?: string;
  debugFile?: string;
  saveKeys?: boolean;
  minify?: boolean;
}

const defaultOptions: BabelPluginOptions = {
  defaultMessages: undefined,
  outputFile: undefined,
  debugFile: undefined,
  saveKeys: false,
  minify: false
};

interface TagAttribute {
  name: {
    name: string;
  };
  value: any;
}

// -------------------------------------------------------------------------------------------------

export default function I18nBabelPlugin(options: BabelPluginOptions = defaultOptions) {
  if (options.defaultMessages) {
    if (typeof options.defaultMessages === 'string') {
      try {
        replaceDefault = require(options.defaultMessages);
      } catch (e) {
        throw new Error(
          `[React I18n] Loading default messages failed '${options.defaultMessages}'`
        );
      }
    } else {
      replaceDefault = options.defaultMessages;
    }
  }

  const config = {
    // debug output file
    DEBUG_FILE: options.debugFile,
    // active keys map
    EXPORT_FILE: options.outputFile,
    // use minified keys
    MINIFY_KEYS: options.minify
  };

  // // --------------------------------------------------------------------------------------------

  return function() {
    return {
      inherits: jsxPlugin,

      // // // -------------------------------------------------------------------------------------

      visitor: {
        JSXElement(path: any, state: any) {
          const tagName = path.node.openingElement.name.name;

          if (tagName === 'I18n' || tagName === 'I18En') {
            processI18nTag(path, state, config);
          }
        }
      },

      // // // -------------------------------------------------------------------------------------

      post() {
        if (!changed) {
          return; // skip untouched files
        }

        config.DEBUG_FILE && fs.writeFileSync(config.DEBUG_FILE, JSON.stringify(KEYMAP, null, 2));

        if (config.EXPORT_FILE) {
          KEYS = Object.keys(KEYS)
            .sort()
            .reduce((map, key) => {
              map[key] = KEYS[key];
              return map;
            }, {});
          config.EXPORT_FILE && fs.writeFileSync(config.EXPORT_FILE, JSON.stringify(KEYS, null, 2));
        }

        changed = false;
      }
    };
  };
}

// -------------------------------------------------------------------------------------------------

function processI18nTag(path: any, state: any, config: any) {
  const tagName = path.node.openingElement.name.name;
  const isEnum = tagName === 'I18En';
  const attrs: any = {};

  // read attributes
  path.node.openingElement.attributes.forEach((i: TagAttribute) => {
    if (i.name) {
      attrs[i.name.name] = i.value;
    }
  });

  const id = attrs.id.value;

  if (typeof id !== 'string') {
    throw path.buildCodeFrameError('[React I18n] key id is required');
  }

  // get default id suffix
  let currentKey: string = '';
  let filePath: string = '';

  try {
    filePath = state.file.opts.filename.replace(
      state.file.opts.root || state.file.opts.sourceRoot, // babel version
      ''
    );
    currentKey = createKey(filePath, id);
  } catch (e) {
    throw path.buildCodeFrameError('[React I18n] building key failed: ' + e.message || e.code || e);
  }

  // if (KEYS.hasOwnProperty(currentKey)) {
  //   throw path.buildCodeFrameError(
  //     `[React I18n] Key: "${currentKey}" is already declared`
  //   );
  // }

  if (!attrs.d) {
    throw path.buildCodeFrameError('[React I18n] Message must have a default value.');
  }

  // log object
  const mapItem = {
    file: filePath,
    id,
    key: currentKey,
    minKey: count.toString(16),
    num: count,
    d: null
  };

  // enum has to have default object literal
  if (isEnum) {
    const enumMap =
      attrs.d && attrs.d.expression && attrs.d.expression.properties
        ? attrs.d.expression.properties
        : null;

    mapItem.d = enumMap.reduce(
      (obj: {}, it: { key: { name: string }; value: { value: any } }) => ({
        obj,
        [it.key.name]: it.value.value
      }),
      {}
    );
  } else {
    mapItem.d = attrs.d.value;
  }

  // save current key
  KEYS[currentKey] = attrs.d.value;

  // save debug output
  KEYMAP[currentKey] = mapItem;

  // replace id
  attrs.id.value = '' + (config.MINIFY_KEYS ? mapItem.minKey : currentKey);

  // inc number of keys
  count++;

  // Production build
  if (replaceDefault) {
    let newDefault = undefined;
    if (replaceDefault[currentKey]) {
      newDefault = replaceDefault[currentKey];
    }
    attrs.d.value = newDefault;
  }
  changed = true;
}

// -------------------------------------------------------------------------------------------------

function createKey(filePath: string, id: string) {
  return filePath
    .replace(/\..*$/, '') // remove file ext
    .replace(/[/\\]/g, '.') // slashes -> dots
    .concat('.' + id) // original ID
    .replace(/^\.+/, '') // dots from start
    .replace(/^src\./, '') // remove src root -- TODO: root folder
    .replace(/((^|\.)[A-Z])/g, (v: string) => v.toLowerCase()) // all words to camelcase so key.LabelName -> key.labelName
    .split('.')
    .filter((i: any, k: number, a: Array<any>) => i !== a[k + 1]) // remove same steps, so pages/A/A.js -> pages.A
    .join('.');
}
