import MessageFormat from "intl-messageformat";

// -------------------------------------------------------------------------------------------------

export default function format(
  template: string,
  locale: string,
  props: Object
): string {
  try {
    let msg = new MessageFormat(template, locale);
    return msg.format(props);
  } catch (e) {
    console.error(new Error(`I18n: Pluralization failed for "${template}"`));
    return template;
  }
}
