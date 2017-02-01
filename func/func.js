/**
 * A variadic compose that accepts any number of pure functions and composes
 * them together.
 * @type {function(...function(?):?): !function(?):?}
 */
const compose = (...fns) => (...x) => fns.reduce((a, b) => c => a(b(c)))(...x);


/**
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
const partial = function(fn, var_args) {
  let args = Array.prototype.slice.call(arguments, 1);
  return function() {
    let newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


const identity = e => e;


/**
 * @type {function(!string): !string}
 */
const toLowerCase = x => x.toLowerCase();


/**
 * @param {*} x
 * @return {!string}
 */
const whatType = x => typeof x;

/**
 * @param {*} n
 * @return {boolean}
 */
const isNumber = n => whatType(n) === 'number' && !Number.isNaN(n);


/**
 * A strict even test that does not coerce values, and results in false if the
 * given element is not a number.
 * @param {*} t
 */
const isEven = t => isNumber(t) && !(t % 2);
[Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -0, 0, 1, '1', 2, '2', -1,
 'oddball', NaN, {}, [], true, false]
    .forEach(e => console.log(isEven(e)));



/**
 * @param {*} n
 * @return {function(*): !boolean}
 */
const isDivisibleBy = n => x => x % n === 0 && isNumber(x);


const logInline = (tag, x) => {
  console.log(tag, x);
  return x;
};


const trace = t => partial(logInline, t);


/**
 * @type {function(*): !string}
 */
const toString = x => x + '';


/**
 * @type {function(*): !number}
 */
const toNumber = x => x * 1;


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
 * @type {function(!string): !function(!Array<*>): !string}
 */
const join = s => x => x.join(s);


/**
 * @type {function(!string, !string): !string}
 */
const append = (x, y) => y + x;


/**
 * @type {function((!Array.<*>|!string)): *}
 */
const head = x => x[0];


/**
 * Reverse either an array or a string
 * @type {function((!Array.<*>|!string)): !Array.<*>}
 */
const reverse = x => {
  let y = x.split ? x.split('') : x;
  return y.reduce((p, c) => [c].concat(p), [])
};


const flatten = arr =>
    arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

/**
 * @type {function(function(*, !number, !Array) : *) : function(!Array<*>): ?}
 */
const map = func => x => x.map(func);


const filter = func => n => n.filter(func);

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
 * @return {!string}
 */
const interleave = j => s => s.split('').map(v => `${j}${v}`).join('');


/**
 * @type {function(!Array<*>): *}
 */
const tail = compose(head, reverse);


/**
 * @type {function(!string): !string}
 */
const snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);


/**
 * @type {function(*): !string}
 */
const anyToLowerCase = compose(toLowerCase, toString);

/**
 * A generator function that returns an iterator over the specified range of
 * numbers. By default the step size is 1, but this can optionally be passed
 * in as well. A negative step size is silently converted to a positive number.
 * The generator will always yield the first value, and from there step
 * towards the second value.
 * It does not matter which of the 2 values are larger, the generator will
 * always step from the first towards the second.
 * @param {!number} b Begin here - First element in array
 * @param {!number} e End here - Last element in array
 * @param {!number} s Step this size
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
const rangeArr = (b, e, s) => [...(rangeGen(b, e, s))];
console.log(rangeArr(1, -1));


const stringReverse = compose(join(''), reverse);
const numReverse = compose(toNumber, join(''), reverse, toString);


/**
 * Counts the occurrence of an element in an array.
 * @param {*} t
 */
const countOck = t => arr =>
    arr.filter(e => Number.isNaN(t) ? Number.isNaN(e) : e === t).length;
let countZeros = countOck(0);
let countNaNs = countOck(NaN);
console.log(`Number of zeros: ${countZeros([0,1,0,1,0,0,0,1])}`);
console.log(`Number of NaNs: ${countNaNs([NaN,1,NaN,1,NaN,0,NaN,1])}`);

const countByFunc = f => arr => arr.filter(f).length;
let countArr = countByFunc(e => Array.isArray(e));
console.log(`Number of Arrays: ${countArr([[],[], NaN, {}, 1, {length:1}])}`);

/**
 * A strict same elements in same order comparison.
 * @param {!Array.<*>} a
 * @param {!Array.<*>} b
 */
const sameArr = (a, b) => a.length == b.length && a.every((c, i) => b[i] === c);
console.log('Same Arrays:', sameArr([1, 2], [1, 2]));
console.log('Same Arrays:', sameArr([2, 1], [1, 2]));


/**
 * A loose same elements comparison.
 * @param {!Array.<*>} a
 * @param {!Array.<*>} b
 */
const sameEls = (a, b) => a.length == b.length &&
    a.every((c, i) => b.includes(c)) && b.every((c, i) => a.includes(c));
console.log('Same Elements:', sameEls([1, 2], [1, 2]));
console.log('Same Elements:', sameEls([2, 1], [1, 2]));
console.log('Same Elements:', sameEls([2, 2], [1, 2]));



// -----------------------------------------------------------------------------
// FizzBuzz
const dividesBy3 = isDivisibleBy(3);
const dividesBy5 = isDivisibleBy(5);
const dividesBy15 = isDivisibleBy(15);
const f = n => dividesBy3(n) ? 'Fizz' : n;
const b = n => dividesBy5(n) ? 'Buzz' : n;
const fb = n => dividesBy15(n) ? 'FizzBuzz' : n;
const c = compose(f, b, fb);
rangeArr(1, 100).forEach(e => console.log(c(e)));


// -----------------------------------------------------------------------------
// Rosetta code: Luhn_test_of_credit_card_numbers
// http://rosettacode.org/wiki/Luhn_test_of_credit_card_numbers

// Try: 1
const luhn = n => {
  let evens = a => a.filter((e, i) => !((i + 1) % 2));
  let odds = a => a.filter((e, i) => !!((i + 1) % 2));
  let sum = (p, c) => Number(p) + Number(c);
  let rN = n => n.toString().split('').reduce(sum, 0);
  let sumArr = a => a.reduce(sum, 0);
  let timesN = n => x => x * n;
  let s1 = compose(sumArr, odds, map(Number), reverse, toString);
  let s2 = compose(
      sumArr, map(rN), map(timesN(2)), evens, map(Number), reverse, toString);
  return !((s1(n) + s2(n)) % 10)
};


/**
 * @param {!number|!string} n The number to calc and check
 * @return {!Array.<!boolean|!number>} Valid and Luhn number
 */
const luhn2 = n => {
  let result = n.toString().split('').reverse().reduce((p, e, i) => {
    let n = Number(e);
    return p += (!(i % 2)) ?
        n :
        (n * 2).toString().split('').reduce((a, b) => Number(a) + Number(b), 0);
  }, 0);
  return [!(result % 10), result / 10];
};

/**
 * /**
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
 * @param {!number|!string} n The IMEIsv number as received from RADIUS.
 * @return {!string}
 */
const imeisvToImei = n => {
  let t = n.toString().substr(0, 14);
  let r = luhn2(t);
  return r[0] ? t + r[1] : n;
};

console.log('\n\n--------------------------------------');
console.log([35956805108414].map(luhn2));
console.log(imeisvToImei('3595680510841401'));
console.log('--------------------------------------\n\n');

// The IMEI reported in 3595680510841401 is the same as the IMEI of the device
// 359568051084146


// -----------------------------------------------------------------------------
// Rosetta code: 2-points
// http://rosettacode.org/wiki/Circles_of_given_radius_through_two_points
// point is given as [x, y]

const hDist = (p1, p2) => Math.hypot(...p1.map((e, i) => e - p2[i])) / 2;
const pAng = (p1, p2) =>
    Math.atan(p1.map((e, i) => e - p2[i]).reduce((p, c) => c / p, 1));
const solveF = (p, r) => t => [r * Math.cos(t) + p[0], r * Math.sin(t) + p[1]];
const diamPoints = (p1, p2) => p1.map((e, i) => e + (p2[i] - e) / 2);

const findC = (...args) => {
  const [p1, p2, s] = args;
  const solve = solveF(p1, s);
  const halfDist = hDist(p1, p2);
  let msg = `p1: ${p1}, p2: ${p2}, r:${s} Result: `;
  switch (Math.sign(s - halfDist)) {
    case 0:
      msg += s ? `Points on diameter. Circle at: ${diamPoints(p1, p2)}` :
                 'Radius Zero';
      break;
    case 1:
      if (!halfDist) {
        msg += 'Coincident point. Infinite solutions';
      } else {
        let theta = pAng(p1, p2);
        let theta2 = Math.acos(halfDist / s);
        [1, -1]
            .map(e => solve(theta + e * theta2))
            .forEach(e => msg += `Circle at ${e} `);
      }
      break;
    case -1:
      msg += 'No intersection. Points further apart than circle diameter';
      break;
  }
  return msg;
};

[[[0.1234, 0.9876], [0.8765, 0.2345], 2.0],
 [[0.0000, 2.0000], [0.0000, 0.0000], 1.0],
 [[0.1234, 0.9876], [0.1234, 0.9876], 2.0],
 [[0.1234, 0.9876], [0.8765, 0.2345], 0.5],
 [[0.1234, 0.9876], [0.1234, 0.9876], 0.0]]
    .forEach((t, i) => console.log(`Test: ${i}: ${findC(...t)}`));


// -----------------------------------------------------------------------------
// Rosetta code: Topological sort
// http://rosettacode.org/wiki/Topological_sort

const topoSort = input => {
  // A map of the input data, with the keys as the packages, and the values as
  // an array of packages on which it depends.
  const D =
      input.split('\n')
          .map(e => e.split(' ').filter(e => e != ''))
          .reduce(
              (p, c) => p.set(
                  c[0], c.filter((e, i) => i > 0 && e !== c[0] ? e : null)),
              new Map());
  [].concat(...D.values()).forEach(e => {D.set(e, D.get(e) || [])});

  // The above map rotated so that it represents a DAG of the form
  // Map {
  //    A => [ A, B, C],
  //    B => [C],
  //    C => []
  // }
  // where each key represents a node, and the array contains the edges.
  const G = [...D.keys()].reduce(
      (p, c) => p.set(c, [...D.keys()].filter(e => D.get(e).includes(c))),
      new Map());

  // An array of leaf nodes; nodes with 0 in degrees.
  const Q = [...D.keys()].filter(e => D.get(e).length == 0);

  // The result array.
  const S = [];
  while (Q.length) {
    const u = Q.pop();
    S.push(u);
    G.get(u).forEach(v => {
      D.set(v, D.get(v).filter(e => e !== u));
      if (D.get(v).length == 0) {
        Q.push(v);
      }
    });
  }
  return S;
};

console.log(
    'Solution:',
    topoSort(
        `des_system_lib   std synopsys std_cell_lib des_system_lib dw02 dw01 ramlib ieee
  dw01             ieee dw01 dware gtech
  dw02             ieee dw02 dware
  dw03             std synopsys dware dw03 dw02 dw01 ieee gtech
  dw04             dw04 ieee dw01 dware gtech
  dw05             dw05 ieee dware
  dw06             dw06 ieee dware
  dw07             ieee dware
  dware            ieee dware
  gtech            ieee gtech
  ramlib           std ieee
  std_cell_lib     ieee std_cell_lib
  synopsys`));


// -----------------------------------------------------------------------------
// Rosetta code: Generator/Exponential
// http://rosettacode.org/wiki/Generator/Exponential

function* nPowerGen(n) {
  let e = 0;
  while (1) {
    e++ && (yield Math.pow(e, n));
  }
}

function* filterGen(gS, gC, skip = 0) {
  let s = 0;  // The square value
  let c = 0;  // The cube value
  let n = 0;  // A skip counter4

  while (1) {
    s = gS.next().value;
    s > c && (c = gC.next().value);
    s == c ? c = gC.next().value : n++ && n > skip && (yield s);
  }
}

const filtered = filterGen(nPowerGen(2), nPowerGen(3), skip = 20);

for (let n = 0; n < 10; n++) {
  console.log(filtered.next().value)
}


// -----------------------------------------------------------------------------
// Rosetta code: Split a character string based on change of character
// http://rosettacode.org/wiki/Split_a_character_string_based_on_change_of_character#ES6
const splitOnCharChange = s => {
  const tail = x => x[x.length - 1];
  return s.split('')
      .reduce(
          (p, c) => c === p[1] ? tail(p[0]).push(c) && [p[0], c] :
                                 p[0].push([c]) && [p[0], c],
          [[], ''])[0]
      .map(e => e.join(''));
};
let r = splitOnCharChange(`gHHH5YY++///\\`);
r.forEach(e => console.log(e));
