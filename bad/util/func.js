goog.module('bad.func');


/**
 * @param {string} x
 * @return {string}
 */
const toLowerCase = x => x.toLowerCase();


/**
 * @param {*} x
 * @return {string}
 */
const whatType = x => typeof x;


/**
 * @param {*} n
 * @return {boolean}
 */
const isNumber = n =>
    whatType(n) === 'number' && !Number.isNaN(/** @type {number}*/ (n));


/**
 * @type {function(string): string}
 */
const toUpperCase = x => x.toUpperCase();


/**
 * @type {function(string): function(string): !Array<string>}
 */
const split = s => x => x.split(s);


/**
 * @type {function(!RegExp, string): function(string): string}
 */
const replace = (p, r) => x => x.replace(p, r);


/**
 * @param {string} s
 * @return {function(!Array<*>): string}
 */
const join = s => x => x.join(s);


/**
 * @param {string} x
 * @param {string} y
 * @return {string}
 */
const append = (x, y) => y + x;


/**
 * @param {Array.<*>|string} x
 * @return {*}
 */
const head = x => x[0];

/**
 *
 * @param {Array.<*>} arr
 * @return {Array.<*>}
 */
const flatten = arr =>
    arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);


/**
 * a → n → [a]
 * Returns a fixed list of size n containing a specified identical value.
 * @param {*} v
 * @param {number} n
 */
const repeat = (v, n) => new Array(n).fill(v);


/**
 * Concatenate a series of strings with the separator if the string is not empty
 * example:
 *    const cat = catWithSep('|')
 *    cat('a', 'b', 'c')  # 'a|b|c'
 *    cat('', 'b', 'c')   # 'b|c'
 *    cat('a', '', 'c')   # 'a|c'
 *    cat('', '', 'c')    # 'c'
 *    cat(1, 'a', false, 'b', null, 'c', new Date())  # 'a|b|c'
 * @param sep
 */
const catWithSep = sep => (...str) =>
    str.filter(s => typeof s === 'string' && s !== '').join(sep);


/**
 * A generator function that returns an iterator over the specified range of
 * numbers. By default the step size is 1, but this can optionally be passed
 * in as well. A negative step size is silently converted to a positive number.
 * The generator will always yield the first value, and from there step
 * towards the second value.
 * It does not matter which of the 2 values are larger, the generator will
 * always step from the first towards the second.
 * Example:
 *    const range = (b, e, s) => [...(rangeGen(b, e, s))];
 *    console.log(range(1, -1));
 * @param {number} b Begin here - First element in array
 * @param {number} e End here - Last element in array
 * @param {number} s Step this size
 *
 */
function* rangeGen(b, e, s = 1) {
  if (!isNumber(s) || s === 0) {
    throw `Invalid step size: ${s}`;
    }
  if (!(isNumber(b) && isNumber(e))) {
    throw new TypeError('Arguments to range must be numbers');
    }
  let up = e >= b;
  for (let i = b; up ? i <= e : i >= e;
       up ? i += Math.abs(s) : i -= Math.abs(s)) {
    yield i;
  }
  }
const range = (b, e, s) => [...(rangeGen(b, e, s))];


exports = {
  toLowerCase,
  toUpperCase,
  split,
  replace,
  join,
  append,
  head,
  repeat,
  catWithSep,
  range,
};
