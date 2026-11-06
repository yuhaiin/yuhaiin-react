/**
 * HTML `pattern` for login names. Browsers compile `pattern` with the `v`
 * flag, where a literal `-` inside a character class must be escaped.
 */
export const LOGIN_NAME_PATTERN = '[A-Za-z0-9_.\\-]{1,64}';
