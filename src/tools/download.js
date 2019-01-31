'use-strict';

const fs = require('mz/fs');
const path = require('path');

const assetsFolder = path.resolve(__dirname, '../../src/_assets/I18n');

const localesDefaults = require(path.resolve(__dirname, '../../locales/defaults.json'));
const appDefaults = require(path.resolve(__dirname, '../../locales/defaults.app.json'));

const localesFolder = path.resolve(__dirname, '../../locales');
const masterName = 'defaults';

function swapMap(json) {
  return Object.keys(json).reduce((obj, key) => {
    obj[json[key]] = key;
    return obj;
  }, {});
}

const localesDefaultsReverted = swapMap(localesDefaults);
const currentKeys = Object.keys(appDefaults);

fs.readdir(assetsFolder)

  .then(files => {
    let locales = files.reduce((list, file) => {
      if (/[a-z]{2}.json/.test(file)) {
        const filePath = path.resolve(assetsFolder, file);
        let read = fs.readFile(filePath).then(c => ({
          name: file.substr(0, 2),
          data: JSON.parse(c),
          path: filePath
        }));
        list.push(read);
      }
      return list;
    }, []);
    return Promise.all(locales);
  })

  .then(locales => {
    return Promise.all(
      locales.map(locale => {
        let localeFile = path.resolve(localesFolder, `${masterName}.${locale.name}.json`);
        return fs
          .readFile(localeFile) // TODO: add brand file
          .then(res => {
            const translations = JSON.parse(res);

            currentKeys.forEach(key => {
              if (typeof translations[key] === 'string') {
                locale.data[key] = translations[key];
              } else {
                let find = appDefaults[key];
                find = localesDefaultsReverted[find];
                if (translations[find]) {
                  locale.data[key] = translations[find];
                }
              }
            });

            return locale;
          })
          .catch(e => {
            return locale;
          });
      })
    );
  })

  .then(locales => {
    return Promise.all(
      locales.map(locale => {
        return fs.writeFile(locale.path, JSON.stringify(locale.data, null, 2));
      })
    );
  })

  .then(_ => {
    console.log('Update translation files done!'); // eslint-disable-line
  });
