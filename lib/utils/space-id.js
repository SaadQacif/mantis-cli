// A Mantis identifier is a canonical UUID: 8-4-4-4-12 hexadecimal characters.
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
// An identifier must stand on its own. Without these guards the patterns match
// the first 36 characters of a longer run and silently truncate it, turning a
// mistyped link into a different, plausible-looking id.
const BEFORE = '(?<![0-9a-f-])';
const AFTER = '(?![0-9a-f-])';

const UUID_RE = new RegExp(`${BEFORE}${UUID}${AFTER}`, 'i');
const SPACE_PATH_RE = new RegExp(`/space/(${UUID})${AFTER}`, 'i');

/**
 * Reads a space or map id from a raw UUID, a Mantis link, or a mantis:// URI.
 * Surrounding whitespace, uppercase hexadecimal and a trailing slash, query or
 * fragment are accepted, and the result is normalized to lowercase. Returns
 * null when the input holds no canonical UUID, so callers can report the bad
 * value instead of sending it to the API.
 */
export function parseSpaceIdFromInput(text) {
  const t = (text || '').trim();
  if (!t) return null;
  const pathMatch = t.match(SPACE_PATH_RE);
  if (pathMatch) return pathMatch[1].toLowerCase();
  const uuidMatch = t.match(UUID_RE);
  if (uuidMatch) return uuidMatch[0].toLowerCase();
  return null;
}
