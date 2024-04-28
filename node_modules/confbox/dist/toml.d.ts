/**
 * Converts a [TOML](https://toml.io/) string into an object.
 *
 *
 * @template T The type of the return value.
 * @param text The TOML string to parse.
 * @returns The JavaScript value converted from the TOML string.
 */
declare function parseTOML<T = unknown>(text: string): T;

export { parseTOML };
