goog.module('bad.func');

/**
 * Return myself
 * @param {*} e
 * @return {*}
 */
const identity = e => e;


/**
 * @param {!string} x
 * @return {!string}
 */
const toLowerCase = x => x.toLowerCase();


/**
 * @param {*} x
 * @return {!string}
 */
const whatType = x => typeof x;


/**
 * @param {*} n
 * @return {!boolean}
 */
const isNumber = n =>
  whatType(n) === 'number' && !Number.isNaN(/** @type {number}*/(n));


/**
 * @param {*} n
 * @return {!boolean}
 */
const isString = n => whatType(n) === 'string';


/**
 * A strict even test that does not coerce values, and results in false if the
 * given element is not a number.
 * Example:
 *    [
 *      Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY,
 *      -0, 0, 1, '1', 2, '2', -1,
 *      'oddball', NaN, {}, [], true, false
 *    ].forEach(e => console.log(isEven(e)));
 * @param {*} t
 * @return {!boolean}
 */
const isEven = t => isNumber(t) && !(/** @type {!number} */(t) % 2);


/**
 * @param {!number} n
 * @return {function(*): !boolean}
 */
const isDivisibleBy = n =>
  x => isNumber(x) && /** @type {!number} */(x) % n === 0;


/**
 * @type {function(!string): !string}
 */
const toUpperCase = x => x.toUpperCase();


/**
 * @type {function(!string): !function(!string): !Array<!string>}
 */
const split = s => x => x.split(s);


/**
 * @type {function(!RegExp, !string): !function(!string): !string}
 */
const replace = (p, r) => x => x.replace(p, r);


/**
 * @param {!string} s
 * @return {!function(!Array<*>): !string}
 */
const join = s => x => x.join(s);


/**
 * @param {!string} x
 * @param {!string} y
 * @return {!string}
 */
const append = (x, y) => y + x;


/**
 * @param {!Array.<*>|!string} x
 * @return {!Array.<*>}
 */
const reverse = x => {
  let y = (isString(x) && /** @type {!string} */(x).split('')) ||
    /** @type {!Array} */(x);
  return y.reduce((p, c) => [c].concat(p), [])
};


/**
 * @param {!Array.<*>|!string} x
 * @return {*}
 */
const head = x => x[0];

/**
 *
 * @param {!Array.<*>} arr
 * @return {!Array.<*>}
 */
const flatten = arr =>
    arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);


/**
 * @param {!boolean} n
 * @return {!boolean}
 */
const negate = n => !n;


/**
 * a → n → [a]
 * Returns a fixed list of size n containing a specified identical value.
 * @param {*} v
 * @param {!number} n
 */
const repeat = (v, n) => new Array(n).fill(v);


const both = (a, b) => n => a(n) && b(n);

/**
 * Interleave a string (s) with the given joiner (j)
 * @param {!string} j The joiner to interleave the string with.
 * @return {!function(!string):!string}
 */
const interleave = j => s => s.split('').map(v => `${j}${v}`).join('');


/**
 * A generator function that returns an iterator over the specified range of
 * numbers. By default the step size is 1, but this can optionally be passed
 * in as well. A negative step size is silently converted to a positive number.
 * The generator will always yield the first value, and from there step
 * towards the second value.
 * It does not matter which of the 2 values are larger, the generator will
 * always step from the first towards the second.
 * Example:
 *    const rangeArr = (b, e, s) => [...(rangeGen(b, e, s))];
 *    console.log(rangeArr(1, -1));
 * @param {!number} b Begin here - First element in array
 * @param {!number} e End here - Last element in array
 * @param {!number} s Step this size
 *
 */
function* rangeGen(b, e, s = 1) {
  if (!isNumber(s) || s === 0) {
    throw `Invalid step size: ${s}`;
  }
  let up = e >= b;
  for (let i = b; up ? i <= e : i >= e;
       up ? i += Math.abs(s) : i -= Math.abs(s)) {
    yield i;
  }
}


/**
 * Counts the occurrence of an element in an array.
 * Example:
 *    let countZeros = countOck(0);
 *     let countNaNs = countOck(NaN);
 *     console.log(`Number of zeros: ${countZeros([0,1,0,1,0,0,0,1])}`);
 *     console.log(`Number of NaNs: ${countNaNs([NaN,1,NaN,1,NaN,0,NaN,1])}`);
 * @param {*} t
 */
const countOck = t => arr =>
    arr.filter(e => Number.isNaN(t) ? Number.isNaN(e) : e === t).length;


/**
 * Count the number of times func returns true.
 * Example:
 *    let countArr = countByFunc(e => Array.isArray(e));
 *    console.log(`Num Arrays: ${countArr([[],[], NaN, {}, 1, {length:1}])}`);
 * @param f
 */
const countByFunc = f => arr => arr.filter(f).length;


/**
 * A strict same elements in same order comparison.
 * Example:
 *    console.log('Same Arrays:', sameArr([1, 2], [1, 2]));
 *    console.log('Same Arrays:', sameArr([2, 1], [1, 2]));
 * @param {!Array.<*>} a
 * @param {!Array.<*>} b
 */
const sameArr = (a, b) => a.length == b.length && a.every((c, i) => b[i] === c);


/**
 * A loose same elements comparison.
 * Example:
 *    console.log('Same Elements:', sameEls([1, 2], [1, 2]));
 *    console.log('Same Elements:', sameEls([2, 1], [1, 2]));
 *    console.log('Same Elements:', sameEls([2, 2], [1, 2]));
 * @param {!Array.<*>} a
 * @param {!Array.<*>} b
 */
const sameEls = (a, b) => a.length == b.length &&
    a.every((c, i) => b.includes(c)) && b.every((c, i) => a.includes(c));


/**
 * @param {!number|!string} n The number to calc and check
 * @return {{valid: !boolean, luhn: !number}}
 */
const luhn = n => {
  let result = n.toString().split('').reverse().reduce((p, e, i) => {
    let n = Number(e);
    return p += (!(i % 2)) ?
        n :
        (n * 2).toString().split('').reduce((a, b) => Number(a) + Number(b), 0);
  }, 0);
  return {
    valid: !(result % 10),
    luhn: result / 10};
};


/**
 * The IMEI (International Mobile Station Equipment Identity) is a 15-digit
 * number to uniquely identify a mobile phone device.
 * IMEISV (IMEI Software Version) is a 16-digit number with the IMEI and an
 * additional software version number.
 *
 * As of 2004, the formats of the IMEI and IMEISV are
 *    AA-BBBBBB-CCCCCC-D and
 *    AA-BBBBBB-CCCCCC-EE respectively.
 * The definition of the formats can be found below.
 *
 * AA	   BB-BB-BB	 CC-CC-CC	   D	   EE
 * TAC	 TAC	     SN	         CD	   SVN
 * TAC : Type Allocation Code
 * SN : Serial Number
 * CD : Check Digit based on Luhn algorithm
 * SVN : Software Version Number
 * Example:
 *    console.log([35956805108414].map(luhn2));
 *    console.log(imeisvToImei('3595680510841401'));
 * @param {!number|!string} n The IMEIsv number as received from RADIUS.
 * @return {!string}
 */
const imeisvToImei = n => {
  const t = n.toString().substr(0, 14);
  const r = luhn(t);
  return r.valid ? t + r.luhn : n.toString();
};

exports = {
  identity: identity,
  toLowerCase: toLowerCase,
  whatType: whatType,
  isNumber: isNumber,
  isEven: isEven,
  isDivisibleBy: isDivisibleBy,
  isString: isString,
  toUpperCase: toUpperCase,
  split: split,
  replace: replace,
  join: join,
  append: append,
  reverse: reverse,
  head: head,
  negate: negate,
  repeat: repeat,
  both: both,
  interleave: interleave,
  rangeGen: rangeGen,
  countOck: countOck,
  countByFunc: countByFunc,
  sameArr: sameArr,
  sameEls: sameEls,
  luhn: luhn,
  imeisvToImei: imeisvToImei
};
