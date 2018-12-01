"use-strict";

const fs = require("mz/fs");
const path = require("path");

const SOURCE_DIR = path.resolve(__dirname, "../../src/assets/I18n");
const KEYMAP = path.resolve(__dirname, "./src/keys.json");
const PREVMAP = path.resolve(__dirname, "./src/old.json");
const DEFAULT_LOCALE = process.env.REACT_APP_DEFAULT_LANGUAGE || "en";

console.log("Localization postprocess started"); // eslint-disable-line

let KEYS = {};
let MOVED = {}; // MAP of moved keys = ID is changed but default value is same
// { [new]: old }

// -------------------------------------------------------------------------------------------------

function swapMap(json) {
  return Object.keys(json).reduce((obj, key) => {
    obj[json[key]] = key;
    return obj;
  }, {});
}

// -------------------------------------------------------------------------------------------------

Promise.all([fs.readFile(KEYMAP), fs.readFile(PREVMAP), fs.readdir(SOURCE_DIR)])

  .then(results => {
    // ---------------------------------------------------------------------------------------------

    // Parse keymap json
    KEYS = JSON.parse(results[0]); // remember keymap
    // parse prev map keys
    let OLD = JSON.parse(results[1]);

    let invertMap = swapMap(OLD);

    // Create Moved keys map
    Object.keys(KEYS).forEach(key => {
      if (!OLD.hasOwnProperty(key) && invertMap.hasOwnProperty(KEYS[key])) {
        MOVED[key] = invertMap[KEYS[key]]; // NEW : OLD
      }
    });

    // return found files
    return results[2];
  })
  .catch(e => {
    console.error("Reading sources failed!"); // eslint-disable-line
    throw e;
  })

  .then(files => {
    // Read assets folder and parse source files
    // {
    //   locale: sk | en | hu ...
    //   filePath '/src/assets/...[locale].json'
    //   content: { [key]: message }
    // }
    // ---------------------------------------------------------------------------------------------
    const locales = files
      .filter(
        filename => filename.length === 7 && /[a-z]{2}\.json/.test(filename)
      )
      .map(filename => filename.substr(0, 2))
      .map(locale => {
        const filePath = path.resolve(SOURCE_DIR, locale + ".json");
        return fs.readFile(filePath).then(res => ({
          locale,
          filePath,
          content: JSON.parse(res)
        }));
      });
    return Promise.all(locales);
  })
  .catch(e => {
    console.log("Reading assets failed"); // eslint-disable-line
    throw e;
  })

  .then(locales => {
    // Merge keys
    // ---------------------------------------------------------------------------------------------

    return Promise.all(
      locales.map(obj => {
        return {
          ...obj,
          content: Object.keys(KEYS).reduce((messages, key) => {
            if (
              obj.content[key] &&
              typeof obj.content[key] === typeof KEYS[key]
            ) {
              // IF sourceFile contain key and it has same type as default, use
              messages[key] = obj.content[key];
            } else if (
              MOVED.hasOwnProperty(key) &&
              obj.content.hasOwnProperty(MOVED[key])
            ) {
              // original KEY was removed but default value is same as another => moved = use
              messages[key] = obj.content[MOVED[key]];
            } else if (obj.locale === DEFAULT_LOCALE) {
              // if not exists in sourceFile, but locale is default = write
              messages[key] = KEYS[key];
            }
            return messages;
          }, {})
        };
      })
    );
  })
  .catch(e => {
    console.log("Locale fill failed"); // eslint-disable-line
    throw e;
  })

  .then(locales => {
    // Sort keys
    // ---------------------------------------------------------------------------------------------

    return Promise.all(
      locales.map(locale => ({
        ...locale,
        content: Object.keys(locale.content)
          .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
          .reduce((map, key) => {
            map[key] = locale.content[key];
            return map;
          }, {})
      }))
    );
  })

  .then(locales => {
    // Save
    // ---------------------------------------------------------------------------------------------

    return Promise.all(
      locales.map(obj => {
        return fs.writeFile(obj.filePath, JSON.stringify(obj.content, null, 2));
      })
    );
  })

  .then(() => {
    // Move keymap to "old"
    // ---------------------------------------------------------------------------------------------

    fs.rename(KEYMAP, PREVMAP);
  })
  .then(() => {
    console.log("I18n postprocess Done!"); // eslint-disable-line
  })
  .catch(e => {
    console.log("I18n postprocess Failed", e); // eslint-disable-line
  });
