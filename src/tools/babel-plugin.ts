const jsxPlugin = require('babel-plugin-syntax-jsx');
const fs = require('fs');

// debug database
let KEYMAP = {};
// simple output
let KEYS = {};
// existing unique keys
let count = 0;
// key changed = update output
let changed = false;

// -------------------------------------------------------------------------------------------------

/**
 * options: {
 *   defaultMessages: string | { [string]: string } // json file or map
 *   outputFile: string
 *   debugFile: string
 *   tagName: string
 * }
 */

export interface BabelPluginOptions {
  defaultMessages: null | string | {};
  outputFile: null | string;
  debugFile: null | string;
  saveKeys: null | Boolean;
  tagName: null | string;
}

const defaultOptions: BabelPluginOptions = {
  defaultMessages: null,
  outputFile: null,
  saveKeys: false,
  debugFile: null,
  tagName: null
};

interface TagAttribute {
  name: {
    name: string;
  };
  value: any;
}

export default function I18nBabelPlugin(options: BabelPluginOptions = defaultOptions) {
  // debug output file
  const DEBUG_FILE = options.debugFile;
  // active keys map
  const DEFAULTS_FILE = options.outputFile;
  // tag name
  const JSX_TAG_NAME = options.tagName || 'I18n';

  // source map for building pre-translated app
  let replaceDefault: null | string | {} = null;

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

  // // --------------------------------------------------------------------------------------------

  return function() {
    return {
      inherits: jsxPlugin,
      visitor: {
        JSXElement(path: any, state: any) {
          const tagName = path.node.openingElement.name.name;

          if (tagName === JSX_TAG_NAME) {
            let attrs: any = {};
            path.node.openingElement.attributes.forEach((i: TagAttribute) => {
              if (i.name) {
                attrs[i.name.name] = i.value;
              }
            });

            const id = attrs.id && attrs.id.value;

            if (typeof id !== 'string') {
              throw path.buildCodeFrameError('[React I18n] Key ID must be string');
            }

            const dolars = id.match(/\$/g) || [];
            if (dolars.length > 1) {
              if (dolars.length > 2) {
                throw path.buildCodeFrameError(
                  `[React I18n] Invalid key: max 2 $ chanracters enabled '${id}'`
                );
              } else if (!id.startsWith('$') || !id.endsWith('$')) {
                throw path.buildCodeFrameError(`[React I18n] Invalid key: [a-zA-Z0-9]$ '${id}'`);
              }
            }

            if (!attrs.d) {
              throw path.buildCodeFrameError('[React I18n] Message must have a default value.');
            }

            let file = state.file.opts.filename.replace(
              state.file.opts.root || state.file.opts.sourceRoot,
              ''
            ); // cut off project path

            let computedKey: string = '';

            try {
              computedKey = file
                .replace(/\..*$/, '') // remove file ext
                .replace(/[/\\]/g, '.') // slashes -> dots
                .concat('.' + attrs.id.value) // original ID
                .replace(/^\.+/, '') // dots from start
                .replace(/^src\./, '') // remove src root
                .replace(/((^|\.)[A-Z])/g, (v: string) => v.toLowerCase()) // all words to camelcase so key.LabelName -> key.labelName
                .split('.')
                .filter((i: any, k: number, a: Array<any>) => i !== a[k + 1]) // remove same steps, so pages/A/A.js -> pages.A
                .join('.');
            } catch (e) {
              throw path.buildCodeFrameError(
                '[React I18n] building key failed: ' + e.message || e.code || e
              );
            }

            // log object
            const mapItem = {
              minKey: count.toString(16),
              id: attrs.id.value,
              key: computedKey,
              num: count,
              d: null,
              file
            };

            if (attrs.id.value.endsWith('$')) {
              const props =
                attrs.d && attrs.d.expression && attrs.d.expression.properties
                  ? attrs.d.expression.properties
                  : null;

              if (!props || typeof props !== 'object') {
                throw path.buildCodeFrameError(
                  '[React I18n] Enum default have to be object / map!'
                );
              }

              mapItem.d = props.reduce(
                (obj: {}, it: { key: { name: string }; value: { value: any } }) => {
                  // POTENTIAL BUG - parsing could fail because enum expects Object as default val
                  obj[it.key.name] = it.value.value;
                  KEYS[computedKey + '.' + it.key.name] = it.value.value;
                  count++;
                  return obj;
                },
                {}
              );
            } else {
              KEYS[computedKey] = attrs.d.value;
              mapItem.d = attrs.d.value;
              count++;
            }

            KEYMAP[computedKey] = mapItem;
            attrs.id.value = computedKey;

            // Production build
            if (replaceDefault && replaceDefault[computedKey]) {
              let newDefault = replaceDefault[computedKey];
              // Build Enum defaults
              if (attrs.id.value.endsWith('$')) {
                newDefault = {};
                const keys = Object.keys(replaceDefault);
                for (let i = 0; i <= keys.length; i++) {
                  if (keys[i].startsWith(computedKey)) {
                    let k = keys[i].replace(computedKey + '.', '');
                    newDefault[k] = replaceDefault[k];
                  }
                }
              }

              if (!newDefault) {
                throw path.buildCodeFrameError(
                  `[React I18n] Missing default value to replace '${computedKey}'`
                );
              }

              attrs.d.value = newDefault;
            }
            changed = true;
          }
        }
      },

      post() {
        if (!changed) {
          return; // skip untouched files
        }

        DEBUG_FILE && fs.writeFileSync(DEBUG_FILE, JSON.stringify(KEYMAP, null, 2));

        if (DEFAULTS_FILE) {
          KEYS = Object.keys(KEYS)
            .sort()
            .reduce((map, key) => {
              map[key] = KEYS[key];
              return map;
            }, {});
          DEFAULTS_FILE && fs.writeFileSync(DEFAULTS_FILE, JSON.stringify(KEYS, null, 2));
        }

        changed = false;
      }
    };
  };
}
