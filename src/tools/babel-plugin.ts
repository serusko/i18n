const jsxPlugin = require('babel-plugin-syntax-jsx');
const path = require('path');
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

export default function I18nBabelPlugin(options: BabelPluginOptions = defaultOptions) {
  // debug output file
  const KEYMAP_FILE = options.debugFile;
  // active keys map
  const KEYS_FILE = options.outputFile;
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

  fs.writeFileSync(
    path.resolve(__dirname, 'replaces.json'),
    JSON.stringify(replaceDefault, null, 2)
  );

  // // --------------------------------------------------------------------------------------------

  return function() {
    return {
      inherits: jsxPlugin,

      // work done - save outputs
      post() {
        if (!changed) {
          return; // skip untouched files
        }

        if (options.saveKeys) {
          KEYS = Object.keys(KEYS)
            .sort()
            .reduce((map, key) => {
              map[key] = KEYS[key];
              return map;
            }, {});
          KEYS_FILE && fs.writeFileSync(KEYS_FILE, JSON.stringify(KEYS, null, 2));
          KEYMAP_FILE && fs.writeFileSync(KEYMAP_FILE, JSON.stringify(KEYMAP, null, 2));
        }

        changed = false;
      },

      visitor: {
        // @ts-ignore
        JSXElement(path, state) {
          if (path.node.openingElement.name.name === JSX_TAG_NAME) {
            let attrs: any = {};
            // @ts-ignore
            path.node.openingElement.attributes.forEach(i => {
              if (i.name) {
                attrs[i.name.name] = i.value;
              }
            });

            // @ts-ignore
            if (typeof attrs.id.value !== 'string') {
              throw path.buildCodeFrameError('[React I18n] Key ID must be string');
            }

            // @ts-ignore
            const dolars = attrs.id.value.match(/\$/g) || [];
            if (dolars.length > 1) {
              if (dolars.length > 2) {
                throw path.buildCodeFrameError(
                  // @ts-ignore
                  `[React I18n] Invalid key: max 2 $ chanracters enabled '${attrs.id.value}'`
                );
                // @ts-ignore
              } else if (!attrs.id.value.startsWith('$') || !attrs.id.value.endsWith('$')) {
                throw path.buildCodeFrameError(
                  `[React I18n] Invalid key: $ enabled as terminal character only '${
                    // @ts-ignore
                    attrs.id.value
                  }'`
                );
              }
            }

            // detect reused keys = not declared at moment
            // @ts-ignore
            if (attrs.id.value.startsWith('$')) {
              // @ts-ignore
              if (attrs.d) {
                throw path.buildCodeFrameError(
                  '[React I18n] Reused key cannot redeclare default value'
                );
              }
            } else {
              // @ts-ignore
              if (!attrs.d) {
                throw path.buildCodeFrameError('[React I18n] Message must have a default value.');
              }

              let file = state.file.opts.filename.replace(
                state.file.opts.root || state.file.opts.sourceRoot,
                ''
              ); // cut off project path

              let val = file;

              try {
                val = file
                  .replace(/\..*$/, '') // remove file ext
                  .replace(/[/\\]/g, '.') // slashes -> dots
                  // @ts-ignore
                  .concat('.' + attrs.id.value) // original ID
                  .replace(/^\.+/, '') // dots from start
                  .replace(/^src\./, '') // remove src root
                  // @ts-ignore
                  .replace(/((^|\.)[A-Z])/g, v => v.toLowerCase()) // all words to camelcase so key.LabelName -> key.labelName
                  .split('.')
                  // @ts-ignore
                  .filter((i, k, a) => i !== a[k + 1]) // remove same steps, so pages/A/A.js -> pages.A
                  .join('.');
              } catch (e) {
                throw path.buildCodeFrameError(
                  '[React I18n] building key failed: ' + e.message || e.code || e
                );
              }

              // log object
              const mapItem = {
                minKey: count.toString(16),
                // @ts-ignore
                id: attrs.id.value,
                num: count,
                key: val,
                d: null,
                file
              };

              // @ts-ignore
              if (attrs.id.value.endsWith('$')) {
                const props =
                  // @ts-ignore
                  attrs.d && attrs.d.expression && attrs.d.expression.properties
                    ? // @ts-ignore
                      attrs.d.expression.properties
                    : null;

                if (!props || typeof props !== 'object') {
                  throw path.buildCodeFrameError(
                    '[React I18n] Enum default have to be object / map!'
                  );
                }

                // @ts-ignore
                mapItem.d = props.reduce((obj, it) => {
                  // POTENTIAL BUG - parsing could fail because enum expects Object as default val
                  obj[it.key.name] = it.value.value;
                  KEYS[val + '.' + it.key.name] = it.value.value;
                  count++;
                  return obj;
                }, {});
              } else {
                // @ts-ignore
                KEYS[val] = attrs.d.value;
                // @ts-ignore
                mapItem.d = attrs.d.value;
                count++;
              }

              KEYMAP[val] = mapItem;
              // @ts-ignore
              attrs.id.value = val;

              // Production build
              if (replaceDefault && replaceDefault[val]) {
                let newDefault = replaceDefault[val];
                // Build Enum defaults
                // @ts-ignore
                if (attrs.id.value.endsWith('$')) {
                  newDefault = {};
                  const keys = Object.keys(replaceDefault);
                  for (let i = 0; i <= keys.length; i++) {
                    if (keys[i].startsWith(val)) {
                      let k = keys[i].replace(val + '.', '');
                      newDefault[k] = replaceDefault[k];
                    }
                  }
                }

                if (!newDefault) {
                  throw path.buildCodeFrameError(
                    `[React I18n] Missing default value to replace '${val}'`
                  );
                }
                // @ts-ignore
                attrs.d.value = newDefault;
              }
              changed = true;
            }
          }
        }
      }
    };
  };
}
