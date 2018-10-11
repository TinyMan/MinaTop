/**
 * Converts and removes keys with a
 * dev prefix to the key without prefix
 * or no key if prod env
 *
 * Example:
 *
 *    __dev__keyName
 *
 * to `keyName` in dev env, or none in prod
 *
 * @param  {Object} manifest
 * @return {Object}
 */
export default function applyEnvPrefixesFor(_env) {
  env = _env
  return iterator
};

/**
 * Env key
 * @type {String}
 */
var env = ''

/**
 * Recursive iterator over all object keys
 * @param  {Object} obj    Object to iterate over
 * @return {Object}        Processed object
 */
function iterator(obj) {
  Object.keys(obj).forEach((key) => {
    let match = key.match(/^__(dev|prod)__(.*)/)
    if (match) {
      // Swap key with non prefixed name
      if (match[1] === env) {
        obj[match[2]] = obj[key]
      }

      // Remove the prefixed key
      // so it won't cause warings
      delete obj[key]
    } else {    // no match? try deeper
      // Recurse over object's inner keys
      if (typeof (obj[key]) === 'object') iterator(obj[key])
    }
  })
  return obj
}
