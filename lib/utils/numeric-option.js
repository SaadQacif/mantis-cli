import { InvalidArgumentError } from 'commander';

/**
 * Builds a parser for a whole-number CLI option.
 *
 * Reporting a bad value matters more than accepting it: `parseInt(v, 10) || 4`
 * turns a typo, an empty string and a deliberate 0 into the default, and
 * `Number(v)` turns a typo into NaN, which silently removes a limit instead of
 * applying one. Both leave the user with a result they did not ask for and no
 * sign that their value was dropped.
 *
 * @param {string} flag the option as it is written, used in the message
 * @param {{min?: number}} [bounds] smallest value the option accepts
 */
export function wholeNumberOption(flag, { min = 0 } = {}) {
  return (value) => {
    const text = String(value).trim();
    if (!/^[+-]?\d+$/.test(text)) {
      throw new InvalidArgumentError(`${flag} expects a whole number.`);
    }
    const parsed = Number(text);
    if (!Number.isSafeInteger(parsed)) {
      throw new InvalidArgumentError(`${flag} is outside the safe integer range.`);
    }
    if (parsed < min) {
      throw new InvalidArgumentError(`${flag} must be ${min} or more.`);
    }
    return parsed;
  };
}
