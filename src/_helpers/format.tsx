import MessageFormat from 'intl-messageformat';

import Logger from '../Logger';

// -------------------------------------------------------------------------------------------------

export default function format(template: string, locale: string, props: Object): string {
  try {
    let msg = new MessageFormat(template, locale);
    return msg.format(props);
  } catch (e) {
    Logger.notify(new Error(`Pluralization failed for "${template}"`));
    return template;
  }
}
