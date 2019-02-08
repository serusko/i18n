/**
 * @class ExampleComponent
 */

import I18n from './I18n';
import { TranslationMap } from './fileSource';

export { TranslationMap };
export { Locale } from './config';

export default I18n;
export { I18nContext } from './I18n';
export { default as Logger } from './Logger';
export { default as config } from './config';
export { default as I18nProvider } from './Provider';
export { default as BBCode } from './_helpers/BBCode';
export { default as babelPlugin } from './tools/babel-plugin';
